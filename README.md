# PAI Assistant

Ruang informasi dan teman berdiskusi untuk mengenal dunia Pendidikan Agama Islam.
Dibangun dengan **Next.js 16 (App Router) + TypeScript**, LLM melalui **OpenRouter**
(SDK resmi `@openrouter/sdk`), dan **Supabase opsional** untuk basis pengetahuan resmi.

## Fitur utama

- **Landing page** dengan dua karakter penyambut (laki-laki berkemeja hijau, perempuan berhijab hijau),
  lambaian tangan, kedipan, mengambang ringan, dan **balon sapaan acak** (berganti tiap halaman dimuat,
  tidak mengulang sapaan sebelumnya, kedua karakter tidak pernah mengucapkan kalimat yang sama).
- **AI Assistant** dengan streaming SSE, markdown aman, tombol berhenti/coba lagi, dan maskot yang
  berekspresi sesuai percakapan: `HAPPY`, `THINKING`, `CONFUSED`, `NEUTRAL`, `SUPPORTIVE`, `APOLOGETIC`.
- **Tema biru-putih / biru-navy** berbasis CSS variables (`src/styles/tokens.css`), dark mode di seluruh
  halaman, tersimpan di `localStorage`, mengikuti tema sistem bila belum memilih.
- **Dashboard admin** (`/admin`): status API key (tersamarkan), model aktif & alternatif, Supabase,
  batas penggunaan, dan tombol **Test Connection**.
- `prefers-reduced-motion` dihormati; di mobile gerakan dikurangi.

## Menjalankan secara lokal

```bash
npm install
cp .env.example .env.local   # lalu isi OPENROUTER_API_KEY & OPENROUTER_MODEL
npm run dev                  # http://localhost:3000
```

Belum punya API key? Coba dengan **mock OpenRouter** (hanya untuk pengembangan):

```bash
npm run mock:openrouter
# di .env.local:
# OPENROUTER_BASE_URL=http://localhost:4010/api/v1
# OPENROUTER_API_KEY=mock-key
# OPENROUTER_MODEL=mock/pai-demo
```

## Konfigurasi

| File | Isi |
| --- | --- |
| `.env.local` / env hosting | **Rahasia server**: `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `OPENROUTER_FALLBACK_MODELS`, `OPENROUTER_BASE_URL`, `OPENROUTER_SITE_URL`, `OPENROUTER_SITE_NAME`, `SUPABASE_*`, `ADMIN_PASSWORD`. Lihat `.env.example`. |
| `src/config/site.ts` | **Konfigurasi publik**: `APP_NAME`, `APP_DESCRIPTION`, `APP_LOGO`, `APP_THEME`, `PAI_VISION`, `PAI_MISSION`, `HMJ_ABOUT`, `TEAM_MEMBERS`, `SOCIAL_LINKS`, `WELCOME_GREETINGS_MALE/FEMALE`, aset karakter. |
| `src/config/assistant.ts` | Aturan & gaya bahasa asisten (prompt sistem). |
| `src/styles/tokens.css` | Semua warna tema (light & dark). |

**Data jurusan sengaja kosong.** Visi, misi, profil HMJ, dan tim tampil sebagai "belum ditambahkan"
sampai diisi dengan teks resmi. Asisten diinstruksikan untuk tidak mengarang informasi spesifik jurusan.

### Model OpenRouter

- `OPENROUTER_MODEL` wajib diisi dengan model ID dari katalog <https://openrouter.ai/models>
  (format `penyedia/nama-model`). Tidak ada model bawaan.
- `OPENROUTER_FALLBACK_MODELS` (opsional, dipisah koma) dicoba berurutan bila model utama gagal
  (model tidak ditemukan, rate limit, 5xx, timeout) **sebelum** jawaban mulai dikirim.
- Ganti model cukup lewat env lalu deploy ulang — tanpa mengubah kode.

### Keamanan

- API key hanya dibaca di server (`src/lib/server/*`, dilindungi `server-only`) dan tidak pernah dikirim
  ke browser, `localStorage`, atau repository. Cek setelah build: `npm run check:secrets`.
- `/api/chat`: validasi input, batas panjang & riwayat, rate limit per IP, tolak permintaan lintas situs.
- Dashboard: kata sandi dari `ADMIN_PASSWORD`, sesi cookie `HttpOnly` + `SameSite=Strict` bertanda tangan
  HMAC, batas percobaan login, dan `X-Frame-Options: DENY`.

### Supabase (opsional)

Jalankan `supabase/schema.sql` di SQL Editor Supabase, isi `SUPABASE_URL` dan
`SUPABASE_SERVICE_ROLE_KEY`. Entri `knowledge_base` dengan `is_published = true` dipakai sebagai
konteks resmi. Bila Supabase belum diatur atau gagal diakses, chatbot tetap berjalan via OpenRouter.

### Mengganti karakter

Lihat `public/characters/README.md` — cukup taruh PNG/WebP transparan per ekspresi dan isi path di
`src/config/site.ts`.

## Skrip

```bash
npm run dev            # pengembangan
npm run build && npm start
npm test               # unit + integrasi (memakai mock OpenRouter)
npm run typecheck
npm run check:secrets  # setelah build: pastikan rahasia tidak bocor ke bundle browser
```

## Deploy (contoh: Vercel)

1. Import repository, framework **Next.js**.
2. Isi Environment Variables sesuai `.env.example` (minimal `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`,
   dan `OPENROUTER_SITE_URL` = URL situs). Tambahkan `ADMIN_PASSWORD` untuk dashboard.
3. Deploy, buka `/admin`, lalu tekan **Test Connection**.

Catatan: rate limit bawaan disimpan di memori tiap instance; untuk perlindungan ketat di serverless,
gunakan penyimpanan bersama (mis. Upstash Redis).
