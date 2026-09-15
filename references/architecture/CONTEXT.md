# Architecture Reference Router

Status: ACTIVE LAYER 3 ROUTER
Authority: subordinate to `AGENTS.md` and root `CONTEXT.md`.
Contract: C6 Architecture-Manifest Contract.

This file is the only active architecture-source manifest. Do not scan `docs/`, compare timestamps, or infer version order from filenames.

ARCHITECTURE_MANIFEST_BEGIN

```json
{
  "version": "1.0.0",
  "active_sources": [
    "docs/Website_System_Architecture_v1.0_LOCKED.md",
    "docs/SYSTEM_ARCHITECTURE_AMENDMENT_v1.1.md",
    "docs/SYSTEM_ARCHITECTURE_AMENDMENT_v1.2.md"
  ],
  "supersession": [
    {
      "from": "v1.0",
      "to": "v1.1",
      "scope": [
        "Website System Architecture Section 18",
        "repository implementation controls"
      ],
      "preserved": "all v1.0 requirements outside the declared scope"
    },
    {
      "from": "v1.1",
      "to": "v1.2",
      "scope": [
        "A18-03",
        "A18-04",
        "A18-05"
      ],
      "replacements": [
        "A18-03A",
        "A18-04A",
        "A18-05A"
      ],
      "preserved": [
        "A18-01",
        "A18-02",
        "all other v1.1 requirements not explicitly amended"
      ]
    }
  ],
  "active_reviewable_loc_limit": 500
}
```

ARCHITECTURE_MANIFEST_END

## Active Source Order

1. `docs/Website_System_Architecture_v1.0_LOCKED.md`
2. `docs/SYSTEM_ARCHITECTURE_AMENDMENT_v1.1.md`
3. `docs/SYSTEM_ARCHITECTURE_AMENDMENT_v1.2.md`

No other architecture source is active unless an authorized governance change updates this manifest.

## v1.0 -> v1.1

v1.1 amends only Website System Architecture Section 18 and repository implementation controls.

Within that boundary, v1.1 controls. Outside it, v1.0 remains active.

Active v1.1 controls include:

- A18-01: maximum 500 reviewable implementation lines per PR unless the exact owner exception in `AGENTS.md` is valid.
- A18-02: persistent exact-head verification.
- A18-03: independent Codex review.
- A18-04: protected production branch.
- A18-05: merge authority and final evidence.

## v1.1 -> v1.2

v1.2 amends only A18-03, A18-04, and A18-05 through A18-03A, A18-04A, and A18-05A.

A18-01 and A18-02 remain controlled by v1.1. Every v1.0/v1.1 requirement not explicitly amended by v1.2 remains active.

## Conflict Gate

```text
G_ARCH_SOURCE_SET :=
  ActiveSources = [v1.0, v1.1, v1.2]

G_ARCH_PRECEDENCE :=
  every architecture conflict is resolved by an explicit supersession boundary

G_ARCH_CHANGE_SIZE :=
  active_reviewable_loc_limit = 500
```

If a conflict is not resolved by the explicit chain above, return `BLOCKED`. No model may choose a winner.
