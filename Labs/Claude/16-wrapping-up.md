# 16 · Wrapping Up

> How Claude Code's building blocks - CLAUDE.md, permissions, skills, hooks, MCP, subagents, and plugins - fit together into one customizable agent, plus a workflow to use them well.

---

## The big picture

- Claude Code is an agentic CLI: a model that reads, edits, and runs code in your terminal using tools.
- Everything else is configuration that shapes *what context it has*, *what it's allowed to do*, and *how it behaves*.
- Three broad layers: **context** (CLAUDE.md, MCP), **control** (permissions, hooks), and **capability** (skills, subagents, plugins).
- Almost all of it lives in plain files (`CLAUDE.md`, `.claude/settings.json`, `.claude/...`) that you can commit and share.
- Start minimal; add pieces only when a real friction point shows up.

---

## CLAUDE.md - persistent context

- Auto-loaded memory file that gives Claude project conventions, commands, and gotchas every session.
- Lives at several levels: project root `CLAUDE.md` (shared), `CLAUDE.local.md` or `.claude/` for personal notes, and `~/.claude/CLAUDE.md` for global preferences.
- Keep it short and high-signal - it's spent on every turn, so bloat costs context.
- Use `@path/to/file.md` imports to pull in modular docs instead of one giant file.

```md
# Project: payments-api
- Run tests: `pnpm test`
- Never edit files in `generated/` - they're built from protobufs.
- Use the `Result<T>` type for fallible functions, not exceptions.
```

---

## Permissions - what Claude may do

- Tool calls are gated by allow / ask / deny rules in `settings.json`; sensitive actions prompt unless pre-approved.
- Rules are specific, e.g. `Bash(npm run test:*)` or `Read(./src/**)`, and resolve deny > ask > allow.
- Permission modes change the default posture: `default`, `acceptEdits`, `plan` (read-only investigation), and `bypassPermissions` (no prompts - use with care).
- Settings cascade: enterprise > project (`.claude/settings.json`) > user (`~/.claude/settings.json`), with `.local.json` for uncommitted overrides.

```json
{
  "permissions": {
    "allow": ["Bash(git status)", "Read(./**)"],
    "ask": ["Bash(git push:*)"],
    "deny": ["Read(./.env)", "Bash(rm -rf:*)"]
  }
}
```

---

## Skills - packaged know-how

- A skill is a folder with a `SKILL.md` describing a repeatable procedure, plus optional scripts and reference files.
- Claude reads the name/description up front and loads the full body only when the task matches - progressive disclosure keeps context lean.
- Great for codifying workflows your team repeats: releasing, writing a certain kind of test, generating a report.
- Invoked automatically when relevant, or explicitly as a slash command; they can ship inside plugins.

```md
---
name: release-notes
description: Generate release notes from merged PRs since the last tag.
---
1. Find the last git tag.
2. List merged PRs since then via `gh pr list`.
3. Group by label and write CHANGELOG entries.
```

---

## Hooks - deterministic automation

- Shell commands the harness (not the model) runs on lifecycle events: `PreToolUse`, `PostToolUse`, `UserPromptSubmit`, `Stop`, `SessionStart`, and more.
- Use them for guarantees the model shouldn't be trusted to remember - auto-formatting after edits, blocking writes to protected paths, logging.
- A `PreToolUse` hook can return a non-zero/deny decision to **block** an action before it happens.
- Configured in `settings.json`; they fire every time, which is exactly why they're reliable.

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{ "type": "command", "command": "prettier --write \"$CLAUDE_FILE_PATHS\"" }]
    }]
  }
}
```

---

## MCP - external tools and data

- Model Context Protocol connects Claude to outside systems: databases, issue trackers, browsers, internal APIs.
- MCP servers expose **tools** (actions) and **resources** (readable context) over a standard interface, so any compliant server just works.
- Add servers per-project or globally; their tools appear with an `mcp__<server>__<tool>` naming pattern and obey the same permission rules.
- This is how Claude Code reaches beyond your filesystem and shell without baking integrations into the core tool.

---

## Subagents - delegated context

- Subagents are separate Claude instances Claude can spawn for a focused task, each with its own context window.
- Keeps the main thread clean: a subagent can read 50 files or run a noisy search and return just the answer.
- Configurable with their own system prompt, tool allowlist, and model - define reusable ones in `.claude/agents/`.
- Good for parallelizable or exploratory work (codebase search, multi-file review); they can't see each other, so give each a self-contained brief.

---

## Plugins - bundling and sharing

- A plugin packages skills, slash commands, hooks, subagents, and MCP server configs into one installable unit.
- Distributed via marketplaces (git repos with a manifest), so a team can install a shared toolkit with one command.
- This is the unit of *distribution* - it ties together the other primitives so onboarding a repo means installing one thing.
- Use it to standardize how your whole team works with Claude Code instead of everyone hand-configuring.

---

## How the pieces fit together

- **CLAUDE.md** tells Claude about your project; **MCP** gives it access to systems beyond the repo.
- **Permissions** and **hooks** form the guardrails - one decides what's allowed, the other enforces guarantees deterministically.
- **Skills** and **subagents** extend capability - reusable procedures and isolated worker contexts.
- **Plugins** bundle all of the above so it's shareable and consistent across a team.
- The model is constant; these layers turn a generic agent into one that fits *your* codebase.

---

## Recommended workflow

- **Explore → Plan → Implement → Verify**: understand first, agree on an approach, then change code, then check it.
- Use **plan mode** for anything non-trivial so Claude investigates read-only before touching files.
- Keep changes reviewable: small commits, run tests/linters (ideally enforced via a hook), read the diff yourself.
- Manage context: start fresh sessions for new tasks, use `/clear`, and push heavy investigation into subagents.
- Capture recurring fixes and conventions back into CLAUDE.md and skills so the setup compounds over time.

---

## Where to go next

- Read the official docs at `docs.claude.com` (Claude Code section) for the authoritative, up-to-date reference.
- Use `/help` in-session and `claude --help` for current commands and flags.
- For programmatic / headless use, explore the **Agent SDK**, which exposes the same agent loop for building your own tools and automations.
- Browse community plugins and marketplaces, but vet hooks and MCP servers before trusting them - they run with your permissions.

---

## Key takeaways

- Claude Code = one model plus configurable layers for context, control, and capability - almost all just files you commit.
- Permissions and hooks keep the agent safe and predictable; CLAUDE.md and MCP keep it well-informed.
- Skills, subagents, and plugins let you scale and share customizations across tasks and teammates.
- A disciplined explore-plan-implement-verify loop beats one-shot prompting on real work.
- Start small, add a piece only to solve a real pain point, and feed lessons back into your config.
