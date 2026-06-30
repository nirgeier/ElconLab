# 04 · Permissions

> How Claude Code decides which tool actions run automatically, which need your approval, and which are blocked outright.

---

## Why permissions exist

- Claude Code can read files, edit code, run shell commands, and call MCP tools - all of which can have real consequences.
- The permission system is the guardrail: it gates *actions* (tool calls), not Claude's reasoning or text.
- Goal is to keep risky operations (deleting files, pushing code, running arbitrary commands) under human control by default.
- Read-only and clearly-safe actions can be pre-approved so you are not interrupted constantly.
- The model proposes a tool call; the permission layer decides allow / ask / deny before it ever executes.

---

## The three rule behaviors

- Every permission rule maps a tool action to one of three behaviors: **allow**, **ask**, or **deny**.
- **allow** - the action runs automatically with no prompt.
- **ask** - Claude pauses and requests your confirmation before running (the interactive default for most state-changing actions).
- **deny** - the action is blocked entirely and cannot be run, even if you would have approved it.
- Precedence: **deny wins over ask, and ask wins over allow** - the most restrictive matching rule applies.
- Deny rules are the right tool for hard guardrails (e.g. never read secrets, never run a destructive command).

---

## Permission modes

- A **mode** sets the overall posture for a session, layered on top of your individual rules.
- **default** - normal behavior: safe actions may be allowed, state-changing actions prompt with "ask".
- **acceptEdits** - auto-accepts file edits (Edit/Write) so you are not prompted per change; other actions still follow their rules.
- **plan** - read-only research mode: Claude can explore and propose a plan but cannot edit files or run side-effecting commands.
- **bypassPermissions** - skips all permission checks and runs everything without prompting; powerful and dangerous, use only in trusted/sandboxed contexts.
- Switch modes interactively (Shift+Tab cycles through them) or set a starting mode via config.

---

## Plan mode in practice

- Plan mode lets Claude read the codebase, search, and analyze without making changes.
- Useful when you want a strategy or review first, then approve execution as a separate step.
- Claude presents a proposed plan and waits; you accept it to move into an editing-capable mode.
- Nothing is written and no side-effecting shell commands run while you are in plan mode.
- Great default for unfamiliar codebases or high-stakes changes where you want to look before you leap.

---

## Where rules live - settings.json

- Permissions are configured in `settings.json` files, merged from several layers.
- Typical layers: enterprise-managed policy, user-level (`~/.claude/settings.json`), project (`.claude/settings.json`), and local project overrides (`.claude/settings.local.json`).
- `settings.local.json` is meant for personal, machine-specific rules and is usually git-ignored; project `settings.json` is shared with the team.
- More specific / more restrictive layers and rules take precedence; enterprise policy can enforce rules users cannot override.
- The `permissions` block holds `allow`, `ask`, and `deny` arrays plus related options.

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Bash(npm run test:*)",
      "Bash(git status)"
    ],
    "ask": [
      "Bash(git push:*)"
    ],
    "deny": [
      "Read(./.env)",
      "Bash(rm -rf:*)"
    ]
  }
}
```

---

## Tool-scoped rules and matchers

- A rule names a tool, optionally with a parameter pattern in parentheses: `Tool(specifier)`.
- `Bash(npm run test:*)` matches `npm run test` commands; the `:*` is a prefix wildcard for arguments.
- File tools can scope by path: `Edit(src/**)` or `Read(./secrets/**)` to allow or deny based on location.
- A bare tool name like `Read` or `WebFetch` matches all uses of that tool.
- MCP tools follow the `mcp__<server>__<tool>` naming, so you can allow or deny specific MCP servers/tools.
- Match carefully: overly broad allow rules (e.g. allowing all of `Bash`) defeat the purpose of the guardrails.

---

## Allowlists and reducing prompts

- An allowlist is just your `allow` array - actions you have decided are safe to run unattended.
- Approving an action interactively can offer to remember it, which appends a rule to your settings.
- Good allowlist candidates: read-only inspection (`git status`, `git diff`, `ls`), running tests, type-checks, linters.
- Keep destructive or networked actions (pushes, deploys, `rm`, `curl` to arbitrary hosts) on **ask** or **deny**.
- Curating a tight allowlist is the main way to cut prompt fatigue without lowering your safety posture.

```json
{
  "permissions": {
    "allow": [
      "Bash(git diff:*)",
      "Bash(npm run lint)",
      "Bash(npm run typecheck)"
    ]
  }
}
```

---

## Safe defaults and the trust prompt

- Out of the box, Claude Code prompts for state-changing actions rather than running them silently.
- The first time you open a new project (a new directory) Claude asks you to confirm you trust that folder before acting.
- File edits, shell commands, and network fetches are gated; pure reads inside the working directory are lighter-touch.
- Deny rules and managed enterprise settings let admins enforce non-negotiable boundaries across a team.
- Treat `bypassPermissions` as an explicit, deliberate choice - best confined to isolated sandboxes or CI, never casual use.

---

## Hooks and the Agent SDK

- **Hooks** run your own shell commands at lifecycle points and can act as a programmatic gate; a `PreToolUse` hook can inspect a pending tool call and approve or block it.
- This lets you enforce policy with custom logic beyond static allow/deny patterns.
- Permissions also apply to **subagents**, which operate under the same rule set and modes as the main session.
- The **Agent SDK** exposes the same permission model programmatically, including a callback (`canUseTool`) to decide on tool calls in code.
- This makes the security model consistent whether you run Claude Code interactively or embed it in an automated pipeline.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "/usr/local/bin/check-cmd.sh" }
        ]
      }
    ]
  }
}
```

---

## Key takeaways

- Permissions gate *tool actions* via three behaviors - allow, ask, deny - where deny always wins.
- Modes set the session posture: default, acceptEdits, plan (read-only), and the dangerous bypassPermissions.
- Configure rules in layered `settings.json`/`settings.local.json` using tool-scoped patterns like `Bash(...)` and path matchers.
- Curate a tight allowlist for safe, repetitive actions to reduce prompts without weakening safety.
- For programmatic control, use `PreToolUse` hooks or the Agent SDK's `canUseTool` callback; the model is safe-by-default and asks before changing state.
