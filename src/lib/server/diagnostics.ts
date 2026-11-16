import "server-only";
import {
  getChatLimits,
  getOpenRouterConfig,
  getSupabaseConfig,
  isOpenRouterReady,
  isSupabaseReady,
  looksLikeModelId,
  maskSecret,
  type ChatLimits,
} from "./env";
import { createOpenRouterClient, toProviderError } from "./openrouter";
import { inspectKnowledgeBase } from "./knowledge";

/** Ringkasan konfigurasi untuk dashboard — rahasia selalu disamarkan. */
export type AdminStatus = {
  openrouter: {
    ready: boolean;
    apiKeySet: boolean;
    apiKeyMasked: string;
    baseUrl: string;
    model: string;
    modelLooksValid: boolean;
    fallbackModels: string[];
    siteUrl: string;
    siteName: string;
    stream: boolean;
    timeoutMs: number;
    maxTokens: number;
    temperature: number;
  };
  supabase: {
    configured: boolean;
    host: string;
    keyType: "service_role" | "anon" | "none";
  };
  limits: ChatLimits;
  environment: string;
};

export function getAdminStatus(): AdminStatus {
  const or = getOpenRouterConfig();
  const sb = getSupabaseConfig();
  let host = "";
  try {
    host = sb.url ? new URL(sb.url).host : "";
  } catch {
    host = "(URL tidak valid)";
  }
  return {
    openrouter: {
      ready: isOpenRouterReady(or),
      apiKeySet: Boolean(or.apiKey),
      apiKeyMasked: maskSecret(or.apiKey),
      baseUrl: or.baseUrl,
      model: or.model,
      modelLooksValid: or.model ? looksLikeModelId(or.model) : false,
      fallbackModels: or.fallbackModels,
      siteUrl: or.siteUrl,
      siteName: or.siteName,
      stream: or.stream,
      timeoutMs: or.timeoutMs,
      maxTokens: or.maxTokens,
      temperature: or.temperature,
    },
    supabase: {
      configured: isSupabaseReady(sb),
      host,
      keyType: sb.serviceRoleKey ? "service_role" : sb.anonKey ? "anon" : "none",
    },
    limits: getChatLimits(),
    environment: process.env.NODE_ENV ?? "development",
  };
}

export type CheckStatus = "ok" | "warn" | "fail" | "skip";
export type CheckResult = { id: string; label: string; status: CheckStatus; detail: string; latencyMs?: number };
export type ConnectionReport = { ok: boolean; testedAt: string; checks: CheckResult[] };

const formatUsd = (value: number) => `$${value.toFixed(value < 1 ? 4 : 2)}`;

