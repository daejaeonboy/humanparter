create extension if not exists "pgcrypto";

create table if not exists public.faqs (
    id uuid default gen_random_uuid() primary key,
    category text not null,
    question text not null,
    answer text not null,
    display_order integer default 0,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

alter table public.faqs
add column if not exists updated_at timestamp with time zone default now();

create index if not exists faqs_display_order_idx
on public.faqs (display_order asc);

grant select, insert, update, delete on public.faqs to anon, authenticated;

alter table public.faqs enable row level security;

drop policy if exists "faqs_read" on public.faqs;
create policy "faqs_read" on public.faqs
for select
using (true);

drop policy if exists "faqs_insert" on public.faqs;
create policy "faqs_insert" on public.faqs
for insert
with check (true);

drop policy if exists "faqs_update" on public.faqs;
create policy "faqs_update" on public.faqs
for update
using (true)
with check (true);

drop policy if exists "faqs_delete" on public.faqs;
create policy "faqs_delete" on public.faqs
for delete
using (true);
