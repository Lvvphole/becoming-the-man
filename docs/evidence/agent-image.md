# Agent image supply-chain evidence

Status: implementation candidate. This record does not authorize merge or claim that the supply chain is established.

## Authority and source

- Plan v5 SHA-256: `2641a694c8af6869ffbbf32e93acf23e333c7344cb8d80b18d0572aeb1aee0be`
- Source commit: `d6983bd38bafc8d1fed29753cb380ff0cde319e9`
- Existing PR Verification blob: `87328d05b5be848653f7e75e25cfb0b978d37950`
- Approved base index: `docker.io/library/node@sha256:2fe369e969550cde8e867afc3fe370b260140cab4a23d467074295b42163d553`
- Required linux/amd64 child: `sha256:713cfbf4a0ac19f40e1bb9919893e126b74a5c8cf5d0623c9f89515c8f74c6fa`
- Runtime contract: Node 24.21.0; repository engine `>=22.12 <25`

Base approval stays bound to the exact registry identity and platform relationship. Current vulnerability evidence is recorded before publication and cannot approve, reject or revoke an unchanged base automatically.

## Pinned Actions

| Canonical action | Discovery tag | Executed commit |
|---|---|---|
| actions/checkout | v4.2.2 | `11bd71901bbe5b1630ceea73d27597364c9af683` |
| docker/login-action | v3.5.0 | `184bdaa0721073962dff0199f1fb9940f07167d1` |
| docker/build-push-action | v6.18.0 | `263435318d21b8e681c14492fe198d362a7d2c83` |
| actions/attest-build-provenance | v3.0.0 | `977bb373ede98d70efdf65b84cb5f73e068dcc2a` |

Each tag-to-commit mapping was resolved from the canonical repository's Git tag reference. Workflow authority is the full commit only.

## Candidate verification

- Local policy: `IMAGE_POLICY_CHECKS_PASSED`; this is candidate evidence pending independent review.
- Deterministic test replay: 11 tests passed twice with byte-identical standard output.
- Checker mutations: always-accept, always-reject and workflow-bypass variants were detected.
- Docker parser-directive regression: failed before the policy fix and passed afterward.
- Current live evidence: registry index, child manifest and configuration hashes matched; platform was linux/amd64; configuration reported Node 24.21.0.
- Current Docker Scout report: 65 total, 2 Critical, 14 High, 14 Medium, 31 Low, 4 unspecified; substantive findings SHA-256 `df7ee741a7722a49b94144c75d7eafcae18e8e29003cc5a5507d1c93b98ba7f0`. Six new CVEs were not independently corroborated in public Debian/CVE search results.
- Commit-addressable tags are write-once: publication proceeds only after an authenticated GHCR manifest lookup returns authoritative HTTP 404. Existing tags and lookup/authentication/outage failures block before build/push.

## Required external evidence

- Agent Image workflow build succeeds for the final PR head and publish/verify jobs are skipped on the PR.
- Existing PR Verification succeeds for that same head.
- Reviewable implementation change is at most 1,000 lines.
- Independent Codex review has no unresolved actionable finding within the three-cycle limit.
- A separately authorized merge is followed by successful protected-main publication, exact-digest pull, attestation verification and current repository CI for the merged SHA.

Until every applicable item exists, the candidate is not accepted and the supply chain is not established.
