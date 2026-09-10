"""Behavioral oracle for the governed community idempotency claim operation."""
import subprocess
import time

SIGNATURE = 'public.claim_idempotency_key(text,uuid,text,timestamptz)'
SCOPE = 'subscribe'
HASH_A = 'a' * 64
HASH_B = 'b' * 64
FUTURE = '2999-01-01T00:00:00Z'
FUTURE_TEXT = '2999-01-01 00:00:00+00'
PAST_CREATED = '2020-01-01T00:00:00Z'
PAST_EXPIRES = '2020-01-02T00:00:00Z'
PAST_EXPIRES_TEXT = '2020-01-02 00:00:00+00'
REQUEST = '00000000-0000-0000-0000-0000000000e1'
RESULT = '{"subscriber": "reader"}'
CLAIM_KEY = '00000000-0000-0000-0000-0000000000b1'
RECLAIM_KEY = '00000000-0000-0000-0000-0000000000b2'
EXPIRED_CONFLICT_KEY = '00000000-0000-0000-0000-0000000000b3'
INVALID_EXPIRY_KEY = '00000000-0000-0000-0000-0000000000b4'
RACE_KEY = '00000000-0000-0000-0000-0000000000b5'
LOCK_KEY = '00000000-0000-0000-0000-0000000000b6'
MIXED_KEY = '00000000-0000-0000-0000-0000000000b7'
RACE_CALLERS = 8
LOCK_HOLD_SECONDS = 6
LOCK_PROBE_DELAY = 0.5
LOCK_MIN_WAIT_SECONDS = 1.0
PROCESS_TIMEOUT_SECONDS = 30


def call(key: str, request_hash: str, expires_at: str) -> str:
    return ("SET TimeZone='UTC'; SELECT decision||'|'||coalesce(status,'')||'|'"
            "||coalesce(result_reference::text,'')||'|'||coalesce(result_jsonb::text,'')||'|'"
            "||coalesce(expires_at::text,'') FROM public.claim_idempotency_key("
            f"'{SCOPE}','{key}','{request_hash}','{expires_at}');")


def decision(key: str, request_hash: str, expires_at: str) -> str:
    return ("SET TimeZone='UTC'; SELECT decision FROM public.claim_idempotency_key("
            f"'{SCOPE}','{key}','{request_hash}','{expires_at}');")


def snapshot(key: str) -> str:
    return ("SET TimeZone='UTC'; SELECT request_hash||'|'||status||'|'"
            "||coalesce(result_reference::text,'')||'|'||coalesce(result_jsonb::text,'')||'|'"
            "||expires_at::text FROM public.idempotency_keys "
            f"WHERE scope='{SCOPE}' AND key='{key}';")


def seed(key: str, request_hash: str) -> str:
    return ('INSERT INTO public.idempotency_keys'
            '(scope,key,request_hash,status,result_reference,result_jsonb,created_at,expires_at) '
            f"VALUES ('{SCOPE}','{key}','{request_hash}','completed','{REQUEST}','{RESULT}',"
            f"'{PAST_CREATED}','{PAST_EXPIRES}');")


