# 10 · Agent Teams

> How to coordinate multiple Claude Code agents - subagents and orchestrators - so that work gets split up, run in parallel, and verified instead of being done by one agent in a single context.

---

## Slide: What is an agent team?

- An "agent team" is several Claude instances working toward one goal, rather than a single long-running session.
- The core building block is the **subagent**: a separate agent the main session spawns via the Task tool to handle a focused piece of work.
- Each subagent runs in its **own context window** and returns only a final text summary to the caller - its intermediate tokens never pollute the parent's context.
- The main session acts as the **orchestrator**: it plans the work, dispatches subagents, and stitches their results together.
- Teams help with context budget (offload big reads), focus (one job per agent), and parallelism (many agents at once).

---

## Slide: Defining reusable subagents

- Custom subagents live as markdown files in `.claude/agents/` (project) or `~/.claude/agents/` (user), with YAML frontmatter.
- The `description` field tells the orchestrator *when* to delegate to that agent; a strong description drives automatic routing.
- You can scope each subagent's tools and give it its own system prompt, so a reviewer agent can be read-only while a builder can edit.

```markdown
---
name: test-runner
description: Runs the test suite and reports failures. Use after code changes.
tools: Bash, Read, Grep
model: sonnet
---
You run the project's tests, then summarize only the failing
cases and the likely cause. Do not attempt fixes.
```

- Subagents can also ship inside **plugins**, so a whole team travels with one install.

---

## Slide: Orchestration pattern - Fan-out

- **Fan-out** means the orchestrator splits a task into independent chunks and dispatches one subagent per chunk.
- Best when subtasks don't depend on each other: "audit each of these 5 modules," "summarize each log file."
- Launch them in parallel by issuing multiple Task calls **in a single turn** - they then run concurrently.
- Each agent returns a compact result; the orchestrator merges them into one answer.
- Keep each subagent's brief self-contained, since they can't see each other's work.

```text
            ┌─ subagent: audit auth/
orchestrator┼─ subagent: audit api/
            └─ subagent: audit db/   →  merge findings
```

---

## Slide: Orchestration pattern - Pipeline

- A **pipeline** chains agents so each one's output feeds the next stage.
- Useful when steps are dependent: research → plan → implement → test.
- The orchestrator runs these **sequentially**, passing forward only the distilled result it needs, not raw context.
- This keeps each stage's context clean and lets you swap a specialized agent into any stage.
- Trade-off: no parallelism, so reserve it for genuinely ordered work.

---

## Slide: Orchestration pattern - Verify

- The **verify** pattern pairs a "doer" with a separate "checker" agent.
- A second agent with fresh context reviews the first one's output - catching errors the author is blind to.
- Common pairs: implement + code-review, write + fact-check, fix + run-tests.
- Give the verifier read-only tools so it can inspect but not silently "fix" and mask problems.
- The `/security-review` and `/review` slash commands are built-in examples of verifier-style agents.

---

## Slide: Running work in parallel

- Parallelism comes from issuing several Task calls in one assistant turn; the orchestrator waits for all to finish.
- Good parallel candidates: independent file reads, multi-target searches, fan-out audits, generating alternatives.
- Watch for **write conflicts** - parallel agents editing the same files collide; keep parallel work read-only or partition the files.
- For heavier isolation, run separate Claude Code sessions in **git worktrees**, each on its own branch.
- Parallelism trades token/cost for wall-clock speed, so use it where the subtasks are truly independent.

---

## Slide: Combining subagents into a workflow

- Real workflows mix the patterns: fan-out to gather, pipeline to process, verify to gate the result.
- Encode a repeatable workflow as a **slash command** (`.claude/commands/`) that lays out the steps and which agents to call.
- **Hooks** can automate hand-offs - e.g. a `SubagentStop` or `PostToolUse` hook that kicks off the next step.

```json
{
  "hooks": {
    "Stop": [
      { "matcher": "", "hooks": [
        { "type": "command", "command": "npm test" }
      ]}
    ]
  }
}
```

- Use **plan mode** first to design the whole team and approve it before any agent starts editing.
- Permission rules in `settings.json` set the guardrails the whole team inherits.

---

## Slide: Orchestration with the Agent SDK

- For programmatic teams, the **Claude Agent SDK** (TypeScript/Python) lets you build orchestrators in code instead of the CLI.
- You can define subagents, tools, and permission policy, then drive multi-agent loops from a script or service.
- This is the path for CI jobs, batch processing, or wiring a fan-out/verify pattern into an automated pipeline.
- The SDK shares the same primitives as the CLI - system prompts, tools, MCP servers, permission modes - so designs transfer over.
- Use it when you need the team to run unattended; use the CLI when a human stays in the loop.

---

## Slide: Practical guidance

- Prefer one clear job per subagent; vague briefs produce vague results since the agent can't ask the parent for clarification mid-run.
- Pass down only what the agent needs, and expect back only a tight summary - that is the whole point of separate contexts.
- Subagents cannot spawn their own subagents, so keep orchestration at the top level.
- More agents means more tokens and cost; reach for a team when context, focus, or parallelism actually pays off - not by default.
- Name and store agents/commands in the repo so the team is version-controlled and shared.

---

## Slide: Key takeaways

- A team = an orchestrator plus focused subagents, each in its own clean context returning only a summary.
- Three core patterns: **fan-out** (parallel independent work), **pipeline** (ordered stages), **verify** (separate checker).
- Get parallelism by launching multiple Task calls in one turn; isolate heavy parallel edits with git worktrees.
- Combine patterns into repeatable workflows using slash commands, hooks, plan mode, and `settings.json` guardrails.
- Use the Agent SDK for unattended/programmatic teams; spend extra agents only when they clearly earn their cost.
