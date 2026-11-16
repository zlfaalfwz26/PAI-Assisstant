/**
 * =====================================================================
 *  KONFIGURASI PUBLIK — PAI Assistant
 * =====================================================================
 *  File ini ikut terkirim ke browser, jadi JANGAN menaruh API key,
 *  kata sandi, atau rahasia apa pun di sini (gunakan `.env.local`).
 *
 *  Data jurusan/HMJ SENGAJA dikosongkan. Isi hanya dengan informasi
 *  resmi yang sudah diverifikasi. Bagian yang kosong otomatis tampil
 *  sebagai "belum tersedia" dan tidak dipakai sebagai konteks AI.
 * =====================================================================
 */

export type ThemePreference = "light" | "dark" | "system";

export type TeamMember = {
  /** Nama lengkap anggota tim. */
  name: string;
  /** Jabatan/peran, mis. "Ketua", "Pengembang". */
  role: string;
  /** Opsional: divisi/bidang. */
  division?: string;
  /** Opsional: path foto di folder /public, mis. "/team/nama.jpg". */
  photo?: string;
  /** Opsional: tautan profil (URL lengkap). */
  instagram?: string;
  linkedin?: string;
};

export type SocialPlatform =
  "instagram" | "youtube" | "tiktok" | "x" | "facebook" | "linkedin" | "website" | "email" | "whatsapp";

export type SocialLink = {
  platform: SocialPlatform;
  /** Teks yang ditampilkan, mis. "@hmjpai". */
  label: string;
  /** URL lengkap (https://…, mailto:…, atau https://wa.me/…). */
  url: string;
};

/** Ekspresi karakter maskot. Tidak ada ekspresi marah. */
export type CharacterExpression = "happy" | "thinking" | "confused" | "neutral" | "supportive" | "apologetic";

/**
 * Aset karakter pengganti (opsional). Biarkan kosong untuk memakai
 * ilustrasi SVG bawaan. Bila gambar referensi resmi sudah tersedia,
 * taruh PNG/WebP transparan di /public/characters lalu isi path-nya.
 * Ekspresi yang tidak diisi akan memakai gambar `neutral`.
 * Lihat /public/characters/README.md.
 */
export type CharacterAssets = Partial<Record<CharacterExpression, string>>;

export const siteConfig = {
  /* ---------------- Identitas aplikasi ---------------- */
  APP_NAME: "PAI Assistant",
  APP_TAGLINE: "Teman diskusi seputar Pendidikan Agama Islam",
  APP_DESCRIPTION: "Ruang informasi dan teman berdiskusi untuk mengenal dunia Pendidikan Agama Islam.",
  /** Path logo di folder /public. Ganti file-nya atau ubah path ini. */
  APP_LOGO: "/brand/logo.svg",
  /**
   * Tema awal bila pengunjung belum pernah memilih.
   * "system" = mengikuti pengaturan perangkat (disarankan).
   */
  APP_THEME: "system" as ThemePreference,

  /* ---------------- Identitas lembaga ----------------
   * Isi dengan nama resmi. Biarkan "" bila belum pasti. */
  INSTITUTION_NAME: "",
  DEPARTMENT_NAME: "Jurusan Pendidikan Agama Islam",
  DEPARTMENT_SHORT_NAME: "Jurusan PAI",
  HMJ_NAME: "HMJ PAI",
  HMJ_FULL_NAME: "Himpunan Mahasiswa Jurusan Pendidikan Agama Islam",

  /* ---------------- Visi & misi resmi ----------------
   * JANGAN diisi dengan teks karangan. Salin persis dari dokumen resmi.
   * Contoh:
   *   PAI_VISION: "Menjadi …",
   *   PAI_MISSION: ["Menyelenggarakan …", "Mengembangkan …"],
   */
  PAI_VISION: "MENJADIKAN",
  PAI_MISSION: ["MENYELENGGARAKAN", "MENGEMBANGKAN"] as string[],

  /* ---------------- Tentang HMJ PAI ----------------
   * Satu string per paragraf. Contoh: ["HMJ PAI adalah …", "Kami …"] */
  HMJ_ABOUT: ["HMJ PAI adalah organisasi mahasiswa yang berfokus pada pengembangan potensi dan keterampilan anggotanya dalam bidang Pendidikan Agama Islam."] as string[],

  /* ---------------- Tim ----------------
   * Contoh:
   *   { name: "Nama Lengkap", role: "Ketua Umum", division: "Inti",
   *     photo: "/team/nama.jpg", instagram: "https://instagram.com/…" }
   */
  TEAM_MEMBERS: [{ name: "Nama Lengkap", role: "Ketua Umum", division: "Inti", instagram: "https://instagram.com/…" }] as TeamMember[],

  /* ---------------- Kontak & media sosial ---------------- */ 
  CONTACT_EMAIL: "NAMA@GMAIL.COM",
  SOCIAL_LINKS: [] as SocialLink[],

  /* ---------------- Sapaan karakter penyambut ----------------
   * Dipilih acak di browser setiap halaman dimuat. Tidak memakai LLM. */
  WELCOME_GREETINGS_MALE: [
    "Assalamu'alaikum! Selamat datang di Jurusan PAI!",
    "Mau tahu lebih banyak tentang PAI?",
    "Halo! Ada yang bisa kami bantu?",
    "Sedang mencari informasi tentang PAI?",
    "Yuk, kenalan lebih dekat dengan jurusan kami!",
    "Ahlan wa sahlan! Senang kamu mampir.",
    "Penasaran kuliah di PAI itu seperti apa?",
    "Ada topik keislaman yang ingin didiskusikan?",
    "Mari jelajahi dunia Pendidikan Agama Islam bersama!",
  ] as string[],
  WELCOME_GREETINGS_FEMALE: [
    "Masih bingung? Yuk, tanya!",
    "Mau tanya-tanya seputar jurusan kami?",
    "Tenang, kami siap membantu!",
    "Punya pertanyaan tentang kehidupan mahasiswa PAI?",
    "Ada yang ingin kamu ketahui hari ini?",
    "Jangan ragu bertanya, ya!",
    "Yuk, ngobrol santai seputar PAI!",
    "Butuh teman diskusi materi keislaman?",
    "Ceritakan apa yang ingin kamu pelajari!",
  ] as string[],

  /* ---------------- Karakter maskot ---------------- */
  CHARACTERS: {
    male: {
      /** Deskripsi untuk pembaca layar. */
      alt: "Karakter laki-laki berkemeja hijau yang melambaikan tangan",
      /** Kosong = pakai SVG bawaan. */
      assets: {} as CharacterAssets,
    },
    female: {
      alt: "Karakter perempuan berhijab hijau yang melambaikan tangan",
      assets: {} as CharacterAssets,
    },
  },

  /* ---------------- Pertanyaan contoh di halaman chat ---------------- */
  STARTER_QUESTIONS: [
    "Apa itu Pendidikan Agama Islam?",
    "Apa saja yang biasanya dipelajari mahasiswa PAI?",
    "Bagaimana peran guru PAI di era digital?",
    "Jelaskan pengertian akhlak beserta contohnya.",
  ] as string[],
};

export type SiteConfig = typeof siteConfig;

/** Nama lembaga lengkap untuk ditampilkan, mis. "Jurusan PAI — Universitas X". */
export function institutionLabel(): string {
  return [siteConfig.DEPARTMENT_NAME, siteConfig.INSTITUTION_NAME].filter(Boolean).join(" — ");
}
