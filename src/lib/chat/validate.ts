import type { WireMessage } from "./types";

export type ValidationLimits = {
  maxInputChars: number;
  maxHistory: number;
  /** Batas panjang jawaban asisten sebelumnya yang ikut dikirim sebagai riwayat. */
  maxAssistantChars?: number;
};

export type ValidationResult = { ok: true; messages: WireMessage[] } | { ok: false; reason: string };

// Karakter kontrol selain tab & baris baru dibuang.
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

function clean(text: string) {
  return text.replace(CONTROL_CHARS, "").replace(/\r\n?/g, "\n").trim();
}

/**
 * Validasi & rapikan riwayat chat dari browser sebelum diteruskan ke LLM.
 * - hanya peran "user"/"assistant" (peran "system" dari browser ditolak),
 * - pesan terakhir wajib dari pengguna dan tidak melebihi batas karakter,
 * - riwayat dipangkas ke N pesan terakhir.
 */
export function validateMessages(input: unknown, limits: ValidationLimits): ValidationResult {
  if (!input || typeof input !== "object" || !Array.isArray((input as { messages?: unknown }).messages)) {
    return { ok: false, reason: "Format permintaan tidak valid." };
  }
  const raw = (input as { messages: unknown[] }).messages;
  if (raw.length === 0) return { ok: false, reason: "Pesan kosong." };
  if (raw.length > 200) return { ok: false, reason: "Riwayat percakapan terlalu panjang." };

  const maxAssistant = limits.maxAssistantChars ?? 6000;
  const messages: WireMessage[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") return { ok: false, reason: "Format pesan tidak valid." };
    const { role, content } = item as { role?: unknown; content?: unknown };
    if (role !== "user" && role !== "assistant") return { ok: false, reason: "Peran pesan tidak valid." };
    if (typeof content !== "string") return { ok: false, reason: "Isi pesan tidak valid." };
    const text = clean(content);
    if (!text) continue;
    const max = role === "user" ? limits.maxInputChars : maxAssistant;
    messages.push({ role, content: text.length > max ? text.slice(0, max) : text });
  }

  const last = messages[messages.length - 1];
  if (!last || last.role !== "user") return { ok: false, reason: "Pesan terakhir harus berasal dari pengguna." };

  const lastRaw = raw[raw.length - 1] as { content: string };
  if (clean(lastRaw.content).length > limits.maxInputChars) {
    return { ok: false, reason: `Pesan terlalu panjang (maksimal ${limits.maxInputChars} karakter).` };
  }

  let trimmed = messages.slice(-limits.maxHistory);
  // Riwayat harus diawali pesan pengguna.
  while (trimmed.length > 1 && trimmed[0].role !== "user") trimmed = trimmed.slice(1);

  return { ok: true, messages: trimmed };
}
