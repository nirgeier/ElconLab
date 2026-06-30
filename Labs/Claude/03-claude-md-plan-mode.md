# 03 · CLAUDE.md & Plan Mode

> How Claude Code remembers your project across sessions (CLAUDE.md) and how it investigates safely before touching code (Plan Mode).

---

## What CLAUDE.md is

- A plain-markdown file Claude Code loads automatically into context at the start of a session.
- Acts as persistent "project memory" so you don't re-explain conventions every time.
- Lives alongside your code (typically the repo root) and is meant to be committed and shared with the team.
- Treated as instructions/context, not executable config - keep it short and high-signal, since it consumes context budget.
- You can add to it on the fly: prefix a message with `#` and Claude offers to write that note into a CLAUDE.md file.

---

## What to put in CLAUDE.md

- Build / test / lint commands the project actually uses (e.g. `pnpm test`, `make lint`).
- Code style and conventions: formatting, naming, preferred libraries, patterns to follow or avoid.
- Architecture orientation: where key modules live, how the pieces fit together.
- Workflow rules: branching, commit message format, "run tests before committing."
- Gotchas and non-obvious constraints (flaky test, required env vars, things that look wrong but are intentional).

```markdown
# Project: Billing Service

## Commands
- Test: `pnpm test`
- Lint/format: `pnpm lint && pnpm format`

## Conventions
- TypeScript strict mode; no `any`.
- Use the existing `Result<T>` type instead of throwing.

## Notes
- `legacy/` is frozen - do not refactor.
```

---

## The memory hierarchy

- Claude Code reads CLAUDE.md from multiple locations and merges them, more specific layered over more general.
- **Enterprise**: a managed system-level policy file, deployed by an admin to all users on a machine.
- **User** (`~/.claude/CLAUDE.md`): your personal preferences that apply across every project.
- **Project** (`./CLAUDE.md` at repo root): shared, committed team memory for that codebase.
- **Local / nested**: a `CLAUDE.md` in a subdirectory is pulled in when you work in that part of the tree.

---

## How the files combine

- All applicable layers are loaded together; nothing fully "overrides" by replacing - they accumulate as context.
- More specific files (project, then subdirectory) sit closer to the work and naturally take precedence in practice.
- Use **user** memory for habits ("always explain before large edits"), **project** memory for team facts.
- `CLAUDE.local.md` was the old way to keep personal/project notes out of git; the recommended path now is the user-level file plus `.gitignore`.
- Keep the project file lean - anything machine-specific or secret-adjacent belongs in user or untracked files.

---

## Imports and keeping it maintainable

- A CLAUDE.md can pull in other files with `@path/to/file.md`, so you can split memory into focused pieces.
- Good for large repos: a root file that imports per-area docs instead of one giant file.
- Run `/init` in a new project to have Claude scan the codebase and draft a starter CLAUDE.md.
- Use `/memory` to open and edit the active memory files directly.
- Review it periodically - stale instructions actively mislead the model.

```markdown
See @docs/architecture.md and @docs/testing.md for details.
```

---

## What Plan Mode is

- A mode where Claude investigates and proposes an approach but is blocked from editing files or running mutating commands.
- Intended for read-only exploration first: read code, search, reason - then commit to a plan before any change lands.
- In this mode, Claude can still suggest tool calls, but mutating calls do not execute until you approve leaving plan mode.
- Toggle it during a session by cycling permission modes (Shift+Tab); you can also start a session in plan mode.
- It's one of several permission modes, alongside normal (prompt-on-action), accept-edits, and bypass-permissions.
- Reduces the risk of Claude charging ahead and editing the wrong thing before you've agreed on direction.

---

## The Plan Mode workflow

- Claude reads and analyzes the relevant code without modifying anything.
- It presents a concrete plan: what it will change, where, and in what order.
- You review and approve, reject, or ask for revisions - execution only begins after approval.
- On approval, Claude typically exits plan mode and switches to making the edits.
- Best for ambiguous or high-blast-radius tasks (refactors, migrations, anything touching many files).

---

## Where it fits with permissions

- Permission modes govern how much Claude can do without asking; plan mode is the most restrictive useful one.
- `accept-edits` auto-approves file edits for fast iteration on trusted work.
- `bypass-permissions` skips prompts entirely - only for sandboxed/throwaway contexts you trust.
- Fine-grained `allow`/`deny`/`ask` rules in `settings.json` complement modes for specific tools and commands.

```json
{
  "permissions": {
    "allow": ["Bash(git diff:*)", "Bash(pnpm test:*)"],
    "deny": ["Bash(rm -rf:*)", "Read(./.env)"]
  },
  "defaultMode": "plan"
}
```

---

## Key takeaways

- CLAUDE.md is persistent, committed project memory - put commands, conventions, architecture, and gotchas there, kept short.
- Memory layers (enterprise → user → project → subdirectory) merge, with more specific files effectively winning.
- Use `/init` to bootstrap, `/memory` to edit, `@imports` to keep it modular, and `#` to capture notes mid-session.
- Plan Mode keeps Claude read-only so it proposes a plan you approve before any edit happens.
- It's one point on the permission-mode spectrum (plan → normal → accept-edits → bypass), backed by allow/deny rules in settings.json.
