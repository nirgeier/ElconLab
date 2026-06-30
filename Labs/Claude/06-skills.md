# 06 · Skills

> Skills are model-invoked capabilities packaged as folders that Claude Code reads and runs on its own when a task matches, without you typing a command.

---

## What a Skill is

- A reusable capability packaged as a folder containing a `SKILL.md` file plus any supporting assets (scripts, templates, reference docs).
- The `SKILL.md` holds YAML frontmatter (`name`, `description`) and a Markdown body with instructions Claude follows when the skill activates.
- Skills extend what Claude can do for a specialized, repeatable workflow - e.g. filling a PDF form, applying a house style, scaffolding a component.
- They are "progressive disclosure": only the name and description load up front; the full body and assets are read only when the skill is actually used.

---

## Anatomy of a SKILL.md

- The frontmatter `description` is the most important field - it is the only text Claude sees when deciding whether to invoke the skill.
- The body can reference bundled files by relative path; Claude reads them as needed instead of loading everything at once.

```markdown
---
name: pdf-form-filler
description: Fill and flatten PDF forms from a JSON
  data file. Use when the user asks to populate a PDF
  form or generate a filled PDF.
---

# PDF Form Filler

1. Read the field map in `reference/fields.md`.
2. Run `scripts/fill.py <template.pdf> <data.json>`.
3. Return the path to the output PDF.
```

---

## Skills metadata reference (all SKILL.md options)

For `SKILL.md` frontmatter, there are only two supported metadata fields.
This is the complete and exhaustive list:

| Field         | Required | Type   | What it does                                              | Example value |
| ------------- | -------- | ------ | --------------------------------------------------------- | ------------- |
| `name`        | Yes      | string | Unique skill identifier shown to Claude at startup        | `release-notes` |
| `description` | Yes      | string | Trigger text Claude uses to decide whether to load skill  | `Generate release notes from merged PRs. Use when the user asks for a changelog.` |

Notes:

- Keep `name` short, lowercase, and stable (for example, `pdf-form-filler`).
- Write `description` with a clear trigger phrase: "Use when the user asks to...".
- Fields like `model`, `tools`, `allow`, `ask`, and `deny` are **not** SKILL.md metadata keys.

Quick copy/paste example:

```yaml
---
name: release-notes
description: Generate release notes from merged PRs. Use when the user asks for changelog generation.
---
```

---

## Exhaustive metadata matrix (skill vs agent vs settings)

The table below answers "where does each field go?" for all commonly used fields.

| Field         | Valid in `SKILL.md` | Valid in agent frontmatter | Valid in `.claude/settings.json` | Example | Notes |
| ------------- | ------------------- | -------------------------- | --------------------------------- | ------- | ----- |
| `name`        | Yes                 | Yes                        | No                                | `test-runner` | Skill/agent identifier |
| `description` | Yes                 | Yes                        | No                                | `Run tests and summarize failures.` | Trigger text / role description |
| `model`       | No                  | Yes                        | Optional (global model setting)   | `sonnet` | Use on agents when you want a specific model |
| `tools`       | No                  | Yes                        | No                                | `Bash, Read, Grep` | Agent tool scope |
| `allow`       | No                  | No                         | Yes (`permissions.allow`)         | `"Bash(npm test:*)"` | Tool/command allowlist |
| `ask`         | No                  | No                         | Yes (`permissions.ask`)           | `"Bash(git push:*)"` | Prompt-before-run rules |
| `deny`        | No                  | No                         | Yes (`permissions.deny`)          | `"Read(./.env)"` | Hard block rules |

If your goal is a skill file, use only `name` and `description` in frontmatter.

---

## Complete SKILL.md metadata examples

### Minimal valid skill

```markdown
---
name: release-notes
description: Generate release notes from merged PRs. Use when the user asks for changelog or release summary generation.
---

# Release Notes

1. Find the last tag.
2. Collect merged PRs since that tag.
3. Group output by feature, fix, docs.
```

### Strong trigger wording example

```markdown
---
name: sql-review
description: Review SQL migrations for safety and rollback readiness. Use when the user asks to review migration scripts, schema changes, or production DB updates.
---

# SQL Migration Review

1. Check for destructive operations.
2. Check rollback path.
3. Provide risk levels and mitigation.
```

---

## Where model, tools, and allow rules actually belong

Many teams mix these concepts. Use this quick map:

