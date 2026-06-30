# 15 · Agent SDK

> The Claude Agent SDK lets you run Claude Code's agent loop as a library inside your own programs, so you can build custom agents with the same tools, sessions, and permission controls that power the CLI.

---

## What the Agent SDK is

- The same harness that powers the Claude Code CLI, exposed as a programmable library instead of a terminal app.
- Originally shipped as the "Claude Code SDK," later renamed the **Claude Agent SDK** to reflect that it builds general agents, not just coding tools.
- Available for **TypeScript/JavaScript** (`@anthropic-ai/claude-agent-sdk`) and **Python** (`claude-agent-sdk`).
- Gives you the full agent loop: model calls, tool execution, context management, and permission gating - all handled for you.
- Use it when you want Claude Code behavior embedded in an app, service, or batch job rather than driven interactively.

---

## The agent loop as a library

- The core idea: you send a prompt, and the SDK runs the **loop** - Claude decides on actions, calls tools, reads results, and repeats until the task is done.
- You don't hand-write the orchestration; the SDK manages the turn-by-turn cycle of thinking, tool use, and responding.
- Results stream back as a sequence of **messages** (assistant text, tool calls, tool results, final result) you can consume as they arrive.
- The loop includes automatic **context compaction** so long-running tasks don't blow the context window.
- This is the same loop the CLI uses, so behavior is consistent between interactive sessions and programmatic ones.

---

## Calling the SDK (TypeScript)

- The primary entry point is `query()`, which takes a prompt plus an `options` object and returns an async iterator of messages.

```ts
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const msg of query({
  prompt: "Find and fix the failing test in this repo",
  options: {
    permissionMode: "acceptEdits",
    allowedTools: ["Read", "Edit", "Bash"],
    cwd: "/path/to/project",
  },
})) {
  if (msg.type === "result") console.log(msg.result);
}
```

- `permissionMode`, `allowedTools`, `cwd`, `systemPrompt`, and `model` are common options.
- Authentication comes from `ANTHROPIC_API_KEY` (or a configured Bedrock/Vertex provider).

---

## Calling the SDK (Python)

- Python offers a one-shot `query()` async generator and a stateful `ClaudeSDKClient` for multi-turn conversations.

```python
import anyio
from claude_agent_sdk import query, ClaudeAgentOptions

async def main():
    async for msg in query(
        prompt="Summarize the README in this folder",
        options=ClaudeAgentOptions(
            allowed_tools=["Read", "Glob"],
            permission_mode="default",
        ),
    ):
        print(msg)

anyio.run(main)
```

- Use `ClaudeSDKClient` when you need to keep a session open and send follow-up turns interactively.

---

## Tools available to your agent

- Built-in Claude Code tools are available: `Read`, `Write`, `Edit`, `Bash`, `Glob`, `Grep`, `WebFetch`, `WebSearch`, `TodoWrite`, and the `Task` subagent tool.
- Control exposure with `allowedTools` / `disallowedTools` so an agent only gets the capabilities it needs.
- Add your own tools in two ways: connect **MCP servers**, or define **in-process custom tools** (e.g. `createSdkMcpServer` + `tool()` in TS) that run inside your application.
- In-process tools are great for app-specific actions (query your DB, call your internal API) without spawning a separate process.
- Tool results feed back into the loop automatically; you generally don't manually wire results into the next prompt.

---

## Sessions and conversation state

- A **session** is one continuous conversation with its accumulated context, history, and working directory.
- The TS `query()` returns a session you can resume; Python's `ClaudeSDKClient` keeps the session alive for back-and-forth turns.
- Sessions can be **resumed** by ID so an agent can pick up where it left off across separate runs.
- Long sessions are kept manageable through automatic compaction of older context.
- Each session has its own permission state and working directory, so concurrent agents stay isolated.

---

## Permissions and safety controls

