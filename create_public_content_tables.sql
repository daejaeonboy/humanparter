create extension if not exists "uuid-ossp";

create table if not exists public.page_contents (
  id uuid default uuid_generate_v4() primary key,
  page_key text not null unique,
  content jsonb not null default '{}'::jsonb,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.notice_posts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  excerpt text default '',
  image_url text default '',
  published_at date default current_date,
  category text default '',
  content_html text default '',
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.page_contents disable row level security;
alter table public.notice_posts disable row level security;

create unique index if not exists idx_page_contents_page_key on public.page_contents(page_key);
create index if not exists idx_notice_posts_display_order on public.notice_posts(display_order);
create index if not exists idx_notice_posts_published_at on public.notice_posts(published_at desc);
