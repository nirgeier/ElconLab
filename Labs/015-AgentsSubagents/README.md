# Lab 015 - Building Agents and Subagents (Hands-On)

!!! hint "Overview"

    - In this lab, you will create custom Claude agents and subagents.
    - You will run two demos: Claude Code subagents and a simple Agent SDK orchestrator.
    - All required code is included in this lab.

## Prerequisites

- Completed Lab 003 and Claude section 09 (Subagents)
- Node.js 20+
- Claude Code CLI installed (`claude`)
- Anthropic API key for SDK demo (`ANTHROPIC_API_KEY`)

## What You Will Learn

- How to define reusable custom agents in `.claude/agents/`
- How to run a simple agent-team flow with subagents
- How to run a minimal TypeScript Agent SDK orchestrator

---

## Background

Single-agent workflows are great for simple tasks. For larger tasks, splitting the work into focused subagents improves clarity and can reduce context noise.

In this lab you will build:

1. A `researcher` subagent (read/search only)
2. An `implementer` subagent (edits and tests)
3. A `reviewer` subagent (quality checks)
4. A simple orchestrator script that asks Claude to use those roles

---

## Lab Steps

## Step 1 - Create Subagent Definitions

Create these files in your project root under `.claude/agents/`.

### File: `.claude/agents/researcher.md`

```markdown
---
name: researcher
description: Explore a codebase and summarize findings with exact file paths. Use for discovery and analysis.
tools: Read, Glob, Grep
model: sonnet
---
You are a codebase researcher.

Rules:
1. Do not edit files.
2. Find relevant files quickly.
3. Return concise findings with exact file paths and reasons.
4. If uncertain, state assumptions.
```

### File: `.claude/agents/implementer.md`

```markdown
---
name: implementer
description: Implement requested changes in a focused scope and run lightweight validation.
tools: Read, Glob, Grep, Edit, Write, Bash
model: sonnet
---
You are an implementation agent.

Rules:
1. Make the smallest safe change.
2. Preserve style of existing files.
3. Run minimal validation commands if available.
4. Return: changed files, what changed, and validation results.
```

### File: `.claude/agents/reviewer.md`

```markdown
---
name: reviewer
description: Review changes for correctness, regressions, and missing tests.
tools: Read, Glob, Grep, Bash
model: sonnet
---
You are a code reviewer.

Rules:
1. Prioritize bugs and regressions.
2. Report findings ordered by severity.
3. Include exact file paths.
4. If no issues, state residual risks.
```

---

## Step 2 - Add a Reusable Team Command

Create `.claude/commands/run-agent-team.md`.

### File: `.claude/commands/run-agent-team.md`

```markdown
Run an agent team in this order:

1. Use the `researcher` subagent to identify where to implement the request.
2. Use the `implementer` subagent to perform the change.
3. Use the `reviewer` subagent to review the resulting diff.
4. Return a final summary with:
   - Files changed
   - Risks found
   - Suggested next step

Task to execute:
$ARGUMENTS
```

Use it from Claude Code:

```bash
claude
/run-agent-team Add a health-check endpoint to the demo API
```

---

## Step 3 - Run Demo A (Claude Code Subagents)

Inside a test project, run a simple request:

```text
Use researcher to find where configuration is loaded,
then use implementer to add a default timeout value,
then use reviewer to check for regressions.
```

Expected outcome:

- `researcher` returns candidate files
- `implementer` applies one focused edit
- `reviewer` reports issues or confirms low risk

---

## Step 4 - Run Demo B (Agent SDK, full runnable code)

Use the complete demo files below.

### File: `agent-sdk-demo/package.json`

```json
{
  "name": "agent-sdk-demo",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "tsc -p .",
    "demo": "node dist/run-agent-team.js"
  },
  "dependencies": {
    "@anthropic-ai/claude-agent-sdk": "^0.1.0"
  },
  "devDependencies": {
    "typescript": "^5.9.0"
  }
}
```

### File: `agent-sdk-demo/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "outDir": "dist",
    "rootDir": "src",
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts"]
}
```

### File: `agent-sdk-demo/src/run-agent-team.ts`

```ts
import { query } from "@anthropic-ai/claude-agent-sdk";

async function main() {
  const prompt = [
    "You are an orchestrator.",
    "Use subagents researcher, implementer, reviewer in sequence.",
    "Task: In this demo folder, create TODO.md with three bullet points for an internal CRM rollout plan.",
    "Then ask reviewer to verify clarity and risks.",
    "Return a final summary with changed files and risks."
  ].join(" ");

  for await (const msg of query({
    prompt,
    options: {
      cwd: process.cwd(),
      permissionMode: "default",
      allowedTools: ["Read", "Write", "Edit", "Glob", "Grep", "Bash", "Task"]
    }
  })) {
    if (msg.type === "result") {
      console.log("\n=== FINAL RESULT ===\n");
      console.log(msg.result);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

### Run the SDK demo

```bash
cd agent-sdk-demo
npm install
npm run build
ANTHROPIC_API_KEY=your_key_here npm run demo
```

---

## Hands-On Workshop

1. Create one additional subagent called `test-runner`.
2. Restrict it to `Bash, Read, Grep` only.
3. Extend `run-agent-team` to call `test-runner` after `implementer`.
4. Run the flow on a small bug fix in your own repo.

---

## Summary

In this lab you:

- [x] Created custom subagents
- [x] Added a reusable team command
- [x] Ran a simple Claude Code multi-agent demo
- [x] Ran a complete Agent SDK demo with full code
