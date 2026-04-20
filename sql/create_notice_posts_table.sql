create extension if not exists "pgcrypto";

create table if not exists public.notice_posts (
    id text primary key default gen_random_uuid()::text,
    title text not null,
    excerpt text not null,
    image_url text not null,
    published_at date not null,
    category text not null,
    content_html text not null,
    attachments jsonb not null default '[]'::jsonb,
    display_order integer default 0,
    is_active boolean not null default true,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

alter table public.notice_posts
add column if not exists attachments jsonb not null default '[]'::jsonb;

create index if not exists notice_posts_display_order_idx
on public.notice_posts (display_order asc);

create index if not exists notice_posts_is_active_idx
on public.notice_posts (is_active);

grant select, insert, update, delete on public.notice_posts to anon, authenticated;

alter table public.notice_posts enable row level security;

drop policy if exists "notice_posts_read" on public.notice_posts;
create policy "notice_posts_read" on public.notice_posts
for select
using (true);

drop policy if exists "notice_posts_insert" on public.notice_posts;
create policy "notice_posts_insert" on public.notice_posts
for insert
with check (true);

drop policy if exists "notice_posts_update" on public.notice_posts;
create policy "notice_posts_update" on public.notice_posts
for update
using (true)
with check (true);

drop policy if exists "notice_posts_delete" on public.notice_posts;
create policy "notice_posts_delete" on public.notice_posts
for delete
using (true);

insert into public.notice_posts (
    id,
    title,
    excerpt,
    image_url,
    published_at,
    category,
    content_html,
    attachments,
    display_order,
    is_active
)
values
(
    'notice-2026-office-rental-guide',
    'Office Rental Consultation Guide',
    'Reference guide for office furniture rental consultations and planning.',
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
    '2026-03-31',
    'news',
    '<h2>Consultation Scope</h2><p>This sample notice explains the consultation flow for office furniture rentals.</p><p>Replace this content after the table is created.</p>',
    '[]'::jsonb,
    1,
    true
),
(
    'notice-2026-installation-schedule-guide',
    'Installation Schedule Checklist',
    'Checklist for access time, loading path, and site coordination before installation.',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    '2026-03-28',
    'resources',
    '<h2>Before Installation</h2><p>Confirm access hours, elevator rules, and unloading routes before installation day.</p>',
    '[]'::jsonb,
    2,
    true
),
(
    'notice-2026-it-package-update',
    'IT Package Rental Update',
    'Sample update for bundled monitor, laptop, and accessory rentals.',
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
    '2026-03-24',
    'news',
    '<h2>Package Update</h2><p>This is placeholder content for a product or service update notice.</p>',
    '[]'::jsonb,
    3,
    true
),
(
    'notice-2026-customer-hours',
    'Customer Support Hours',
    'Business support hours and response flow overview.',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
    '2026-03-21',
    'news',
    '<h2>Support Hours</h2><p>This sample post outlines support hours and the expected response process.</p>',
    '[]'::jsonb,
    4,
    true
),
(
    'notice-2026-large-project-support',
    'Large Project Support Process',
    'Overview of support flow for large rental or installation projects.',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
    '2026-03-18',
    'news',
    '<h2>Project Support</h2><p>This sample post explains the process for larger projects that require closer coordination.</p>',
    '[]'::jsonb,
    5,
    true
),
(
    'notice-2026-site-checklist',
    'Site Preparation Checklist',
    'Reference checklist for moving, unloading, and site setup.',
    'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1200&q=80',
    '2026-03-15',
    'resources',
    '<h2>Preparation Checklist</h2><p>This sample post can be replaced with site-specific preparation notes and download links.</p>',
    '[]'::jsonb,
    6,
    true
)
on conflict (id) do update
set title = excluded.title,
    excerpt = excluded.excerpt,
    image_url = excluded.image_url,
    published_at = excluded.published_at,
    category = excluded.category,
    content_html = excluded.content_html,
    attachments = excluded.attachments,
    display_order = excluded.display_order,
    is_active = excluded.is_active,
    updated_at = now();