async function fetchModelCatalog(baseUrl: string, apiKey: string): Promise<Set<string>> {
  const response = await fetch(`${baseUrl}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(15_000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const body = (await response.json()) as { data?: Array<{ id?: unknown; canonical_slug?: unknown }> };
  const ids = new Set<string>();
  for (const item of body.data ?? []) {
    if (typeof item.id === "string") ids.add(item.id);
    if (typeof item.canonical_slug === "string") ids.add(item.canonical_slug);
  }
  return ids;
}

/** Uji koneksi menyeluruh: kunci API, katalog model, permintaan chat kecil, Supabase. */
export async function runConnectionTest(): Promise<ConnectionReport> {
  const config = getOpenRouterConfig();
  const checks: CheckResult[] = [];

  if (!config.apiKey || !config.model) {
    checks.push({
      id: "config",
      label: "Konfigurasi OpenRouter",
      status: "fail",
      detail: !config.apiKey
        ? "OPENROUTER_API_KEY belum diatur di environment server."
        : "OPENROUTER_MODEL belum diatur. Isi dengan model ID dari katalog OpenRouter.",
    });
  } else {
    const client = createOpenRouterClient(config);

    // 1) Validasi API key (GET /key)
    const keyStart = Date.now();
    try {
      const { data } = await client.apiKeys.getCurrentKeyMetadata(undefined, { signal: AbortSignal.timeout(15_000) });
      const parts = [`Label: ${data.label || "—"}`];
      if (data.limitRemaining !== null && data.limitRemaining !== undefined) {
        parts.push(`sisa limit ${formatUsd(data.limitRemaining)}`);
      }
      parts.push(`pemakaian ${formatUsd(data.usage ?? 0)}`);
      if (data.isFreeTier) parts.push("akun tier gratis");
      checks.push({
        id: "key",
        label: "API key",
        status:
          data.limitRemaining !== null && data.limitRemaining !== undefined && data.limitRemaining <= 0 ? "warn" : "ok",
        detail: `Kunci valid. ${parts.join(" · ")}.`,
        latencyMs: Date.now() - keyStart,
      });
    } catch (error) {
      const failure = toProviderError(error);
      const unreadable = failure.code === "unknown" && /format/i.test(failure.message);
      checks.push({
        id: "key",
        label: "API key",
        status: unreadable ? "warn" : "fail",
        detail: unreadable
          ? "Kunci diterima, tetapi detail kuota tidak dapat dibaca."
          : failure.code === "auth"
            ? "API key ditolak (401). Periksa OPENROUTER_API_KEY."
            : `Gagal memeriksa kunci: ${failure.message}`,
        latencyMs: Date.now() - keyStart,
      });
    }

    // 2) Model ada di katalog?
    const catalogStart = Date.now();
    try {
      const catalog = await fetchModelCatalog(config.baseUrl, config.apiKey);
      const models = [config.model, ...config.fallbackModels];
      const missing = models.filter((model) => !catalog.has(model));
      checks.push({
        id: "catalog",
        label: "Katalog model",
        status: missing.length === 0 ? "ok" : missing.includes(config.model) ? "fail" : "warn",
        detail:
          missing.length === 0
            ? `${models.length} model ditemukan di katalog OpenRouter.`
            : `Tidak ditemukan di katalog: ${missing.join(", ")}. Periksa penulisan model ID.`,
        latencyMs: Date.now() - catalogStart,
      });
    } catch (error) {
      checks.push({
        id: "catalog",
        label: "Katalog model",
        status: "warn",
        detail: `Katalog tidak dapat dimuat (${(error as Error).message}).`,
        latencyMs: Date.now() - catalogStart,
      });
    }

    // 3) Permintaan chat kecil ke model utama
    const chatStart = Date.now();
    try {
      const result = await client.chat.send(
        {
          chatRequest: {
            model: config.model,
            messages: [{ role: "user", content: "Uji koneksi. Balas hanya dengan kata: OK" }],
            maxTokens: 16,
            temperature: 0,
            stream: false,
          },
        },
        { signal: AbortSignal.timeout(Math.min(config.timeoutMs, 30_000)) },
      );
      const reply = result.choices[0]?.message?.content;
      const text = typeof reply === "string" ? reply.trim() : "";
      checks.push({
        id: "chat",
        label: "Permintaan chat",
        status: "ok",
        detail: `Model ${result.model || config.model} menjawab${text ? `: “${text.slice(0, 60)}”` : " (tanpa teks)"}.`,
        latencyMs: Date.now() - chatStart,
      });
    } catch (error) {
      const failure = toProviderError(error);
      checks.push({
        id: "chat",
        label: "Permintaan chat",
        status: "fail",
        detail: `${failure.code}${failure.status ? ` (${failure.status})` : ""}: ${failure.message}`,
        latencyMs: Date.now() - chatStart,
      });
    }
  }

  // 4) Supabase (opsional)
  if (isSupabaseReady(getSupabaseConfig())) {
    const sbStart = Date.now();
    const result = await inspectKnowledgeBase();
    checks.push({
      id: "supabase",
      label: "Supabase",
      status: result.ok ? "ok" : "warn",
      detail: result.ok
        ? `Terhubung. ${result.published} dari ${result.total} entri pengetahuan dipublikasikan.`
        : `Tidak dapat membaca tabel knowledge_base: ${result.message}. Chatbot tetap berjalan tanpa konteks tambahan.`,
      latencyMs: Date.now() - sbStart,
    });
  } else {
    checks.push({
      id: "supabase",
      label: "Supabase",
      status: "skip",
      detail: "Belum dikonfigurasi (opsional). Chatbot tetap berjalan melalui OpenRouter.",
    });
  }

  return {
    ok: checks.every((check) => check.status !== "fail"),
    testedAt: new Date().toISOString(),
    checks,
  };
}
