-- FR-105 contact anti-abuse contract.
-- This test is intentionally independent of inquiry content: only keyed HMACs and timestamps persist.
BEGIN;

DO $$
DECLARE
  claimed text;
  blocked text;
  cleaned integer;
  expired_count integer;
  v_email_hmac text := repeat('a', 64);
  v_other_email_hmac text := repeat('c', 64);
  v_ip_hmac text := repeat('b', 64);
  v_other_ip_hmac text := repeat('d', 64);
BEGIN
  IF to_regclass('public.contact_rate_limits') IS NULL THEN
    RAISE EXCEPTION 'contact_rate_limits missing';
  END IF;

  IF has_table_privilege('service_role', 'public.contact_rate_limits', 'SELECT')
     OR has_table_privilege('service_role', 'public.contact_rate_limits', 'INSERT')
     OR has_table_privilege('service_role', 'public.contact_rate_limits', 'UPDATE')
     OR has_table_privilege('service_role', 'public.contact_rate_limits', 'DELETE') THEN
    RAISE EXCEPTION 'service_role must not have direct contact-rate-limit table access';
  END IF;

  IF NOT has_function_privilege(
    'service_role',
    'public.claim_contact_rate_limit(text,text)',
    'EXECUTE'
  ) THEN
    RAISE EXCEPTION 'service_role cannot execute claim_contact_rate_limit';
  END IF;

  INSERT INTO public.contact_rate_limits (email_hmac, ip_hmac, created_at, expires_at)
  VALUES
    (repeat('1', 64), repeat('2', 64), now() - interval '48 hours', now() - interval '24 hours'),
    (repeat('3', 64), repeat('4', 64), now() - interval '49 hours', now() - interval '25 hours'),
    (repeat('5', 64), repeat('6', 64), now() - interval '50 hours', now() - interval '26 hours');

  SELECT public.claim_contact_rate_limit(v_email_hmac, v_ip_hmac) INTO claimed;
  IF claimed <> 'CLAIMED' THEN
    RAISE EXCEPTION 'first contact-rate-limit claim was not admitted: %', claimed;
  END IF;

  SELECT count(*) INTO expired_count
  FROM public.contact_rate_limits
  WHERE expires_at <= now();

  IF expired_count <> 3 THEN
    RAISE EXCEPTION 'contact claim deleted unrelated expired rows: % remain', expired_count;
  END IF;

  SELECT public.claim_contact_rate_limit(v_email_hmac, v_other_ip_hmac) INTO blocked;
  IF blocked <> 'RATE_LIMITED' THEN
    RAISE EXCEPTION 'same email HMAC was not rate limited: %', blocked;
  END IF;

  SELECT public.claim_contact_rate_limit(v_other_email_hmac, v_ip_hmac) INTO blocked;
  IF blocked <> 'RATE_LIMITED' THEN
    RAISE EXCEPTION 'same IP HMAC was not rate limited: %', blocked;
  END IF;

  IF to_regprocedure('public.cleanup_contact_rate_limits(integer)') IS NULL THEN
    RAISE EXCEPTION 'bounded cleanup function missing';
  END IF;

  IF NOT has_function_privilege(
    'service_role',
    'public.cleanup_contact_rate_limits(integer)',
    'EXECUTE'
  ) THEN
    RAISE EXCEPTION 'service_role cannot execute cleanup_contact_rate_limits';
  END IF;

  SELECT public.cleanup_contact_rate_limits(2) INTO cleaned;
  IF cleaned <> 2 THEN
    RAISE EXCEPTION 'bounded cleanup removed % rows instead of 2', cleaned;
  END IF;

  SELECT count(*) INTO expired_count
  FROM public.contact_rate_limits
  WHERE expires_at <= now();

  IF expired_count <> 1 THEN
    RAISE EXCEPTION 'bounded cleanup did not leave exactly one expired row: % remain', expired_count;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.contact_rate_limits
    WHERE email_hmac = v_email_hmac
      AND ip_hmac = v_ip_hmac
      AND expires_at - created_at = interval '24 hours'
  ) THEN
    RAISE EXCEPTION 'claim did not persist the approved 24-hour HMAC-only state';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'contact_rate_limits'
      AND column_name NOT IN ('email_hmac', 'ip_hmac', 'created_at', 'expires_at')
  ) THEN
    RAISE EXCEPTION 'contact_rate_limits persists an unapproved column';
  END IF;
END $$;

ROLLBACK;
SELECT 'CONTACT_RATE_LIMIT_CONTRACT_OK';
