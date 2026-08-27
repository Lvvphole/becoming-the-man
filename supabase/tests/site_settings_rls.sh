#!/usr/bin/env bash
set -euo pipefail

container="btmsct-site-settings-rls-${GITHUB_RUN_ID:-local}-$$"

cleanup() {
  docker rm -f "$container" >/dev/null 2>&1 || true
}
trap cleanup EXIT

docker run --rm -d \
  --name "$container" \
  -e POSTGRES_PASSWORD=postgres \
  postgres:17-alpine >/dev/null

ready=false
for _ in {1..30}; do
  if docker exec "$container" pg_isready -U postgres >/dev/null 2>&1; then
    ready=true
    break
  fi
  sleep 1
done

if [[ "$ready" != "true" ]]; then
  echo "FAIL: isolated Postgres did not become ready."
  exit 1
fi

docker exec -i "$container" psql -v ON_ERROR_STOP=1 -U postgres -d postgres <<'SQL'
create role anon nologin;
create role authenticated nologin;
SQL

while IFS= read -r migration; do
  docker exec -i "$container" psql -v ON_ERROR_STOP=1 -U postgres -d postgres < "$migration"
done < <(find supabase/migrations -type f -name '*.sql' -print | sort)

docker exec -i "$container" psql -v ON_ERROR_STOP=1 -U postgres -d postgres <<'SQL'
insert into public.site_settings (setting_key, setting_value)
values
  ('book_purchase_url', 'https://example.test/book'),
  ('internal_flag', 'private');
SQL

assert_write_denied() {
  local role="$1"
  local statement="$2"

  if docker exec "$container" psql -qAt -v ON_ERROR_STOP=1 -U postgres -d postgres \
    -c "set role $role; $statement" >/dev/null 2>&1; then
    echo "FAIL: $role unexpectedly gained write access: $statement"
    exit 1
  fi
}

for role in anon authenticated; do
  visible_keys="$(
    docker exec "$container" psql -qAt -v ON_ERROR_STOP=1 -U postgres -d postgres \
      -c "set role $role; select setting_key from public.site_settings order by setting_key;" \
      | tr -d '\r'
  )"

  if [[ "$visible_keys" != "book_purchase_url" ]]; then
    echo "FAIL: $role visible keys were '$visible_keys'; expected only book_purchase_url."
    exit 1
  fi

  assert_write_denied "$role" \
    "insert into public.site_settings (setting_key, setting_value) values ('unauthorized_insert', 'x');"
  assert_write_denied "$role" \
    "update public.site_settings set setting_value = 'https://example.test/changed' where setting_key = 'book_purchase_url';"
  assert_write_denied "$role" \
    "delete from public.site_settings where setting_key = 'book_purchase_url';"
done

echo "PASS: site_settings migration, grants, and RLS restrict anon/authenticated to read-only book_purchase_url access."
