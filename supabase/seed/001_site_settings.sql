-- LOCAL / NON-PRODUCTION FIXTURE ONLY.
insert into public.site_settings (key, value_text, is_public)
values ('book_purchase_url', 'https://example.com/book', true)
on conflict (key) do update
set value_text = excluded.value_text,
    is_public = excluded.is_public,
    updated_at = now();
