-- EXC-DOD01-DB-PREREQ-01: atomic idempotency claim for the audience prerequisite.
-- Run as the migration owner. Runtime must never own these objects.
BEGIN;
-- The claim operation resets expiry state on a same-hash reclaim under the invoker's own rights.
GRANT UPDATE (created_at,expires_at) ON public.idempotency_keys TO community_runtime;

CREATE FUNCTION public.claim_idempotency_key(
 p_scope text, p_key uuid, p_request_hash text, p_expires_at timestamptz)
RETURNS TABLE (decision text, status text, result_reference uuid,
 result_jsonb jsonb, expires_at timestamptz)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
 v_now timestamptz := statement_timestamp();
 v_request_hash text;
 v_status text;
 v_result_reference uuid;
 v_result_jsonb jsonb;
 v_expires_at timestamptz;
BEGIN
 -- The caller supplies the deadline; authority defines expiry, not a duration.
 IF p_expires_at IS NULL OR p_expires_at <= v_now THEN
  RAISE EXCEPTION 'idempotency expiry must be later than the current statement time'
   USING ERRCODE = '22023';
 END IF;

 INSERT INTO public.idempotency_keys
  (scope,key,request_hash,status,result_reference,result_jsonb,created_at,expires_at)
 VALUES (p_scope,p_key,p_request_hash,'pending',NULL,NULL,v_now,p_expires_at)
 ON CONFLICT (scope,key) DO NOTHING;
 IF FOUND THEN
  RETURN QUERY SELECT 'CLAIMED'::text,'pending'::text,NULL::uuid,NULL::jsonb,p_expires_at;
  RETURN;
 END IF;

 SELECT k.request_hash,k.status,k.result_reference,k.result_jsonb,k.expires_at
  INTO v_request_hash,v_status,v_result_reference,v_result_jsonb,v_expires_at
  FROM public.idempotency_keys k
  WHERE k.scope = p_scope AND k.key = p_key
  FOR UPDATE;
 IF NOT FOUND THEN
  RAISE EXCEPTION 'idempotency record disappeared during claim' USING ERRCODE = '55000';
 END IF;

 -- Hash discrimination precedes expiry: a differing payload is rejected in every expiry state.
 IF v_request_hash IS DISTINCT FROM p_request_hash THEN
  RETURN QUERY SELECT 'CONFLICT'::text,NULL::text,NULL::uuid,NULL::jsonb,NULL::timestamptz;
  RETURN;
 END IF;

 IF v_expires_at <= v_now THEN
  UPDATE public.idempotency_keys k
   SET status='pending',result_reference=NULL,result_jsonb=NULL,
    created_at=v_now,expires_at=p_expires_at
   WHERE k.scope = p_scope AND k.key = p_key;
  RETURN QUERY SELECT 'CLAIMED'::text,'pending'::text,NULL::uuid,NULL::jsonb,p_expires_at;
  RETURN;
 END IF;

 IF v_status = 'pending' THEN
  RETURN QUERY SELECT 'IN_PROGRESS'::text,v_status,v_result_reference,v_result_jsonb,v_expires_at;
 ELSE
  RETURN QUERY SELECT 'REPLAY'::text,v_status,v_result_reference,v_result_jsonb,v_expires_at;
 END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_idempotency_key(text,uuid,text,timestamptz)
 FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_idempotency_key(text,uuid,text,timestamptz)
 TO community_runtime;
COMMIT;
