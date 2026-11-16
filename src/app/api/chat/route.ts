import { getChatLimits, getOpenRouterConfig, isOpenRouterReady } from "@/lib/server/env";
import { requestCompletion, TimeoutReason, toProviderError, type LlmMessage } from "@/lib/server/openrouter";
import { getKnowledgeContext } from "@/lib/server/knowledge";
import { buildSystemPrompt } from "@/lib/server/prompt";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { clientIp, isSameOrigin } from "@/lib/server/request";
import { validateMessages } from "@/lib/chat/validate";
import { CHAT_ERROR_MESSAGES, type ChatErrorCode, type StreamEvent } from "@/lib/chat/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_BODY_BYTES = 200_000;

function jsonError(code: ChatErrorCode, status: number, extra?: Record<string, unknown>, headers?: HeadersInit) {
  return Response.json(
    { error: { code, message: CHAT_ERROR_MESSAGES[code], ...extra } },
    { status, headers: { "Cache-Control": "no-store", ...headers } },
  );
}

/**
 * POST /api/chat — meneruskan percakapan ke OpenRouter dan mengalirkan
 * jawabannya ke browser sebagai Server-Sent Events:
 *   event: meta  → { model, attempt }
 *   event: delta → { text }
 *   event: done  → { model, finishReason }
 *   event: error → { code, message }
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError("forbidden_origin", 403);

  const config = getOpenRouterConfig();
  if (!isOpenRouterReady(config)) return jsonError("not_configured", 503);

  const limits = getChatLimits();
  const rate = checkRateLimit(`chat:${clientIp(request)}`, limits.rateLimitPerMinute, 60_000);
  if (!rate.ok) {
    const retryAfter = Math.ceil(rate.retryAfterMs / 1000);
    return jsonError("rate_limited_local", 429, { retryAfter }, { "Retry-After": String(retryAfter) });
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return jsonError("invalid_input", 413);
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return jsonError("invalid_input", 400);
  }
  const validation = validateMessages(body, limits);
  if (!validation.ok) return jsonError("invalid_input", 400, { detail: validation.reason });

  const history = validation.messages;
  const knowledge = await getKnowledgeContext(history[history.length - 1].content);
  const messages: LlmMessage[] = [{ role: "system", content: buildSystemPrompt(knowledge) }, ...history];
  const models = [config.model, ...config.fallbackModels];

  const encoder = new TextEncoder();
  const upstream = new AbortController();
  const onClientAbort = () => upstream.abort(request.signal.reason);
  request.signal.addEventListener("abort", onClientAbort);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const write = (chunk: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          closed = true;
        }
      };
      const send = <E extends StreamEvent>(event: E["event"], data: E["data"]) =>
        write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      const heartbeat = setInterval(() => write(": ping\n\n"), 15_000);
      write(": ok\n\n");

      try {
        for (let attempt = 0; attempt < models.length; attempt++) {
          const model = models[attempt];
          const attemptAbort = new AbortController();
          const relayAbort = () => attemptAbort.abort(upstream.signal.reason);
          if (upstream.signal.aborted) return;
          upstream.signal.addEventListener("abort", relayAbort);

          // Batas waktu: menunggu respons pertama & jeda antar-potongan.
          let timer = setTimeout(() => attemptAbort.abort(new TimeoutReason()), config.timeoutMs);
          const resetTimer = () => {
            clearTimeout(timer);
            timer = setTimeout(() => attemptAbort.abort(new TimeoutReason()), config.timeoutMs);
          };

          let delivered = false; // sudah ada teks yang terkirim → tidak bisa ganti model
          let metaSent = false;
          try {
            for await (const item of requestCompletion({
              config,
              model,
              messages,
              signal: attemptAbort.signal,
              onActivity: resetTimer,
            })) {
              if (!metaSent) {
                metaSent = true;
                send("meta", { model, attempt: attempt + 1 });
              }
              if (item.type === "delta") {
                delivered = true;
                send("delta", { text: item.text });
              } else {
                send("done", { model: item.model, finishReason: item.finishReason });
              }
            }
            return;
          } catch (error) {
            const failure = toProviderError(error, attemptAbort.signal);
            if (failure.code === "aborted") return;
            const canFallback = !delivered && failure.retryable && attempt < models.length - 1;
            console.warn(
              `[chat] model "${model}" gagal (${failure.code}${failure.status ? ` ${failure.status}` : ""})` +
                `${canFallback ? " → mencoba model alternatif" : ""}: ${failure.message}`,
            );
            if (canFallback) continue;
            send("error", { code: failure.code, message: CHAT_ERROR_MESSAGES[failure.code] });
            return;
          } finally {
            clearTimeout(timer);
            upstream.signal.removeEventListener("abort", relayAbort);
          }
        }
      } finally {
        clearInterval(heartbeat);
        request.signal.removeEventListener("abort", onClientAbort);
        if (!closed) {
          closed = true;
          try {
            controller.close();
          } catch {
            /* sudah ditutup */
          }
        }
      }
    },
    cancel() {
      upstream.abort(new Error("client closed"));
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
