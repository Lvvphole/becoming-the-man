create extension if not exists pgcrypto;

create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  first_name text,
  marketing_eligible boolean not null default true,
  provider_status text not null default 'not_synced'
    check (provider_status in ('not_synced', 'pending', 'reachable')),
  resend_contact_id text,
  last_error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.email_requests (
  id uuid primary key,
  request_type text not null default 'newsletter_signup'
    check (request_type = 'newsletter_signup'),
  subscriber_id uuid references public.subscribers(id),
  email text not null,
  first_name text,
  consent_scope text not null default 'marketing'
    check (consent_scope = 'marketing'),
  consent_version text not null,
  source text not null,
  request_fingerprint text not null,
  delivery_status text not null default 'not_synced'
    check (delivery_status in ('not_synced', 'pending', 'reachable')),
  error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.consent_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.email_requests(id),
  subscriber_id uuid not null references public.subscribers(id),
  purpose text not null check (purpose = 'marketing'),
  action text not null check (action in ('grant', 'revoke')),
  consent_version text not null,
  source text not null,
  created_at timestamptz not null default now(),
  unique (request_id, purpose, action)
);

alter table public.subscribers enable row level security;
alter table public.email_requests enable row level security;
alter table public.consent_events enable row level security;

revoke all on public.subscribers from public;
revoke all on public.email_requests from public;
revoke all on public.consent_events from public;

create or replace function public.persist_community_subscription(
  p_request_id uuid,
  p_email text,
  p_first_name text,
  p_source text,
  p_consent_version text
)
returns table(request_id uuid, subscriber_id uuid, provider_status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
  v_first_name text := nullif(trim(p_first_name), '');
  v_source text := trim(p_source);
  v_consent_version text := trim(p_consent_version);
  v_fingerprint text;
  v_existing_fingerprint text;
  v_subscriber_id uuid;
  v_provider_status text;
begin
  if p_request_id is null or v_email = '' or v_source = '' or v_consent_version = '' then
    raise exception using errcode = '22023', message = 'invalid_subscription_request';
  end if;

  v_fingerprint := md5(
    v_email || '|' || coalesce(v_first_name, '') || '|' || v_source || '|' || v_consent_version
  );

  insert into public.email_requests (
    id, email, first_name, consent_version, source, request_fingerprint
  ) values (
    p_request_id, v_email, v_first_name, v_consent_version, v_source, v_fingerprint
  ) on conflict (id) do nothing;

  if not found then
    select request_fingerprint into v_existing_fingerprint
    from public.email_requests
    where id = p_request_id;

    if v_existing_fingerprint is distinct from v_fingerprint then
      raise exception using errcode = '23505', message = 'request_id_conflict';
    end if;
  end if;

  insert into public.subscribers (email, first_name, marketing_eligible)
  values (v_email, v_first_name, true)
  on conflict (email) do update
    set first_name = coalesce(excluded.first_name, public.subscribers.first_name),
        marketing_eligible = true,
        updated_at = now()
  returning id, public.subscribers.provider_status
    into v_subscriber_id, v_provider_status;

  update public.email_requests
  set subscriber_id = v_subscriber_id,
      delivery_status = v_provider_status,
      updated_at = now()
  where id = p_request_id;

  insert into public.consent_events (
    request_id, subscriber_id, purpose, action, consent_version, source
  ) values (
    p_request_id, v_subscriber_id, 'marketing', 'grant', v_consent_version, v_source
  ) on conflict (request_id, purpose, action) do nothing;

  return query select p_request_id, v_subscriber_id, v_provider_status;
end;
$$;

create or replace function public.set_community_provider_state(
  p_subscriber_id uuid,
  p_status text,
  p_resend_contact_id text,
  p_error_code text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_status not in ('pending', 'reachable') then
    raise exception using errcode = '22023', message = 'invalid_provider_status';
  end if;

  update public.subscribers
  set provider_status = p_status,
      resend_contact_id = case when p_status = 'reachable' then p_resend_contact_id else resend_contact_id end,
      last_error_code = case when p_status = 'pending' then p_error_code else null end,
      updated_at = now()
  where id = p_subscriber_id;

  if not found then
    raise exception using errcode = 'P0002', message = 'subscriber_not_found';
  end if;

  update public.email_requests
  set delivery_status = p_status,
      error_code = case when p_status = 'pending' then p_error_code else null end,
      updated_at = now()
  where subscriber_id = p_subscriber_id;
end;
$$;

revoke all on function public.persist_community_subscription(uuid, text, text, text, text) from public;
revoke all on function public.set_community_provider_state(uuid, text, text, text) from public;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function public.persist_community_subscription(uuid, text, text, text, text) to service_role;
    grant execute on function public.set_community_provider_state(uuid, text, text, text) to service_role;
  end if;
end;
$$;
