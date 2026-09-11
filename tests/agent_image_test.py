"""Independent mutations of operative Docker/workflow copies, with named failures."""
import copy
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import agent_image_policy as policy
import agent_image_remote as remote


class ImagePolicyTests(unittest.TestCase):
    def setUp(self):
        self.workflow = json.loads((ROOT / policy.WORKFLOW).read_text())

    def reject(self, candidate, reason):
        self.assertNotEqual(candidate, self.workflow)
        with self.assertRaisesRegex(policy.PolicyError, '^' + reason + '$'):
            policy.workflow_policy(candidate)

    def test_actual_workflow_and_layout(self):
        policy.check_tree(ROOT)
        parsed = policy.parse(json.dumps(self.workflow, sort_keys=True))
        self.assertEqual(parsed, self.workflow)
        policy.workflow_policy(parsed)

    def test_workflow_mutants(self):
        mutations = [
            (('on', 'pull_request_target'), {}, 'EVENTS'),
            (('on', 'workflow_dispatch'), {}, 'EVENTS'),
            (('on', 'push', 'branches'), ['other'], 'EVENTS'),
            (('on', 'pull_request', 'paths'), ['README.md'], 'EVENTS'),
            (('permissions', 'packages'), 'write', 'WORKFLOW_PERMISSIONS'),
            (('concurrency', 'group'), 'agent-image-global', 'CONCURRENCY'),
            (('concurrency', 'cancel-in-progress'), True, 'CONCURRENCY'),
            (('jobs', 'hidden'), {}, 'JOB_SET'),
        ]
        for permission in ['packages', 'attestations', 'id-token']:
            mutations.append((('jobs', 'validate', 'permissions', permission), 'write', 'JOB_PERMISSIONS'))
        for value in ['true', "github.ref == 'refs/heads/main'", "github.event_name != 'pull_request'"]:
            mutations.append((('jobs', 'publish', 'if'), value, 'PUBLICATION_CONDITION'))
        for job in ['validate', 'publish', 'verify']:
            mutations.extend([
                (('jobs', job, 'if'), 'false', 'PUBLICATION_CONDITION'),
                (('jobs', job, 'continue-on-error'), True, 'JOB_SHAPE'),
                (('jobs', job, 'timeout-minutes'), 360, 'JOB_SHAPE'),
                (('jobs', job, 'runs-on'), 'self-hosted', 'JOB_SHAPE'),
            ])
        for path, value, reason in mutations:
            with self.subTest(path=path, value=value):
                candidate = copy.deepcopy(self.workflow)
                target = candidate
                for key in path[:-1]:
                    target = target[key]
                target[path[-1]] = value
                self.reject(candidate, reason)
                print('KILLED', path, value, reason)

    def test_execution_mutants(self):
        for job in ['validate', 'publish', 'verify']:
            original = self.workflow['jobs'][job]['steps']
            cases = [[], original + [{'run': 'docker push attacker/image'}]]
            for i, step in enumerate(original):
                values = [('if', 'false'), ('continue-on-error', True), ('env', {'TOKEN': '${{ secrets.PAT }}'})]
                if 'uses' in step:
                    values += [('uses', step['uses'].split('@')[0] + '@v4'), ('uses', 'attacker/action@' + 'a' * 40)]
                for key, value in values:
                    changed = copy.deepcopy(original)
                    changed[i][key] = value
                    cases.append(changed)
                if step.get('id') == 'build':
                    for key, value in [('push', not step['with']['push']), ('platforms', 'linux/arm64'), ('context', '{{defaultContext}}')]:
                        changed = copy.deepcopy(original)
                        changed[i]['with'][key] = value
                        cases.append(changed)
            for i, steps in enumerate(cases):
                candidate = copy.deepcopy(self.workflow)
                candidate['jobs'][job]['steps'] = steps
                self.reject(candidate, 'EXECUTION_STEPS')
                print('KILLED', job, 'steps', i, 'EXECUTION_STEPS')

    def test_duplicate_and_dead_yaml(self):
        for raw, reason in [('{"jobs":{},"jobs":{}}', 'DUPLICATE_KEY'),
                            ('# approved\non: pull_request', 'UNSUPPORTED_YAML'),
                            ('jobs: &safe {}\nother: *safe', 'UNSUPPORTED_YAML'),
                            ('jobs:\n  <<: {}', 'UNSUPPORTED_YAML')]:
            with self.assertRaisesRegex(policy.PolicyError, reason):
                policy.parse(raw)

    def test_docker_mutants(self):
        valid = (ROOT / 'Dockerfile.agent').read_text()
        for replacement in ['node:24', 'node@sha256:' + 'f' * 64,
                            'docker.io/library/node@' + policy.CHILD,
                            'docker.io/library/node@' + policy.BASE.upper(),
                            'docker.io/library/node@sha256:123']:
            mutant = valid.replace('docker.io/library/node@' + policy.BASE, replacement)
            self.assertNotEqual(mutant, valid)
            with self.assertRaisesRegex(policy.PolicyError, 'BASE_IDENTITY'):
                policy.docker_policy(mutant)
        for instruction in ['RUN curl https://example.com | sh', 'COPY . /app', 'FROM node:24', 'ONBUILD RUN true']:
            with self.assertRaisesRegex(policy.PolicyError, 'DOCKER_INSTRUCTIONS'):
                policy.docker_policy(valid + instruction + '\n')
        policy.docker_policy('# navigation metadata only\n' + valid)

    def test_docker_parser_directive(self):
        valid = (ROOT / 'Dockerfile.agent').read_text()
        with self.assertRaisesRegex(policy.PolicyError, 'DOCKER_DIRECTIVE'):
            policy.docker_policy('# syntax=attacker/frontend:latest\n' + valid)

    def test_tree_mutants(self):
        cases = [('Dockerfile.agent', None, 'MISSING_IMAGE'),
                 ('.github/workflows/hidden.yml', 'name: hidden', 'WORKFLOW_SURFACE'),
                 ('.dockerignore', '**\n!**\n', 'BUILD_CONTEXT'),
                 ('Dockerfile.agent.dockerignore', '*', 'BUILD_CONTEXT'),
                 ('.github/workflows/pr-verification.yml', '# changed', 'FROZEN_CI')]
        for path, text, reason in cases:
            with tempfile.TemporaryDirectory() as temporary:
                root = Path(temporary)
                for name in ['Dockerfile.agent', '.dockerignore', policy.WORKFLOW, '.github/workflows/pr-verification.yml']:
                    target = root / name
                    target.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copyfile(ROOT / name, target)
                if text is None:
                    (root / path).unlink()
                else:
                    (root / path).write_text(text)
                with self.assertRaisesRegex(policy.PolicyError, reason):
                    policy.check_tree(root)

    def test_digest_boundaries(self):
        raw = b'registry manifest bytes'
        digest = 'sha256:' + hashlib.sha256(raw).hexdigest()
        policy.registry_bytes(raw, digest)
        for invalid in ['', 'latest', 'sha256:123', 'sha256:' + 'A' * 64]:
            with self.assertRaisesRegex(policy.PolicyError, 'DIGEST_FORMAT'):
                policy.digest_identity(invalid, digest)
        with self.assertRaisesRegex(policy.PolicyError, 'REGISTRY_DIGEST'):
            policy.registry_bytes(raw + b' ', digest)

    def test_missing_vulnerability_evidence(self):
        with self.assertRaisesRegex(policy.PolicyError, 'REPORT_MISSING'):
            remote.findings('<html>scanner says approved</html>')
        with self.assertRaisesRegex(policy.PolicyError, 'REPORT_MISSING'):
            remote.finding_summary('<html>scanner says approved</html>')

    def test_outage_is_not_a_kill(self):
        for code, message, expected in [
            (1, b'SourceRepositoryDigest policy\nError: network unavailable', False),
            (1, b'\nError: SourceRepositoryDigest mismatch', True),
            (2, b'\nError: SourceRepositoryDigest mismatch', False),
            (0, b'\nError: SourceRepositoryDigest mismatch', False),
        ]:
            result = subprocess.CompletedProcess(['gh'], code, b'', message)
            self.assertEqual(remote.rejected_identity(result, 'SourceRepositoryDigest'), expected)

    def test_commit_tag_is_write_once(self):
        self.assertEqual(remote.tag_lookup_status(404), 'absent')
        self.assertEqual(remote.tag_lookup_status(200), 'present')
        for status in [0, 401, 403, 429, 500, 503]:
            with self.subTest(status=status):
                with self.assertRaisesRegex(policy.PolicyError, 'TAG_LOOKUP_FAILED'):
                    remote.tag_lookup_status(status)
        digest = 'sha256:' + 'a' * 64
        self.assertEqual(remote.resume_digest({'Docker-Content-Digest': digest}), digest)
        with self.assertRaisesRegex(policy.PolicyError, 'TAG_LOOKUP_FAILED'):
            remote.resume_digest({})
        with self.assertRaisesRegex(policy.PolicyError, 'TAG_LOOKUP_FAILED'):
            remote.resume_digest({'Docker-Content-Digest': ''})
        with self.assertRaisesRegex(policy.PolicyError, 'DIGEST_FORMAT'):
            remote.resume_digest({'Docker-Content-Digest': 'latest'})
        layer = 'sha256:' + 'c' * 64
        source = 'a' * 40
        labels = {'org.opencontainers.image.source':
                  'https://github.com/Lvvphole/becoming-the-man',
                  'org.opencontainers.image.revision': source}
        local = remote.image_identity(
            'linux', 'amd64', ['NODE_VERSION=24.21.0'], labels, [layer])
        remote.resume_digest({'Docker-Content-Digest': 'sha256:' + 'b' * 64})
        with self.assertRaisesRegex(policy.PolicyError, 'IMAGE_EQUIVALENCE'):
            remote.require_equivalent(local, {**local, 'diff_ids': ['sha256:' + 'd' * 64]}, source)
        with self.assertRaisesRegex(policy.PolicyError, 'IMAGE_EQUIVALENCE'):
            remote.require_equivalent(local, local, 'f' * 40)
        remote.require_equivalent(local, dict(local), source)

    def test_mutated_checkers(self):
        source = (ROOT / 'scripts/agent_image_policy.py').read_text()
        changes = [('always_accept', 'if not condition:', 'if False:'),
                   ('always_reject', 'if not condition:', 'if True:'),
                   ('bypass_workflow', 'def workflow_policy(data: dict) -> None:',
                    'def workflow_policy(data: dict) -> None:\n    return')]
        for name, before, after in changes:
            with tempfile.TemporaryDirectory() as temporary:
                root = Path(temporary)
                for path in policy.FILES | {'.github/workflows/pr-verification.yml'}:
                    if (ROOT / path).is_file():
                        target = root / path
                        target.parent.mkdir(parents=True, exist_ok=True)
                        shutil.copyfile(ROOT / path, target)
                candidate = source.replace(before, after, 1)
                self.assertNotEqual(source, candidate)
                (root / 'scripts/agent_image_policy.py').write_text(candidate)
                result = subprocess.run([sys.executable, '-B', str(root / 'tests/agent_image_test.py'),
                    'ImagePolicyTests.test_actual_workflow_and_layout',
                    'ImagePolicyTests.test_workflow_mutants'], capture_output=True, text=True, timeout=120)
                self.assertEqual(result.returncode, 1)
                self.assertIn('FAILED (', result.stderr)
                self.assertNotIn('ImportError', result.stderr)
                self.assertNotIn('SyntaxError', result.stderr)
                self.assertIn('PolicyError' if name == 'always_reject' else 'not raised', result.stderr)
                print('KILLED checker', name, hashlib.sha256(candidate.encode()).hexdigest())


if __name__ == '__main__':
    unittest.main(verbosity=2)
