-- Esquema de la app web (petcare-web): Postgres es la persistencia real de
-- mascotas/eventos/estudios (ver src/lib/api/*.ts), Supabase Auth maneja el
-- login. Este archivo es idempotente: se puede volver a correr sin romper
-- datos existentes (create table if not exists / add column if not exists).

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  species text not null check (species in ('Dog', 'Cat', 'Other')),
  custom_species text, -- nombre propio cuando species = 'Other' (ej. "Conejo")
  breed text,
  birth_date date,
  weight numeric(5, 2),
  photo_url text,
  chip_number text,
  active boolean not null default true, -- false = mascota dada de baja
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pets add column if not exists custom_species text;

create table if not exists public.medical_events (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets (id) on delete cascade,
  category text not null check (
    category in ('Vacuna', 'Desparasitante', 'Medicamento', 'Turno Médico')
  ),
  title text not null,
  date timestamptz not null,
  time text,
  completed boolean not null default false,
  affiliate_url text,
  -- Cada cuántos días se repite (desparasitación, pipeta antipulgas, etc.).
  -- NULL/0 = no se repite.
  repeat_interval_days integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.medical_events add column if not exists repeat_interval_days integer;

create table if not exists public.emergency_info (
  pet_id uuid primary key references public.pets (id) on delete cascade,
  owner_name text not null,
  owner_phone text not null,
  vet_name text, -- Veterinario de cabecera
  vet_phone text,
  vet_address text,
  emergency_clinic_name text, -- Clínica de urgencia 24h
  emergency_clinic_phone text,
  allergies text,
  conditions text,
  blood_type text
);

create table if not exists public.pet_studies (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets (id) on delete cascade,
  file_url text not null,
  file_name text not null,
  mime_type text,
  kind text not null default 'image' check (kind in ('image', 'document')),
  label text,
  date timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.pets enable row level security;
alter table public.medical_events enable row level security;
alter table public.emergency_info enable row level security;
alter table public.pet_studies enable row level security;

create policy "Los dueños administran sus propias mascotas"
  on public.pets for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Los dueños administran los eventos de sus mascotas"
  on public.medical_events for all
  using (exists (select 1 from public.pets p where p.id = pet_id and p.owner_id = auth.uid()))
  with check (exists (select 1 from public.pets p where p.id = pet_id and p.owner_id = auth.uid()));

create policy "Los dueños administran la info de emergencia de sus mascotas"
  on public.emergency_info for all
  using (exists (select 1 from public.pets p where p.id = pet_id and p.owner_id = auth.uid()))
  with check (exists (select 1 from public.pets p where p.id = pet_id and p.owner_id = auth.uid()));

create policy "Los dueños administran los estudios de sus mascotas"
  on public.pet_studies for all
  using (exists (select 1 from public.pets p where p.id = pet_id and p.owner_id = auth.uid()))
  with check (exists (select 1 from public.pets p where p.id = pet_id and p.owner_id = auth.uid()));
