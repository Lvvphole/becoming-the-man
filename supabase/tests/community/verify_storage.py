"""Review verifier: only a caller-created disposable Docker container is supported."""
import importlib.util
import re
import subprocess
from pathlib import Path

TABLES = ('subscribers', 'consent_events', 'idempotency_keys', 'email_requests')
ROOT = Path(__file__).resolve().parent


def sql(container: str, role: str, statement: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ['docker', 'exec', '-i', container, 'psql', '-X', '-qAt',
         '-v', 'ON_ERROR_STOP=1', '-v', 'VERBOSITY=verbose',
         '-U', role, '-d', 'postgres'],
        input=statement, text=True, capture_output=True, timeout=30, check=False,
    )


def expect(container: str, name: str, role: str, statement: str,
           expected_state: str = '', expected_output: str | None = None) -> None:
    result = sql(container, role, statement)
    print(f'CASE {name} role={role} exit={result.returncode}', flush=True)
    print(result.stdout, end='', flush=True)
    print(result.stderr, end='', flush=True)
    states = re.findall(r'ERROR:\s+([0-9A-Z]{5}):', result.stderr)
    if expected_state:
        if result.returncode == 0 or states != [expected_state]:
            raise RuntimeError(f'{name}: expected exactly SQLSTATE {expected_state}; got {states}')
    elif result.returncode != 0:
        raise RuntimeError(f'{name}: unexpected SQL failure')
    if expected_output is not None and result.stdout.strip() != expected_output:
        raise RuntimeError(f'{name}: expected output {expected_output!r}')


def inventory(container: str) -> list[str]:
    result = sql(container, 'postgres',
                 "select name from unnest(array['subscribers','consent_events',"
                 "'idempotency_keys','email_requests']) name "
                 "where to_regclass('public.' || name) is null order by name;")
    if result.returncode:
        raise RuntimeError('SETUP_FAILURE: inventory query failed: ' + result.stderr)
    return result.stdout.splitlines()


def suite(container: str) -> bool:
    missing = inventory(container)
    if missing:
        print('RED_REQUIRED_STORAGE_MISSING:' + ','.join(missing), flush=True)
        return False
    expect(container, 'migration owner separate from runtime', 'postgres',
           "select count(*) from pg_class where oid in "
           "('public.subscribers'::regclass,'public.consent_events'::regclass,"
           "'public.idempotency_keys'::regclass,'public.email_requests'::regclass) "
           "and relowner = 'postgres'::regrole and relrowsecurity;", expected_output='4')
    expect(container, 'runtime cannot bypass RLS or administer roles', 'postgres',
           "select (not rolsuper and not rolcreaterole and not rolcreatedb "
           "and not rolbypassrls and not rolcanlogin)::text from pg_roles "
           "where rolname='community_runtime';", expected_output='true')
    expect(container, 'runtime cannot inherit schema or database creation', 'community_test_login',
           "select (not has_schema_privilege(current_user,'public','CREATE') "
           "and not has_database_privilege(current_user,current_database(),'CREATE'))::text;",
           expected_output='true')
    expect(container, 'authorization oracle rejects a syntax failure', 'community_test_login',
           'SELEC 1;', '42601')
    expect(container, 'positive persistence and constrained updates', 'community_test_login',
           (ROOT / 'storage-scenarios.sql').read_text(), expected_output='BDD_STORAGE_ROUNDTRIP_OK')
    for table in TABLES:
        for action in [f'DELETE FROM public.{table};', f'TRUNCATE public.{table};',
                       f'ALTER TABLE public.{table} ADD COLUMN forbidden text;',
                       f'DROP TABLE public.{table};']:
            expect(container, f'runtime denies {action}', 'community_test_login', action, '42501')
        for role in ('anon', 'authenticated'):
            for action in [f'SELECT * FROM public.{table};',
                           f'INSERT INTO public.{table} DEFAULT VALUES;',
                           f'UPDATE public.{table} SET created_at=created_at;',
                           f'DELETE FROM public.{table};']:
                expect(container, f'public role denies {action}', role, action, '42501')
    expect(container, 'runtime denies table creation', 'community_test_login',
           'CREATE TABLE public.forbidden (id integer);', '42501')
    expect(container, 'runtime denies schema creation', 'community_test_login',
           'CREATE SCHEMA forbidden;', '42501')
    expect(container, 'runtime denies owner escalation', 'community_test_login',
           'SET ROLE postgres;', '42501')
    for table, column in [('subscribers', 'email'), ('consent_events', 'consent_version'),
                          ('idempotency_keys', 'request_hash'), ('email_requests', 'consent_version')]:
        expect(container, 'immutable column ' + table + '.' + column, 'community_test_login',
               f'UPDATE public.{table} SET {column}={column};', '42501')
    for name_value, state in [('NULL', '23502'), ("''", '23514'), ("'   '", '23514')]:
        for table in ('subscribers', 'email_requests'):
            statement = (f"INSERT INTO public.subscribers(id,email,first_name,audience_state) "
                         f"VALUES ('00000000-0000-0000-0000-000000000009','bad@example.test',"
                         f"{name_value},'pending');") if table == 'subscribers' else (
                         "INSERT INTO public.email_requests(id,request_type,email,first_name,"
                         "consent_scope,consent_version,source,payload_jsonb,delivery_status) VALUES "
                         "('00000000-0000-0000-0000-000000000009','subscribe','bad@example.test',"
                         f"{name_value},'marketing','test-v1','test','{{}}','pending');")
            expect(container, f'{table} rejects first_name={name_value}',
                   'community_test_login', statement, state)
    expect(container, 'normalized email enforced', 'community_test_login',
           "INSERT INTO public.subscribers(id,email,first_name,audience_state) VALUES "
           "('00000000-0000-0000-0000-000000000009',' Reader@Example.test ','Reader','pending');",
           '23514')
    expect(container, 'unique normalized email', 'community_test_login',
           "BEGIN; INSERT INTO public.subscribers(id,email,first_name,audience_state) VALUES "
           "('00000000-0000-0000-0000-000000000001','same@example.test','Reader','pending'),"
           "('00000000-0000-0000-0000-000000000002','same@example.test','Reader','pending');", '23505')
    for expiry, state in [("'2020-01-01T00:00:00Z'", '23514'), ('NULL', '23502')]:
        expect(container, 'expiry must be explicit and after creation', 'community_test_login',
               "INSERT INTO public.idempotency_keys(scope,key,request_hash,status,created_at,expires_at) "
               "VALUES ('subscribe','00000000-0000-0000-0000-000000000001',repeat('a',64),"
               f"'pending','2020-01-02T00:00:00Z',{expiry});", state)
    expect(container, 'scope and logical key unique', 'community_test_login',
           "BEGIN; INSERT INTO public.idempotency_keys(scope,key,request_hash,status,created_at,expires_at) "
           "SELECT 'subscribe','00000000-0000-0000-0000-000000000001'::uuid,repeat('a',64),"
           "'pending','2020-01-01T00:00:00Z'::timestamptz,'2020-01-02T00:00:00Z'::timestamptz FROM generate_series(1,2);",
           '23505')
    print('GREEN_DRAFT_STORAGE_CHECKS_ONLY', flush=True)
    return idempotency_suite(container)


def idempotency_suite(container: str) -> bool:
    # The declared scenario filename is not a Python identifier, so load it by path.
    spec = importlib.util.spec_from_file_location(
        'idempotency_scenarios', ROOT / 'idempotency-scenarios.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.run(container, sql, expect)
