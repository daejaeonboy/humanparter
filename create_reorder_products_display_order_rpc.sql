create or replace function public.reorder_products_display_order(ordered_product_ids uuid[])
returns void
language sql
security definer
set search_path = public
as $$
  with ordered as (
    select product_id, ordinality
    from unnest(ordered_product_ids) with ordinality as t(product_id, ordinality)
  )
  update public.products as products
  set display_order = ordered.ordinality
  from ordered
  where products.id = ordered.product_id;
$$;

grant execute on function public.reorder_products_display_order(uuid[]) to anon;
grant execute on function public.reorder_products_display_order(uuid[]) to authenticated;
grant execute on function public.reorder_products_display_order(uuid[]) to service_role;
