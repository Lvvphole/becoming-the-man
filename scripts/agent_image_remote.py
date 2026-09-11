"""Bounded live registry and provenance evidence, separate from local policy tests."""
import hashlib
import base64
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import urllib.error
import urllib.parse
import urllib.request
from agent_image_policy import (BASE, CHILD, IMAGE, REPO, WORKFLOW,
                                PolicyError, digest_identity, registry_bytes, require)


def fetch(url: str, headers: dict | None = None) -> bytes:
    request_headers = {'User-Agent': 'becoming-the-man-image-verifier/1'}
    request_headers.update(headers or {})
    with urllib.request.urlopen(urllib.request.Request(url, headers=request_headers), timeout=30) as response:
        data = response.read(8_000_001)
    require(len(data) <= 8_000_000, 'RESPONSE_LIMIT')
    return data


def findings(html: str) -> str:
    """Hash substantive package findings; missing or ambiguous reports fail closed."""
    for match in re.finditer(r'\.enqueue\(', html):
        try:
            encoded, _ = json.JSONDecoder().raw_decode(html[match.end():])
            data = json.loads(encoded)
        except (ValueError, TypeError):
            continue  # Other stream chunks are unrelated to the report.
        if not isinstance(data, list) or 'purlToVulnerabilities' not in data:
            continue
        def decode(index: int, depth: int = 0) -> object:
            require(depth < 24, 'REPORT_DEPTH')
            if index < 0:
                return None
            value = data[index]
            if isinstance(value, list):
                return [decode(item, depth + 1) for item in value]
            if isinstance(value, dict):
                return {data[int(key[1:])]: decode(item, depth + 1) for key, item in value.items()}
            return value
        key = '_' + str(data.index('purlToVulnerabilities'))
        for value in data:
            if isinstance(value, dict) and key in value:
                report = decode(value[key])
                require(isinstance(report, dict) and bool(report), 'REPORT_MISSING')
                return hashlib.sha256(json.dumps(report, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
    raise PolicyError('REPORT_MISSING')


def finding_summary(html: str) -> dict:
    for match in re.finditer(r'\.enqueue\(', html):
        try:
            encoded, _ = json.JSONDecoder().raw_decode(html[match.end():])
            data = json.loads(encoded)
        except (ValueError, TypeError):
            continue
        if not isinstance(data, list) or 'vulnerabilityReport' not in data:
            continue
        value = data[data.index('vulnerabilityReport') + 1]
        require(isinstance(value, dict), 'REPORT_MISSING')
        summary = {data[int(key[1:])]: data[index] for key, index in value.items()}
        require(summary.get('total') == sum(summary.get(name, 0) for name in
                ('critical', 'high', 'medium', 'low', 'unspecified')), 'REPORT_SUMMARY')
        return summary
    raise PolicyError('REPORT_MISSING')


def check_base() -> None:
    token = json.loads(fetch('https://auth.docker.io/token?service=registry.docker.io&scope=repository:library/node:pull'))['token']
    headers = {'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.oci.image.index.v1+json, application/vnd.oci.image.manifest.v1+json'}
    url = 'https://registry-1.docker.io/v2/library/node/'
    index = fetch(url + 'manifests/' + BASE, headers)
    registry_bytes(index, BASE)
    require(any(m['digest'] == CHILD and m['platform'] == {'os': 'linux', 'architecture': 'amd64'}
                for m in json.loads(index)['manifests']), 'BASE_PLATFORM')
    manifest = fetch(url + 'manifests/' + CHILD, headers)
    registry_bytes(manifest, CHILD)
    config_digest = json.loads(manifest)['config']['digest']
    config = fetch(url + 'blobs/' + config_digest, headers)
    registry_bytes(config, config_digest)
    data = json.loads(config)
    require(data['os'] == 'linux' and data['architecture'] == 'amd64' and
            'NODE_VERSION=24.21.0' in data['config']['Env'], 'BASE_RUNTIME')
    html = fetch('https://hub.docker.com/layers/library/node/24-bookworm-slim/images/' + CHILD.replace(':', '-')).decode()
    print(json.dumps({'event': 'CURRENT_VULNERABILITY_EVIDENCE',
                      'subject': CHILD, 'findings_sha256': findings(html),
                      'summary': finding_summary(html)}, sort_keys=True))
    print('BASE_IDENTITY_AND_RUNTIME_MATCH_APPROVED_SUBJECT')


def run(argv: list[str]) -> subprocess.CompletedProcess:
    result = subprocess.run(argv, capture_output=True, timeout=120)
    print(json.dumps({'argv': argv, 'exit': result.returncode,
                      'stdout': result.stdout.decode(errors='replace'),
                      'stderr': result.stderr.decode(errors='replace')}))
    return result


def success(argv: list[str]) -> bytes:
    result = run(argv)
    require(result.returncode == 0, 'REMOTE_COMMAND_FAILED')
    return result.stdout


def tag_lookup_status(status: int) -> str:
    """Classify an authenticated tag lookup; only 200 and 404 are authoritative."""
    if status == 404:
        return 'absent'
    if status == 200:
        return 'present'
    raise PolicyError('TAG_LOOKUP_FAILED')


def resume_digest(headers) -> str:
    """Reuse an existing commit tag only when its digest is registry-authoritative."""
    digest = headers.get('Docker-Content-Digest')
    require(isinstance(digest, str) and bool(digest), 'TAG_LOOKUP_FAILED')
    digest_identity(digest, digest)
    return digest


def write_github_output(name: str, value: str) -> None:
    path = os.environ.get('GITHUB_OUTPUT')
    if not path:
        return
    with open(path, 'a', encoding='utf-8') as handle:
        handle.write(name + '=' + value + '\n')


def resolve_commit_tag() -> None:
    """Permit first publication on 404; resume on an existing digest without rewrite."""
    source = os.environ['GITHUB_SHA']
    require(source == os.environ['SOURCE_SHA'] and
            re.fullmatch('[0-9a-f]{40}', source) is not None, 'SOURCE_MISMATCH')
    credentials = base64.b64encode(
        (os.environ['GITHUB_ACTOR'] + ':' + os.environ['GH_TOKEN']).encode()).decode()
    query = urllib.parse.urlencode({
        'service': 'ghcr.io',
        'scope': 'repository:lvvphole/becoming-the-man-agent:pull',
    })
    token_data = json.loads(fetch('https://ghcr.io/token?' + query,
                                  {'Authorization': 'Basic ' + credentials}))
    token = token_data.get('token') or token_data.get('access_token')
    require(isinstance(token, str) and bool(token), 'TAG_LOOKUP_FAILED')
    request = urllib.request.Request(
        'https://ghcr.io/v2/lvvphole/becoming-the-man-agent/manifests/' + source,
        headers={'Authorization': 'Bearer ' + token,
                 'Accept': 'application/vnd.oci.image.index.v1+json, '
                           'application/vnd.oci.image.manifest.v1+json, '
                           'application/vnd.docker.distribution.manifest.list.v2+json, '
                           'application/vnd.docker.distribution.manifest.v2+json'})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            require(tag_lookup_status(response.status) == 'present', 'TAG_LOOKUP_FAILED')
            data = response.read(8_000_001)
            require(len(data) <= 8_000_000, 'RESPONSE_LIMIT')
            digest = resume_digest(response.headers)
            registry_bytes(data, digest)
            write_github_output('digest', digest)
            print('COMMIT_TAG_REUSED')
            return
    except urllib.error.HTTPError as exc:
        require(tag_lookup_status(exc.code) == 'absent', 'TAG_LOOKUP_FAILED')
    write_github_output('digest', '')
    print('COMMIT_TAG_AUTHORITATIVELY_ABSENT')


def check_registry(digest: str) -> bytes:
    digest_identity(digest, digest)
    source = os.environ['GITHUB_SHA']
    require(re.fullmatch('[0-9a-f]{40}', source) is not None, 'SOURCE_FORMAT')
    observed = success(['docker', 'buildx', 'imagetools', 'inspect', IMAGE + ':' + source,
                        '--format', '{{.Manifest.Digest}}']).decode().strip()
    digest_identity(digest, observed)
    raw = success(['docker', 'buildx', 'imagetools', 'inspect', IMAGE + '@' + digest, '--raw'])
    if 'sha256:' + hashlib.sha256(raw).hexdigest() != digest and raw.endswith(b'\n'):
        raw = raw[:-1]  # Buildx prints a newline after raw manifest bytes.
    registry_bytes(raw, digest)
    return raw


def verification_args(subject: str, source: str) -> list[str]:
    return ['gh', 'attestation', 'verify', subject, '--repo', REPO,
            '--signer-workflow', REPO + '/' + WORKFLOW, '--source-digest', source,
            '--signer-digest', source, '--source-ref', 'refs/heads/main',
            '--deny-self-hosted-runners', '--format', 'json']


def rejected_identity(result: subprocess.CompletedProcess, pattern: str) -> bool:
    # Match the final error, never echoed policy criteria preceding an outage.
    error = result.stderr.decode(errors='replace').rsplit('\nError:', 1)
    return result.returncode == 1 and len(error) == 2 and re.search(pattern, error[1], re.I) is not None


def verify(digest: str) -> None:
    raw = check_registry(digest)
    source = os.environ['SOURCE_SHA']
    require(source == os.environ['GITHUB_SHA'], 'SOURCE_MISMATCH')
    ref = IMAGE + '@' + digest
    success(['docker', 'pull', '--platform', 'linux/amd64', ref])
    argv = verification_args('oci://' + ref, source)
    verified = json.loads(success(argv))
    require(isinstance(verified, list) and bool(verified), 'ATTESTATION_MISSING')
    # signer-workflow is a prefix regex; a second verification enforces exact SAN.
    exact = argv.copy()
    index = exact.index('--signer-workflow')
    exact[index:index + 2] = ['--cert-identity', 'https://github.com/' + REPO + '/' + WORKFLOW + '@refs/heads/main']
    success(exact)
    with tempfile.TemporaryDirectory(prefix='image-provenance-') as temporary:
        root = Path(temporary)
        subject, bundle = root / 'manifest.json', root / 'bundle.jsonl'
        subject.write_bytes(raw)
        bundle.write_text('\n'.join(json.dumps(item['attestation']['bundle']) for item in verified) + '\n')
        offline = verification_args(str(subject), source) + ['--bundle', str(bundle)]
        success(offline)
        cases = [('--repo', 'Lvvphole/wrong-repository', r'SourceRepositoryURI|source repository'),
                 ('--signer-workflow', REPO + '/.github/workflows/wrong.yml', r'certificate identity|SAN|subject alternative'),
                 ('--source-digest', '0' * 40, r'SourceRepositoryDigest|source.*digest')]
        for flag, value, reason in cases:
            mutant = offline.copy()
            mutant[mutant.index(flag) + 1] = value
            result = run(mutant)
            require(rejected_identity(result, reason),
                    'NEGATIVE_CONTROL_NOT_PROVEN:' + flag)
        subject.write_bytes(raw + b' ')
        result = run(offline)
        require(rejected_identity(result, r'digest.*(match|verif)|no matching subject'), 'SUBJECT_CONTROL_NOT_PROVEN')
    print('EXACT_IMAGE_PROVENANCE_VERIFIED; independent acceptance and merged CI still required')


if __name__ == '__main__':
    try:
        require(len(sys.argv) == 2 and sys.argv[1] in
                {'base', 'commit-tag', 'registry', 'verify'}, 'COMMAND')
        if sys.argv[1] == 'base':
            check_base()
        elif sys.argv[1] == 'commit-tag':
            resolve_commit_tag()
        elif sys.argv[1] == 'registry':
            check_registry(os.environ['IMAGE_DIGEST'])
        else:
            verify(os.environ['IMAGE_DIGEST'])
    except (PolicyError, OSError, ValueError, KeyError, IndexError, TypeError, subprocess.SubprocessError) as exc:
        print(str(exc), file=sys.stderr)
        sys.exit(1)
