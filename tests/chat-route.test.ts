/**
 * Uji integrasi POST /api/chat terhadap mock OpenRouter (scripts/mock-openrouter.mjs).
 * Memastikan: streaming, model alternatif, pemetaan galat, batas waktu, rate limit,
 * dan chatbot tetap berjalan tanpa Supabase.
 */
import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { resetRateLimits } from "@/lib/server/rate-limit";
import { POST } from "@/app/api/chat/route";

const PORT = 4300 + Math.floor(Math.random() * 500);
const BASE = `http://127.0.0.1:${PORT}/api/v1`;
let mock: ChildProcess;

beforeAll(async () => {
  mock = spawn(process.execPath, [path.resolve(__dirname, "../scripts/mock-openrouter.mjs")], {
    env: { ...process.env, MOCK_PORT: String(PORT), MOCK_KEY: "test-key" },
    stdio: ["ignore", "pipe", "inherit"],
  });
  await new Promise<void>((resolve) => mock.stdout!.once("data", () => resolve()));
});

afterAll(() => {
  mock.kill();
});

beforeEach(() => {
  vi.unstubAllEnvs();
  resetRateLimits();
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
  vi.stubEnv("OPENROUTER_BASE_URL", BASE);
  vi.stubEnv("OPENROUTER_API_KEY", "test-key");
  vi.stubEnv("OPENROUTER_MODEL", "mock/pai-demo");
  vi.stubEnv("OPENROUTER_FALLBACK_MODELS", "");
  vi.stubEnv("OPENROUTER_STREAM", "true");
  vi.stubEnv("OPENROUTER_TIMEOUT_MS", "20000");
  vi.stubEnv("SUPABASE_URL", "");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
  vi.stubEnv("SUPABASE_ANON_KEY", "");
  vi.stubEnv("CHAT_RATE_LIMIT_PER_MINUTE", "50");
});

function chatRequest(content = "Apa itu PAI?", headers: Record<string, string> = {}) {
  return new Request("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "http://localhost:3000", Host: "localhost:3000", ...headers },
    body: JSON.stringify({ messages: [{ role: "user", content }] }),
  });
}

type Event = { event: string; data: Record<string, unknown> };

async function collect(response: Response): Promise<{ events: Event[]; text: string }> {
  const raw = await response.text();
  const events = raw
    .split("\n\n")
    .map((block) => {
      const event = block.match(/^event: (.+)$/m)?.[1];
      const data = block.match(/^data: (.+)$/m)?.[1];
      return event && data ? { event, data: JSON.parse(data) as Record<string, unknown> } : null;
    })
    .filter((item): item is Event => item !== null);
  const text = events
    .filter((e) => e.event === "delta")
    .map((e) => e.data.text)
    .join("");
  return { events, text };
}

