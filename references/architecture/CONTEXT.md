# Architecture Reference Router

Status: ACTIVE LAYER 3 ROUTER
Authority: subordinate to `AGENTS.md` and root `CONTEXT.md`.
Purpose: enumerate the complete active Website System Architecture source set and its supersession boundaries. Do not scan `docs/` to discover architecture amendments.

## Active source order

Read only the sections required by the selected root route, in this precedence order:

1. `docs/Website_System_Architecture_v1.0_LOCKED.md`
2. `docs/SYSTEM_ARCHITECTURE_AMENDMENT_v1.1.md`
3. `docs/SYSTEM_ARCHITECTURE_AMENDMENT_v1.2.md`

No other architecture document is active unless this router is changed under an authorized governance-change task.

## Supersession boundaries

### v1.0 -> v1.1

v1.1 amends only Website System Architecture v1.0 Section 18 and repository implementation controls.

Within that boundary, v1.1 controls. Outside it, v1.0 remains the active architecture source.

Active v1.1 controls include:

- A18-01: maximum 500 reviewable implementation lines per PR unless the repository-owner exception defined by `AGENTS.md` is valid.
- A18-02: persistent exact-head verification.
- A18-03: independent Codex review.
- A18-04: protected production branch.
- A18-05: merge authority and final evidence.

### v1.1 -> v1.2

v1.2 amends only:

- A18-03 review convergence;
- A18-04 up-to-date-main refresh behavior;
- A18-05 final-evidence requirements.

Where v1.2 defines A18-03A, A18-04A, or A18-05A, v1.2 controls.

A18-01 and A18-02 remain controlled by v1.1.

All v1.0 and v1.1 requirements not explicitly amended by v1.2 remain active.

## Conflict gate

If two listed sources produce incompatible requirements and the supersession rules above do not select exactly one controlling requirement, return BLOCKED.

```text
G_ARCH_SOURCE_SET :=
  active_sources = [v1.0, v1.1, v1.2]

G_ARCH_PRECEDENCE :=
  conflict_is_resolved_by_explicit_supersession = TRUE

G_ARCH_CHANGE_SIZE :=
  active_reviewable_LOC_limit = 500
```

Do not infer a newer amendment by filename, timestamp, directory listing, or model judgment. A new amendment becomes active only after this router is explicitly updated by an authorized governance change.
