alter table public.products
add column if not exists external_link_url text;

comment on column public.products.external_link_url
is '상품 클릭 시 외부 사이트로 이동할 선택 링크 URL';
