-- =========================================================
-- RespondeZap AI — Schema do banco de dados (Supabase / Postgres)
-- Execute este script no SQL Editor do seu projeto Supabase.
-- =========================================================

-- Tabela de perfis (dados complementares do usuário autenticado)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

-- Tabela de empresas (uma empresa por usuário na V1)
create type public.attendance_tone as enum ('formal', 'amigavel', 'tecnico');

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  segment text not null default '',
  products_services text not null default '',
  business_hours text not null default '',
  tone public.attendance_tone not null default 'amigavel',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

-- Tabela de respostas geradas pela IA (histórico)
create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company_id uuid references public.companies (id) on delete set null,
  customer_message text not null,
  ai_response text not null,
  created_at timestamptz not null default now()
);

-- =========================================================
-- Row Level Security: cada usuário só acessa os próprios dados
-- =========================================================

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.responses enable row level security;

create policy "Usuários visualizam o próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuários atualizam o próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Usuários gerenciam a própria empresa"
  on public.companies for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Usuários gerenciam as próprias respostas"
  on public.responses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =========================================================
-- Trigger: cria automaticamente um perfil ao cadastrar um usuário
-- =========================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
