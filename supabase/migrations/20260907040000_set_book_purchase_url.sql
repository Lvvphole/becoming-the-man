insert into public.site_settings (setting_key, setting_value)
values (
  'book_purchase_url',
  'https://a.co/d/0gtdzuED'
)
on conflict (setting_key) do update
set setting_value = excluded.setting_value,
    updated_at = now();
