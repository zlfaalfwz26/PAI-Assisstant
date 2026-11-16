#!/usr/bin/env node
/**
 * MOCK OpenRouter (+ Supabase REST) — HANYA untuk pengembangan lokal & pengujian.
 * Meniru POST /api/v1/chat/completions (streaming SSE & non-streaming),
 * GET /api/v1/key, GET /api/v1/models, dan GET/HEAD /rest/v1/knowledge_base.
 *
 *   node scripts/mock-openrouter.mjs            (port 4010)
 *   OPENROUTER_BASE_URL=http://localhost:4010/api/v1
 *   OPENROUTER_API_KEY=mock-key
 *   OPENROUTER_MODEL=mock/pai-demo
 *
 * Skenario lewat nama model: mock/pai-demo (normal), mock/slow, mock/not-found,
 * mock/rate-limit, mock/down, mock/credits, mock/moderation, mock/midstream-error.
 */
import http from "node:http";
import { appendFileSync } from "node:fs";

const PORT = Number(process.env.MOCK_PORT || 4010);
const KEY = process.env.MOCK_KEY || "mock-key";
const LOG = process.env.MOCK_LOG || "";
const MODELS = [
  "mock/pai-demo",
  "mock/slow",
  "mock/rate-limit",
  "mock/down",
  "mock/credits",
  "mock/moderation",
  "mock/midstream-error",
];
const KNOWLEDGE =
  process.env.MOCK_KNOWLEDGE === "1"
    ? [
        {
          id: "11111111-1111-1111-1111-111111111111",
          title: "Contoh entri uji",
          content: "Ini hanya data uji dari mock server, bukan data jurusan.",
          category: "uji",
          keywords: ["uji", "contoh"],
        },
      ]
    : [];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const log = (entry) => LOG && appendFileSync(LOG, JSON.stringify({ at: new Date().toISOString(), ...entry }) + "\n");

function json(res, status, body, headers = {}) {
  res.writeHead(status, { "content-type": "application/json", ...headers });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
  });
}

