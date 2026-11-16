# Aset karakter penyambut

Saat ini karakter memakai **ilustrasi SVG bawaan** (placeholder bergaya 3D lembut) di
`src/components/characters/MaleCharacter.tsx` dan `FemaleCharacter.tsx`.

## Mengganti dengan gambar referensi resmi

1. Siapkan gambar **PNG/WebP transparan**, setengah badan, menghadap pengunjung,
   rasio ±4:5 (mis. 800×1000 px). Satu file per ekspresi.
2. Simpan di folder ini, misalnya:
   `male/neutral.webp`, `male/happy.webp`, `female/neutral.webp`, …
3. Isi path-nya di `src/config/site.ts`:

```ts
CHARACTERS: {
  male: {
    alt: "…",
    assets: {
      neutral: "/characters/male/neutral.webp",
      happy: "/characters/male/happy.webp",
      thinking: "/characters/male/thinking.webp",
      // confused, supportive, apologetic (opsional)
    },
  },
  female: { alt: "…", assets: { neutral: "/characters/female/neutral.webp" } },
},
```

Ekspresi yang tidak diisi otomatis memakai gambar `neutral`. Animasi mengambang,
muncul, dan reaksi saat disentuh tetap berjalan; untuk gerakan melambai pada
gambar, gunakan WebP/APNG animasi.

Ekspresi yang didukung: `happy`, `thinking`, `confused`, `neutral`, `supportive`,
`apologetic` (tidak ada ekspresi marah).
