#!/usr/bin/env bash
set -euo pipefail

container="btmsct-legal-pages-rls-${GITHUB_RUN_ID:-local}-$$"

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
  if docker exec "$container" psql -qAt -v ON_ERROR_STOP=1 -U postgres -d postgres \
      -c 'select 1' 2>/dev/null | grep -qx '1'; then
    ready=true
    break
  fi
  sleep 1
done

if [[ "$ready" != "true" ]]; then
  echo "FAIL: isolated Postgres server did not become ready."
  exit 1
fi

docker exec -i "$container" psql -v ON_ERROR_STOP=1 -U postgres -d postgres <<'SQL'
create role anon nologin;
create role authenticated nologin;
SQL

while IFS= read -r migration; do
  docker exec -i "$container" psql -v ON_ERROR_STOP=1 -U postgres -d postgres < "$migration"
done < <(find supabase/migrations -type f -name '*.sql' -print | sort)

disclaimer_summary="$(
  docker exec "$container" psql -qAt -v ON_ERROR_STOP=1 -U postgres -d postgres \
    -c "select slug || '|' || title || '|' || jsonb_array_length(body_jsonb)::text from public.legal_pages where slug = 'disclaimer';" \
    | tr -d '\r'
)"

if [[ "$disclaimer_summary" != "disclaimer|Disclaimer|4" ]]; then
  echo "FAIL: disclaimer legal-page seed is missing or malformed."
  exit 1
fi

docker exec -i "$container" psql -v ON_ERROR_STOP=1 -U postgres -d postgres <<'SQL'
insert into public.legal_pages (slug, title, body_jsonb, is_published)
values ('internal-draft', 'Internal Draft', '["private"]'::jsonb, false);
SQL

assert_write_denied() {
  local role="$1"
  local statement="$2"

  if docker exec "$container" psql -qAt -v ON_ERROR_STOP=1 -U postgres -d postgres \
    -c "set role $role; $statement" >/dev/null 2>&1; then
    echo "FAIL: $role unexpectedly gained legal_pages write access: $statement"
    exit 1
  fi
}

for role in anon authenticated; do
  visible_slugs="$(
    docker exec "$container" psql -qAt -v ON_ERROR_STOP=1 -U postgres -d postgres \
      -c "set role $role; select slug from public.legal_pages order by slug;" \
      | tr -d '\r'
  )"

  if [[ "$visible_slugs" != "disclaimer" ]]; then
    echo "FAIL: $role visible legal pages were '$visible_slugs'; expected only disclaimer."
    exit 1
  fi

  assert_write_denied "$role" \
    "insert into public.legal_pages (slug, title, body_jsonb, is_published) values ('unauthorized', 'Unauthorized', '[\"x\"]'::jsonb, true);"
  assert_write_denied "$role" \
    "update public.legal_pages set title = 'Changed' where slug = 'disclaimer';"
  assert_write_denied "$role" \
    "delete from public.legal_pages where slug = 'disclaimer';"
done

echo "PASS: published legal pages are public-read only and the Disclaimer seed is present."
