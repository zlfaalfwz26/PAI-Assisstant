/**
 * Palet ilustrasi karakter maskot.
 * Dipakai bersama oleh kedua karakter agar identitas visualnya konsisten
 * (hijau yang sama untuk kemeja dan hijab, gaya kulit/mata yang sama).
 * Ini warna ilustrasi, bukan warna tema UI — warna tema ada di tokens.css.
 */
export const P = {
  green: {
    highlight: "#5fd59a",
    light: "#36bf78",
    base: "#22a565",
    mid: "#1b8f55",
    shadow: "#147245",
    deep: "#0d5533",
    seam: "#0b4a2c",
  },
  skin: {
    highlight: "#fde0c4",
    light: "#f6cfac",
    base: "#ecb88f",
    shadow: "#d59a70",
    deep: "#b97a52",
    line: "#9c5f3c",
  },
  hair: {
    light: "#5a4034",
    base: "#33241d",
    deep: "#1d140f",
  },
  eye: {
    iris: "#3a2418",
    pupil: "#1a0f0a",
    highlight: "#ffffff",
  },
  mouth: {
    line: "#8f3a2c",
    inside: "#6d2420",
    tongue: "#e2716f",
    teeth: "#fffaf5",
    lipFemale: "#b4475a",
  },
  blush: "#ff8c86",
  cream: {
    highlight: "#fffaf2",
    base: "#f2e7d6",
    shadow: "#d9c8ad",
    deep: "#bfa985",
  },
  book: {
    cover: "#2563eb",
    coverShadow: "#1e40af",
    pages: "#fffaf0",
    accent: "#fbbf24",
  },
  accent: {
    sweat: "#8cc8ff",
    heart: "#ff7a8a",
    spark: "#ffd166",
    thought: "#ffffff",
  },
} as const;
