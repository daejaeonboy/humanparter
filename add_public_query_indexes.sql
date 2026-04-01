create extension if not exists pg_trgm;

do $$
begin
  if to_regclass('public.nav_menu_items') is not null then
    create index if not exists idx_nav_menu_items_active_display_order
      on public.nav_menu_items (display_order)
      where is_active = true;
  end if;

  if to_regclass('public.quick_menu_items') is not null then
    create index if not exists idx_quick_menu_items_active_display_order
      on public.quick_menu_items (display_order)
      where is_active = true;
  end if;

  if to_regclass('public.banners') is not null then
    create index if not exists idx_banners_active_type_display_order
      on public.banners (banner_type, display_order)
      where is_active = true;
  end if;

  if to_regclass('public.popups') is not null then
    create index if not exists idx_popups_active_display_order_window
      on public.popups (display_order, start_date, end_date)
      where is_active = true;
  end if;

  if to_regclass('public.installation_cases') is not null then
    create index if not exists idx_installation_cases_active_display_order_created_at
      on public.installation_cases (display_order, created_at desc)
      where is_active = true;
  end if;

  if to_regclass('public.notice_posts') is not null then
    create index if not exists idx_notice_posts_active_display_order_published_at
      on public.notice_posts (display_order, published_at desc)
      where is_active = true;
  end if;

  if to_regclass('public.faqs') is not null then
    create index if not exists idx_faqs_display_order
      on public.faqs (display_order);
  end if;

  if to_regclass('public.faq_categories') is not null then
    create index if not exists idx_faq_categories_display_order
      on public.faq_categories (display_order);
  end if;

  if to_regclass('public.products') is not null then
    create index if not exists idx_products_display_order_created_at
      on public.products (display_order, created_at desc);

    create index if not exists idx_products_category_display_order_created_at
      on public.products (category, display_order, created_at desc);

    create index if not exists idx_products_product_type_display_order_created_at
      on public.products (product_type, display_order, created_at desc);

    create index if not exists idx_products_name_trgm
      on public.products using gin (name gin_trgm_ops);

    create index if not exists idx_products_short_description_trgm
      on public.products using gin (short_description gin_trgm_ops);

    create index if not exists idx_products_description_trgm
      on public.products using gin (description gin_trgm_ops);
  end if;
end
$$;
