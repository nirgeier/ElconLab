# 06 · Skills

> Skills are model-invoked capabilities packaged as folders that Claude Code reads and runs on its own when a task matches, without you typing a command.

---

## Slide: What a Skill is

- A reusable capability packaged as a folder containing a `SKILL.md` file plus any supporting assets (scripts, templates, reference docs).
- The `SKILL.md` holds YAML frontmatter (`name`, `description`) and a Markdown body with instructions Claude follows when the skill activates.
- Skills extend what Claude can do for a specialized, repeatable workflow - e.g. filling a PDF form, applying a house style, scaffolding a component.
- They are "progressive disclosure": only the name and description load up front; the full body and assets are read only when the skill is actually used.

---

## Slide: Anatomy of a SKILL.md

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

## Slide: How Claude decides to use one

- Skills are **model-invoked**: Claude chooses to trigger one based on the conversation, not because you explicitly called it.
- At startup, Claude is given each skill's `name` and `description` as lightweight metadata.
- When your request semantically matches a description, Claude opens that `SKILL.md` and follows its instructions.
- A precise, trigger-oriented description ("Use when the user asks to…") makes activation reliable; a vague one means the skill may never fire.
- Multiple skills can be relevant; Claude picks based on the best match and may chain its steps with normal tool use.

---

## Slide: Where Skills live

- **Personal skills**: `~/.claude/skills/<skill-name>/SKILL.md` - available across all your projects.
- **Project skills**: `.claude/skills/<skill-name>/SKILL.md` - committed to the repo and shared with the team.
- **Plugin skills**: bundled inside an installed plugin and namespaced as `plugin-name:skill-name`.
- Each skill is its own subfolder; the folder name typically matches the skill `name`.
- Assets sit alongside `SKILL.md` in that folder and are referenced by relative path.

---

## Slide: Skills vs slash commands

- **Slash commands** are *user-invoked*: you type `/name` to run a prompt template on demand.
- **Skills** are *model-invoked*: Claude decides to use them when the task fits, with no typing required.
- A slash command is essentially a single Markdown prompt file; a skill is a folder that can carry scripts, data, and multiple reference files.
- Use a slash command for an action you want to trigger deliberately; use a skill for a capability Claude should reach for automatically.
- They are complementary - a slash command can be a deliberate entry point while skills handle background know-how.

---

## Slide: Skills vs other extension points

- **CLAUDE.md** is always-on project context and conventions; a skill loads only when relevant, keeping the base context lean.
- **MCP servers** add external *tools and data sources* over a protocol; skills add *instructions and workflows* using the tools Claude already has.
- **Subagents** are separate context windows for delegated work; a skill is guidance executed within the current agent (though a skill can drive multi-step tool use).
- **Hooks** are deterministic shell commands the harness runs on events; skills are model-driven and only fire when Claude judges them relevant.

---

## Slide: Authoring good Skills

- Write the `description` for the decision moment: state what the skill does and the situations that should trigger it.
- Keep the `SKILL.md` body focused; push long details into separate reference files the body links to, preserving progressive disclosure.
- Bundle executable helpers (Python/shell scripts) for deterministic steps instead of asking Claude to redo them by hand each time.
- Test by describing a matching task in plain language and confirming Claude reaches for the skill on its own.
- Commit project skills to version control so the whole team gets the same behavior.

---

## Slide: Distribution via plugins

- Skills can ship inside **plugins**, installed from a marketplace, so capabilities are shareable beyond a single repo.
- Plugin skills appear namespaced (`plugin:skill`) to avoid collisions with personal or project skills.
- A single plugin commonly bundles related skills, slash commands, hooks, and MCP servers together.
- This makes skills a portable unit of expertise you can publish, version, and reuse across teams.

---

## Slide: Key takeaways

- A skill is a folder (`SKILL.md` + assets) that packages a reusable, specialized workflow.
- Skills are model-invoked - Claude triggers them automatically - while slash commands are user-invoked by typing `/name`.
- Only `name` and `description` load up front; the body and files load on demand (progressive disclosure), so a sharp description is critical.
- They live in `~/.claude/skills/` (personal), `.claude/skills/` (project), or inside plugins (namespaced).
- Skills complement CLAUDE.md, MCP, subagents, and hooks rather than replacing them: they add on-demand instructions and assets.
