insert into public.site_settings (setting_key, setting_value)
values (
  'book_purchase_url',
  'https://www.amazon.com/Becoming-Man-She-Can-Trust-ebook/dp/B0HG3F82J8/ref=sr_1_1?crid=248IIFWJJD84G&dib=eyJ2IjoiMSJ9.Q2WeUmKKql0XVwxmUugjwBPWoiAj40NiIl796yaMTIOH8retIOjTyBbeOBOs0l2F.A9I5QNNGnQl3pDEMwkFi8dcUvw0tO42kvBD-HjHfY4k&dib_tag=se&keywords=becoming+the+man+she+can+trust&qid=1787867145&sprefix=becoming+the+man+she+can+tr%2Caps%2C199&sr=8-1'
)
on conflict (setting_key) do update
set setting_value = excluded.setting_value,
    updated_at = now();
