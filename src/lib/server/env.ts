import "server-only";
import { createHash } from "node:crypto";
import { siteConfig } from "@/config/site";

/**
 * Konfigurasi SERVER. Dibaca dari environment variable pada saat request,
 * tidak pernah dikirim ke browser. Lihat .env.example.
 */

export const DEFAULT_OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

function readString(name: string): string {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
}

function readInt(name: string, fallback: number, min: number, max: number): number {
  const raw = readString(name);
  if (!raw) return fallback;
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function readFloat(name: string, fallback: number, min: number, max: number): number {
  const raw = readString(name);
  if (!raw) return fallback;
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function readBool(name: string, fallback: boolean): boolean {
  const raw = readString(name).toLowerCase();
  if (["1", "true", "yes", "on", "ya"].includes(raw)) return true;
  if (["0", "false", "no", "off", "tidak"].includes(raw)) return false;
  return fallback;
}

function readList(name: string): string[] {
  return [
    ...new Set(
      readString(name)
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

function normalizeBaseUrl(value: string): string {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return DEFAULT_OPENROUTER_BASE_URL;
    return url.toString().replace(/\/+$/, "");
  } catch {
    return DEFAULT_OPENROUTER_BASE_URL;
  }
}

/* ------------------------------------------------------------------ */
/* OpenRouter                                                          */
/* ------------------------------------------------------------------ */

export type OpenRouterConfig = {
  baseUrl: string;
  apiKey: string;
  model: string;
  fallbackModels: string[];
  siteUrl: string;
  siteName: string;
  stream: boolean;
  timeoutMs: number;
  maxTokens: number;
  temperature: number;
};

export function getOpenRouterConfig(): OpenRouterConfig {
  const model = readString("OPENROUTER_MODEL");
  return {
    baseUrl: normalizeBaseUrl(readString("OPENROUTER_BASE_URL") || DEFAULT_OPENROUTER_BASE_URL),
    apiKey: readString("OPENROUTER_API_KEY"),
    model,
    fallbackModels: readList("OPENROUTER_FALLBACK_MODELS").filter((item) => item !== model),
    siteUrl: readString("OPENROUTER_SITE_URL"),
    siteName: readString("OPENROUTER_SITE_NAME") || siteConfig.APP_NAME,
    stream: readBool("OPENROUTER_STREAM", true),
    timeoutMs: readInt("OPENROUTER_TIMEOUT_MS", 60_000, 5_000, 300_000),
    maxTokens: readInt("OPENROUTER_MAX_TOKENS", 1024, 64, 16_384),
    temperature: readFloat("OPENROUTER_TEMPERATURE", 0.6, 0, 2),
  };
}

export function isOpenRouterReady(config: OpenRouterConfig): boolean {
  return Boolean(config.apiKey && config.model);
}

/** Pola umum model ID OpenRouter: "penyedia/nama-model" (opsional ":varian"). */
export function looksLikeModelId(model: string): boolean {
  return /^[a-z0-9][\w.-]*\/[\w.:-]+$/i.test(model);
}

/* ------------------------------------------------------------------ */
/* Supabase (opsional)                                                 */
/* ------------------------------------------------------------------ */

export type SupabaseConfig = {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
};

export function getSupabaseConfig(): SupabaseConfig {
  return {
    url: readString("SUPABASE_URL"),
    anonKey: readString("SUPABASE_ANON_KEY"),
    serviceRoleKey: readString("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

export function isSupabaseReady(config: SupabaseConfig): boolean {
  if (!config.url || !(config.serviceRoleKey || config.anonKey)) return false;
  try {
    const url = new URL(config.url);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Admin & batas penggunaan                                            */
/* ------------------------------------------------------------------ */

export type AdminConfig = {
  password: string;
  sessionSecret: string;
};

export function getAdminConfig(): AdminConfig {
  const password = readString("ADMIN_PASSWORD");
  const explicitSecret = readString("ADMIN_SESSION_SECRET");
  const sessionSecret =
    explicitSecret || (password ? createHash("sha256").update(`pai-admin-session:${password}`).digest("hex") : "");
  return { password, sessionSecret };
}

export type ChatLimits = {
  rateLimitPerMinute: number;
  maxInputChars: number;
  maxHistory: number;
};

export function getChatLimits(): ChatLimits {
  return {
    rateLimitPerMinute: readInt("CHAT_RATE_LIMIT_PER_MINUTE", 12, 1, 120),
    maxInputChars: readInt("CHAT_MAX_INPUT_CHARS", 2000, 200, 8000),
    maxHistory: readInt("CHAT_MAX_HISTORY", 12, 2, 40),
  };
}

/* ------------------------------------------------------------------ */
/* Utilitas                                                            */
/* ------------------------------------------------------------------ */

/** Samarkan rahasia untuk ditampilkan, mis. "sk-or-v1-••••••••••••3f9a". */
export function maskSecret(value: string): string {
  if (!value) return "";
  if (value.length <= 12) return "•".repeat(10);
  const prefix = value.match(/^(sk-or-v1-|sk-or-|sk-|eyJ)/)?.[0] ?? value.slice(0, 2);
  return `${prefix}${"•".repeat(12)}${value.slice(-4)}`;
}
