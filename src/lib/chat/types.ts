/** Tipe bersama antara browser dan server untuk fitur chat. */

export type WireRole = "user" | "assistant";

export type WireMessage = {
  role: WireRole;
  content: string;
};

export type ChatRequestBody = {
  messages: WireMessage[];
};

export type ChatErrorCode =
  | "not_configured"
  | "invalid_input"
  | "rate_limited_local"
  | "forbidden_origin"
  | "auth"
  | "credits"
  | "rate_limited"
  | "model_unavailable"
  | "moderation"
  | "timeout"
  | "unavailable"
  | "context_too_long"
  | "bad_request"
  | "network"
  | "unknown";

/** Peristiwa SSE yang dikirim server ke browser. */
export type StreamEvent =
  | { event: "meta"; data: { model: string; attempt: number } }
  | { event: "delta"; data: { text: string } }
  | { event: "done"; data: { model: string; finishReason: string | null } }
  | { event: "error"; data: { code: ChatErrorCode; message: string; retryAfter?: number } };

/** Pesan galat yang ramah untuk pengunjung (tanpa detail teknis/rahasia). */
export const CHAT_ERROR_MESSAGES: Record<ChatErrorCode, string> = {
  not_configured: "Asisten AI belum dikonfigurasi oleh pengelola situs. Silakan coba lagi nanti atau hubungi HMJ PAI.",
  invalid_input: "Pesan tidak dapat diproses. Pastikan pesan tidak kosong dan tidak terlalu panjang.",
  rate_limited_local: "Kamu mengirim pesan terlalu cepat. Tunggu sebentar, lalu coba lagi.",
  forbidden_origin: "Permintaan ditolak karena berasal dari sumber yang tidak dikenal.",
  auth: "Layanan AI menolak kredensial server. Pengelola perlu memeriksa API key OpenRouter.",
  credits: "Kuota layanan AI sedang habis. Pengelola perlu menambah saldo OpenRouter.",
  rate_limited: "Layanan AI sedang ramai. Tunggu beberapa saat, lalu coba lagi.",
  model_unavailable: "Model AI yang digunakan sedang tidak tersedia. Silakan coba lagi beberapa saat lagi.",
  moderation: "Pesan ini tidak dapat diproses oleh layanan AI. Coba ubah kalimat pertanyaanmu.",
  timeout: "Layanan AI terlalu lama merespons. Silakan coba lagi.",
  unavailable: "OpenRouter sedang tidak dapat dihubungi, jadi asisten belum bisa menjawab. Silakan coba lagi nanti.",
  context_too_long: "Percakapan sudah terlalu panjang. Mulai percakapan baru, lalu ajukan pertanyaanmu lagi.",
  bad_request: "Permintaan tidak dapat diproses oleh layanan AI. Silakan coba lagi.",
  network: "Koneksi internetmu terputus atau server tidak dapat dihubungi. Periksa koneksi, lalu coba lagi.",
  unknown: "Terjadi kendala tak terduga. Silakan coba lagi.",
};
