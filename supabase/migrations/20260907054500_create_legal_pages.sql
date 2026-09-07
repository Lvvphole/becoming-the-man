create table if not exists public.legal_pages (
  slug text primary key check (slug ~ '^[a-z0-9-]+$'),
  title text not null check (length(trim(title)) > 0),
  body_jsonb jsonb not null check (jsonb_typeof(body_jsonb) = 'array'),
  is_published boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.legal_pages enable row level security;

revoke all on table public.legal_pages from anon, authenticated;
grant select on table public.legal_pages to anon, authenticated;

create policy "read published legal pages"
on public.legal_pages
for select
to anon, authenticated
using (is_published = true);

insert into public.legal_pages (slug, title, body_jsonb, is_published)
values (
  'disclaimer',
  'Disclaimer',
  jsonb_build_array(
    'Becoming the Man She Can Trust and the Love | Purpose | Flourish Relationship Operating System are educational frameworks designed to support reflection, communication, trust, responsibility, boundaries, repair, and healthier relationship behavior.',
    'The information, principles, tools, examples, and guidance presented on this website are for educational and informational purposes only. They are not a substitute for individualized medical, mental-health, legal, therapeutic, or other professional advice, diagnosis, or treatment. When circumstances require professional support, readers and users should seek assistance from an appropriately qualified professional.',
    'The framework does not guarantee reconciliation, attraction, commitment, sexual intimacy, relationship preservation, or any particular personal or relationship outcome. Individual circumstances differ, and users remain responsible for their own decisions, boundaries, safety, and actions.',
    'Nothing in this framework should be used to justify manipulation, coercion, surveillance, retaliation, sexual entitlement, abuse, or control. When a situation involves violence, coercive control, stalking, threats, sexual assault, suicidality, severe crisis, or immediate danger, personal safety and qualified professional or emergency support take priority over ordinary relationship guidance.'
  ),
  true
)
on conflict (slug) do update
set title = excluded.title,
    body_jsonb = excluded.body_jsonb,
    is_published = excluded.is_published,
    updated_at = now();