- The same **permission modes** as the CLI apply: `default` (ask), `acceptEdits` (auto-approve file edits), `plan` (read-only planning, no mutations), and `bypassPermissions` (skip prompts - use with care).
- Fine-grained control comes from `allowedTools` / `disallowedTools` and a programmatic `canUseTool` callback that approves or denies each tool call.
- The `canUseTool` hook lets you implement custom policy - log requests, prompt a human, or block dangerous commands.
- **Hooks** (PreToolUse, PostToolUse, etc.) can run your code at lifecycle points to validate, modify, or veto actions.
- Because the SDK can act autonomously, lock down permissions deliberately - `bypassPermissions` removes the safety net.

---

## Reusing Claude Code configuration

- The SDK can load familiar Claude Code config: **CLAUDE.md** memory files, **settings.json**, **subagents**, **skills**, and **MCP servers**.
- A `CLAUDE.md` in the working directory supplies project context, just like in the CLI.

```md
# Project: billing-service
- Run tests with `pytest -q`
- Never edit files under `migrations/` directly
- Prefer async functions for new I/O code
```

- You can also set the `systemPrompt` option directly, or extend the default Claude Code system prompt rather than replacing it.
- **Subagents** let the main agent delegate scoped work via the `Task` tool, keeping the primary context clean.
- **Skills** and **plugins** can extend the agent with reusable instructions and bundled tooling.

---

## Where the SDK fits

- Good fits: CI bots that fix or review code, batch refactors across many repos, automated triage, custom internal "agent" products, and chat backends.
- It abstracts away prompt construction, tool wiring, retries, and context management so you focus on the task and policy.
- Streaming output makes it suitable for live UIs that show the agent's progress turn by turn.
- For headless/non-interactive runs, choose a permission mode that needs no human prompts (and accept the added risk).
- It's the supported path for embedding Claude Code capabilities - more robust than scripting the CLI binary directly.

---

## Demo A - minimal TypeScript SDK runner

```ts
import { query } from "@anthropic-ai/claude-agent-sdk";

async function main() {
  for await (const msg of query({
    prompt: "List the top 3 architectural risks in this repo with file paths.",
    options: {
      cwd: process.cwd(),
      permissionMode: "default",
      allowedTools: ["Read", "Glob", "Grep"]
    }
  })) {
    if (msg.type === "result") console.log(msg.result);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

Run:

```bash
npm install @anthropic-ai/claude-agent-sdk
ANTHROPIC_API_KEY=your_key_here node demo.js
```

---

## Demo B - Python SDK with safer tool scope

```python
import anyio
from claude_agent_sdk import query, ClaudeAgentOptions

async def main():
    async for msg in query(
        prompt="Summarize all TODO comments and group by folder.",
        options=ClaudeAgentOptions(
            permission_mode="default",
            allowed_tools=["Read", "Glob", "Grep"],
        ),
    ):
        if getattr(msg, "type", None) == "result":
            print(msg.result)

anyio.run(main)
```

Run:

```bash
pip install claude-agent-sdk anyio
ANTHROPIC_API_KEY=your_key_here python demo.py
```

---

## Demo C - SDK delegation with Task tool

When you want multi-agent fan-out from SDK, include `Task`:

```ts
allowedTools: ["Read", "Glob", "Grep", "Task"]
```

Prompt example:

```text
Delegate to subagents for auth, billing, and integrations folders.
Return a merged list of reliability risks with exact file paths.
```

---

## Key takeaways

- The Agent SDK is Claude Code's agent loop packaged as a TypeScript and Python library - same tools, sessions, and permissions, programmatically.
- `query()` runs the loop and streams messages; `ClaudeSDKClient` (Python) keeps multi-turn sessions alive and resumable.
- You extend agents with MCP servers and in-process custom tools, and constrain them with `allowedTools`, permission modes, `canUseTool`, and hooks.
- It reuses CLAUDE.md, settings.json, subagents, and skills, so config carries over from the CLI.
- Set permissions deliberately for autonomous runs - convenience modes like `bypassPermissions` trade safety for fewer prompts.
