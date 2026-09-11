"""Closed configuration policy; independent review supplies acceptance authority."""
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys

BASE = 'sha256:2fe369e969550cde8e867afc3fe370b260140cab4a23d467074295b42163d553'
CHILD = 'sha256:713cfbf4a0ac19f40e1bb9919893e126b74a5c8cf5d0623c9f89515c8f74c6fa'
REPO = 'Lvvphole/becoming-the-man'
IMAGE = 'ghcr.io/lvvphole/becoming-the-man-agent'
WORKFLOW = '.github/workflows/agent-image.yml'
BASELINE = 'd6983bd38bafc8d1fed29753cb380ff0cde319e9'
CI_BLOB = '87328d05b5be848653f7e75e25cfb0b978d37950'
PINS = {
    'checkout': 'actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683',
    'login': 'docker/login-action@184bdaa0721073962dff0199f1fb9940f07167d1',
    'build': 'docker/build-push-action@263435318d21b8e681c14492fe198d362a7d2c83',
    'attest': 'actions/attest-build-provenance@977bb373ede98d70efdf65b84cb5f73e068dcc2a',
}
HEAD = '${{ github.event.pull_request.head.sha || github.sha }}'
MAIN = ("github.event_name == 'push' && github.ref == 'refs/heads/main' && "
        "github.ref_protected && github.repository == 'Lvvphole/becoming-the-man'")
FILES = {'Dockerfile.agent', '.dockerignore', WORKFLOW,
         'scripts/agent_image_policy.py', 'scripts/agent_image_remote.py',
         'tests/agent_image_test.py', 'docs/evidence/agent-image.md'}


class PolicyError(ValueError):
    """A named contract violation, distinct from tool or infrastructure failure."""


def require(condition: bool, reason: str) -> None:
    """Raise PolicyError with reason when the contract is violated."""
    if not condition:
        raise PolicyError(reason)


def unique(pairs: list) -> dict:
    result = {}
    for key, value in pairs:
        require(key not in result, 'DUPLICATE_KEY')
        result[key] = value
    return result


def parse(text: str) -> dict:
    """Accept only unambiguous JSON-subset YAML; raise PolicyError otherwise."""
    try:
        result = json.loads(text, object_pairs_hook=unique)
    except json.JSONDecodeError as exc:
        raise PolicyError('UNSUPPORTED_YAML') from exc
    require(isinstance(result, dict), 'WORKFLOW_SHAPE')
    return result


def exact(actual: object, expected: object, reason: str) -> None:
    # Canonical JSON comparison preserves false versus 0 (Python equality does not).
    require(json.dumps(actual, sort_keys=True) == json.dumps(expected, sort_keys=True), reason)


def checkout() -> dict:
    return {'uses': PINS['checkout'], 'with': {
        'ref': HEAD, 'fetch-depth': 0, 'persist-credentials': False}}


def command(run: str, env: dict | None = None, step_id: str | None = None) -> dict:
    step = {'run': run, 'shell': 'bash'}
    if env is not None:
        step['env'] = env
    if step_id is not None:
        step['id'] = step_id
    return step


DIGEST = '${{ steps.build.outputs.digest || steps.tag.outputs.digest }}'


def build(push: bool) -> dict:
    step = {'id': 'build', 'uses': PINS['build'], 'with': {
        'context': '.', 'file': 'Dockerfile.agent', 'platforms': 'linux/amd64',
        'push': push, 'load': not push, 'provenance': False, 'sbom': False,
        'tags': IMAGE + (':${{ github.sha }}' if push else ':validation'),
        'build-args': 'REVISION=' + HEAD}}
    if push:
        step['if'] = "${{ steps.tag.outputs.digest == '' }}"
    return step


def login() -> dict:
    return {'uses': PINS['login'], 'with': {'registry': 'ghcr.io',
        'username': '${{ github.actor }}', 'password': '${{ secrets.GITHUB_TOKEN }}'}}


def steps(job: str) -> list:
    """Closed invocation list prevents unchecked shell and alternate credential paths."""
    common = [checkout(), command('python3 -B scripts/agent_image_policy.py\n'
                                 'python3 -B tests/agent_image_test.py')]
    if job == 'validate':
        return common + [build(False), command(
            'test "$(docker run --rm ' + IMAGE + ':validation node --version)" = "v24.21.0"\n'
            'test "$(docker image inspect ' + IMAGE + ':validation --format \'{{.Os}}/{{.Architecture}}\')" = "linux/amd64"')]
    if job == 'publish':
        return common + [command('python3 -B scripts/agent_image_remote.py base'), login(),
            command('python3 -B scripts/agent_image_remote.py commit-tag', {
                'GH_TOKEN': '${{ secrets.GITHUB_TOKEN }}',
                'SOURCE_SHA': '${{ github.sha }}'}, 'tag'),
            build(True), command('python3 -B scripts/agent_image_remote.py registry', {
                'IMAGE_DIGEST': DIGEST}),
            {'uses': PINS['attest'], 'with': {'subject-name': IMAGE,
                'subject-digest': DIGEST, 'push-to-registry': True}}]
    require(job == 'verify', 'JOB_SET')
    return common + [login(), command('python3 -B scripts/agent_image_remote.py verify', {
        'IMAGE_DIGEST': '${{ needs.publish.outputs.digest }}',
        'GH_TOKEN': '${{ secrets.GITHUB_TOKEN }}', 'SOURCE_SHA': '${{ github.sha }}'})]


