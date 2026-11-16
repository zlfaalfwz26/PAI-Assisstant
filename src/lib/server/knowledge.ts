import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig, isSupabaseReady } from "./env";

/**
 * Basis pengetahuan resmi (opsional) dari tabel Supabase `knowledge_base`.
 * Bila Supabase belum dikonfigurasi atau gagal diakses, chatbot tetap
 * berjalan tanpa konteks tambahan.
 */

export type KnowledgeEntry = {
  id: string;
  title: string;
  content: string;
  category: string | null;
  keywords: string[];
};

const CACHE_TTL_MS = 60_000;
const CONTEXT_BUDGET_CHARS = 6_000;
const FETCH_TIMEOUT_MS = 2_500;
/** Setelah gagal, Supabase dilewati sementara agar chat tidak ikut melambat. */
const FAILURE_COOLDOWN_MS = 60_000;
let failedUntil = 0;

let cache: { at: number; key: string; entries: KnowledgeEntry[] } | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!isSupabaseReady(config)) return null;
  return createClient(config.url, config.serviceRoleKey || config.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

async function loadEntries(): Promise<KnowledgeEntry[]> {
  const config = getSupabaseConfig();
  if (!isSupabaseReady(config)) return [];
  const key = `${config.url}|${config.serviceRoleKey ? "srv" : "anon"}`;
  const now = Date.now();
  if (cache && cache.key === key && now - cache.at < CACHE_TTL_MS) return cache.entries;

  const client = getSupabaseClient();
  if (!client) return [];
  const { data, error } = await client
    .from("knowledge_base")
    .select("id,title,content,category,keywords")
    .eq("is_published", true)
    .order("updated_at", { ascending: false })
    .limit(200)
    .abortSignal(AbortSignal.timeout(FETCH_TIMEOUT_MS));
  if (error) throw new Error(`Supabase: ${error.message}`);

  const entries: KnowledgeEntry[] = (data ?? [])
    .filter((row) => typeof row.title === "string" && typeof row.content === "string" && row.content.trim())
    .map((row) => ({
      id: String(row.id),
      title: row.title.trim(),
      content: row.content.trim(),
      category: typeof row.category === "string" && row.category.trim() ? row.category.trim() : null,
      keywords: Array.isArray(row.keywords) ? row.keywords.filter((k: unknown) => typeof k === "string") : [],
    }));
  cache = { at: now, key, entries };
  return entries;
}

const STOPWORDS = new Set(
  (
    "yang dan di ke dari apa itu ini adalah untuk dengan saya aku kamu kami kita anda bagaimana berapa kapan siapa " +
    "mana dimana apakah bisa boleh tolong mohon jelaskan tentang ada akan atau juga sudah belum tidak bukan pada " +
    "dalam oleh sebagai karena agar seperti lebih sangat saja dong ya nih kak min halo hai assalamualaikum the a an of"
  ).split(" "),
);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));
}

/** Pilih entri paling relevan (pencocokan kata kunci sederhana) dalam batas karakter. */
export function selectRelevant(
  entries: KnowledgeEntry[],
  query: string,
  budget = CONTEXT_BUDGET_CHARS,
): KnowledgeEntry[] {
  if (entries.length === 0) return [];
  const total = entries.reduce((sum, entry) => sum + entry.title.length + entry.content.length, 0);
  if (total <= budget) return entries;

  const terms = new Set(tokenize(query));
  const scored = entries
    .map((entry) => {
      const title = entry.title.toLowerCase();
      const content = entry.content.toLowerCase();
      const keywords = entry.keywords.join(" ").toLowerCase();
      let score = 0;
      for (const term of terms) {
        if (title.includes(term)) score += 3;
        if (keywords.includes(term)) score += 3;
        if (content.includes(term)) score += 1;
      }
      return { entry, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const picked: KnowledgeEntry[] = [];
  let used = 0;
  for (const { entry } of scored) {
    const size = entry.title.length + entry.content.length;
    if (used + size > budget) {
      if (picked.length === 0) picked.push({ ...entry, content: entry.content.slice(0, budget) });
      continue;
    }
    picked.push(entry);
    used += size;
  }
  return picked;
}

/** Konteks pengetahuan untuk pertanyaan tertentu. Tidak pernah melempar galat. */
export async function getKnowledgeContext(query: string): Promise<KnowledgeEntry[]> {
  if (Date.now() < failedUntil) return [];
  try {
    const entries = await loadEntries();
    return selectRelevant(entries, query);
  } catch (error) {
    failedUntil = Date.now() + FAILURE_COOLDOWN_MS;
    console.warn("[knowledge] Supabase tidak dapat diakses, lanjut tanpa konteks:", (error as Error).message);
    return [];
  }
}

/** Untuk dashboard admin: uji koneksi & hitung entri. */
export async function inspectKnowledgeBase(): Promise<
  { ok: true; total: number; published: number } | { ok: false; message: string }
> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, message: "Supabase belum dikonfigurasi." };
  try {
    const signal = AbortSignal.timeout(FETCH_TIMEOUT_MS);
    const [all, published] = await Promise.all([
      client.from("knowledge_base").select("id", { count: "exact", head: true }).abortSignal(signal),
      client
        .from("knowledge_base")
        .select("id", { count: "exact", head: true })
        .eq("is_published", true)
        .abortSignal(signal),
    ]);
    const error = all.error ?? published.error;
    if (error) return { ok: false, message: error.message || "Tabel knowledge_base tidak dapat dibaca." };
    return { ok: true, total: all.count ?? 0, published: published.count ?? 0 };
  } catch (error) {
    return { ok: false, message: (error as Error).message || "Supabase tidak dapat dihubungi." };
  }
}
