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
  request_type text not null check (request_type = 'newsletter_signup'),
  email text not null,
  first_name text,
  consent_scope text not null check (consent_scope = 'marketing'),
  consent_version text not null,
  source text not null,
  payload_jsonb jsonb not null default '{}'::jsonb,
  resend_message_id text,
  delivery_status text,
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

create table public.idempotency_keys (
  scope text not null,
  key text not null,
  request_hash text not null,
  status text not null check (status in ('persisted', 'pending', 'complete')),
  result_reference uuid,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (scope, key)
);

create table public.system_failures (
  id uuid primary key default gen_random_uuid(),
  scope text not null,
  correlation_id uuid not null,
  status text not null check (status in ('open', 'recovered')),
  error_code text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  recovered_at timestamptz,
  unique (scope, correlation_id)
);

create table public.rate_limits (
  request_key_hash text not null,
  endpoint_scope text not null,
  window_started_at timestamptz not null,
  count integer not null check (count > 0),
  expires_at timestamptz not null,
  primary key (request_key_hash, endpoint_scope, window_started_at)
);

alter table public.subscribers enable row level security;
alter table public.email_requests enable row level security;
alter table public.consent_events enable row level security;
alter table public.idempotency_keys enable row level security;
alter table public.system_failures enable row level security;
alter table public.rate_limits enable row level security;

revoke all on public.subscribers from public, anon, authenticated;
revoke all on public.email_requests from public, anon, authenticated;
revoke all on public.consent_events from public, anon, authenticated;
revoke all on public.idempotency_keys from public, anon, authenticated;
revoke all on public.system_failures from public, anon, authenticated;
revoke all on public.rate_limits from public, anon, authenticated;

create or replace function public.persist_community_subscription(
  p_request_id uuid,
  p_email text,
  p_first_name text,
  p_source text,
  p_consent_version text
)
returns table(request_id uuid, subscriber_id uuid, provider_status text)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_email text := lower(trim(p_email));
  v_first_name text := nullif(trim(p_first_name), '');
  v_source text := trim(p_source);
  v_consent_version text := trim(p_consent_version);
  v_hash text;
  v_existing_hash text;
  v_existing_result uuid;
  v_subscriber_id uuid;
  v_provider_status text;
begin
  if p_request_id is null or v_email is null or v_email = ''
     or v_source is null or v_source = ''
     or v_consent_version is null or v_consent_version = '' then
    raise exception using errcode = '22023', message = 'invalid_subscription_request';
  end if;

  v_hash := encode(
    extensions.digest(
      v_email || '|' || coalesce(v_first_name, '') || '|' || v_source || '|' || v_consent_version,
      'sha256'
    ),
    'hex'
  );

  insert into public.idempotency_keys (scope, key, request_hash, status)
  values ('community_signup', p_request_id::text, v_hash, 'persisted')
  on conflict (scope, key) do nothing;

  if not found then
    select request_hash, result_reference
      into v_existing_hash, v_existing_result
    from public.idempotency_keys
    where scope = 'community_signup' and key = p_request_id::text;

    if v_existing_hash is distinct from v_hash then
      raise exception using errcode = '23505', message = 'request_id_conflict';
    end if;

    if v_existing_result is not null then
      select s.provider_status into v_provider_status
      from public.subscribers as s
      where s.id = v_existing_result;
      return query select p_request_id, v_existing_result, v_provider_status;
      return;
    end if;
  end if;

  insert into public.email_requests (
    id, request_type, email, first_name, consent_scope, consent_version, source, payload_jsonb
  ) values (
    p_request_id,
    'newsletter_signup',
    v_email,
    v_first_name,
    'marketing',
    v_consent_version,
    v_source,
    jsonb_build_object('schema_version', 1)
  ) on conflict (id) do nothing;

  insert into public.subscribers (email, first_name, marketing_eligible)
  values (v_email, v_first_name, true)
  on conflict (email) do update
    set first_name = coalesce(excluded.first_name, public.subscribers.first_name),
        marketing_eligible = true,
        updated_at = now()
  returning id, public.subscribers.provider_status
    into v_subscriber_id, v_provider_status;

  insert into public.consent_events (
    request_id, subscriber_id, purpose, action, consent_version, source
  ) values (
    p_request_id, v_subscriber_id, 'marketing', 'grant', v_consent_version, v_source
  ) on conflict (request_id, purpose, action) do nothing;

  update public.idempotency_keys
  set result_reference = v_subscriber_id, updated_at = now()
  where scope = 'community_signup' and key = p_request_id::text;

  return query select p_request_id, v_subscriber_id, v_provider_status;
