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
  INSTITUTION_NAME: "UIN SIBER SYEKH NURJATI CIREBON",
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
  PAI_VISION: "“Mengembangkan Keilmuan PAI Siber yang Unggul dan Transformatif Berkelas Dunia Berdasarkan Nilai-Nilai Islam Kaffah.”",
  PAI_MISSION: ["Menyelenggarakan pendidikan dan pengajaran berbasis IT untuk menghasilkan Guru PAI yang profesional, unggul kompetitif, dan berwawasan Moderasi Beragama.", "Menyelenggarakan penelitian bidang Pendidikan Agama Islam berwawasan moderat dengan pendekatan multidisipliner berbasis digital.","Mempublikasikan karya ilmiah bidang Pendidikan Agama Islam dengan memanfaatkan kemajuan teknologi.","Menyelenggarakan pengabdian kepada masyarakat dalam bidang PAI berbasis digital."] as string[],

  /* ---------------- Tentang HMJ PAI ----------------
   * Satu string per paragraf. Contoh: ["HMJ PAI adalah …", "Kami …"] */
  HMJ_ABOUT: ["Himpunan Mahasiswa Jurusan Pendidikan Agama Islam (HMJ PAI) merupakan organisasi kemahasiswaan di tingkat jurusan yang menjadi wadah bagi mahasiswa PAI untuk mengembangkan potensi, kapasitas intelektual, keterampilan organisasi, kepemimpinan, dan kemampuan sosial.",
              "HMJ PAI tidak hanya berperan sebagai organisasi pelaksana kegiatan mahasiswa, tetapi juga menjadi ruang aktualisasi, kolaborasi, aspirasi, dan pengembangan diri mahasiswa dalam lingkungan akademik maupun masyarakat.",
              "HMJ PAI berkomitmen untuk menciptakan lingkungan yang inklusif, mendukung, dan memberdayakan mahasiswa PAI agar dapat tumbuh menjadi individu yang kompeten, berintegritas, dan siap menghadapi tantangan di dunia pendidikan dan masyarakat."
              
            ] as string[],

  /* ---------------- Tim ----------------
   * Contoh:
   *   { name: "Nama Lengkap", role: "Ketua Umum", division: "Inti",
   *     photo: "/team/nama.jpg", instagram: "https://instagram.com/…" }
   */
TEAM_MEMBERS: [
  {
    name: "Zalfa Alfawaz",
    role: "Developer/Lead Full-Stack Developer",
    division: "Ketua Departemen Pendikbud",
    photo: "/team/ketua-departemen-zalfa.jpg",
    instagram: "https://instagram.com/Fazzlfaa_",
  },
  {
    name: "Cahya Qolbi F",
    role: "Technical Advisor",
    division: "Sekretaris Departemen Pendikbud",
    photo: "/team/sekretaris-departemen-cahya.jpg",
    instagram: "https://instagram.com/efjee_",
  },
    {
    name: "Salman Alfarisi",
    role: "Technical Advisor",
    division: "SC Departemen Pendikbud",
    photo: "/team/sc-departemen-salman.jpg",
    instagram: "https://instagram.com/efjee_",
  },
  {
    name: "Prince Adzhar Salisipan Duran",
    role: "QA / Quality Assurance Engineer",
    division: "Anggota Departemen Pendikbud",
  
    photo: "/team/anggota-prince.jpg",
    instagram: "https://instagram.com/adzhaari",
  },
  {
    name: "Nihayatus (Aya)",
    role: "QA / Quality Assurance Engineer",
    division: "Anggota Departemen Pendikbud",
    photo: "/team/anggota-nihayatus.jpg",
    instagram: "https://instagram.com/_nihayatus.sdh",
  },
  {
    name: "Khalida N",
    role: "Entry-Level Developer",
    division: "Anggota Departemen Pendikbud",
    photo: "/team/anggota-khalida.jpg",
    instagram: "https://instagram.com/khalidanfzh",
  },
  {
    name: "Zahfira N",
    role: "Entry-Level Developer",
    division: "Anggota Departemen Pendikbud",
    photo: "/team/anggota-zahfira.jpg",
    instagram: "https://instagram.com/zhfraheree_",
  },
  {
    name: "Sandi Maulana Y",
    role: "Entry-Level Developer",
    division: "Anggota Departemen Pendikbud",
    photo: "/team/anggota-sandi.jpg",
    instagram: "https://instagram.com/sndimaulanaysf_",
  },
] as TeamMember[],
  /* ---------------- Kontak & media sosial ---------------- */ 
  CONTACT_EMAIL: "",

SOCIAL_LINKS: [
  {
    platform: "Instagram",
    label: "@hmjpaiuinsscirebon",
    url: "https://www.instagram.com/hmjpaiuinsscirebon/",
  },
  {
    platform: "Instagram",
    label: "@pendikbud_hmjpai",
    url: "https://www.instagram.com/pendikbud_hmjpai/",
  },
  {
    platform: "Instagram",
    label: "@brainstormid_",
    url: "https://www.instagram.com/brainstormid_/",
  },
] as unknown as SocialLink[],

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
    "Ceritakan apa yang ingin kamu pelajari!",
    "Udah dengar tentang Fawaz? yuk cari tahu disini!",
    "Pernah dengar cerita tentang Fawaz? Katanya banyak hal menarik yang bisa dibahas!",
    "Hai! Fawaz punya satu pertanyaan menarik untukmu. Siap berdiskusi?",
    "Cahya punya cerita seru yang mungkin belum pernah kamu dengar!",
    "Kalau bertemu Kak Salman, kira-kira apa yang ingin kamu tanyakan?",
    "Fawaz, Cahya, dan Salman punya sudut pandang yang berbeda. Menarik, bukan?",
    "Ada Fawaz yang penuh ide, Cahya dengan ceritanya, dan Salman dengan sudut pandangnya!",
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
