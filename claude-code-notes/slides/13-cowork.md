# 13 · Cowork

> How to treat Claude Code as a collaborator you work alongside - pairing in real time, handing off async work, and keeping a human in the loop at the right checkpoints.

---

## Slide: What "Cowork" means here

- Cowork is a working style, not a single button: you and the agent share the same repo, terminal, and task context.
- Claude Code runs as an interactive loop - you steer, it acts, you review, you steer again.
- The unit of collaboration is the session: a conversation plus the file edits, commands, and tool calls it produces.
- Good cowork is about controlling *when* the agent acts autonomously versus *when* it pauses for you.

---

## Slide: Plan mode - agree before acting

- Plan mode lets Claude research and propose an approach without editing files or running mutating commands.
- Enter it with Shift+Tab (cycling permission modes) or start a session in plan mode.
- The agent reads code, asks questions, and presents a plan; you approve, edit, or reject before any change lands.
- Ideal first step for cowork: you and the agent align on intent, then switch to an execution mode.
- Reduces wasted work - no large diffs appear until you've signed off on the direction.

---

## Slide: Permission modes - the autonomy dial

- Default mode: Claude asks before each consequential action (writes, shell commands, network).
- `acceptEdits`: file edits apply automatically, but commands still prompt - useful for fast iteration on code.
- `plan`: read-only research and proposal, no changes.
- "Bypass permissions" / YOLO-style mode runs without prompts - only for trusted, sandboxed work.
- Cowork is mostly about picking the right point on this dial for the task and your trust level.

---

## Slide: Persisting shared context with CLAUDE.md

- `CLAUDE.md` is project memory loaded into every session - your shared rulebook with the agent.
- Put conventions, commands, and gotchas there so each session starts aligned instead of re-learning.
- Scopes stack: enterprise, user (`~/.claude/CLAUDE.md`), and project files combine.

```markdown
# CLAUDE.md
## Workflow
- Run `npm test` before proposing a commit.
- Never push to `main`; open a PR instead.
- Ask before editing files under `infra/`.

## Conventions
- TypeScript, 2-space indent, no default exports.
```

- Treat it like onboarding docs for a teammate who forgets between sessions.

---

## Slide: Human-in-the-loop checkpoints

- You stay in control by reviewing diffs and approving commands as they're proposed.
- Press Esc to interrupt mid-action and redirect; the agent stops and waits for new instructions.
- Permission prompts are natural checkpoints - read them rather than reflexively approving.
- Use plan mode for risky changes so the human reviews the strategy, not just the diff.
- The agent surfaces its reasoning and tool calls so you can audit what it did and why.

---

## Slide: Hooks - automated guardrails in the loop

- Hooks run your shell commands at lifecycle events (e.g. `PreToolUse`, `PostToolUse`, `Stop`), independent of the model.
- Use them to enforce policy that shouldn't depend on the agent remembering - formatting, linting, blocking edits.
- A `PreToolUse` hook can deny an action by returning a non-zero exit, keeping a human-defined rule in the loop.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{ "type": "command", "command": "npx prettier --write \"$CLAUDE_FILE_PATHS\"" }]
      }
    ]
  }
}
```

- Hooks make cowork repeatable: the same checks fire no matter who is driving.

---

## Slide: Delegating to subagents

- Subagents are separate Claude instances with their own context window, prompt, and tool permissions.
- The main session can hand a scoped task (e.g. "review this diff", "explore the auth module") to a subagent.
- Each subagent reports back a summary, keeping the main conversation focused and uncluttered.
- Define custom subagents (in `.claude/agents/`) with tailored instructions and restricted tools.
- Useful for parallel cowork: research, review, and implementation can run as distinct roles.

---

## Slide: Sharing setup across a team

- Project-scoped `.claude/settings.json`, skills, hooks, and subagents can be committed to the repo.
- Plugins bundle skills, slash commands, agents, hooks, and MCP servers for one-step team distribution.
- MCP servers connect the agent to shared tools and data (issue trackers, databases, internal APIs).
- Committing this config means every teammate's sessions behave consistently - shared cowork conventions, not personal ones.
- `settings.local.json` stays per-user and out of version control for personal overrides.

---

## Slide: Async collaboration and handoffs

- Long or background work can run detached and report back when it finishes, so you don't babysit it.
- Scheduled/triggered runs let the agent pick up recurring tasks and resume a session later.
- Write durable context (plans, decisions, TODOs) into files so a future session - or a teammate - can continue the work.
- A session is a handoff artifact: someone else can read the transcript and diffs to understand what happened.
- For programmatic cowork, the Agent SDK embeds the same agent loop into your own apps and pipelines.

---

## Slide: Key takeaways

- Cowork is about tuning autonomy: plan mode and permission modes decide when the agent acts versus asks.
- Keep humans in the loop at meaningful checkpoints - review diffs, approve commands, interrupt with Esc.
- Encode shared context and guardrails in `CLAUDE.md`, `settings.json`, and hooks so collaboration is consistent and repeatable.
- Delegate scoped work to subagents and connect shared tools via MCP and plugins.
- Files and sessions are your handoff medium for async work and teammate collaboration.