end;
$$;

create or replace function public.set_community_provider_state(
  p_subscriber_id uuid,
  p_request_id uuid,
  p_status text,
  p_resend_contact_id text,
  p_error_code text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if p_status not in ('pending', 'reachable') then
    raise exception using errcode = '22023', message = 'invalid_provider_status';
  end if;
  if p_status = 'pending' and (p_error_code is null or trim(p_error_code) = '') then
    raise exception using errcode = '22023', message = 'provider_error_required';
  end if;
  if p_status = 'reachable' and (p_resend_contact_id is null or trim(p_resend_contact_id) = '') then
    raise exception using errcode = '22023', message = 'provider_contact_required';
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

  update public.idempotency_keys
  set status = case when p_status = 'reachable' then 'complete' else 'pending' end,
      updated_at = now()
  where scope = 'community_signup' and key = p_request_id::text and result_reference = p_subscriber_id;
  if not found then
    raise exception using errcode = 'P0002', message = 'subscription_request_not_found';
  end if;

  if p_status = 'pending' then
    insert into public.system_failures (scope, correlation_id, status, error_code)
    values ('community_provider_sync', p_request_id, 'open', p_error_code)
    on conflict (scope, correlation_id) do update
      set status = 'open', error_code = excluded.error_code,
          updated_at = now(), recovered_at = null;
  else
    update public.system_failures
    set status = 'recovered', updated_at = now(), recovered_at = now()
    where scope = 'community_provider_sync' and correlation_id = p_request_id and status = 'open';
  end if;
end;
$$;

create or replace function public.consume_community_rate_limit(
  p_request_key_hash text,
  p_window_seconds integer,
  p_limit integer
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_window_start timestamptz;
  v_count integer;
begin
  if p_request_key_hash is null or trim(p_request_key_hash) = ''
     or p_window_seconds <= 0 or p_limit <= 0 then
    raise exception using errcode = '22023', message = 'invalid_rate_limit_request';
  end if;

  v_window_start := to_timestamp(
    floor(extract(epoch from clock_timestamp()) / p_window_seconds) * p_window_seconds
  );

  insert into public.rate_limits (
    request_key_hash, endpoint_scope, window_started_at, count, expires_at
  ) values (
    p_request_key_hash,
    'community_signup',
    v_window_start,
    1,
    v_window_start + (p_window_seconds * interval '1 second')
  )
  on conflict (request_key_hash, endpoint_scope, window_started_at) do update
    set count = public.rate_limits.count + 1,
        expires_at = excluded.expires_at
  returning count into v_count;

  return v_count <= p_limit;
end;
$$;

revoke all on function public.persist_community_subscription(uuid, text, text, text, text) from public, anon, authenticated;
revoke all on function public.set_community_provider_state(uuid, uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.consume_community_rate_limit(text, integer, integer) from public, anon, authenticated;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant usage on schema public to service_role;
    grant select, insert, update on public.subscribers to service_role;
    grant select, insert, update on public.email_requests to service_role;
    grant select, insert on public.consent_events to service_role;
    grant select, insert, update on public.idempotency_keys to service_role;
    grant select, insert, update on public.system_failures to service_role;
    grant select, insert, update on public.rate_limits to service_role;
    grant execute on function public.persist_community_subscription(uuid, text, text, text, text) to service_role;
    grant execute on function public.set_community_provider_state(uuid, uuid, text, text, text) to service_role;
    grant execute on function public.consume_community_rate_limit(text, integer, integer) to service_role;
  end if;
end;
$$;