function demoAnswer(messages) {
  const last = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const system = messages.find((m) => m.role === "system")?.content ?? "";
  const titles = [...system.matchAll(/^### (.+)$/gm)].map((m) => m[1]);
  return [
    "Terima kasih atas pertanyaannya! Ini **jawaban demo** dari server tiruan (mock), bukan dari model AI sungguhan.",
    "",
    `> ${last.slice(0, 160)}`,
    "",
    "Beberapa poin contoh:",
    "1. Jawaban dikirim **bertahap** melalui Server-Sent Events.",
    "2. Format *markdown* seperti daftar, `kode`, dan tautan ditampilkan dengan rapi.",
    "3. Hubungkan OpenRouter sungguhan dengan mengisi `OPENROUTER_API_KEY` dan `OPENROUTER_MODEL`.",
    "",
    titles.length
      ? `Konteks resmi yang diterima: ${titles.join(", ")}.`
      : "Konteks resmi: belum ada data yang dimasukkan.",
  ].join("\n");
}

function chunk(model, delta, finish = null, extra = {}) {
  return {
    id: "gen-mock",
    object: "chat.completion.chunk",
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [{ index: 0, delta, finish_reason: finish }],
    ...extra,
  };
}

async function chatCompletions(req, res) {
  const raw = await readBody(req);
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return json(res, 400, { error: { code: 400, message: "Invalid JSON" } });
  }
  const auth = req.headers.authorization || "";
  log({
    path: "/chat/completions",
    model: body.model,
    stream: Boolean(body.stream),
    authOk: auth === `Bearer ${KEY}`,
    referer: req.headers["http-referer"] || null,
    title: req.headers["x-openrouter-title"] || null,
    messages: (body.messages || []).length,
    systemChars: (body.messages || []).find((m) => m.role === "system")?.content?.length ?? 0,
    maxTokens: body.max_tokens ?? null,
  });
  if (auth !== `Bearer ${KEY}`) return json(res, 401, { error: { code: 401, message: "No auth credentials found" } });

  const model = body.model;
  if (!MODELS.includes(model))
    return json(res, 404, { error: { code: 404, message: `No endpoints found for ${model}.` } });
  if (model === "mock/rate-limit") return json(res, 429, { error: { code: 429, message: "Rate limit exceeded" } });
  if (model === "mock/down") return json(res, 503, { error: { code: 503, message: "Service unavailable" } });
  if (model === "mock/credits") return json(res, 402, { error: { code: 402, message: "Insufficient credits" } });
  if (model === "mock/moderation") return json(res, 403, { error: { code: 403, message: "Input flagged" } });

  const answer =
    model === "mock/midstream-error"
      ? "Jawaban ini akan terputus di tengah jalan karena"
      : demoAnswer(body.messages || []);

  if (!body.stream) {
    if (model === "mock/slow") await sleep(8000);
    return json(res, 200, {
      id: "gen-mock",
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model,
      system_fingerprint: null,
      choices: [{ index: 0, finish_reason: "stop", message: { role: "assistant", content: answer } }],
      usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
    });
  }

  res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive" });
  let closed = false;
  req.on("close", () => (closed = true));
  res.write(": OPENROUTER PROCESSING\n\n");
  if (model === "mock/slow") await sleep(8000);
  const send = (payload) => !closed && res.write(`data: ${JSON.stringify(payload)}\n\n`);
  send(chunk(model, { role: "assistant", content: "" }));
  const pieces = answer.match(/\S+\s*|\s+/g) || [];
  for (const piece of pieces) {
    if (closed) return;
    send(chunk(model, { content: piece }));
    await sleep(18);
  }
  if (model === "mock/midstream-error") {
    send(chunk(model, { content: "" }, "error", { error: { code: 502, message: "Provider disconnected" } }));
    return res.end();
  }
  send(
    chunk(model, {}, "stop", {
      usage: { prompt_tokens: 10, completion_tokens: pieces.length, total_tokens: 10 + pieces.length },
    }),
  );
  res.write("data: [DONE]\n\n");
  res.end();
}

function keyInfo(req, res) {
  if ((req.headers.authorization || "") !== `Bearer ${KEY}`) {
    return json(res, 401, { error: { code: 401, message: "No auth credentials found" } });
  }
  json(res, 200, {
    data: {
      allowed_data_regions: ["global"],
      budgets: [],
      byok_usage: 0,
      byok_usage_daily: 0,
      byok_usage_monthly: 0,
      byok_usage_weekly: 0,
      creator_user_id: null,
      effective_budget: null,
      free_model_daily_requests: { limit: 50, remaining: 50, used: 0 },
      include_byok_in_limit: false,
      is_free_tier: false,
      is_management_key: false,
      is_provisioning_key: false,
      label: "mock-key (uji lokal)",
      limit: 10,
      limit_remaining: 9.75,
      limit_reset: null,
      organization_id: null,
      rate_limit: { interval: "10s", note: "mock", requests: 100 },
      usage: 0.25,
      usage_daily: 0.01,
      usage_monthly: 0.25,
      usage_weekly: 0.05,
      workspace_id: null,
    },
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  try {
    if (req.method === "POST" && url.pathname === "/api/v1/chat/completions") return await chatCompletions(req, res);
    if (req.method === "GET" && url.pathname === "/api/v1/key") return keyInfo(req, res);
    if (req.method === "GET" && url.pathname === "/api/v1/models") {
      return json(res, 200, { data: MODELS.map((id) => ({ id, canonical_slug: id, name: id })) });
    }
    if (url.pathname === "/rest/v1/knowledge_base") {
      log({ path: "/rest/v1/knowledge_base", method: req.method, query: url.search });
      const range = `0-${Math.max(0, KNOWLEDGE.length - 1)}/${KNOWLEDGE.length}`;
      if (req.method === "HEAD") {
        res.writeHead(200, { "content-range": range, "content-type": "application/json" });
        return res.end();
      }
      return json(res, 200, KNOWLEDGE, { "content-range": range });
    }
    json(res, 404, { error: { code: 404, message: "Not found" } });
  } catch (error) {
    json(res, 500, { error: { code: 500, message: String(error) } });
  }
});

server.listen(PORT, () => console.log(`Mock OpenRouter berjalan di http://localhost:${PORT}/api/v1`));
