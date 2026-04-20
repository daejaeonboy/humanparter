alter table public.notice_posts
add column if not exists attachments jsonb not null default '[]'::jsonb;
