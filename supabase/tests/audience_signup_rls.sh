#!/usr/bin/env bash
set -euo pipefail

container="btmsct-audience-signup-${GITHUB_RUN_ID:-local}-$$"
cleanup() { docker rm -f "$container" >/dev/null 2>&1 || true; }
trap cleanup EXIT

docker run --rm -d --name "$container" -e POSTGRES_PASSWORD=postgres postgres:17-alpine >/dev/null
ready=false
for _ in {1..30}; do
  if docker exec "$container" psql -qAt -v ON_ERROR_STOP=1 -U postgres -d postgres -c 'select 1' 2>/dev/null | grep -qx '1'; then
    ready=true
    break
  fi
  sleep 1
done
[[ "$ready" == "true" ]] || { echo "FAIL: isolated Postgres did not become ready."; exit 1; }

docker exec -i "$container" psql -v ON_ERROR_STOP=1 -U postgres -d postgres <<'SQL'
create role anon nologin;
create role authenticated nologin;
SQL
while IFS= read -r migration; do
  docker exec -i "$container" psql -v ON_ERROR_STOP=1 -U postgres -d postgres < "$migration"
done < <(find supabase/migrations -type f -name '*.sql' -print | sort)

for table in email_requests subscribers consent_events; do
  exists="$(docker exec "$container" psql -qAt -U postgres -d postgres -c "select to_regclass('public.$table') is not null;")"
  [[ "$exists" == "t" ]] || { echo "FAIL: public.$table is missing."; exit 1; }
  rls="$(docker exec "$container" psql -qAt -U postgres -d postgres -c "select relrowsecurity from pg_class where oid='public.$table'::regclass;")"
  [[ "$rls" == "t" ]] || { echo "FAIL: RLS is not enabled on public.$table."; exit 1; }
  for role in anon authenticated; do
    if docker exec "$container" psql -qAt -v ON_ERROR_STOP=1 -U postgres -d postgres -c "set role $role; select * from public.$table limit 1;" >/dev/null 2>&1; then
      echo "FAIL: $role can read public.$table."
      exit 1
    fi
  done
done

request_id='11111111-1111-4111-8111-111111111111'
call_persist="select * from public.persist_community_subscription('$request_id','reader@example.com','Reader','home-community','newsletter-v1');"
first="$(docker exec "$container" psql -qAt -v ON_ERROR_STOP=1 -U postgres -d postgres -c "$call_persist")"
second="$(docker exec "$container" psql -qAt -v ON_ERROR_STOP=1 -U postgres -d postgres -c "$call_persist")"
[[ "$first" == "$second" && "$first" == *'not_synced' ]] || { echo "FAIL: persistence is not idempotent."; exit 1; }

counts="$(docker exec "$container" psql -qAt -U postgres -d postgres -c "select (select count(*) from email_requests),(select count(*) from subscribers),(select count(*) from consent_events);")"
[[ "$counts" == '1|1|1' ]] || { echo "FAIL: duplicate request created duplicate durable state: $counts"; exit 1; }

subscriber_id="$(printf '%s' "$first" | cut -d'|' -f2)"
docker exec "$container" psql -qAt -v ON_ERROR_STOP=1 -U postgres -d postgres -c "select public.set_community_provider_state('$subscriber_id','reachable','resend-contact-1',null);" >/dev/null
reachable="$(docker exec "$container" psql -qAt -v ON_ERROR_STOP=1 -U postgres -d postgres -c "$call_persist")"
[[ "$reachable" == *'reachable' ]] || { echo "FAIL: reachable provider state was not preserved."; exit 1; }

if docker exec "$container" psql -qAt -v ON_ERROR_STOP=1 -U postgres -d postgres -c "select * from public.persist_community_subscription('$request_id','other@example.com',null,'home-community','newsletter-v1');" >/dev/null 2>&1; then
  echo "FAIL: reused request_id accepted a different payload."
  exit 1
fi

echo "PASS: audience signup persistence is private, RLS-enabled, idempotent, and preserves provider state."
