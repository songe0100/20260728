create table if not exists public.seteuk_drafts (
  id uuid primary key default gen_random_uuid(),
  student_id text not null,
  grade text not null,
  subjects text[] not null,
  results jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.seteuk_drafts enable row level security;
-- Add authenticated-user policies when auth is enabled in the deployment.
