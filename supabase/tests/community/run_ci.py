"""Creates only a disposable isolated Postgres container; no external DB URL accepted."""
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import time
from verify_storage import expect, inventory, sql, suite

ROOT = Path(__file__).resolve().parent
IMAGE = 'postgres:17-alpine'


def command(args: list[str]) -> str:
    result = subprocess.run(args, capture_output=True, text=True, timeout=90, check=False)
    print(result.stdout, end='', flush=True)
    print(result.stderr, end='', flush=True)
    if result.returncode:
        raise RuntimeError(f'SETUP_FAILURE exit={result.returncode}: {args[0:3]}')
    return result.stdout.strip()


def main() -> int:
    if not shutil.which('docker'):
        print('BLOCKED_RUNTIME_UNAVAILABLE: docker not found; no RED or GREEN established')
        return 2
    container = 'btmsct-review-' + str(os.getpid())
    created = False
    try:
        command(['docker', 'run', '--rm', '-d', '--name', container,
                 '-e', 'POSTGRES_HOST_AUTH_METHOD=trust', IMAGE])
        created = True
        command(['docker', 'inspect', '--format', '{{.Image}}', container])
        for _ in range(30):
            pid = subprocess.run(['docker', 'exec', container, 'cat', '/proc/1/comm'],
                                 capture_output=True, text=True, timeout=10, check=False)
            ready = sql(container, 'postgres', 'select 1;')
            if pid.returncode == 0 and pid.stdout.strip() == 'postgres' and ready.returncode == 0:
                break
            time.sleep(1)
        else:
            raise RuntimeError('SETUP_FAILURE: final Postgres process not ready')
        expect(container, 'isolated baseline roles', 'postgres',
               'CREATE ROLE anon LOGIN; CREATE ROLE authenticated LOGIN;')
        for migration in sorted((ROOT.parents[2] / 'supabase' / 'migrations').glob('*.sql')):
            expect(container, 'migration ' + migration.name, 'postgres', migration.read_text())
        expect(container, 'actual database version', 'postgres', 'select version();')
        if not inventory(container):
            expect(container, 'isolated runtime login only', 'postgres',
                   'CREATE ROLE community_test_login LOGIN INHERIT; GRANT community_runtime TO community_test_login;')
        if not suite(container):
            return 1
        expect(container, 'commit for new-connection durability check', 'community_test_login',
               "INSERT INTO public.subscribers(id,email,first_name,audience_state) VALUES "
               "('00000000-0000-0000-0000-000000000099','durable@example.test','Reader','pending');")
        expect(container, 'new connection reads committed record', 'community_test_login',
               "SELECT email || ':' || first_name FROM public.subscribers "
               "WHERE id='00000000-0000-0000-0000-000000000099';",
               expected_output='durable@example.test:Reader')
        print('GREEN_REVIEW_SUITE: database subset only; CI regressions and DOD-01 not established')
        return 0
    finally:
        if created:
            command(['docker', 'rm', '-f', container])


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (OSError, RuntimeError, ValueError, subprocess.TimeoutExpired) as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
