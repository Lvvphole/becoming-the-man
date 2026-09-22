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
  if docker exec "$container" sh -c 'test "$(cat /proc/1/comm)" = "postgres"' >/dev/null 2>&1 \
    && docker exec "$container" psql -qAt -v ON_ERROR_STOP=1 -U postgres -d postgres \
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

terms_heading_summary="$(
  docker exec "$container" psql -qAt -v ON_ERROR_STOP=1 -U postgres -d postgres \
    -c "select string_agg(value, '|' order by ordinality)
        from public.legal_pages
        cross join lateral jsonb_array_elements_text(body_jsonb) with ordinality as body(value, ordinality)
        where slug = 'terms' and value ~ '^[0-9]+\\. ';" \
    | tr -d '\r'
)"

expected_terms_headings="1. Educational and Informational Purpose|2. Safety and Emergency Matters|3. No Guaranteed Outcomes|4. Intellectual Property|5. Acceptable Use|6. Email Communications|7. Third-Party Services and Retailers|8. Disclaimer of Warranties|9. Limitation of Liability|10. Indemnification and Hold Harmless|11. Informal Dispute Resolution|12. Binding Arbitration|13. Class Action and Representative-Action Waiver|14. Arbitration Opt-Out|15. Governing Law|16. Severability|17. No Waiver|18. Assignment|19. Entire Agreement|20. Changes to These Terms|21. Contact"

if [[ "$terms_heading_summary" != "$expected_terms_headings" ]]; then
  echo "FAIL: Terms section headings are missing, duplicated, or out of approved order."
  exit 1
fi

terms_contract_summary="$(
  docker exec "$container" psql -qAt -v ON_ERROR_STOP=1 -U postgres -d postgres \
    -c "with terms as (
          select title, is_published, body_jsonb
          from public.legal_pages
          where slug = 'terms'
        ),
        body as (
          select value
          from terms
          cross join lateral jsonb_array_elements_text(body_jsonb) as item(value)
        )
        select
          (select title = 'Terms' and is_published from terms)::text || '|' ||
          (select count(*) = 3 from body where value like '%info@lovepurposeflourish.com%')::text || '|' ||
          (select bool_or(value like '%State of Georgia%') from body)::text || '|' ||
          (select bool_or(value like '%American Arbitration Association%' and value like '%AAA Consumer Arbitration Rules%') from body)::text || '|' ||
          (select bool_or(value like '%Federal Arbitration Act%') from body)::text || '|' ||
          (select bool_or(value like '%within 30 days after you first become subject to these Terms%') from body)::text || '|' ||
          (select bool_or(value like '%30 days after receipt of the notice%') from body)::text || '|' ||
          (select bool_or(value like '%defend, indemnify, and hold harmless Love Purpose Flourish Inc%') from body)::text || '|' ||
          (select bool_or(value = '• (b) $100.') from body)::text || '|' ||
          (select bool_or(value like '%Book purchases may currently be completed through third-party retailers rather than directly through Love Purpose Flourish Inc.%') from body)::text || '|' ||
          (select bool_or(value like '%provided “as is” and “as available.”%') from body)::text || '|' ||
          (select bool_or(value like '%therapist-client, counselor-client, physician-patient, attorney-client, fiduciary, or other professional relationship%') from body)::text
        ;" \
    | tr -d '\r'
)"

if [[ "$terms_contract_summary" != "true|true|true|true|true|true|true|true|true|true|true|true" ]]; then
  echo "FAIL: Terms contract is missing one or more owner-approved legal invariants: $terms_contract_summary"
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
      -c "set role $role; select string_agg(slug, ',' order by slug) from public.legal_pages;" \
      | tr -d '\r'
  )"

  if [[ "$visible_slugs" != "disclaimer,privacy,terms" ]]; then
    echo "FAIL: $role visible legal pages were '$visible_slugs'; expected disclaimer,privacy,terms."
    exit 1
  fi

  assert_write_denied "$role" \
    "insert into public.legal_pages (slug, title, body_jsonb, is_published) values ('unauthorized', 'Unauthorized', '[\"x\"]'::jsonb, true);"
  assert_write_denied "$role" \
    "update public.legal_pages set title = 'Changed' where slug = 'disclaimer';"
  assert_write_denied "$role" \
    "delete from public.legal_pages where slug = 'disclaimer';"
done

echo "PASS: only published legal pages are public-readable, and anon/authenticated remain write-denied."
