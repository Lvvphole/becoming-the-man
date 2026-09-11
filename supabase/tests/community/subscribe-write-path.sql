-- Proves the exact write sequence server/repositories/supabase-community.server.ts performs, using
-- the production constants from contracts/community.ts rather than fixture values. A unit test with
-- a faked fetch cannot catch a constant the schema rejects; this can.
BEGIN;

-- 1. Claim ownership of the logical request before writing anything.
DO $$
DECLARE v_decision text;
BEGIN
 SELECT decision INTO v_decision FROM public.claim_idempotency_key(
  'subscribe','00000000-0000-0000-0000-0000000000c1',
  encode(sha256('reader@example.test|Reader|marketing'::bytea),'hex'),
  clock_timestamp() + interval '15 minutes');
 IF v_decision IS DISTINCT FROM 'CLAIMED' THEN
  RAISE EXCEPTION 'first claim returned % instead of CLAIMED', v_decision;
 END IF;
END $$;

-- 2. Subscriber, created pending because the provider has not accepted the contact yet.
INSERT INTO public.subscribers (id,email,first_name,audience_state)
VALUES ('00000000-0000-0000-0000-0000000000c2','reader@example.test','Reader','pending');

-- 3. Email request carrying the versioned consent provenance FR-103 requires to be persisted.
INSERT INTO public.email_requests
(id,request_type,email,first_name,consent_scope,consent_version,source,payload_jsonb,delivery_status)
VALUES ('00000000-0000-0000-0000-0000000000c3','subscribe','reader@example.test','Reader',
'marketing','2026-09-marketing-v1','home-community-form',
'{"consent_version":"2026-09-marketing-v1"}','pending');

-- 4. Append-only consent grant.
INSERT INTO public.consent_events
(id,subscriber_id,request_id,consent_scope,consent_version,source,event_type)
VALUES ('00000000-0000-0000-0000-0000000000c4','00000000-0000-0000-0000-0000000000c2',
'00000000-0000-0000-0000-0000000000c1','marketing','2026-09-marketing-v1',
'home-community-form','grant');

-- 5. Record the logical result against the claim.
UPDATE public.idempotency_keys
 SET status='completed',result_reference='00000000-0000-0000-0000-0000000000c3',
  result_jsonb='{"subscriber_id":"00000000-0000-0000-0000-0000000000c2"}'
 WHERE scope='subscribe' AND key='00000000-0000-0000-0000-0000000000c1';

-- 6. A duplicate submission of the same logical request must replay, never write again.
DO $$
DECLARE v_decision text;
BEGIN
 SELECT decision INTO v_decision FROM public.claim_idempotency_key(
  'subscribe','00000000-0000-0000-0000-0000000000c1',
  encode(sha256('reader@example.test|Reader|marketing'::bytea),'hex'),
  clock_timestamp() + interval '15 minutes');
 IF v_decision IS DISTINCT FROM 'REPLAY' THEN
  RAISE EXCEPTION 'duplicate submission returned % instead of REPLAY', v_decision;
 END IF;
END $$;

-- 7. Provider accepted the contact: only now is the subscriber reachable.
UPDATE public.email_requests SET delivery_status='synced',error_code=NULL,updated_at=now()
 WHERE id='00000000-0000-0000-0000-0000000000c3';
UPDATE public.subscribers SET audience_state='subscribed',updated_at=now()
 WHERE id='00000000-0000-0000-0000-0000000000c2';

DO $$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM public.subscribers
  WHERE id='00000000-0000-0000-0000-0000000000c2' AND audience_state='subscribed')
 OR NOT EXISTS (SELECT 1 FROM public.email_requests
  WHERE id='00000000-0000-0000-0000-0000000000c3' AND delivery_status='synced'
  AND consent_version='2026-09-marketing-v1' AND source='home-community-form')
 OR NOT EXISTS (SELECT 1 FROM public.consent_events
  WHERE request_id='00000000-0000-0000-0000-0000000000c1' AND event_type='grant'
  AND consent_version='2026-09-marketing-v1')
 OR NOT EXISTS (SELECT 1 FROM public.idempotency_keys
  WHERE scope='subscribe' AND key='00000000-0000-0000-0000-0000000000c1' AND status='completed') THEN
  RAISE EXCEPTION 'subscribe write path did not reach the expected durable state';
 END IF;
END $$;

SELECT 'BDD_SUBSCRIBE_WRITE_PATH_OK';
ROLLBACK;
