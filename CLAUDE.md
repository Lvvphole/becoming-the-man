# CLAUDE.md

@AGENTS.md

Read and follow [`AGENTS.md`](./AGENTS.md) before taking any action in this repository.

`AGENTS.md` is the repository execution constitution and authority router. Use its **Upstream Source Router** to select and read only the smallest relevant authoritative governing section for the task.

Do not duplicate, reinterpret, or override governance in this file. If anything here conflicts with `AGENTS.md`, `AGENTS.md` controls.

If `AGENTS.md` routes to an authoritative source that is unavailable, follow its stop rule. Do not substitute memory or guess.

## Skills

Repository skills live in `.claude/skills/`. Each skill is a self-contained folder with a `SKILL.md` that defines its name, trigger conditions, and instructions.

**Routing rule:** When a task matches a skill's trigger description, read that skill's `SKILL.md` and follow it. Read reference files only when `SKILL.md` cites them — do not preload an entire skill folder.

Available skills:
- **scout-agent** — Read-only reconnaissance. Use before planning or implementation when the repo state relative to its DoD is unknown. Produces a single-path scout report.
- **plan** — Turns a scout report or user handoff into the smallest sufficient implementation plan. Use after scouting, before building.
- **engineering-rules** — The 51-rule engineering standard. Enforce while writing code; audit diffs and PRs against it. Includes `scripts/check.py` for mechanical gate checks.
