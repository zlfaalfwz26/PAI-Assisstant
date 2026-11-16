import { CHAT_ERROR_MESSAGES, type ChatErrorCode, type WireMessage } from "./types";
import { readEventStream } from "./sse";

export type StreamHandlers = {
  onMeta?: (meta: { model: string; attempt: number }) => void;
  onDelta: (text: string) => void;
};

export type StreamOutcome =
  | { status: "done"; finishReason: string | null }
  | { status: "aborted" }
  | { status: "error"; code: ChatErrorCode; message: string; retryAfter?: number };

/** Kirim percakapan ke /api/chat dan proses aliran SSE. Tidak pernah melempar galat. */
export async function streamChat(
  messages: WireMessage[],
  handlers: StreamHandlers,
  signal: AbortSignal,
): Promise<StreamOutcome> {
  let response: Response;
  try {
    response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
      body: JSON.stringify({ messages }),
      signal,
    });
  } catch {
    if (signal.aborted) return { status: "aborted" };
    return { status: "error", code: "network", message: CHAT_ERROR_MESSAGES.network };
  }

  if (!response.ok || !response.body) {
    try {
      const body = (await response.json()) as {
        error?: { code?: ChatErrorCode; message?: string; retryAfter?: number };
      };
      const code = body.error?.code ?? "unknown";
      return {
        status: "error",
        code,
        message: body.error?.message ?? CHAT_ERROR_MESSAGES[code] ?? CHAT_ERROR_MESSAGES.unknown,
        retryAfter: body.error?.retryAfter,
      };
    } catch {
      return { status: "error", code: "unknown", message: CHAT_ERROR_MESSAGES.unknown };
    }
  }

  let finished: StreamOutcome | null = null;
  try {
    for await (const { event, data } of readEventStream(response.body)) {
      let payload: Record<string, unknown>;
      try {
        payload = JSON.parse(data) as Record<string, unknown>;
      } catch {
        continue;
      }
      if (event === "meta") handlers.onMeta?.(payload as { model: string; attempt: number });
      else if (event === "delta" && typeof payload.text === "string") handlers.onDelta(payload.text);
      else if (event === "done") finished = { status: "done", finishReason: (payload.finishReason as string) ?? null };
      else if (event === "error") {
        const code = (payload.code as ChatErrorCode) ?? "unknown";
        finished = {
          status: "error",
          code,
          message: (payload.message as string) ?? CHAT_ERROR_MESSAGES[code] ?? CHAT_ERROR_MESSAGES.unknown,
        };
      }
    }
  } catch {
    if (signal.aborted) return { status: "aborted" };
    return { status: "error", code: "network", message: CHAT_ERROR_MESSAGES.network };
  }

  if (signal.aborted) return { status: "aborted" };
  return finished ?? { status: "error", code: "network", message: CHAT_ERROR_MESSAGES.network };
}
