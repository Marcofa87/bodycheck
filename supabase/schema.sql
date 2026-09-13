-- BodyTrack — schema database
-- Esegui questo script nel SQL Editor di Supabase (Dashboard → SQL Editor → New query).

create table public.misurazioni (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data_misurazione date not null default current_date,

  -- Statistiche chiave
  peso_kg numeric(5,2),
  massa_grassa_kg numeric(5,2),
  massa_magra_kg numeric(5,2),
  grasso_corporeo_percentuale numeric(5,2),
  collo_cm numeric(5,2),
  torace_superiore_cm numeric(5,2),
  petto_cm numeric(5,2),
  vita_cm numeric(5,2),

  -- Braccia
  braccio_sinistro_cm numeric(5,2),
  braccio_destro_cm numeric(5,2),

  -- Gambe
  fianchi_cm numeric(5,2),
  vita_fianchi_cm numeric(5,2),
  coscia_superiore_sinistra_cm numeric(5,2),
  coscia_superiore_destra_cm numeric(5,2),
  coscia_inferiore_sinistra_cm numeric(5,2),
  coscia_inferiore_destra_cm numeric(5,2),
  polpaccio_sinistro_cm numeric(5,2),
  polpaccio_destro_cm numeric(5,2),

  note text,
  created_at timestamptz not null default now()
);

alter table public.misurazioni enable row level security;

create policy "Utenti vedono solo le proprie misurazioni"
  on public.misurazioni for select
  using (auth.uid() = user_id);

create policy "Utenti inseriscono solo le proprie misurazioni"
  on public.misurazioni for insert
  with check (auth.uid() = user_id);

create policy "Utenti aggiornano solo le proprie misurazioni"
  on public.misurazioni for update
  using (auth.uid() = user_id);

create policy "Utenti eliminano solo le proprie misurazioni"
  on public.misurazioni for delete
  using (auth.uid() = user_id);

create index misurazioni_user_data_idx on public.misurazioni (user_id, data_misurazione desc);
