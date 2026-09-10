-- EXC-DOD01-DB-PREREQ-01: audience storage prerequisite.
-- Run as the migration owner. Runtime must never own these objects.
BEGIN;
CREATE ROLE community_runtime NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;

-- Fail closed on pre-existing public-schema grants instead of changing unrelated grants.
DO $$
BEGIN
 IF has_schema_privilege('community_runtime','public','CREATE')
 OR has_database_privilege('community_runtime',current_database(),'CREATE') THEN
  RAISE EXCEPTION 'runtime inherits schema mutation authority';
 END IF;
END $$;

CREATE TABLE public.subscribers (
 id uuid PRIMARY KEY,
 email text NOT NULL UNIQUE CHECK (email = lower(trim(email)) AND char_length(email) > 0),
 first_name text NOT NULL CHECK (char_length(trim(first_name)) > 0),
 audience_state text NOT NULL CHECK (char_length(trim(audience_state)) > 0),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.consent_events (
 id uuid PRIMARY KEY,
 subscriber_id uuid NOT NULL REFERENCES public.subscribers(id),
 request_id uuid NOT NULL,
 consent_scope text NOT NULL CHECK (char_length(trim(consent_scope)) > 0),
 consent_version text NOT NULL CHECK (char_length(trim(consent_version)) > 0),
 source text NOT NULL CHECK (char_length(trim(source)) > 0),
 event_type text NOT NULL CHECK (event_type IN ('grant','revoke')),
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE (request_id, consent_scope, event_type)
);

CREATE TABLE public.email_requests (
 id uuid PRIMARY KEY,
 request_type text NOT NULL CHECK (char_length(trim(request_type)) > 0),
 email text NOT NULL CHECK (email = lower(trim(email)) AND char_length(email) > 0),
 first_name text NOT NULL CHECK (char_length(trim(first_name)) > 0),
 consent_scope text NOT NULL CHECK (char_length(trim(consent_scope)) > 0),
 consent_version text NOT NULL CHECK (char_length(trim(consent_version)) > 0),
 source text NOT NULL CHECK (char_length(trim(source)) > 0),
 payload_jsonb jsonb NOT NULL CHECK (jsonb_typeof(payload_jsonb) = 'object'),
 resend_message_id text,
 delivery_status text NOT NULL CHECK (char_length(trim(delivery_status)) > 0),
 error_code text,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.idempotency_keys (
 scope text NOT NULL CHECK (char_length(trim(scope)) > 0),
 key uuid NOT NULL,
 request_hash text NOT NULL CHECK (request_hash ~ '^[0-9a-f]{64}$'),
 status text NOT NULL CHECK (char_length(trim(status)) > 0),
 result_reference uuid REFERENCES public.email_requests(id),
 result_jsonb jsonb CHECK (jsonb_typeof(result_jsonb) = 'object'),
 created_at timestamptz NOT NULL DEFAULT now(),
 expires_at timestamptz NOT NULL CHECK (expires_at > created_at),
 PRIMARY KEY (scope,key)
);

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.subscribers, public.consent_events, public.email_requests, public.idempotency_keys
 FROM PUBLIC, anon, authenticated, community_runtime;
GRANT USAGE ON SCHEMA public TO community_runtime;
GRANT SELECT, INSERT ON public.subscribers, public.consent_events, public.email_requests, public.idempotency_keys
 TO community_runtime;
GRANT UPDATE (first_name,audience_state,updated_at) ON public.subscribers TO community_runtime;
GRANT UPDATE (resend_message_id,delivery_status,error_code,updated_at) ON public.email_requests TO community_runtime;
GRANT UPDATE (status,result_reference,result_jsonb) ON public.idempotency_keys TO community_runtime;
-- No UPDATE on consent_events: append-only is more restrictive than the general allowance.

CREATE POLICY community_read ON public.subscribers FOR SELECT TO community_runtime USING (true);
CREATE POLICY community_insert ON public.subscribers FOR INSERT TO community_runtime WITH CHECK (true);
CREATE POLICY community_update ON public.subscribers FOR UPDATE TO community_runtime USING (true) WITH CHECK (true);
CREATE POLICY community_read ON public.consent_events FOR SELECT TO community_runtime USING (true);
CREATE POLICY community_insert ON public.consent_events FOR INSERT TO community_runtime WITH CHECK (true);
CREATE POLICY community_read ON public.email_requests FOR SELECT TO community_runtime USING (true);
CREATE POLICY community_insert ON public.email_requests FOR INSERT TO community_runtime WITH CHECK (true);
CREATE POLICY community_update ON public.email_requests FOR UPDATE TO community_runtime USING (true) WITH CHECK (true);
CREATE POLICY community_read ON public.idempotency_keys FOR SELECT TO community_runtime USING (true);
CREATE POLICY community_insert ON public.idempotency_keys FOR INSERT TO community_runtime WITH CHECK (true);
CREATE POLICY community_update ON public.idempotency_keys FOR UPDATE TO community_runtime USING (true) WITH CHECK (true);
COMMIT;
