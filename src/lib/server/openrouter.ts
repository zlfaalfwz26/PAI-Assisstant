import "server-only";
import { OpenRouter } from "@openrouter/sdk";
import {
  ConnectionError,
  OpenRouterError,
  RequestAbortedError,
  RequestTimeoutError,
  ResponseValidationError,
  SDKValidationError,
} from "@openrouter/sdk/models/errors";
import type { ChatErrorCode } from "@/lib/chat/types";
import type { OpenRouterConfig } from "./env";

/**
 * Satu-satunya gerbang LLM aplikasi: OpenRouter (POST /chat/completions)
 * melalui SDK resmi @openrouter/sdk. API key hanya dipakai di sini (server).
 */

export type LlmMessage = { role: "system" | "user" | "assistant"; content: string };

export type LlmEvent = { type: "delta"; text: string } | { type: "done"; finishReason: string | null; model: string };

/** Galat penyedia yang sudah dipetakan ke kode aplikasi. */
export class ProviderError extends Error {
  constructor(
    public readonly code: ChatErrorCode | "aborted",
    message: string,
    public readonly status?: number,
    /** true = boleh dicoba dengan model alternatif. */
    public readonly retryable = false,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

/** Alasan pembatalan karena batas waktu (dibedakan dari pengguna menekan "Berhenti"). */
export class TimeoutReason extends Error {
  constructor() {
    super("OpenRouter timeout");
    this.name = "TimeoutReason";
  }
}

export function createOpenRouterClient(config: OpenRouterConfig): OpenRouter {
  return new OpenRouter({
    apiKey: config.apiKey,
    serverURL: config.baseUrl,
    // Header atribusi opsional: HTTP-Referer & X-OpenRouter-Title.
    httpReferer: config.siteUrl || undefined,
    appTitle: config.siteName || undefined,
    // Pengulangan ditangani sendiri (model alternatif) agar pengguna tidak menunggu lama.
    retryConfig: { strategy: "none" },
  });
}

function errorDetail(error: OpenRouterError): string {
  try {
    const parsed = JSON.parse(error.body) as { error?: { message?: string } };
    return parsed.error?.message ?? error.message;
  } catch {
    return error.message;
  }
}

/** Petakan galat apa pun (SDK, jaringan, abort) ke ProviderError. */
export function toProviderError(error: unknown, signal?: AbortSignal): ProviderError {
  if (error instanceof ProviderError) return error;

  if (signal?.aborted) {
    return signal.reason instanceof TimeoutReason
      ? new ProviderError("timeout", "Batas waktu menunggu OpenRouter terlampaui.", 408, true)
      : new ProviderError("aborted", "Permintaan dibatalkan.");
  }
  if (error instanceof RequestTimeoutError) {
    return new ProviderError("timeout", "Batas waktu menunggu OpenRouter terlampaui.", 408, true);
  }
  if (error instanceof RequestAbortedError || (error instanceof Error && error.name === "AbortError")) {
    return new ProviderError("aborted", "Permintaan dibatalkan.");
  }
  if (error instanceof ConnectionError) {
    return new ProviderError("unavailable", "Tidak dapat terhubung ke OpenRouter.", undefined, false);
  }
  if (error instanceof OpenRouterError) {
    const status = error.statusCode;
    const detail = errorDetail(error);
    const lower = detail.toLowerCase();
    switch (true) {
      case status === 400 && /context|too long|token/.test(lower):
        return new ProviderError("context_too_long", detail, status);
      case status === 400 && /model/.test(lower):
        return new ProviderError("model_unavailable", detail, status, true);
      case status === 400 || status === 422:
        return new ProviderError("bad_request", detail, status);
      case status === 401:
        return new ProviderError("auth", detail, status);
      case status === 402:
        return new ProviderError("credits", detail, status);
      case status === 403:
        return new ProviderError("moderation", detail, status);
      case status === 404:
        return new ProviderError("model_unavailable", detail, status, true);
      case status === 408:
        return new ProviderError("timeout", detail, status, true);
      case status === 413:
        return new ProviderError("context_too_long", detail, status);
      case status === 429:
        return new ProviderError("rate_limited", detail, status, true);
      case status >= 500:
        return new ProviderError("unavailable", detail, status, true);
      default:
        return new ProviderError("unknown", detail, status);
    }
  }
  if (error instanceof ResponseValidationError || error instanceof SDKValidationError) {
    return new ProviderError("unknown", "Format respons OpenRouter tidak dikenali.", undefined, true);
  }
  if (error instanceof TypeError && /fetch failed|network/i.test(error.message)) {
    return new ProviderError("unavailable", "Tidak dapat terhubung ke OpenRouter.");
  }
  return new ProviderError("unknown", error instanceof Error ? error.message : "Galat tidak dikenal.");
}

/** Petakan galat di tengah stream (chunk.error) ke ProviderError. */
function midStreamError(err: { code?: unknown; message?: unknown }): ProviderError {
  const message = typeof err.message === "string" ? err.message : "Galat dari penyedia model.";
  const code = typeof err.code === "number" ? err.code : Number.parseInt(String(err.code), 10);
  if (code === 429) return new ProviderError("rate_limited", message, 429, true);
  if (code === 402) return new ProviderError("credits", message, 402);
  if (code === 403) return new ProviderError("moderation", message, 403);
  if (code === 408) return new ProviderError("timeout", message, 408, true);
  return new ProviderError("unavailable", message, Number.isFinite(code) ? code : 502, true);
}

function contentToText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) =>
        part && typeof part === "object" && "text" in part ? String((part as { text: unknown }).text) : "",
      )
      .join("");
  }
  return "";
}

/**
 * Minta jawaban dari satu model. Menghasilkan potongan teks (delta) bila
 * streaming aktif, atau satu delta berisi jawaban penuh bila tidak.
 * `signal` dipakai untuk pembatalan & batas waktu; `onActivity` dipanggil
 * setiap ada data agar penghitung waktu tunggu bisa diatur ulang.
 */
export async function* requestCompletion(params: {
  config: OpenRouterConfig;
  model: string;
  messages: LlmMessage[];
  signal: AbortSignal;
  onActivity?: () => void;
  client?: OpenRouter;
}): AsyncGenerator<LlmEvent> {
  const { config, model, messages, signal, onActivity } = params;
  const client = params.client ?? createOpenRouterClient(config);
  const baseRequest = {
    model,
    messages,
    maxTokens: config.maxTokens,
    temperature: config.temperature,
  };

  try {
    if (!config.stream) {
      const result = await client.chat.send({ chatRequest: { ...baseRequest, stream: false } }, { signal });
      onActivity?.();
      const choice = result.choices[0];
      const text = contentToText(choice?.message?.content);
      if (text) yield { type: "delta", text };
      yield { type: "done", finishReason: choice?.finishReason ?? null, model: result.model || model };
      return;
    }

    const stream = await client.chat.send({ chatRequest: { ...baseRequest, stream: true } }, { signal });
    let finishReason: string | null = null;
    let servedModel = model;
    for await (const chunk of stream) {
      onActivity?.();
      if (chunk.error) throw midStreamError(chunk.error);
      if (chunk.model) servedModel = chunk.model;
      const choice = chunk.choices[0];
      const text = choice?.delta?.content;
      if (text) yield { type: "delta", text };
      if (choice?.finishReason) {
        finishReason = choice.finishReason;
        if (finishReason === "error")
          throw new ProviderError("unavailable", "Penyedia model menghentikan jawaban.", 502, true);
      }
    }
    yield { type: "done", finishReason, model: servedModel };
  } catch (error) {
    throw toProviderError(error, signal);
  }
}
