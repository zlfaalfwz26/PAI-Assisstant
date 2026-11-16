import "server-only";

/**
 * Pembatas laju sederhana (sliding window) di memori proses.
 * Cukup untuk melindungi kuota API dari pemakaian berlebihan. Pada hosting
 * serverless tiap instance punya hitungan sendiri; untuk perlindungan ketat
 * gunakan penyimpanan bersama (mis. Redis/Upstash).
 */

type RateResult = { ok: true; remaining: number } | { ok: false; retryAfterMs: number };

const buckets = new Map<string, number[]>();
let lastSweep = 0;

export function checkRateLimit(key: string, limit: number, windowMs: number, now = Date.now()): RateResult {
  const recent = (buckets.get(key) ?? []).filter((time) => now - time < windowMs);
  if (recent.length >= limit) {
    buckets.set(key, recent);
    return { ok: false, retryAfterMs: Math.max(1000, windowMs - (now - recent[0])) };
  }
  recent.push(now);
  buckets.set(key, recent);
  sweep(now, windowMs);
  return { ok: true, remaining: limit - recent.length };
}

function sweep(now: number, windowMs: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, times] of buckets) {
    if (times.every((time) => now - time >= windowMs)) buckets.delete(key);
  }
}

/** Hanya untuk pengujian. */
export function resetRateLimits() {
  buckets.clear();
  lastSweep = 0;
}
