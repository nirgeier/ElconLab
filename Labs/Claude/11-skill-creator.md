# 11 · Skill Creator

> How to author your own Claude Code Skills - folder layout, an effective SKILL.md, bundled scripts, testing, and the conventions that make a Skill discoverable and reliable.

---

## What a Skill is

- A Skill is a reusable, model-invoked capability packaged as a folder containing a `SKILL.md` file plus optional supporting files.
- Claude Code reads each Skill's name and description at startup, then decides on its own when a Skill is relevant to the current task and loads its full instructions on demand.
- This is progressive disclosure: only the lightweight metadata sits in context until a Skill is actually triggered, keeping the context window lean.
- Skills differ from CLAUDE.md (always-on project memory) and from slash commands (explicit user invocation) - Skills are pulled in by the model when they match.
- They can be personal (`~/.claude/skills/`), project-scoped (`.claude/skills/`), or shipped inside a plugin.

---

## Skill folder structure

- Each Skill lives in its own directory; the directory name is the Skill's identifier (use lowercase-with-hyphens).
- The only required file is `SKILL.md` at the folder root.
- Supporting files sit alongside it - reference docs, scripts, templates, and example data.
- A common convention is a `references/` subfolder for extra markdown and a `scripts/` subfolder for executables.

```
.claude/skills/
└── pdf-extractor/
    ├── SKILL.md          # required: metadata + instructions
    ├── references/
    │   └── advanced.md   # loaded only when needed
    ├── scripts/
    │   └── extract.py
    └── templates/
        └── report.md
```

---

## Anatomy of SKILL.md

- A SKILL.md has two parts: YAML frontmatter at the top and Markdown instructions in the body.
- Frontmatter requires `name` and `description`; the body holds the actual guidance Claude follows once the Skill loads.
- `name` should match the folder and be short and descriptive; `description` is the single most important field for discovery.
- The body can be as long as needed - but offload deep detail to `references/` files the body points to, so it loads only when required.

```markdown
---
name: pdf-extractor
description: Extract text and tables from PDF files. Use when the
  user needs to read, parse, or pull data out of a PDF document.
---

# PDF Extractor

## Instructions
1. Run `scripts/extract.py <path>` to get raw text.
2. For tables, see `references/advanced.md`.
3. Return results as clean Markdown.
```

---

## Writing an effective description

- The description is what Claude matches against the task - write it to answer "what does this do AND when should it be used."
- Lead with the capability, then add explicit trigger phrases ("Use when…") that mirror how a user would actually phrase the request.
- Be specific: vague descriptions like "helps with files" rarely fire; concrete nouns and verbs win.
- Mention key terms a user might say (formats, tools, domains) so the match is robust to phrasing.
- Keep it to a couple of sentences - it lives in context for every session, so it must earn its space.

---

## Writing the instruction body

- Write for Claude as the reader: imperative steps, clear ordering, and unambiguous decision points.
- Prefer numbered procedures and short sections over long prose; call out edge cases explicitly.
- Point to bundled scripts and reference files by relative path rather than inlining everything.
- State the expected output format so results are consistent across runs.
- Avoid duplicating what the model already knows well - focus on the project- or domain-specific knowledge it lacks.

---

## Bundling scripts and resources

- Scripts let a Skill do deterministic work (parsing, API calls, transforms) instead of relying on the model to improvise.
- Reference them by relative path from the Skill folder; make executables runnable and document how to call them in the body.
- Keep heavy reference material in separate files and link to them - the model reads them only when the step requires it.
- Declare any runtime prerequisites (Python version, packages, CLI tools) in the instructions so the model can check or install them.
- Remember the model still needs permission to run commands - script execution goes through normal Claude Code permission prompts and allowlists.

---

## Testing your Skill

- Restart or reload Claude Code so it picks up the new Skill folder, then confirm it appears in the available-skills list.
- Test discovery: phrase a request the way a real user would and verify the Skill actually fires without you naming it.
- Test execution: walk through the full procedure, checking that scripts run and reference files load as intended.
- Iterate on the `description` first when a Skill fails to trigger - that is the most common cause of a Skill being ignored.
- Try negative cases too: make sure the Skill does NOT fire on unrelated requests.

---

## Best practices

- One Skill, one job - narrow, focused Skills are easier to match and maintain than sprawling ones.
- Make the description trigger-rich and the body lean; push detail into `references/` to protect context.
- Use scripts for anything that must be exact or repeatable; let the model handle judgment.
- Version and review Skills like code; project Skills in `.claude/skills/` can be committed so the whole team shares them.
- Package related Skills into a plugin when you want to distribute them across repos or teammates.
- Keep names, folders, and the `name` field consistent to avoid confusion.

---

## Key takeaways

- A Skill is a folder with a required `SKILL.md` (YAML `name` + `description`, then Markdown instructions) that Claude loads on demand.
- The `description` drives discovery - make it specific and include "use when" trigger phrases.
- Keep the body lean and offload depth to `references/` and `scripts/` so context stays small.
- Bundle scripts for deterministic work; they still run under normal permission controls.
- Test both that the Skill fires when it should and stays quiet when it shouldn't, tuning the description first.
