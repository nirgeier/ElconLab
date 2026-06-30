# 01 · Introduction to Claude Code

> Claude Code is Anthropic's terminal-first agentic coding tool that turns Claude into a hands-on collaborator inside your real codebase.

---

## Slide: What Claude Code is

- A command-line tool (`claude`) that runs an agentic coding loop in your terminal, operating directly on your project files
- Reads, writes, and edits files, runs shell commands, and uses git - taking real actions rather than just suggesting text
- Powered by Claude models (Opus, Sonnet, Haiku families), it plans multi-step work and iterates until a task is done
- Meets you where you already work: the terminal, your existing repo, your existing toolchain
- Also embeddable in IDEs (VS Code, JetBrains) and scriptable via the Agent SDK, but the CLI is the core experience

---

## Slide: Who it is for

- Developers who live in the terminal and want an agent that can act, not just chat
- Engineers handling real tasks: feature work, refactors, bug fixes, test writing, codebase exploration
- Teams that want shared, version-controlled project conventions and reproducible agent behavior
- Anyone automating coding workflows in CI or scripts via the headless / SDK modes
- Comfortable with code review: you stay the reviewer and approver of what the agent does

---

## Slide: The terminal-first agentic model

- "Agentic" means Claude decides which tools to call (read, edit, bash, search) and chains them toward a goal
- It explores the codebase on demand instead of needing you to paste files into a chat window
- Each meaningful action (editing files, running commands) is gated by a permission prompt unless pre-approved
- The loop is observable: you see the plan, the tool calls, and the results as they happen
- You can interrupt, redirect, or correct course at any point with Esc and follow-up messages

---

## Slide: Install and first run

- Requires Node.js; install the CLI globally, then launch it from inside a project directory:

```bash
npm install -g @anthropic-ai/claude-code
cd my-project
claude
```

- On first run you authenticate (Claude subscription or an Anthropic API key)
- It works best when run at the root of a git repository so it can see structure and use version control
- Run `/init` once to have Claude generate a starter `CLAUDE.md` describing your project
- Use `/help` to list commands and `claude -p "..."` for one-shot headless prompts

---

## Slide: CLAUDE.md - project memory

- A markdown file Claude auto-loads as context: conventions, commands, architecture notes, and do/don'ts
- Lives in the repo root (shared, committed) and can be nested in subdirectories for scoped guidance
- A user-level `~/.claude/CLAUDE.md` applies your personal preferences across all projects
- Keep it concise and high-signal - it is prepended to context, so bloat costs tokens

```markdown
# Project: payments-api

## Commands
- Test: `npm test`
- Lint: `npm run lint` (run before committing)

## Conventions
- TypeScript strict mode; no `any`
- Prefer small, pure functions; colocate tests as `*.test.ts`
```

---

## Slide: settings.json and permissions

- `settings.json` configures behavior: permission rules, environment variables, hooks, model, and more
- Scopes: user (`~/.claude/settings.json`), project (`.claude/settings.json`, committed), and local (`.claude/settings.local.json`, gitignored)
- Permission rules allow or deny specific tools and commands so routine actions skip the prompt

```json
{
  "permissions": {
    "allow": ["Bash(npm test:*)", "Read", "Edit"],
    "deny": ["Bash(rm -rf:*)", "Read(./.env)"]
  }
}
```

- Permission modes shape the session: default (prompt), `acceptEdits`, `plan` (read-only planning), and a full-auto bypass mode for sandboxes

---

## Slide: Extending Claude Code

- MCP (Model Context Protocol): connect external servers (databases, issue trackers, browsers, internal APIs) as tools and data sources
- Subagents: specialized agent configs with their own prompt and tool scope, used to delegate focused subtasks
- Skills: packaged instructions and assets Claude loads on demand when a task matches their description
- Hooks: shell commands the harness runs automatically on events (e.g., format code after every edit)
- Plugins bundle skills, subagents, hooks, MCP servers, and slash commands for one-step sharing

```json
{
  "hooks": {
    "PostToolUse": [
      { "matcher": "Edit", "hooks": [
        { "type": "command", "command": "prettier --write \"$CLAUDE_FILE_PATHS\"" }
      ] }
    ]
  }
}
```

---

## Slide: Plan mode and staying in control

- Plan mode lets Claude investigate and draft a step-by-step approach without touching files
- You review and approve the plan before any edits run - good for large or risky changes
- Combine with git: Claude can stage, diff, and commit, and you review changes like any teammate's PR
- Context is managed with `/clear` to reset and `/compact` to summarize long sessions

---

## Slide: How it differs from chat assistants and IDE autocomplete

- vs chat assistants (web/app): Claude Code acts on real files and runs commands instead of returning text you copy-paste
- vs IDE autocomplete (e.g., Copilot-style): autocomplete predicts the next lines as you type; Claude Code owns whole multi-file, multi-step tasks
- It has agency over tools and the filesystem, with permissions and git as the safety and review layer
- It carries durable project context via CLAUDE.md and config rather than starting cold each time
- It is scriptable and composable - usable in pipelines and other programs through the Agent SDK

---

## Slide: Key takeaways

- Claude Code is an agentic, terminal-first coding tool that takes real actions in your repo, gated by permissions
- CLAUDE.md plus `settings.json` give Claude durable project context and controlled, reproducible behavior
- MCP, skills, subagents, hooks, and plugins extend it; plan mode keeps you in control of big changes
- It differs from chat (it acts, not just suggests) and from autocomplete (whole tasks, not next-line predictions)
- Install with npm, run `claude` in a git repo, `/init` your CLAUDE.md, and review its work like a teammate's
