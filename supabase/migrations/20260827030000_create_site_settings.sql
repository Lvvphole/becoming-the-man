create table if not exists public.site_settings (
  setting_key text primary key,
  setting_value text not null,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

revoke all on table public.site_settings from anon, authenticated;
grant select on table public.site_settings to anon, authenticated;

create policy "read approved book purchase setting"
on public.site_settings
for select
to anon, authenticated
using (setting_key = 'book_purchase_url');
