-- R1-01: minimal public server-rendered settings projection.
-- Production writes remain admin-controlled in a later governed operator surface.

create table if not exists public.site_settings (
  key text primary key
    check (key ~ '^[a-z0-9_]+$'),
  value_text text not null,
  is_public boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

revoke all on table public.site_settings from anon, authenticated;
grant select (key, value_text, is_public, updated_at)
  on table public.site_settings
  to anon;

drop policy if exists site_settings_public_book_read
  on public.site_settings;

create policy site_settings_public_book_read
  on public.site_settings
  for select
  to anon
  using (
    is_public = true
    and key = 'book_purchase_url'
  );

comment on table public.site_settings is
  'Governed website settings. R1 exposes only the approved book purchase destination through a narrow read policy.';
