create table if not exists public.seteuk_drafts (
  id uuid primary key default gen_random_uuid(),
  student_id text not null,
  grade text not null,
  subjects text[] not null,
  results jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.seteuk_drafts enable row level security;
grant select, insert on public.seteuk_drafts to anon, authenticated;
create policy "public can read drafts" on public.seteuk_drafts for select to anon, authenticated using (true);
create policy "public can create drafts" on public.seteuk_drafts for insert to anon, authenticated with check (true);
