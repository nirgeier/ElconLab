# 07 · Hooks

> Hooks let you run your own shell commands automatically at defined points in Claude Code's lifecycle, so you can enforce policy, automate chores, and shape the agent's behavior deterministically.

---

## Slide: What hooks are

- User-defined shell commands that Claude Code runs automatically at specific lifecycle events
- They are deterministic: the harness runs them every time, unlike asking the model to "remember" to do something
- Configured in `settings.json` (not in `CLAUDE.md`, which is just guidance for the model)
- Each hook receives a JSON payload on stdin describing the event and returns signals via exit code or JSON on stdout
- Good for things you want guaranteed: formatting, linting, audit logs, guardrails

---

## Slide: The lifecycle events

- `PreToolUse` - fires before a tool runs; can inspect and block the call
- `PostToolUse` - fires after a tool succeeds; good for reacting to changes (e.g. format an edited file)
- `UserPromptSubmit` - fires when you submit a prompt, before the model sees it
- `SessionStart` / `SessionEnd` - fires when a session begins or ends
- `Stop` / `SubagentStop` - fires when the main agent (or a subagent) finishes responding
- `Notification` and `PreCompact` - fire on notifications and before context compaction

---

## Slide: How hooks are configured

- Live under a top-level `hooks` key in `settings.json` (project, local, or user scope)
- Each event maps to an array of matcher groups; each group has a `matcher` and a list of `hooks`
- The `matcher` selects which tools trigger the hook (e.g. `Edit`, `Write`, or a regex like `Edit|Write`)
- Events without tools (like `SessionStart`) ignore the matcher
- Each hook entry has `type: "command"` and a `command` string

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "prettier --write \"$CLAUDE_FILE_PATHS\"" }
        ]
      }
    ]
  }
}
```

---

## Slide: The input payload

- Hooks receive a JSON object on stdin every time they fire
- Common fields: `session_id`, `hook_event_name`, `cwd`, and the transcript path
- Tool events include `tool_name` and `tool_input` (and `tool_response` for `PostToolUse`)
- Read it with `jq` or any language to make decisions based on what the tool is doing
- Example: inspect the command a `Bash` call is about to run before allowing it

```bash
#!/usr/bin/env bash
input=$(cat)
cmd=$(echo "$input" | jq -r '.tool_input.command')
echo "$cmd" | grep -qE '\brm -rf\b' && { echo "Blocked: rm -rf" >&2; exit 2; }
```

---

## Slide: Blocking vs non-blocking

- Exit code `0` - success; the action proceeds (stdout is informational)
- Exit code `2` - blocking error; the action is stopped and stderr is fed back to Claude
- Other non-zero codes - non-blocking error; surfaced to the user but the flow continues
- Only certain events can actually block: `PreToolUse` blocks the tool call, `UserPromptSubmit` blocks the prompt, `Stop` can force the agent to keep working
- `PostToolUse` runs after the fact, so it cannot undo the tool, but a non-zero exit still feeds feedback to Claude

---

## Slide: JSON output for finer control

- Instead of exit codes, a hook can print a JSON object to stdout for richer control
- `continue`, `stopReason`, and `suppressOutput` control overall flow
- For `PreToolUse`, a `permissionDecision` of `allow`, `deny`, or `ask` overrides the normal permission prompt
- `UserPromptSubmit` and `SessionStart` can inject `additionalContext` into the conversation
- This lets a hook approve trusted commands automatically or add reason text when denying

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Edits to .env are not allowed"
  }
}
```

---

## Slide: Use case - format and lint on save

- Attach a `PostToolUse` hook on `Edit|Write` to run a formatter on changed files
- Use `$CLAUDE_FILE_PATHS` (or parse `tool_input` from stdin) to target only what changed
- Pair with a linter that exits non-zero so Claude sees and fixes the errors
- Keeps the codebase consistent without the model having to remember to format
- Faster and more reliable than prompting "always run prettier afterward"

---

## Slide: Use case - guardrails

- A `PreToolUse` hook on `Bash` can scan and block dangerous commands before they run
- A `PreToolUse` hook on `Edit|Write` can protect sensitive paths (secrets, lockfiles, CI config)
- Return exit `2` or a `deny` decision with a clear reason so Claude understands and adapts
- `UserPromptSubmit` hooks can reject prompts that violate policy or inject required context
- These run in the harness, so the model cannot talk its way past them

---

## Slide: Scope, ordering, and safety

- Hooks resolve from user (`~/.claude/settings.json`), project (`.claude/settings.json`), and local settings
- Multiple matching hooks for an event all run; non-blocking ones run in parallel
- Hooks execute with your full user permissions - treat them like any script you trust
- Newly edited hook config is not applied mid-session for safety; review changes before they take effect
- Test commands standalone first, and quote variables to handle paths with spaces

---

## Slide: Key takeaways

- Hooks make selected behaviors deterministic instead of relying on the model's good intentions
- Configure them per event in `settings.json` with matchers that select tools
- Exit code `2` (or a JSON `deny`) blocks; `PreToolUse` and `UserPromptSubmit` are your real gates
- Classic wins: auto-format on `PostToolUse`, command/path guardrails on `PreToolUse`
- They run as you, with your permissions - keep them simple, safe, and tested
