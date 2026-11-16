import { afterEach, describe, expect, it, vi } from "vitest";
import { getOpenRouterConfig, looksLikeModelId, maskSecret } from "@/lib/server/env";
import { createSessionToken, passwordMatches, verifySessionToken } from "@/lib/server/admin-auth";
import { checkRateLimit, resetRateLimits } from "@/lib/server/rate-limit";
import { selectRelevant, tokenize, type KnowledgeEntry } from "@/lib/server/knowledge";

vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }));

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("env", () => {
  it("menyamarkan API key", () => {
    const masked = maskSecret("sk-or-v1-abcdef0123456789abcdef0123456789");
    expect(masked).toBe("sk-or-v1-••••••••••••6789");
    expect(masked).not.toContain("abcdef");
    expect(maskSecret("")).toBe("");
    expect(maskSecret("pendek")).not.toContain("pendek");
  });

  it("membaca model utama & alternatif dari environment", () => {
    vi.stubEnv("OPENROUTER_MODEL", "provider/model-a");
    vi.stubEnv("OPENROUTER_FALLBACK_MODELS", "provider/model-b, provider/model-a,\nprovider/model-c,provider/model-b");
    vi.stubEnv("OPENROUTER_TIMEOUT_MS", "10");
    vi.stubEnv("OPENROUTER_STREAM", "false");
    vi.stubEnv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1/");
    const config = getOpenRouterConfig();
    expect(config.model).toBe("provider/model-a");
    expect(config.fallbackModels).toEqual(["provider/model-b", "provider/model-c"]);
    expect(config.timeoutMs).toBe(5000); // dibatasi minimal 5 detik
    expect(config.stream).toBe(false);
    expect(config.baseUrl).toBe("https://openrouter.ai/api/v1");
  });

  it("tidak mengasumsikan model bawaan", () => {
    vi.stubEnv("OPENROUTER_MODEL", "");
    expect(getOpenRouterConfig().model).toBe("");
  });

  it("mengenali format model ID OpenRouter", () => {
    expect(looksLikeModelId("meta-llama/llama-3.3-70b-instruct:free")).toBe(true);
    expect(looksLikeModelId("gpt-4")).toBe(false);
  });
});

describe("admin-auth", () => {
  const config = { password: "rahasia-panjang", sessionSecret: "s".repeat(64) };

  it("memverifikasi token yang sah", () => {
    expect(verifySessionToken(createSessionToken(config), config)).toBe(true);
  });

  it("menolak token yang diubah atau kedaluwarsa", () => {
    const token = createSessionToken(config, Date.now());
    expect(verifySessionToken(`${token}x`, config)).toBe(false);
    expect(verifySessionToken(token.replace("v1.", "v1.9"), config)).toBe(false);
    expect(verifySessionToken(token, config, Date.now() + 9 * 60 * 60 * 1000)).toBe(false);
    expect(verifySessionToken(token, { ...config, sessionSecret: "lain" })).toBe(false);
  });

  it("membandingkan kata sandi", () => {
    expect(passwordMatches("rahasia-panjang", config)).toBe(true);
    expect(passwordMatches("salah", config)).toBe(false);
    expect(passwordMatches("", { password: "", sessionSecret: "" })).toBe(false);
  });
});

describe("rate-limit", () => {
  it("membatasi permintaan per jendela waktu", () => {
    resetRateLimits();
    const now = 1_000_000;
    expect(checkRateLimit("ip", 2, 60_000, now).ok).toBe(true);
    expect(checkRateLimit("ip", 2, 60_000, now + 1).ok).toBe(true);
    const blocked = checkRateLimit("ip", 2, 60_000, now + 2);
    expect(blocked.ok).toBe(false);
    expect(checkRateLimit("ip", 2, 60_000, now + 60_001).ok).toBe(true);
  });
});

describe("knowledge", () => {
  const entries: KnowledgeEntry[] = [
    { id: "1", title: "Jadwal kuliah", content: "x".repeat(4000), category: null, keywords: ["jadwal"] },
    { id: "2", title: "Kegiatan HMJ", content: "y".repeat(4000), category: null, keywords: ["kegiatan"] },
  ];

  it("membuang kata umum saat tokenisasi", () => {
    expect(tokenize("Apa saja kegiatan HMJ?")).toEqual(["kegiatan", "hmj"]);
  });

  it("memilih entri yang relevan dalam batas karakter", () => {
    expect(selectRelevant(entries, "kegiatan apa saja?").map((e) => e.id)).toEqual(["2"]);
  });

  it("memakai semua entri bila basis pengetahuan kecil", () => {
    const small = entries.map((e) => ({ ...e, content: "ringkas" }));
    expect(selectRelevant(small, "apa pun")).toHaveLength(2);
  });
});
