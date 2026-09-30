-- FR-105 contact anti-abuse state.
-- Persist only keyed HMAC identifiers and a 24-hour expiry window. Inquiry content is never stored.
BEGIN;

CREATE TABLE public.contact_rate_limits (
  email_hmac text NOT NULL CHECK (email_hmac ~ '^[0-9a-f]{64}$'),
  ip_hmac text NOT NULL CHECK (ip_hmac ~ '^[0-9a-f]{64}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  CHECK (expires_at = created_at + interval '24 hours')
);

CREATE INDEX contact_rate_limits_email_hmac_idx
  ON public.contact_rate_limits (email_hmac);
CREATE INDEX contact_rate_limits_ip_hmac_idx
  ON public.contact_rate_limits (ip_hmac);
CREATE INDEX contact_rate_limits_expires_at_idx
  ON public.contact_rate_limits (expires_at);

ALTER TABLE public.contact_rate_limits ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.contact_rate_limits
  FROM PUBLIC, anon, authenticated, community_runtime, service_role;

CREATE OR REPLACE FUNCTION public.claim_contact_rate_limit(
  p_email_hmac text,
  p_ip_hmac text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_now timestamptz := clock_timestamp();
BEGIN
  IF p_email_hmac IS NULL OR p_email_hmac !~ '^[0-9a-f]{64}$'
     OR p_ip_hmac IS NULL OR p_ip_hmac !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'invalid contact rate-limit identifier' USING ERRCODE = '22023';
  END IF;

  -- Every caller acquires locks in the same order. This makes the two-identifier
  -- decision atomic without exposing the table to the runtime role.
  PERFORM pg_advisory_xact_lock(
    hashtextextended('contact-email:' || p_email_hmac, 0)
  );
  PERFORM pg_advisory_xact_lock(
    hashtextextended('contact-ip:' || p_ip_hmac, 0)
  );

  IF EXISTS (
    SELECT 1
    FROM public.contact_rate_limits
    WHERE expires_at > v_now
      AND (email_hmac = p_email_hmac OR ip_hmac = p_ip_hmac)
  ) THEN
    RETURN 'RATE_LIMITED';
  END IF;

  INSERT INTO public.contact_rate_limits (
    email_hmac,
    ip_hmac,
    created_at,
    expires_at
  )
  VALUES (
    p_email_hmac,
    p_ip_hmac,
    v_now,
    v_now + interval '24 hours'
  );

  RETURN 'CLAIMED';
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_contact_rate_limits(
  p_batch_size integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $
DECLARE
  v_deleted integer;
BEGIN
  IF p_batch_size IS NULL OR p_batch_size < 1 OR p_batch_size > 500 THEN
    RAISE EXCEPTION 'contact cleanup batch size must be between 1 and 500'
      USING ERRCODE = '22023';
  END IF;

  WITH expired AS (
    SELECT ctid
    FROM public.contact_rate_limits
    WHERE expires_at <= clock_timestamp()
    ORDER BY expires_at
    LIMIT p_batch_size
    FOR UPDATE SKIP LOCKED
  )
  DELETE FROM public.contact_rate_limits AS target
  USING expired
  WHERE target.ctid = expired.ctid;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$;

REVOKE ALL ON FUNCTION public.claim_contact_rate_limit(text, text)
  FROM PUBLIC, anon, authenticated, community_runtime;
GRANT EXECUTE ON FUNCTION public.claim_contact_rate_limit(text, text)
  TO service_role;

REVOKE ALL ON FUNCTION public.cleanup_contact_rate_limits(integer)
  FROM PUBLIC, anon, authenticated, community_runtime;
GRANT EXECUTE ON FUNCTION public.cleanup_contact_rate_limits(integer)
  TO service_role;

COMMIT;