| You want to configure...           | Put it in...                              |
| ---------------------------------- | ------------------------------------------ |
| Skill trigger and behavior         | `SKILL.md` (`name`, `description`, body)   |
| Agent role, model, tool set        | `.claude/agents/<agent>.md` frontmatter    |
| Tool permission policies (`allow`) | `.claude/settings.json` permissions block  |

### Agent metadata example (`name`, `description`, `model`, `tools`)

```markdown
---
name: test-runner
description: Run tests and summarize only failures. Use after code changes.
model: sonnet
tools: Bash, Read, Grep
---
You execute the project's tests and report failures with likely root cause.
```

### Permission rules example (`allow`, `ask`, `deny`)

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Bash(npm test:*)",
      "Bash(git diff:*)"
    ],
    "ask": [
      "Bash(git push:*)"
    ],
    "deny": [
      "Read(./.env)",
      "Bash(rm -rf:*)"
    ]
  }
}
```

### Skills + agents + permissions together (practical layout)

```text
.claude/
  skills/
    release-notes/SKILL.md
  agents/
    test-runner.md
  settings.json
```

---

## How Claude decides to use one

- Skills are **model-invoked**: Claude chooses to trigger one based on the conversation, not because you explicitly called it.
- At startup, Claude is given each skill's `name` and `description` as lightweight metadata.
- When your request semantically matches a description, Claude opens that `SKILL.md` and follows its instructions.
- A precise, trigger-oriented description ("Use when the user asks to…") makes activation reliable; a vague one means the skill may never fire.
- Multiple skills can be relevant; Claude picks based on the best match and may chain its steps with normal tool use.

---

## Where Skills live

- **Personal skills**: `~/.claude/skills/<skill-name>/SKILL.md` - available across all your projects.
- **Project skills**: `.claude/skills/<skill-name>/SKILL.md` - committed to the repo and shared with the team.
- **Plugin skills**: bundled inside an installed plugin and namespaced as `plugin-name:skill-name`.
- Each skill is its own subfolder; the folder name typically matches the skill `name`.
- Assets sit alongside `SKILL.md` in that folder and are referenced by relative path.

---

## Skills vs slash commands

- **Slash commands** are *user-invoked*: you type `/name` to run a prompt template on demand.
- **Skills** are *model-invoked*: Claude decides to use them when the task fits, with no typing required.
- A slash command is essentially a single Markdown prompt file; a skill is a folder that can carry scripts, data, and multiple reference files.
- Use a slash command for an action you want to trigger deliberately; use a skill for a capability Claude should reach for automatically.
- They are complementary - a slash command can be a deliberate entry point while skills handle background know-how.

---

## Skills vs other extension points

- **CLAUDE.md** is always-on project context and conventions; a skill loads only when relevant, keeping the base context lean.
- **MCP servers** add external *tools and data sources* over a protocol; skills add *instructions and workflows* using the tools Claude already has.
- **Subagents** are separate context windows for delegated work; a skill is guidance executed within the current agent (though a skill can drive multi-step tool use).
- **Hooks** are deterministic shell commands the harness runs on events; skills are model-driven and only fire when Claude judges them relevant.

---

## Authoring good Skills

- Write the `description` for the decision moment: state what the skill does and the situations that should trigger it.
- Keep the `SKILL.md` body focused; push long details into separate reference files the body links to, preserving progressive disclosure.
- Bundle executable helpers (Python/shell scripts) for deterministic steps instead of asking Claude to redo them by hand each time.
- Test by describing a matching task in plain language and confirming Claude reaches for the skill on its own.
- Commit project skills to version control so the whole team gets the same behavior.

---

## Distribution via plugins

- Skills can ship inside **plugins**, installed from a marketplace, so capabilities are shareable beyond a single repo.
- Plugin skills appear namespaced (`plugin:skill`) to avoid collisions with personal or project skills.
- A single plugin commonly bundles related skills, slash commands, hooks, and MCP servers together.
- This makes skills a portable unit of expertise you can publish, version, and reuse across teams.

---

## Key takeaways

- A skill is a folder (`SKILL.md` + assets) that packages a reusable, specialized workflow.
- Skills are model-invoked - Claude triggers them automatically - while slash commands are user-invoked by typing `/name`.
- Only `name` and `description` load up front; the body and files load on demand (progressive disclosure), so a sharp description is critical.
- They live in `~/.claude/skills/` (personal), `.claude/skills/` (project), or inside plugins (namespaced).
- Skills complement CLAUDE.md, MCP, subagents, and hooks rather than replacing them: they add on-demand instructions and assets.
