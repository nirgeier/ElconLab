# Claude Code - Study Notes

Slide-style study notes covering 16 Claude Code topics, organized one deck per topic
in [`slides/`](./slides/). Each file is plain markdown with slides separated by `---`,
so it renders well in any markdown viewer or slide tool (Marp, reveal-md, etc.).

> **Note on sourcing:** These are **original notes** written from my own knowledge of
> Claude Code - they are *not* transcripts or copies of any paid course. The topic list
> mirrors the structure of Anthropic's Claude Code course on master.dev, but all wording,
> examples, and explanations here are independent.

## Decks

| # | Topic | Slides |
|---|-------|:-----:|
| 01 | [Introduction to Claude Code](./slides/01-introduction.md) | 10 |
| 02 | [Claude Code Under the Hood](./slides/02-claude-code-under-the-hood.md) | 9 |
| 03 | [CLAUDE.md & Plan Mode](./slides/03-claude-md-plan-mode.md) | 9 |
| 04 | [Permissions](./slides/04-permissions.md) | 10 |
| 05 | [Effort & Context Windows](./slides/05-effort-context-windows.md) | 10 |
| 06 | [Skills](./slides/06-skills.md) | 9 |
| 07 | [Hooks](./slides/07-hooks.md) | 10 |
| 08 | [MCP Overview](./slides/08-mcp-overview.md) | 10 |
| 09 | [Subagents](./slides/09-subagents.md) | 10 |
| 10 | [Agent Teams](./slides/10-agent-teams.md) | 10 |
| 11 | [Skill Creator](./slides/11-skill-creator.md) | 9 |
| 12 | [Plugins Overview](./slides/12-plugins-overview.md) | 9 |
| 13 | [Cowork](./slides/13-cowork.md) | 10 |
| 14 | [Claude Code Desktop & GitHub Workflow](./slides/14-claude-code-desktop-github-workflow.md) | 9 |
| 15 | [Agent SDK](./slides/15-agent-sdk.md) | 10 |
| 16 | [Wrapping Up](./slides/16-wrapping-up.md) | 12 |

**Total: 16 decks · 156 slides**

## Format

Each deck follows this shape:

```markdown
# NN · Topic Title

> One-sentence summary.

---

## Slide: <concept>

- bullet
- bullet

---

## Slide: Key takeaways

- ...
```

## Building the deck

Edit the notes in `slides/`, then run one command to regenerate every format:

```bash
./build.sh              # pdf + editable pptx + html
./build.sh pdf          # only specific format(s)
./build.sh pdf html
./build.sh pptx-image   # Marp image-based PPTX (pixel-perfect, NOT editable)
```

`build.sh` merges `slides/NN-*.md` into `combined.md` (dark theme + auto-split of
long slides) and exports the chosen formats.

| Output | What |
|--------|------|
| `claude-code-deck.pdf`  | Present full-screen anywhere |
| `claude-code-deck.pptx` | **Editable** PowerPoint (real text boxes + slide masters) |
| `claude-code-deck.html` | Self-contained HTML, arrow-key navigation |

## Updating the look (PowerPoint slide masters)

The editable PPTX is built with **three slide masters**, so you can restyle the whole
deck in one place instead of touching individual slides:

| Master   | Applies to |
|----------|------------|
| `TITLE`   | the opening slide |
| `SECTION` | the divider before each of the 16 topics |
| `CONTENT` | every body slide (background, header rule, footer, page number) |

Two ways to change the UI:

1. **In PowerPoint** - open **View → Slide Master**, edit the `TITLE` / `SECTION` /
   `CONTENT` layouts (background, fonts, footer, colors). Changes apply to all slides
   of that type. *(Re-running `./build.sh pptx` regenerates the file and overwrites
   manual master edits - make lasting changes in step 2.)*
2. **In code (persists across rebuilds)** - edit `build-pptx.mjs`:
   - the `C` color object (theme palette) and `FONT` / `MONO` near the top
   - the `defineSlideMaster({...})` blocks for `TITLE`, `SECTION`, `CONTENT`
   then run `./build.sh pptx`.

The PDF/HTML theme lives separately in the front-matter at the top of `build-combined.mjs`.

## Marp tips

- Live preview while editing: `npx @marp-team/marp-cli combined.md --preview --watch`
- In-editor: install the **Marp for VS Code** extension and open `combined.md`.
- Individual decks render standalone too: `npx @marp-team/marp-cli slides/06-skills.md --pdf`
