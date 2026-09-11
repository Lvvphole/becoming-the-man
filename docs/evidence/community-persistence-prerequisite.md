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

## I2 atomic idempotency and TTL task list

- [x] INC-1 — Establish real-PostgreSQL RED for atomic claim, pending duplicate, replay, conflict, TTL reclaim, concurrency, and execute privileges.
- [x] INC-2 — Add the security-invoker claim migration and establish GREEN plus all existing regression gates.

## I2 atomic idempotency and TTL

Owner authorization: EXC-DOD01-DB-PREREQ-01 continues to apply to this database-only
prerequisite. Source revision: 7c7819b39879da06729fd00d7758a2c4aab65487.

RED commit: 3da6c5be91aaf66c7c2aa349287e8a3cccbdd1a1.
RED run: https://github.com/Lvvphole/becoming-the-man/actions/runs/34531543219
Observed successful baseline migrations and the prior storage, privilege and RLS suite
(`GREEN_DRAFT_STORAGE_CHECKS_ONLY`), followed by:

```
RED_REQUIRED_IDEMPOTENCY_OPERATION_MISSING:claim_idempotency_key
Process completed with exit code 1.
```

GREEN commit: 34bd805601eaa40a070852e0defa5e165ecf661f.
GREEN run: https://github.com/Lvvphole/becoming-the-man/actions/runs/34532042259
Observed PostgreSQL 17.11 on x86_64-pc-linux-musl, all prior database gates, then:

```
CASE concurrent same-hash callers elect exactly one owner decisions=['CLAIMED', 'IN_PROGRESS', 'IN_PROGRESS', 'IN_PROGRESS', 'IN_PROGRESS', 'IN_PROGRESS', 'IN_PROGRESS', 'IN_PROGRESS']
CASE a held claim blocks a concurrent caller from owning execution holder=['CLAIMED'] probe=['IN_PROGRESS'] waited=5.57s
GREEN_IDEMPOTENCY_CLAIM_CONTRACT
```

Verifier stability: the isolated database suite executed twice against fresh disposable
PostgreSQL containers on the unchanged head 34bd805 (runs 34532042259 and 34532189824).
Both produced identical 116-case summaries apart from the two values the oracle deliberately
does not fix: the observed lock wait duration, and which payload wins the mixed-hash race.
The mixed-hash case is asserted as a result multiset against the stored winner, never against
process order.

Behavioral mapping: a new scope/key claims execution once; an unexpired same-hash duplicate
cannot independently execute; an unexpired completed duplicate returns the stored result
reference and JSON; the same scope/key under any different request hash is rejected before and
after expiry with the stored row unchanged; an expired same-hash record is reclaimable, its
cached result cleared and the caller-supplied deadline stored. Concurrent callers elect exactly
one execution owner and the losing payload is rejected. Decision names, the required future
expiry argument and the returned column set are implementation choices. No TTL duration, purge
schedule, completion function, retry worker, provider behavior, API or UI behavior is introduced.

Access control: the operation is SECURITY INVOKER, owned by the migration owner, with a fixed
search_path. Default PUBLIC execute is revoked; EXECUTE is granted only to community_runtime;
anon and authenticated are denied with SQLSTATE 42501. community_runtime UPDATE on
idempotency_keys is exactly status, result_reference, result_jsonb, created_at and expires_at;
scope, key and request_hash remain immutable at 42501; the expiry CHECK still rejects a deadline
at or before creation with 23514. The two added timestamp columns are a column-scoped table
grant, not a function-only capability: a runtime caller may also update them directly, subject to
the existing RLS policies and CHECK constraints. No service-role credential, SECURITY DEFINER
function, new role, table or extension is introduced.

This change establishes the I2 claim and expiry contract only. Public signup, provider
synchronization, Resend and DOD-01 remain incomplete. No staging or production database was
contacted. Independent Codex review on the exact final head is required; no merge authority is
implied.

## I2 Codex review cycle 1 repair

Reviewed commit: b20d8f95349c48845d20fb49a93c59d9d2b355c8. Codex returned two P2 findings; both were
reproduced against real PostgreSQL before any code changed.

Finding 1 — the claim operation captured `statement_timestamp()` once, then reused it after waits that
the suite itself measures at over five seconds, so expiry was decided and written on a stale clock.
Reproduced on the unrepaired function: a lease seeded to expire two seconds out, with the row lock held
five seconds, returned `REPLAY` to a caller that acquired the lock after expiry; and a reclaim whose
caller-supplied deadline elapsed during the same wait returned `CLAIMED` while storing
`expires_at` already in the past (`already_expired=true`), which would let a second caller reclaim and
execute alongside the first.

Finding 2 — the concurrency helper read the caller's stdout to EOF before applying
`PROCESS_TIMEOUT_SECONDS`, so the declared bound never applied. Reproduced with the pre-repair
ordering against a twelve-second lock hold: the read returned after 11.75 s under a declared 2 s bound.
After the repair the same setup raises the timeout error at 2.00 s.

Repair — the operation now reads `clock_timestamp()` and re-reads it after each wait, before the value
decides or is written: after a conflicting insert resolves, and after the row lock is acquired. A
caller-supplied deadline that elapsed during the wait is refused with SQLSTATE 22023 on both write
paths rather than stored. Hash discrimination still precedes the expiry branch, and `CONFLICT`,
`IN_PROGRESS` and `REPLAY` are unchanged because none of them reads or writes the caller's deadline.
The helper passes each statement as a `-c` argument with no stdin pipe and collects through
`communicate(timeout=PROCESS_TIMEOUT_SECONDS)`; the existing minimum-wait assertion continues to prove
the concurrent callers still race rather than serialize.

Two regression cases cover the mechanism: a lease that expires during contention must be reclaimed
rather than replayed, and a deadline that elapses during contention must be refused without mutating
the stored record. Both fail on the unrepaired function and pass after it.

The suite ran three times against fresh disposable PostgreSQL clusters and produced identical
118-case summaries, apart from the two values the oracle deliberately leaves free: the observed wait
duration and which payload wins the mixed-hash race. The observed contention waits were 5.54 s, 5.56 s
and 5.54 s.

This repair is a substantive implementation and verification-logic change. It invalidates the cycle-1
review and requires fresh exact-head CI followed by the next permitted Codex review cycle. Locked
Architecture section 19 and its idempotency contract, now present in the repository, were re-read
against this implementation: duplicates map to the same logical result and return the prior result
without a duplicate record or send, reuse of a key with a different request hash is rejected, and no
TTL duration is specified by authority. Merge authority remains separate and is not implied.
