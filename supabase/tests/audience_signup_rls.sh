#!/usr/bin/env bash
set -euo pipefail

container="btmsct-audience-${GITHUB_RUN_ID:-local}-$$"
finish() {
  status=$?
  if (( status != 0 )); then
    echo "DIAGNOSTIC: audience Postgres failure status=$status container=$container"
    docker ps -a --filter "name=^/${container}$" || true
    docker inspect -f 'state={{.State.Status}} exit={{.State.ExitCode}} oom={{.State.OOMKilled}} error={{.State.Error}}' "$container" || true
    docker logs --tail 120 "$container" || true
  fi
  docker rm -f "$container" >/dev/null 2>&1 || true
}
trap finish EXIT

docker run -d --name "$container" -e POSTGRES_PASSWORD=postgres postgres:17-alpine >/dev/null
for _ in {1..30}; do
  if [[ "$(docker exec "$container" cat /proc/1/comm 2>/dev/null || true)" == "postgres" ]] &&
     docker exec "$container" psql -qAt -v ON_ERROR_STOP=1 -U postgres -d postgres -c 'select 1' 2>/dev/null | grep -qx '1'; then
    ready=true; break
  fi
  sleep 1
done
[[ "${ready:-false}" == "true" ]] || { echo "FAIL: isolated Postgres did not become ready."; exit 1; }

docker exec -i "$container" psql -v ON_ERROR_STOP=1 -U postgres -d postgres <<'SQL'
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
SQL
while IFS= read -r migration; do
  docker exec -i "$container" psql -v ON_ERROR_STOP=1 -U postgres -d postgres < "$migration"
done < <(find supabase/migrations -type f -name '*.sql' -print | sort)

for table in subscribers email_requests consent_events idempotency_keys system_failures rate_limits; do
  [[ "$(docker exec "$container" psql -qAt -U postgres -d postgres -c "select to_regclass('public.$table') is not null;")" == "t" ]] || { echo "FAIL: public.$table is missing."; exit 1; }
  [[ "$(docker exec "$container" psql -qAt -U postgres -d postgres -c "select relrowsecurity from pg_class where oid='public.$table'::regclass;")" == "t" ]] || { echo "FAIL: RLS missing on public.$table."; exit 1; }
  for role in anon authenticated; do
    if docker exec "$container" psql -qAt -v ON_ERROR_STOP=1 -U postgres -d postgres -c "set role $role; select * from public.$table limit 1;" >/dev/null 2>&1; then
      echo "FAIL: $role can read public.$table."; exit 1
    fi
  done
done

columns="$(docker exec "$container" psql -qAt -U postgres -d postgres -c "select string_agg(column_name,',' order by column_name) from information_schema.columns where table_schema='public' and table_name='email_requests' and column_name in ('payload_jsonb','resend_message_id','delivery_status');")"
[[ "$columns" == "delivery_status,payload_jsonb,resend_message_id" ]] || { echo "FAIL: email_requests locked fields missing: $columns"; exit 1; }

for role in anon authenticated; do
  [[ "$(docker exec "$container" psql -qAt -U postgres -d postgres -c "select has_function_privilege('$role','public.persist_community_subscription(uuid,text,text,text,text)','EXECUTE');")" == "f" ]] || { echo "FAIL: $role can execute persistence RPC."; exit 1; }
done

request_id='11111111-1111-4111-8111-111111111111'
call_persist="set role service_role; select * from public.persist_community_subscription('$request_id','reader@example.com','Reader','home-community','newsletter-v1');"
first="$(docker exec "$container" psql -qAt -v ON_ERROR_STOP=1 -U postgres -d postgres -c "$call_persist")"
second="$(docker exec "$container" psql -qAt -v ON_ERROR_STOP=1 -U postgres -d postgres -c "$call_persist")"
[[ "$first" == "$second" && "$first" == *'not_synced' ]] || { echo "FAIL: duplicate request did not return one logical result."; exit 1; }
[[ "$(docker exec "$container" psql -qAt -U postgres -d postgres -c "select (select count(*) from email_requests),(select count(*) from subscribers),(select count(*) from consent_events),(select count(*) from idempotency_keys);")" == '1|1|1|1' ]] || { echo "FAIL: duplicate durable state created."; exit 1; }
if docker exec "$container" psql -qAt -v ON_ERROR_STOP=1 -U postgres -d postgres -c "set role service_role; select * from public.persist_community_subscription('$request_id','different@example.com',null,'home-community','newsletter-v1');" >/dev/null 2>&1; then
  echo "FAIL: reused request_id accepted a different request hash."; exit 1
fi

subscriber_id="$(printf '%s' "$first" | cut -d'|' -f2)"
docker exec "$container" psql -qAt -v ON_ERROR_STOP=1 -U postgres -d postgres -c "set role service_role; select public.set_community_provider_state('$subscriber_id','$request_id','pending',null,'PROVIDER_UNAVAILABLE');" >/dev/null
[[ "$(docker exec "$container" psql -qAt -U postgres -d postgres -c "select count(*) from system_failures where correlation_id='$request_id' and status='open';")" == '1' ]] || { echo "FAIL: pending provider failure is not durable."; exit 1; }
[[ "$(docker exec "$container" psql -qAt -U postgres -d postgres -c "select coalesce(delivery_status,'NULL') from email_requests where id='$request_id';")" == 'NULL' ]] || { echo "FAIL: contact reachability leaked into email delivery_status."; exit 1; }

docker exec "$container" psql -qAt -v ON_ERROR_STOP=1 -U postgres -d postgres -c "set role service_role; select public.set_community_provider_state('$subscriber_id','$request_id','reachable','contact-1',null);" >/dev/null
[[ "$(docker exec "$container" psql -qAt -U postgres -d postgres -c "select provider_status from subscribers where id='$subscriber_id';")" == 'reachable' ]] || { echo "FAIL: reachable provider state not persisted."; exit 1; }
[[ "$(docker exec "$container" psql -qAt -U postgres -d postgres -c "select status from system_failures where correlation_id='$request_id';")" == 'recovered' ]] || { echo "FAIL: provider recovery not recorded."; exit 1; }

rate="$(docker exec "$container" psql -qAt -v ON_ERROR_STOP=1 -U postgres -d postgres -c "set role service_role; select public.consume_community_rate_limit('hash-1',60,1); select public.consume_community_rate_limit('hash-1',60,1);")"
[[ "$rate" == $'t\nf' ]] || { echo "FAIL: rate-limit counter contract failed: $rate"; exit 1; }

echo "PASS: audience persistence is private, idempotent, failure-visible, rate-limited, and keeps contact state separate from email delivery evidence."
