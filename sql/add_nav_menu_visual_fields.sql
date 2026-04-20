alter table if exists public.nav_menu_items
  add column if not exists image_url text,
  add column if not exists description text;