def workflow_policy(data: dict) -> None:
    exact(set_as_list(data), ['concurrency', 'jobs', 'name', 'on', 'permissions'], 'WORKFLOW_SHAPE')
    exact(data['name'], 'Agent Image', 'WORKFLOW_NAME')
    exact(data['on'], {'pull_request': {}, 'push': {'branches': ['main']}}, 'EVENTS')
    exact(data['concurrency'], {'group': 'agent-image-' + HEAD,
                                'cancel-in-progress': False}, 'CONCURRENCY')
    exact(data['permissions'], {}, 'WORKFLOW_PERMISSIONS')
    jobs = data['jobs']
    require(isinstance(jobs, dict), 'JOB_SET')
    exact(set_as_list(jobs), ['publish', 'validate', 'verify'], 'JOB_SET')
    for name, job in jobs.items():
        expected = {'runs-on': 'ubuntu-latest', 'timeout-minutes': 20,
                    'permissions': {'contents': 'read'}, 'steps': steps(name)}
        if name != 'validate':
            expected.update({'needs': 'validate' if name == 'publish' else 'publish', 'if': MAIN})
            expected['permissions']['packages'] = 'write' if name == 'publish' else 'read'
        if name == 'publish':
            expected['permissions'].update({'id-token': 'write', 'attestations': 'write'})
            expected['outputs'] = {'digest': DIGEST}
        if name == 'verify':
            expected['permissions']['attestations'] = 'read'
        require(isinstance(job, dict), 'JOB_SHAPE')
        exact(job.get('permissions'), expected['permissions'], 'JOB_PERMISSIONS')
        exact(job.get('if'), expected.get('if'), 'PUBLICATION_CONDITION')
        exact(job.get('steps'), expected['steps'], 'EXECUTION_STEPS')
        exact(job, expected, 'JOB_SHAPE')


def set_as_list(data: dict) -> list:
    return sorted(data)


def docker_policy(text: str) -> None:
    require(re.search(r'^\s*#\s*(syntax|escape|check)\s*=', text, re.I | re.M) is None,
            'DOCKER_DIRECTIVE')
    lines = [line.strip() for line in text.splitlines() if line.strip() and not line.startswith('#')]
    require(bool(lines), 'MISSING_FROM')
    exact(lines[0], 'FROM docker.io/library/node@' + BASE, 'BASE_IDENTITY')
    exact(lines[1:], ['ARG REVISION',
        'LABEL org.opencontainers.image.source="https://github.com/' + REPO + '"',
        'LABEL org.opencontainers.image.revision="$REVISION"'], 'DOCKER_INSTRUCTIONS')


def digest_identity(reported: str, registry: str) -> None:
    require(re.fullmatch(r'sha256:[0-9a-f]{64}', reported) is not None, 'DIGEST_FORMAT')
    require(reported == registry, 'REGISTRY_DIGEST')


def registry_bytes(data: bytes, expected: str) -> None:
    digest_identity(expected, 'sha256:' + hashlib.sha256(data).hexdigest())


def check_tree(root: Path) -> None:
    require((root / 'Dockerfile.agent').is_file(), 'MISSING_IMAGE')
    for path in FILES:
        require(not (root / path).is_symlink(), 'SYMLINK')
    docker_policy((root / 'Dockerfile.agent').read_text())
    exact((root / '.dockerignore').read_text(), '**\n!Dockerfile.agent\n', 'BUILD_CONTEXT')
    require(not (root / 'Dockerfile.agent.dockerignore').exists(), 'BUILD_CONTEXT')
    surface = {p.name for p in (root / '.github/workflows').iterdir()}
    exact(sorted(surface), ['agent-image.yml', 'pr-verification.yml'], 'WORKFLOW_SURFACE')
    workflow_policy(parse((root / WORKFLOW).read_text()))
    original = (root / '.github/workflows/pr-verification.yml').read_bytes()
    blob = hashlib.sha1(b'blob ' + str(len(original)).encode() + b'\0' + original).hexdigest()
    require(blob == CI_BLOB, 'FROZEN_CI')


def check_diff(root: Path) -> None:
    result = subprocess.run(['git', 'diff', '--name-only', BASELINE, '--'], cwd=root,
                            check=True, capture_output=True, text=True, timeout=120)
    require(set(result.stdout.splitlines()) <= FILES, 'SCOPE_DRIFT')
    untracked = subprocess.run(['git', 'ls-files', '--others', '--exclude-standard'], cwd=root,
                               check=True, capture_output=True, text=True, timeout=120)
    require(set(untracked.stdout.splitlines()) <= FILES, 'SCOPE_DRIFT')


if __name__ == '__main__':
    try:
        require(sys.argv[1:] in ([], ['--scope']), 'COMMAND')
        check_tree(Path.cwd())
        if sys.argv[1:] == ['--scope']:
            check_diff(Path.cwd())
        print('IMAGE_POLICY_CHECKS_PASSED; independent acceptance still required')
    except (PolicyError, OSError, subprocess.SubprocessError) as exc:
        print(str(exc), file=sys.stderr)
        sys.exit(1)
