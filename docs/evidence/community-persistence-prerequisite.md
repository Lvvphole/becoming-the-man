# Community persistence prerequisite

Owner authorization: EXC-DOD01-DB-PREREQ-01. Required first name; database-only prerequisite; no production application or DOD-01 acceptance.

Baseline: c282900834b08c487b2960e0c77716288ba46f00.
RED commit: 2067945950a3a69c2f3f9a23e553da64090bc086.
RED run: https://github.com/Lvvphole/becoming-the-man/actions/runs/34469762416/job/102846662592
Observed PostgreSQL 17.11, successful baseline migrations and previous database regressions, followed by:

```
RED_REQUIRED_STORAGE_MISSING:consent_events,email_requests,idempotency_keys,subscribers
Process completed with exit code 1.
```

Architecture v1.0 section 8 defines the four storage responsibilities. Inspected source SHA-256: 5bd599dd9fa6589e27116dd95b7e1a164ca3a92449459cd7aadda5408876815a.

Physical mapping: UUID identifiers, normalized unique text email, required nonblank first_name, explicit audience state, immutable consent version/source/purpose/events, purpose-specific email request snapshots, unique idempotency scope/key, immutable SHA-256 request hash, cached JSON result and explicit expiry deadline. Timestamp defaults, column names and runtime group are implementation choices. No policy version, TTL duration, provider state machine or real subscriber is fabricated.

community_runtime is a non-login permission group, separate from migration owner, with SELECT/INSERT and selected UPDATE columns. Consent has no UPDATE. No runtime DELETE/TRUNCATE/DDL or public table access. CI tests use an inheriting login and distinguish SQLSTATE 42501 from other errors.

This change establishes storage only. Cache expiration, atomic replay and concurrency behavior are not established merely by the columns. These remain required before full prerequisite acceptance. Public signup, provider synchronization and DOD-01 remain incomplete. Exact-head CI and independent review are required; no merge authority is implied.
