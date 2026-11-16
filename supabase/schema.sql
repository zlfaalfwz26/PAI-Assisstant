-- =====================================================================
--  PAI Assistant — skema Supabase (OPSIONAL)
--  Jalankan di Supabase Dashboard → SQL Editor.
--  Tabel sengaja KOSONG: isi hanya dengan informasi resmi jurusan/HMJ.
-- =====================================================================

create extension if not exists pgcrypto;

create table if not exists public.knowledge_base (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  content      text not null,
  category     text,
  keywords     text[] not null default '{}',
  is_published boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists knowledge_base_published_idx
  on public.knowledge_base (is_published, updated_at desc);

-- Perbarui updated_at otomatis
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists knowledge_base_updated_at on public.knowledge_base;
create trigger knowledge_base_updated_at
  before update on public.knowledge_base
  for each row execute function public.set_updated_at();

-- Row Level Security: publik hanya bisa MEMBACA entri yang dipublikasikan.
-- Server memakai service role (melewati RLS) — kunci itu tidak pernah ke browser.
alter table public.knowledge_base enable row level security;

drop policy if exists "Baca entri terpublikasi" on public.knowledge_base;
create policy "Baca entri terpublikasi"
  on public.knowledge_base for select
  to anon, authenticated
  using (is_published = true);

-- Contoh menambah data (ganti dengan data RESMI, lalu set is_published = true):
-- insert into public.knowledge_base (title, content, category, keywords, is_published)
-- values ('Judul resmi', 'Isi informasi resmi…', 'akademik', array['kata','kunci'], true);