def start(container: str, role: str, statement: str) -> subprocess.Popen[str]:
    process = subprocess.Popen(
        ['docker', 'exec', '-i', container, 'psql', '-X', '-qAt',
         '-v', 'ON_ERROR_STOP=1', '-v', 'VERBOSITY=verbose', '-U', role, '-d', 'postgres'],
        stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    process.stdin.write(statement)
    process.stdin.close()
    return process


def collect(name: str, process: subprocess.Popen[str]) -> list[str]:
    try:
        output = process.stdout.read()
        errors = process.stderr.read()
        code = process.wait(timeout=PROCESS_TIMEOUT_SECONDS)
    except subprocess.TimeoutExpired:
        process.kill()
        raise RuntimeError(f'{name}: concurrent caller exceeded {PROCESS_TIMEOUT_SECONDS}s; '
                           'a blocked caller is failure evidence, never success') from None
    if code:
        raise RuntimeError(f'{name}: concurrent caller failed exit={code}: {errors.strip()}')
    return [line for line in output.splitlines() if line.strip()]


def sequential(container: str, expect) -> None:
    expect(container, 'new request claims execution ownership', 'community_test_login',
           call(CLAIM_KEY, HASH_A, FUTURE), expected_output=f'CLAIMED|pending|||{FUTURE_TEXT}')
    expect(container, 'claim persists exactly one row', 'community_test_login',
           f"SELECT count(*)::text FROM public.idempotency_keys WHERE scope='{SCOPE}' "
           f"AND key='{CLAIM_KEY}';", expected_output='1')
    expect(container, 'unexpired pending duplicate cannot execute', 'community_test_login',
           call(CLAIM_KEY, HASH_A, FUTURE), expected_output=f'IN_PROGRESS|pending|||{FUTURE_TEXT}')
    expect(container, 'pending duplicate leaves ownership unchanged', 'community_test_login',
           snapshot(CLAIM_KEY), expected_output=f'{HASH_A}|pending|||{FUTURE_TEXT}')
    expect(container, 'result reference fixture', 'community_test_login',
           'INSERT INTO public.email_requests(id,request_type,email,first_name,consent_scope,'
           'consent_version,source,payload_jsonb,delivery_status) VALUES '
           f"('{REQUEST}','subscribe','claim@example.test','Reader','marketing','test-v1',"
           "'test','{}','sent');")
    expect(container, 'owner completes through the already-granted update', 'community_test_login',
           "UPDATE public.idempotency_keys SET status='completed',"
           f"result_reference='{REQUEST}',result_jsonb='{RESULT}' "
           f"WHERE scope='{SCOPE}' AND key='{CLAIM_KEY}';")
    expect(container, 'completed duplicate replays the stored result', 'community_test_login',
           call(CLAIM_KEY, HASH_A, FUTURE),
           expected_output=f'REPLAY|completed|{REQUEST}|{RESULT}|{FUTURE_TEXT}')
    expect(container, 'different request hash is rejected before expiry', 'community_test_login',
           call(CLAIM_KEY, HASH_B, FUTURE), expected_output='CONFLICT||||')
    expect(container, 'rejected hash leaves the original row intact', 'community_test_login',
           snapshot(CLAIM_KEY),
           expected_output=f'{HASH_A}|completed|{REQUEST}|{RESULT}|{FUTURE_TEXT}')
    expect(container, 'expired record fixture', 'community_test_login', seed(RECLAIM_KEY, HASH_A))
    expect(container, 'expired same hash reclaims execution', 'community_test_login',
           call(RECLAIM_KEY, HASH_A, FUTURE), expected_output=f'CLAIMED|pending|||{FUTURE_TEXT}')
    expect(container, 'reclaim clears the cached result and stores the supplied expiry',
           'community_test_login', snapshot(RECLAIM_KEY),
           expected_output=f'{HASH_A}|pending|||{FUTURE_TEXT}')
    expect(container, 'reclaim resets the creation deadline', 'community_test_login',
           f"SELECT (created_at > '{PAST_EXPIRES}'::timestamptz)::text "
           f"FROM public.idempotency_keys WHERE scope='{SCOPE}' AND key='{RECLAIM_KEY}';",
           expected_output='true')
    expect(container, 'expired conflict fixture', 'community_test_login',
           seed(EXPIRED_CONFLICT_KEY, HASH_A))
    expect(container, 'different request hash is rejected after expiry', 'community_test_login',
           call(EXPIRED_CONFLICT_KEY, HASH_B, FUTURE), expected_output='CONFLICT||||')
    expect(container, 'expired rejection leaves the original row intact', 'community_test_login',
           snapshot(EXPIRED_CONFLICT_KEY),
           expected_output=f'{HASH_A}|completed|{REQUEST}|{RESULT}|{PAST_EXPIRES_TEXT}')
    expect(container, 'nonfuture expiry is refused', 'community_test_login',
           call(INVALID_EXPIRY_KEY, HASH_A, PAST_EXPIRES), '22023')
    expect(container, 'refused expiry persists nothing', 'community_test_login',
           f"SELECT count(*)::text FROM public.idempotency_keys WHERE scope='{SCOPE}' "
           f"AND key='{INVALID_EXPIRY_KEY}';", expected_output='0')


def privileges(container: str, expect) -> None:
    expect(container, 'claim operation is security invoker owned by the migration owner', 'postgres',
           "SELECT (NOT p.prosecdef AND p.proowner='postgres'::regrole AND EXISTS "
           "(SELECT 1 FROM unnest(p.proconfig) setting WHERE setting LIKE 'search_path=%'))::text "
           f"FROM pg_proc p WHERE p.oid = to_regprocedure('{SIGNATURE}');",
           expected_output='true')
    expect(container, 'execute is granted only to the runtime group', 'postgres',
           f"SELECT (has_function_privilege('community_runtime','{SIGNATURE}','EXECUTE') "
           f"AND NOT has_function_privilege('anon','{SIGNATURE}','EXECUTE') "
           f"AND NOT has_function_privilege('authenticated','{SIGNATURE}','EXECUTE') "
           'AND NOT EXISTS (SELECT 1 FROM aclexplode(p.proacl) entry WHERE entry.grantee = 0))::text '
           f"FROM pg_proc p WHERE p.oid = to_regprocedure('{SIGNATURE}');",
           expected_output='true')
    for role in ('anon', 'authenticated'):
        expect(container, f'public role denies claim execution for {role}', role,
               decision(CLAIM_KEY, HASH_A, FUTURE), '42501')
    expect(container, 'runtime update columns remain exactly the approved set', 'postgres',
           "SELECT string_agg(column_name,',' ORDER BY column_name) "
           'FROM information_schema.column_privileges '
           "WHERE grantee='community_runtime' AND table_schema='public' "
           "AND table_name='idempotency_keys' AND privilege_type='UPDATE';",
           expected_output='created_at,expires_at,result_jsonb,result_reference,status')
    for column in ('scope', 'key', 'request_hash'):
        expect(container, f'identity column idempotency_keys.{column} stays immutable',
               'community_test_login',
               f'UPDATE public.idempotency_keys SET {column}={column};', '42501')
    expect(container, 'runtime may set the approved expiry timestamps', 'community_test_login',
           'UPDATE public.idempotency_keys SET created_at=created_at,expires_at=expires_at '
           f"WHERE scope='{SCOPE}' AND key='{CLAIM_KEY}';")
    expect(container, 'expiry must still follow creation', 'community_test_login',
           f"UPDATE public.idempotency_keys SET expires_at='{PAST_EXPIRES}' "
           f"WHERE scope='{SCOPE}' AND key='{CLAIM_KEY}';", '23514')


def concurrent(container: str, expect) -> None:
    name = 'concurrent same-hash callers elect exactly one owner'
    processes = [start(container, 'community_test_login', decision(RACE_KEY, HASH_A, FUTURE))
                 for _ in range(RACE_CALLERS)]
    decisions: list[str] = []
    for process in processes:
        decisions.extend(collect(name, process))
    print(f'CASE {name} decisions={sorted(decisions)}', flush=True)
    if len(decisions) != RACE_CALLERS or decisions.count('CLAIMED') != 1 or set(decisions) - {
            'CLAIMED', 'IN_PROGRESS'}:
        raise RuntimeError(f'{name}: expected exactly one CLAIMED among {RACE_CALLERS} callers')

    name = 'a held claim blocks a concurrent caller from owning execution'
    holder = start(container, 'community_test_login',
                   'BEGIN; ' + decision(LOCK_KEY, HASH_A, FUTURE)
                   + f' SELECT pg_sleep({LOCK_HOLD_SECONDS}); COMMIT;')
    time.sleep(LOCK_PROBE_DELAY)
    started = time.monotonic()
    probe = start(container, 'community_test_login', decision(LOCK_KEY, HASH_A, FUTURE))
    probe_decisions = collect(name, probe)
    waited = time.monotonic() - started
    holder_decisions = collect(name, holder)
    print(f'CASE {name} holder={holder_decisions} probe={probe_decisions} waited={waited:.2f}s',
          flush=True)
    if holder_decisions != ['CLAIMED'] or probe_decisions != ['IN_PROGRESS']:
        raise RuntimeError(f'{name}: expected one CLAIMED holder and one IN_PROGRESS probe')
    if waited < LOCK_MIN_WAIT_SECONDS:
        raise RuntimeError(f'{name}: probe returned in {waited:.2f}s without waiting on the claim')

    name = 'concurrent differing hashes elect one owner and reject the losing payload'
    launched = [(request_hash,
                 start(container, 'community_test_login', decision(MIXED_KEY, request_hash, FUTURE)))
                for request_hash in (HASH_A, HASH_B) * 3]
    results = [(request_hash, collect(name, process)) for request_hash, process in launched]
    stored = subprocess.run(
        ['docker', 'exec', '-i', container, 'psql', '-X', '-qAt', '-v', 'ON_ERROR_STOP=1',
         '-U', 'community_test_login', '-d', 'postgres'],
        input=f"SELECT request_hash FROM public.idempotency_keys WHERE scope='{SCOPE}' "
              f"AND key='{MIXED_KEY}';",
        text=True, capture_output=True, timeout=PROCESS_TIMEOUT_SECONDS, check=False)
    winner = stored.stdout.strip()
    print(f'CASE {name} winner={winner[:8]} results='
          f'{[(h[:8], d) for h, d in results]}', flush=True)
    claimed = [d for _, outcome in results for d in outcome if d == 'CLAIMED']
    if stored.returncode or winner not in (HASH_A, HASH_B) or len(claimed) != 1:
        raise RuntimeError(f'{name}: expected exactly one stored owner for the winning payload')
    for request_hash, outcome in results:
        allowed = ['CLAIMED', 'IN_PROGRESS'] if request_hash == winner else ['CONFLICT']
        if len(outcome) != 1 or outcome[0] not in allowed:
            raise RuntimeError(f'{name}: payload {request_hash[:8]} returned {outcome}; '
                               f'expected one of {allowed}')


def run(container: str, sql, expect) -> bool:
    absent = sql(container, 'postgres',
                 f"SELECT (to_regprocedure('{SIGNATURE}') IS NULL)::text;")
    if absent.returncode:
        raise RuntimeError('SETUP_FAILURE: claim operation inventory failed: ' + absent.stderr)
    if absent.stdout.strip() == 'true':
        print('RED_REQUIRED_IDEMPOTENCY_OPERATION_MISSING:claim_idempotency_key', flush=True)
        return False
    sequential(container, expect)
    privileges(container, expect)
    concurrent(container, expect)
    print('GREEN_IDEMPOTENCY_CLAIM_CONTRACT', flush=True)
    return True
