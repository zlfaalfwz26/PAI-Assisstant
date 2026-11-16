/**
 * Pemilihan sapaan acak untuk karakter penyambut.
 * Aturan:
 *  1. Daftar terpisah untuk tiap karakter.
 *  2. Dipilih acak sekali saat halaman dimuat (tidak berganti saat dibaca).
 *  3. Saat dimuat ulang, hindari kalimat yang sama dengan kunjungan sebelumnya.
 *  4. Kedua karakter tidak boleh mengucapkan kalimat yang sama.
 */

export type GreetingPick = { male: number; female: number };

export const GREETING_STORAGE_KEY = "pai-greeting-last";

type RandomFn = () => number;

const normalize = (text: string) => text.trim().toLowerCase().replace(/\s+/g, " ");

function randomIndex(length: number, random: RandomFn) {
  return Math.min(length - 1, Math.floor(random() * length));
}

/** Pilih indeks acak dari daftar, menghindari indeks tertentu bila memungkinkan. */
export function pickIndex(length: number, avoid: number[], random: RandomFn = Math.random): number {
  if (length <= 0) return -1;
  const pool = Array.from({ length }, (_, i) => i).filter((i) => !avoid.includes(i));
  if (pool.length === 0) return randomIndex(length, random);
  return pool[randomIndex(pool.length, random)];
}

export function pickGreetings(
  male: readonly string[],
  female: readonly string[],
  previous: Partial<GreetingPick> | null,
  random: RandomFn = Math.random,
): GreetingPick {
  const maleIndex = pickIndex(male.length, previous?.male !== undefined ? [previous.male] : [], random);
  const maleText = maleIndex >= 0 ? normalize(male[maleIndex]) : null;

  // Indeks perempuan yang kalimatnya sama dengan pilihan laki-laki selalu dihindari.
  const sameText = female.flatMap((text, i) => (maleText !== null && normalize(text) === maleText ? [i] : []));
  const avoidFemale = previous?.female !== undefined ? [...sameText, previous.female] : sameText;
  let femaleIndex = pickIndex(female.length, avoidFemale, random);
  if (femaleIndex >= 0 && sameText.includes(femaleIndex)) {
    // Hanya terjadi bila semua pilihan lain habis; coba tanpa batasan "sebelumnya".
    const fallback = pickIndex(female.length, sameText, random);
    if (!sameText.includes(fallback)) femaleIndex = fallback;
  }

  return { male: maleIndex, female: femaleIndex };
}

export function readLastGreeting(): Partial<GreetingPick> | null {
  try {
    const raw = window.localStorage.getItem(GREETING_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GreetingPick>;
    return {
      male: Number.isInteger(parsed.male) ? parsed.male : undefined,
      female: Number.isInteger(parsed.female) ? parsed.female : undefined,
    };
  } catch {
    return null;
  }
}

export function storeLastGreeting(pick: GreetingPick) {
  try {
    window.localStorage.setItem(GREETING_STORAGE_KEY, JSON.stringify(pick));
  } catch {
    /* penyimpanan bisa diblokir; abaikan */
  }
}
