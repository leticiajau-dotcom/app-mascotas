-- Esquema de referencia para sincronizar el MVP con Supabase (Postgres).
-- El MVP actual persiste todo localmente vía AsyncStorage (src/api/storage.ts);
-- estas tablas quedan listas para cuando se active la sincronización en la nube
-- usando el cliente de src/api/supabase.ts.

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  species text not null check (species in ('Dog', 'Cat', 'Other')),
  breed text,
  birth_date date,
  weight numeric(5, 2),
  photo_url text,
  chip_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.emergency_info (
  pet_id uuid primary key references public.pets (id) on delete cascade,
  owner_name text not null,
  owner_phone text not null,
  vet_name text,
  vet_phone text,
  vet_address text,
  allergies text,
  conditions text,
  blood_type text
);

alter table public.pets enable row level security;
alter table public.medical_events enable row level security;
alter table public.emergency_info enable row level security;

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
