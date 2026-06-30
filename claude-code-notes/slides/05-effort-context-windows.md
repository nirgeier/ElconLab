# 05 · Effort & Context Windows

> How Claude Code spends two scarce budgets - the context window (what the model can "see") and thinking effort (how hard it reasons) - and how to manage both for speed, depth, and cost.

---

## Slide: What the context window is

- The context window is the total token budget for a single conversation: everything the model can read at once.
- It holds the system prompt, your CLAUDE.md, tool definitions, your messages, and every tool result (file reads, command output, search hits).
- It is finite and shared - every token spent on one thing is unavailable for another.
- When it fills up, older turns must be summarized or dropped; nothing is "remembered" beyond what currently fits.
- Standard Claude Code sessions run on a large window (around 200K tokens for most models); a 1M-token option exists for select models.

---

## Slide: What actually consumes context

- File reads - the biggest variable cost. Reading a 3,000-line file costs far more than reading the 40 lines you needed.
- Tool output - `npm test`, `git log`, build logs, and large command dumps land verbatim in context.
- MCP servers - each connected server injects its tool schemas (and sometimes resources) at startup, before you do anything.
- CLAUDE.md files - loaded automatically from project, parent, and `~/.claude/`; useful, but always-on overhead.
- The running conversation itself - past tool calls and results accumulate turn after turn.

---

## Slide: Keeping the window lean

- Prefer targeted reads: use `offset`/`limit` or search (Grep/Glob) instead of dumping whole files.
- Disable MCP servers you are not using - their schemas cost tokens whether or not you call them.
- Keep CLAUDE.md tight; it is paid on every single turn, so favor pointers over pasted documentation.
- Use subagents for exploratory or noisy work: a subagent burns its own context and returns only a summary to the main thread.
- Check usage with `/context` to see what is occupying the window before it becomes a problem.

---

## Slide: Compaction and summarization

- When the window approaches its limit, Claude Code compacts: it summarizes earlier conversation into a condensed form and continues.
- Auto-compaction triggers near capacity; you can also run `/compact` manually at a clean stopping point.
- Compaction is lossy - fine details, exact file contents, and earlier reasoning can be lost or blurred.
- Best practice: compact deliberately between tasks rather than mid-task, so the summary captures stable conclusions.
- `/clear` is the harder reset - it wipes the conversation entirely; use it when starting unrelated work.

---

## Slide: Subagents as a context strategy

- A subagent runs in its own separate context window and reports back a short result.
- This keeps large, throwaway output (searching a big repo, reading many files) out of your main conversation.
- The main thread pays only for the subagent's final summary, not for everything it read along the way.
- Trade-off: subagents cannot see your live conversation, so give them a complete, self-contained task.
- Ideal for parallel investigation, codebase exploration, and any step that generates a lot of noise.

---

## Slide: The 1M context option

- Some models offer a 1M-token (1 million) context window - roughly five times the standard size.
- It lets you hold very large codebases, long transcripts, or many files in view at once without compacting.
- It is a separate capability tied to specific model variants (often surfaced with a `[1m]` marker on the model id).
- Larger context typically costs more per token and can be slower; do not reach for it by default.
- Use it when the task genuinely requires breadth - wide refactors, cross-file analysis - not as a substitute for disciplined reads.

---

## Slide: Effort and thinking budget

- Separate from context: "effort" (thinking budget) controls how much internal reasoning the model does before answering.
- More thinking improves multi-step reasoning, planning, and tricky debugging - at the cost of latency and tokens.
- In Claude Code, extended thinking is invoked with prompts like "think", "think hard", or "ultrathink" to escalate depth.
- Higher effort consumes context too - reasoning tokens occupy the same window as everything else.
- Match effort to the task: quick edits and lookups need little; architecture decisions and subtle bugs reward more.

---

## Slide: Speed vs depth trade-off

- Low effort = fast, cheap, good for mechanical or well-specified changes.
- High effort = slower, pricier, but stronger on ambiguity, planning, and correctness-critical work.
- Plan mode pairs well with higher effort: think first, get a plan, then execute without burning depth on simple steps.
- Over-thinking simple tasks wastes time and tokens; under-thinking hard ones produces confident wrong answers.
- Tune dynamically - escalate when stuck, dial back once the path is clear.

---

## Slide: Practical configuration

- A focused CLAUDE.md keeps per-turn overhead low while steering behavior:

```markdown
# Project: payments-api
- Run tests with `pnpm test`, not npm.
- Source lives in `src/`; never edit generated files in `dist/`.
- Prefer reading specific files over `cat`-ing whole directories.
```

- Permission rules in settings.json reduce noisy approval round-trips that clutter a session:

```json
{
  "permissions": {
    "allow": ["Bash(pnpm test:*)", "Read(src/**)"],
    "deny": ["Read(.env)"]
  }
}
```

- A hook can auto-trim noisy output before it ever reaches context:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{ "type": "command", "command": "tail -n 100" }]
      }
    ]
  }
}
```

---

## Slide: Key takeaways

- Context and effort are two distinct budgets - manage both, not just one.
- Most context waste is avoidable: targeted reads, trimmed output, fewer idle MCP servers, lean CLAUDE.md.
- Compact between tasks and use subagents to keep heavy work out of the main thread.
- Reach for 1M context and high effort intentionally, when breadth or depth truly demands it.
- Right-size effort to the task: fast for the simple, deep for the hard.
