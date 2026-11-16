import type { CharacterExpression } from "@/config/site";

/**
 * Heuristik ringan untuk memilih ekspresi maskot setelah jawaban selesai.
 * Tidak memakai LLM tambahan, tidak ada ekspresi marah.
 */

const DISTRESS =
  /\b(bingung|cemas|sedih|takut|stres|stress|galau|khawatir|susah|sulit|gagal|capek|lelah|putus asa|minder|gelisah|tertekan|bimbang|overthinking)\b/i;
const CLARIFY =
  /(apa yang (kamu|anda) maksud|maksud(nya|mu)?\b|bisa (di)?(jelaskan|perjelas)|boleh (di)?(jelaskan|perjelas)|kurang jelas|lebih spesifik)/i;
const MISSING_INFO =
  /\b(maaf|mohon maaf)\b[^.?!]{0,140}\b(belum|tidak)\b[^.?!]{0,40}\b(tersedia|memiliki|punya|ada|tercantum|terdapat)\b/i;

export function expressionForReply(userText: string, reply: string): CharacterExpression {
  if (DISTRESS.test(userText)) return "supportive";
  const text = reply.trim();
  if (MISSING_INFO.test(text.slice(0, 800))) return "apologetic";
  if (text.endsWith("?") && CLARIFY.test(text.slice(-300))) return "confused";
  return "happy";
}

export const EXPRESSION_STATUS: Record<CharacterExpression, string> = {
  neutral: "Siap membantu",
  happy: "Senang bisa membantu!",
  thinking: "Sedang berpikir…",
  confused: "Hmm, boleh diperjelas?",
  supportive: "Kami di sini untukmu",
  apologetic: "Mohon maaf, ada kendala",
};
