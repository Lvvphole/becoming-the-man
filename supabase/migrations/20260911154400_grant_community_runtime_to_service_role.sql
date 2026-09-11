-- PostgREST presents SUPABASE_SERVICE_ROLE_KEY as role service_role, not community_runtime.
-- claim_idempotency_key EXECUTE and the community table grants exist only on community_runtime,
-- so the service-role JWT cannot call the claim RPC until it is a member of that role.
-- PUBLIC, anon, and authenticated stay revoked.
BEGIN;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    -- Hosted Supabase already defines service_role. Isolated CI Postgres does not.
    CREATE ROLE service_role NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
  END IF;
END $$;
GRANT community_runtime TO service_role;
COMMIT;
