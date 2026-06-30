# 09 · Subagents

> How Claude Code delegates work to fresh, isolated agent instances so the main conversation stays focused and parallelizable.

---

## Slide: What a subagent is

- A separate Claude instance spawned by the main agent to handle a scoped task
- Runs with its own context window - it does not see your full conversation history, only the prompt it is handed
- Reports back a single result; intermediate steps stay out of the main thread
- Launched via the Task tool; you can also define reusable named agent types
- Think of it as "fork a worker, get an answer, discard the scratch work"

---

## Slide: Why delegate - isolated context

- Each subagent gets a clean context window, so noisy exploration doesn't bloat the main conversation
- The main agent only receives the distilled result, keeping its own context lean and on-task
- Useful for searches that read many files: the subagent burns tokens reading, you get the summary
- Reduces the chance the main thread drifts or loses the original goal under a pile of tool output
- Failures or dead ends are contained - they don't pollute the primary conversation

---

## Slide: Why delegate - parallelism

- Multiple subagents can run concurrently when their tasks are independent
- Good for fan-out work: search three areas of a codebase at once, then merge findings
- Launch them in a single batch so they execute in parallel rather than one after another
- Wall-clock time drops because reads/searches happen simultaneously
- Only parallelize truly independent work - shared edits must be sequenced to avoid conflicts

---

## Slide: Custom agent types

- Define reusable agents as Markdown files in `.claude/agents/` (project) or `~/.claude/agents/` (user)
- Each file has YAML frontmatter plus a system prompt describing the agent's role
- You can restrict an agent's tools and give it a clear "when to use me" description
- The main agent can then invoke that named type instead of writing an ad-hoc prompt each time
- Plugins can also ship agent definitions for the whole team

```markdown
---
name: test-runner
description: Runs the test suite and summarizes only failures. Use after code changes.
tools: Bash, Read, Grep
---
You run the project's tests, then report failing tests with the
minimal context needed to fix them. Do not attempt fixes yourself.
```

---

## Slide: How invocation works

- The main agent calls the Task tool with a subagent type and a self-contained prompt
- The prompt must include everything the worker needs - it has no access to prior turns
- The subagent's final text response is the only thing returned to the caller
- Subagents cannot spawn deeper subagents in a chain; keep delegation one level
- Be explicit about the expected output shape (e.g. "return absolute file paths and line numbers")

---

## Slide: When to delegate

- Open-ended search or research across many files where you only need the conclusion
- Independent subtasks that can run in parallel to save time
- Heavy, token-expensive exploration you want to keep out of the main context
- Repeatable specialized jobs (review, test, lint triage) backed by a custom agent type
- Verification passes you want done with a fresh, unbiased context

---

## Slide: When to do it inline

- Quick, single-file edits or a couple of obvious commands - delegation overhead isn't worth it
- Work that depends tightly on the current conversation's nuance and state
- Tasks needing back-and-forth with you; subagents run autonomously to completion
- Sequential edits to shared files, where parallel workers would collide
- When you need to see and steer each step rather than receive only a final summary

---

## Slide: Subagents vs. related features

- Skills: packaged instructions/scripts loaded on demand; a subagent can use skills, but they aren't the same thing
- MCP: external tool/data servers; subagents may have MCP tools available within their tool set
- Hooks: shell commands the harness fires on events (e.g. `SubagentStop`) - automation around agents, not agents themselves
- Plan mode: a read-only planning state of one agent; distinct from spawning workers
- Agent SDK: the programmatic way to build your own agents/subagent orchestration outside the CLI

---

## Slide: Practical tips

- Write the delegation prompt as a standalone brief, including success criteria and output format
- Scope tools tightly in custom agents - fewer tools means safer, more focused behavior
- Ask for absolute paths and concrete references so results are actionable
- Don't over-delegate trivial work; the round-trip costs latency and tokens
- Use `SubagentStop` hooks if you want automatic checks after a worker finishes

```json
{
  "hooks": {
    "SubagentStop": [
      { "hooks": [{ "type": "command", "command": "npm run lint --silent" }] }
    ]
  }
}
```

---

## Slide: Key takeaways

- Subagents = isolated, disposable workers that return a result and keep the main context clean
- Delegate for broad search, parallel fan-out, and repeatable specialized jobs
- Define custom agent types in `.claude/agents/` with frontmatter, a focused prompt, and limited tools
- Always hand a subagent a self-contained brief - it cannot see your conversation
- Do trivial, stateful, or interactive work inline; delegation shines on independent, token-heavy tasks
