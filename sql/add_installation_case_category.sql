alter table public.installation_cases
  add column if not exists category text;

update public.installation_cases
set category = case
  when title ilike '%공공기관%'
    or subtitle ilike '%공공기관%'
    or content ilike '%공공기관%'
    or title ilike '%관공서%'
    or subtitle ilike '%관공서%'
    or content ilike '%관공서%'
    or title ilike '%학교%'
    or subtitle ilike '%학교%'
    or content ilike '%학교%'
  then '공공기관'
  else '임시사무실'
end
where coalesce(trim(category), '') = '';

create index if not exists idx_installation_cases_category
  on public.installation_cases (category);