describe("POST /api/chat", () => {
  it("503 not_configured bila API key/model belum diatur", async () => {
    vi.stubEnv("OPENROUTER_MODEL", "");
    const response = await POST(chatRequest());
    expect(response.status).toBe(503);
    expect(((await response.json()) as { error: { code: string } }).error.code).toBe("not_configured");
  });

  it("mengalirkan jawaban via SSE (meta → delta → done)", async () => {
    const response = await POST(chatRequest("Apa itu PAI?"));
    expect(response.headers.get("content-type")).toContain("text/event-stream");
    const { events, text } = await collect(response);
    expect(events[0]).toEqual({ event: "meta", data: { model: "mock/pai-demo", attempt: 1 } });
    expect(events.at(-1)?.event).toBe("done");
    expect(text).toContain("jawaban demo");
    expect(text).toContain("Apa itu PAI?");
  });

  it("mode non-streaming tetap berfungsi", async () => {
    vi.stubEnv("OPENROUTER_STREAM", "false");
    const { events, text } = await collect(await POST(chatRequest()));
    expect(events.filter((e) => e.event === "delta")).toHaveLength(1);
    expect(events.at(-1)?.event).toBe("done");
    expect(text).toContain("jawaban demo");
  });

  it("berpindah ke model alternatif bila model utama tidak ditemukan", async () => {
    vi.stubEnv("OPENROUTER_MODEL", "mock/tidak-ada");
    vi.stubEnv("OPENROUTER_FALLBACK_MODELS", "mock/down,mock/pai-demo");
    const { events, text } = await collect(await POST(chatRequest()));
    expect(events.find((e) => e.event === "meta")?.data).toEqual({ model: "mock/pai-demo", attempt: 3 });
    expect(events.at(-1)?.event).toBe("done");
    expect(text.length).toBeGreaterThan(20);
  });

  it.each([
    ["mock/down", "unavailable"],
    ["mock/rate-limit", "rate_limited"],
    ["mock/credits", "credits"],
    ["mock/moderation", "moderation"],
    ["mock/tidak-ada", "model_unavailable"],
  ])("memetakan kegagalan %s → %s", async (model, code) => {
    vi.stubEnv("OPENROUTER_MODEL", model);
    const { events } = await collect(await POST(chatRequest()));
    const error = events.find((e) => e.event === "error");
    expect(error?.data.code).toBe(code);
    expect(typeof error?.data.message).toBe("string");
  });

  it("tidak memakai model alternatif untuk galat akun (402)", async () => {
    vi.stubEnv("OPENROUTER_MODEL", "mock/credits");
    vi.stubEnv("OPENROUTER_FALLBACK_MODELS", "mock/pai-demo");
    const { events } = await collect(await POST(chatRequest()));
    expect(events.some((e) => e.event === "delta")).toBe(false);
    expect(events.find((e) => e.event === "error")?.data.code).toBe("credits");
  });

  it("menyimpan jawaban parsial lalu melaporkan galat di tengah stream", async () => {
    vi.stubEnv("OPENROUTER_MODEL", "mock/midstream-error");
    vi.stubEnv("OPENROUTER_FALLBACK_MODELS", "mock/pai-demo");
    const { events, text } = await collect(await POST(chatRequest()));
    expect(text).toContain("terputus");
    expect(events.at(-1)?.event).toBe("error");
    expect(events.filter((e) => e.event === "meta")).toHaveLength(1);
  });

  it("API key yang salah → auth", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "kunci-salah");
    const { events } = await collect(await POST(chatRequest()));
    expect(events.find((e) => e.event === "error")?.data.code).toBe("auth");
  });

  it("OpenRouter tidak dapat dihubungi → unavailable", async () => {
    vi.stubEnv("OPENROUTER_BASE_URL", "http://127.0.0.1:9/api/v1");
    const { events } = await collect(await POST(chatRequest()));
    expect(events.find((e) => e.event === "error")?.data.code).toBe("unavailable");
  });

  it("batas waktu → timeout", async () => {
    vi.stubEnv("OPENROUTER_MODEL", "mock/slow");
    vi.stubEnv("OPENROUTER_TIMEOUT_MS", "5000");
    const started = Date.now();
    const { events } = await collect(await POST(chatRequest()));
    expect(events.find((e) => e.event === "error")?.data.code).toBe("timeout");
    expect(Date.now() - started).toBeLessThan(7500);
  }, 15_000);

  it("rate limit lokal per IP", async () => {
    vi.stubEnv("CHAT_RATE_LIMIT_PER_MINUTE", "1");
    const first = await POST(chatRequest("hai", { "x-forwarded-for": "10.0.0.7" }));
    await first.text();
    const second = await POST(chatRequest("hai lagi", { "x-forwarded-for": "10.0.0.7" }));
    expect(second.status).toBe(429);
    expect(second.headers.get("retry-after")).toBeTruthy();
  });

  it("menolak permintaan lintas situs", async () => {
    const response = await POST(chatRequest("hai", { Origin: "https://situs-lain.example" }));
    expect(response.status).toBe(403);
  });

  it("tetap menjawab walau Supabase gagal diakses", async () => {
    vi.stubEnv("SUPABASE_URL", "http://127.0.0.1:9");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "kunci-uji");
    const { events } = await collect(await POST(chatRequest()));
    expect(events.at(-1)?.event).toBe("done");
  }, 15_000);
});
