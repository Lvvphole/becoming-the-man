-- Given a runtime connection, capture records and preserve their stored values.
-- Fixture state/version/source values are not proposed production constants.
BEGIN;
INSERT INTO public.subscribers (id,email,first_name,audience_state)
VALUES ('00000000-0000-0000-0000-000000000001','reader@example.test','Reader','pending');
INSERT INTO public.consent_events
(id,subscriber_id,request_id,consent_scope,consent_version,source,event_type)
VALUES ('00000000-0000-0000-0000-000000000002',
'00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000003',
'marketing','test-v1','test','grant');
INSERT INTO public.email_requests
(id,request_type,email,first_name,consent_scope,consent_version,source,payload_jsonb,delivery_status)
VALUES ('00000000-0000-0000-0000-000000000003','subscribe','reader@example.test','Reader',
'marketing','test-v1','test','{}','pending');
INSERT INTO public.idempotency_keys
(scope,key,request_hash,status,result_reference,result_jsonb,created_at,expires_at)
VALUES ('subscribe','00000000-0000-0000-0000-000000000003',repeat('a',64),'pending',
'00000000-0000-0000-0000-000000000003','{"status":"pending"}',
'2020-01-01T00:00:00Z','2020-01-02T00:00:00Z');
UPDATE public.subscribers SET first_name='Updated', updated_at=now()
WHERE id='00000000-0000-0000-0000-000000000001';
UPDATE public.email_requests SET delivery_status='pending',error_code='TEST_ONLY',updated_at=now()
WHERE id='00000000-0000-0000-0000-000000000003';
UPDATE public.idempotency_keys SET result_jsonb='{"status":"pending","test":true}'
WHERE scope='subscribe' AND key='00000000-0000-0000-0000-000000000003';
DO $$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM public.subscribers WHERE email='reader@example.test' AND first_name='Updated')
 OR NOT EXISTS (SELECT 1 FROM public.consent_events WHERE consent_version='test-v1' AND source='test' AND event_type='grant')
 OR NOT EXISTS (SELECT 1 FROM public.email_requests WHERE error_code='TEST_ONLY' AND first_name='Reader')
 OR NOT EXISTS (SELECT 1 FROM public.idempotency_keys WHERE result_jsonb='{"status":"pending","test":true}'::jsonb
 AND expires_at='2020-01-02T00:00:00Z'::timestamptz) THEN
  RAISE EXCEPTION 'persisted value mismatch';
 END IF;
END $$;
SELECT 'BDD_STORAGE_ROUNDTRIP_OK';
ROLLBACK;
