# 14 · Claude Code Desktop & GitHub Workflow

> How to drive Claude Code outside the terminal and use it to automate everyday GitHub work - pull requests, reviews, issues, and repo chores via the `gh` CLI.

---

## Slide: Beyond the terminal

- Claude Code started as a terminal CLI but now also runs in a desktop/IDE context (VS Code and JetBrains extensions) and inside the Claude app, not just a raw shell.
- The IDE integration shares the same engine as the CLI: same `CLAUDE.md`, same `settings.json`, same permission model - only the front-end changes.
- The desktop/IDE surface adds inline diff viewing, file-tree awareness, and a panel UI, while still letting Claude run tools and edit files.
- You can run several sessions in parallel (e.g. one per worktree/branch) for independent tasks.
- Headless mode (`claude -p "..."`) is the same tool with no UI - ideal for scripts, cron jobs, and CI.

---

## Slide: One config, many surfaces

- `CLAUDE.md` (project root or `~/.claude/CLAUDE.md`) holds persistent context and conventions Claude reads automatically every session.
- `settings.json` controls permissions, env vars, hooks, and model choice; `.claude/settings.local.json` holds your personal, gitignored overrides.
- The same MCP servers, skills, subagents, and plugins are available whether you launch from terminal or IDE.
- Because config is file-based, switching front-ends does not change behavior - your guardrails travel with the repo.

```jsonc
// .claude/settings.json
{
  "permissions": {
    "allow": ["Bash(gh pr view:*)", "Bash(gh issue list:*)"],
    "deny":  ["Bash(git push --force:*)"]
  }
}
```

---

## Slide: The gh CLI is the bridge to GitHub

- Claude Code has no special GitHub API of its own; it shells out to the official `gh` CLI you already have authenticated (`gh auth login`).
- Anything you can do with `gh` - PRs, issues, reviews, releases, workflow runs - Claude can do by composing the right command.
- Keep `gh` calls under permission rules so read-only commands run freely while write actions stay gated.
- This keeps auth with GitHub, not with Claude: tokens live in your `gh` config, not in Claude's settings.

```bash
gh pr list --state open --limit 10
gh issue view 42 --comments
gh pr checks 128
```

---

## Slide: Creating pull requests

- Ask Claude to branch, commit, and open a PR; it typically runs `git` for the commit and `gh pr create` for the PR.
- It can draft the PR title and body from the actual diff and recent commits, summarizing what changed and why.
- Commit/push only happens when you ask - Claude should not push to a default branch; have it branch first.
- House style (commit message format, required trailers, PR template) belongs in `CLAUDE.md` so every PR is consistent.

```bash
git checkout -b fix/login-redirect
git commit -am "fix: correct post-login redirect"
gh pr create --fill --base main
```

---

## Slide: Reviewing pull requests

- Point Claude at a PR (`gh pr view`, `gh pr diff`) and ask for a focused review: correctness bugs, missing tests, risky changes.
- It can post findings as inline review comments via `gh pr review` / `gh api`, or just summarize in chat for you to act on.
- The built-in `/review` and `/security-review` commands target the current diff or a PR with a structured checklist.
- Use plan mode (read-only) for a review pass when you want analysis without any file edits or commands that change state.
- Tune depth explicitly - fewer high-confidence findings vs. broad coverage that may include uncertain ones.

---

## Slide: Working with issues

- Claude can triage with `gh issue list`/`gh issue view`, then reproduce, propose a fix, and open a PR that closes the issue.
- Use closing keywords (`Closes #123`) in the PR body so GitHub links and auto-closes the issue on merge.
- It can label, comment, and assign via `gh issue edit` / `gh issue comment` when permissions allow.
- For large backlogs, subagents or skills can cluster duplicate reports by root cause before you plan fixes.
- Give Claude the issue number and let it gather context itself rather than pasting the whole thread.

```bash
gh issue create --title "Flaky auth test" --label bug
gh issue comment 42 --body "Reproduced on main; fix in #128"
```

---

## Slide: Automating repo tasks

- Hooks in `settings.json` fire on events (e.g. `PostToolUse`, `Stop`) to run formatters, linters, or notifications deterministically - the harness runs them, not the model.
- Headless `claude -p` plus `gh` lets you script recurring chores: triage new issues, label PRs, draft release notes in CI.
- Subagents handle isolated sub-tasks (e.g. "review this file") with their own context, keeping the main thread clean.
- Skills and plugins package reusable workflows (PR babysitting, issue clustering, version bumps) you can invoke on demand.
- The Agent SDK lets you build your own programs on the same engine when a one-off command isn't enough.

```jsonc
// settings.json - auto-format after edits
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{ "type": "command", "command": "prettier --write $CLAUDE_FILE_PATHS" }]
    }]
  }
}
```

---

## Slide: Permissions & safety on GitHub

- Permission modes range from prompt-on-every-action to `acceptEdits` to fully autonomous - match the mode to the trust level of the task.
- Allowlist safe, read-only `gh`/`git` commands so they never interrupt you; gate or deny destructive ones (force push, branch delete).
- Plan mode is read-only: ideal for review and investigation where Claude should look but not touch.
- In CI/headless runs, prefer narrow, explicit allow rules over broad autonomy so an automated job can't run unexpected commands.
- Keep secrets out of `CLAUDE.md` and settings; let `gh` and the environment own authentication.

---

## Slide: Key takeaways

- Same engine everywhere: terminal, IDE, and headless all share `CLAUDE.md`, `settings.json`, MCP, skills, and hooks.
- GitHub work flows through the authenticated `gh` CLI - PRs, reviews, and issues are just commands Claude composes.
- Encode your conventions in `CLAUDE.md` and your guardrails in `settings.json` so behavior is consistent and safe.
- Hooks, subagents, skills, and headless mode turn repetitive repo chores into reliable automation.
- Use plan mode and tight permission allowlists to review safely and to keep automated runs from doing anything destructive.
