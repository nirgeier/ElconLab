# 02 · Claude Code Under the Hood

> How Anthropic's Claude Code CLI turns a chat model into an autonomous coding agent: the agent loop, its tools, how it reads your repo, the harness around the model, and the model itself.

---

## Slide: What Claude Code Actually Is

- A terminal-based coding agent: you type a request, it edits files, runs commands, and reports back.
- It is a *harness* (the CLI program) wrapped around a *model* (a Claude model) plus a *tool set* the model can call.
- The model does not touch your machine directly - every action goes through tools the harness exposes and gates.
- It is agentic: given one prompt it can take many steps on its own until the task is done.
- Also available as the **Agent SDK** (TypeScript/Python) so you can embed the same loop in your own programs.

---

## Slide: The Agent Loop

- The core cycle is: read context → plan → call a tool → observe the result → iterate.
- Each turn, the model sees the conversation so far plus tool outputs, then decides the next single action.
- It keeps looping - edit, run tests, read the error, fix, re-run - until it judges the task complete or needs you.
- "Observe" matters: tool results (file contents, command stdout/exit codes) feed back into the next decision.
- The loop ends when the model produces a final text answer with no further tool calls, or hits a permission/stop boundary.

---

## Slide: The Tool Set

- **Read** - read a file (or image/PDF/notebook) by absolute path, with line numbers.
- **Edit / Write** - exact string replacement in a file, or create/overwrite a whole file.
- **Bash** - run shell commands; the working directory persists, shell env does not.
- **Grep** - fast content search (ripgrep-backed) by regex across the repo.
- **Glob** - find files by path pattern (e.g. `**/*.ts`).
- **Task / subagents** - spin off a focused sub-agent for a scoped chunk of work.
- Plus web search/fetch, TodoWrite for task tracking, and any tools added via MCP.

---

## Slide: How It Reads the Repo

- It does not pre-ingest the whole codebase; it explores on demand using Grep, Glob, and Read.
- This keeps the context window focused - it pulls in only the files relevant to the current task.
- At startup it loads `CLAUDE.md` files (project root, parent dirs, and `~/.claude/`) as persistent project memory.
- `CLAUDE.md` is where you record conventions, commands, and gotchas so you don't repeat them every session.

```markdown
# CLAUDE.md
## Commands
- Build: `npm run build`
- Test a single file: `npm test -- path/to/file.test.ts`
## Conventions
- Use absolute imports from `@/`
- Never edit files under `generated/`
```

---

## Slide: The System Prompt & Harness

- A built-in system prompt tells the model it is Claude Code, how to use tools, and the house style (concise, minimal, no needless preamble).
- The harness injects environment context: working directory, OS, git status, and your `CLAUDE.md` memory.
- It also manages the context window - summarizing/compacting older turns when the conversation grows long.
- **Hooks** let you run your own shell commands at lifecycle points (e.g. before a tool runs, after the model stops).

```json
// .claude/settings.json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{ "type": "command", "command": "npm run lint --silent" }]
    }]
  }
}
```

---

## Slide: Permissions & Plan Mode

- Every potentially-destructive action (writes, arbitrary Bash) is gated by a permission check before it runs.
- **Permission modes**: default (prompt as needed), accept-edits, plan (read-only - investigate and propose, no changes), and bypass (skip prompts - use with care).
- You pre-approve or deny patterns in `settings.json` so common safe commands stop prompting.
- **Plan mode** is ideal for "look before you leap": the agent researches and writes a plan, then waits for your go-ahead.

```json
// .claude/settings.json
{
  "permissions": {
    "allow": ["Bash(npm run test:*)", "Read(./src/**)"],
    "deny": ["Bash(rm -rf:*)", "Read(./.env)"]
  }
}
```

---

## Slide: Extending Claude Code

- **MCP (Model Context Protocol)** - connect external servers (databases, APIs, browsers) that expose extra tools and resources.
- **Skills** - packaged instructions/scripts the agent loads on demand when a task matches their trigger.
- **Subagents** - named, scoped agents with their own prompt and tool subset, dispatched for sub-tasks to keep the main context clean.
- **Plugins** - bundles that ship slash commands, skills, hooks, and MCP servers together for easy install/sharing.
- **Slash commands** - reusable prompt templates (built-in like `/init`, `/review`, or your own project commands).

---

## Slide: The Model Behind It

- Claude Code runs on a Claude model (the Opus / Sonnet / Haiku family), chosen for strong tool-use and long-context reasoning.
- The model decides *what* to do; the harness decides *whether it's allowed* and actually executes it.
- Large context windows let it hold many files, tool outputs, and your `CLAUDE.md` at once.
- You can switch models (e.g. a heavier model for hard reasoning, a lighter one for speed/cost) and the harness stays the same.
- The same model+loop pattern powers the Agent SDK, so behavior is consistent between the CLI and embedded use.

---

## Slide: Key Takeaways

- Claude Code = harness + model + gated tools running an iterative read→plan→act→observe loop.
- It reads your repo *lazily* (Grep/Glob/Read) and remembers context via `CLAUDE.md`.
- Safety comes from permissions and plan mode - the model proposes, the harness gates, you stay in control.
- Extend it with MCP, skills, subagents, hooks, and plugins instead of changing the core.
- The model reasons and chooses actions; the harness enforces rules and runs them - keep that separation in mind.
