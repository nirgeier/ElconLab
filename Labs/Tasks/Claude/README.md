# Claude Tasks

- Hands-on exercises focused on Claude Code, subagents, skills, hooks, and Agent SDK workflows.
- Each task is demo-oriented and can be completed in a small sandbox repo.
- Use these tasks to build practical Claude automation patterns for Elcon.

---

#### Table of Contents

- [Claude Tasks](#claude-tasks)
      - [Table of Contents](#table-of-contents)
      - [01. Initialize Claude Project Memory](#01-initialize-claude-project-memory)
      - [Scenario:](#scenario)
      - [02. Plan Mode Before Edit](#02-plan-mode-before-edit)
      - [Scenario:](#scenario-1)
      - [03. Create a Skill Folder](#03-create-a-skill-folder)
      - [Scenario:](#scenario-2)
      - [04. Write a Trigger-Strong Description](#04-write-a-trigger-strong-description)
      - [Scenario:](#scenario-3)
      - [05. Add a Read-Only Researcher Subagent](#05-add-a-read-only-researcher-subagent)
      - [Scenario:](#scenario-4)
      - [06. Build a Three-Agent Team](#06-build-a-three-agent-team)
      - [Scenario:](#scenario-5)
      - [07. Add Permission Guardrails](#07-add-permission-guardrails)
      - [Scenario:](#scenario-6)
      - [08. Add a PreToolUse Hook Blocker](#08-add-a-pretooluse-hook-blocker)
      - [Scenario:](#scenario-7)
      - [09. Add PostToolUse Formatting Hook](#09-add-posttooluse-formatting-hook)
      - [Scenario:](#scenario-8)
      - [10. Add a Claude Team Command](#10-add-a-claude-team-command)
      - [Scenario:](#scenario-9)
      - [11. SDK Demo: One-Shot TypeScript Agent](#11-sdk-demo-one-shot-typescript-agent)
      - [Scenario:](#scenario-10)
      - [12. SDK Demo: Safe Tool Allowlist](#12-sdk-demo-safe-tool-allowlist)
      - [Scenario:](#scenario-11)
      - [13. SDK Demo: Task Delegation](#13-sdk-demo-task-delegation)
      - [Scenario:](#scenario-12)
      - [14. Debug Context Growth](#14-debug-context-growth)
      - [Scenario:](#scenario-13)
      - [15. Final Integration Mini-Challenge](#15-final-integration-mini-challenge)
      - [Scenario:](#scenario-14)

---

#### 01. Initialize Claude Project Memory

- Run Claude in a repo and initialize baseline memory.

#### Scenario:

- You are onboarding a new internal project and want consistent behavior in every session.

??? success "Solution"

    ```bash
    claude
    /init
    ```

    Then edit `CLAUDE.md` and add:

    - test/lint/build commands
    - coding conventions
    - files/folders to avoid touching

---

#### 02. Plan Mode Before Edit

- Practice read-only planning before implementation.

#### Scenario:

- A risky change touches 8 files. You want a reviewed plan first.

??? success "Solution"

    1. Switch to plan mode (Shift+Tab until `plan` appears).
    2. Prompt:
       ```
       Analyze where to add rate limiting to the API. Produce a step-by-step plan with files and risk notes. Do not edit yet.
       ```
    3. Approve only after plan quality is acceptable.

---

#### 03. Create a Skill Folder

- Build your first skill with `name` and `description` metadata.

#### Scenario:

- Your team repeatedly asks Claude to generate weekly release notes.

??? success "Solution"

    ```text
    .claude/skills/release-notes/
      SKILL.md
      references/labels.md
    ```

    `SKILL.md`:

    ```markdown
    ---
    name: release-notes
    description: Generate release notes from merged PRs. Use when the user asks for changelog or release notes.
    ---

    1. Find the last tag.
    2. Get merged PRs since that tag.
    3. Group by feature/fix/docs.
    ```

---

#### 04. Write a Trigger-Strong Description

- Improve activation reliability by refining description text.

#### Scenario:

- Your skill is not being auto-invoked.

??? success "Solution"

    Weak:
    `description: Helps with SQL.`

    Strong:
    `description: Review SQL migrations for safety and rollback readiness. Use when the user asks to review schema changes or production DB migrations.`

---

#### 05. Add a Read-Only Researcher Subagent

- Add a subagent with a restricted tool set.

#### Scenario:

- You want safe codebase exploration without accidental edits.

??? success "Solution"

    Create `.claude/agents/researcher.md`:

    ```markdown
    ---
    name: researcher
    description: Explore codebase and report findings with exact paths.
    tools: Read, Glob, Grep
    model: sonnet
    ---
    You are a read-only codebase researcher.
    ```

---

#### 06. Build a Three-Agent Team

- Create `researcher`, `implementer`, `reviewer` workflow.

#### Scenario:

- You want predictable delegation from discovery to implementation to review.

??? success "Solution"

    Add `.claude/commands/run-team.md`:

    ```markdown
    1. Use researcher to find target files.
    2. Use implementer to apply minimal change.
    3. Use reviewer to report risks.

    Task:
    $ARGUMENTS
    ```

    Run:

    ```bash
    /run-team Add a default timeout to outbound HTTP calls
    ```

---

#### 07. Add Permission Guardrails

- Configure safe defaults with `allow`, `ask`, `deny`.

#### Scenario:

- You want to reduce prompt fatigue but block dangerous actions.

??? success "Solution"

    Add to `.claude/settings.json`:

    ```json
    {
      "permissions": {
        "allow": ["Read", "Bash(npm test:*)", "Bash(git diff:*)"],
        "ask": ["Bash(git push:*)"],
        "deny": ["Read(./.env)", "Bash(rm -rf:*)"]
      }
    }
    ```

---

#### 08. Add a PreToolUse Hook Blocker

- Block sensitive commands before execution.

#### Scenario:

- You never want `rm -rf` or `.env` edits in this repo.

??? success "Solution"

    ```json
    {
      "hooks": {
        "PreToolUse": [
          {
            "matcher": "Bash",
            "hooks": [
              { "type": "command", "command": "./scripts/block-dangerous.sh" }
            ]
          }
        ]
      }
    }
    ```

---

#### 09. Add PostToolUse Formatting Hook

- Auto-format changed files after edits.

#### Scenario:

- Developers forget to format before commit.

??? success "Solution"

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

#### 10. Add a Claude Team Command

- Package your team flow as a reusable slash command.

#### Scenario:

- Your team repeats the same analyze/implement/review process.

??? success "Solution"

    Create `.claude/commands/change-with-review.md` with your standard flow.

    Then run:

    ```bash
    /change-with-review Add retry logic to ERP sync calls
    ```

---

#### 11. SDK Demo: One-Shot TypeScript Agent

- Run the Agent SDK with minimal setup.

#### Scenario:

- You need a scriptable Claude job in CI.

??? success "Solution"

    ```ts
    import { query } from "@anthropic-ai/claude-agent-sdk";

    for await (const msg of query({
      prompt: "Summarize changed files in this repo",
      options: { allowedTools: ["Read", "Glob", "Grep"] }
    })) {
      if (msg.type === "result") console.log(msg.result);
    }
    ```

---

#### 12. SDK Demo: Safe Tool Allowlist

- Restrict tooling for safer automation.

#### Scenario:

- Your CI job must not write files.

??? success "Solution"

    ```ts
    options: {
      permissionMode: "default",
      allowedTools: ["Read", "Glob", "Grep"]
    }
    ```

---

#### 13. SDK Demo: Task Delegation

- Allow subagent delegation with `Task` tool.

#### Scenario:

- You want SDK-based fan-out research across large repos.

??? success "Solution"

    Include `Task` in allowed tools:

    ```ts
    allowedTools: ["Read", "Glob", "Grep", "Task"]
    ```

    Prompt:

    ```
    Delegate search to subagents for auth, billing, and notifications modules, then merge findings.
    ```

---

#### 14. Debug Context Growth

- Practice context hygiene with long sessions.

#### Scenario:

- Session quality drops after many tool calls.

??? success "Solution"

    - Run `/context` to inspect usage.
    - Use `/compact` between major task phases.
    - Move noisy exploration to subagents.

---

#### 15. Final Integration Mini-Challenge

- Combine skills + subagents + hooks + permissions in one workflow.

#### Scenario:

- Build a mini "release assistant" flow for Elcon.

??? success "Solution"

    Deliverables:

    1. `release-notes` skill
    2. `researcher` and `reviewer` agents
    3. `run-release-flow` slash command
    4. `permissions` rules with safe allowlist
    5. `PostToolUse` formatting hook

    Success criteria:

    - Workflow runs end-to-end in one command
    - Output includes release notes + risk summary
    - No dangerous command is auto-approved

---

Complete these 15 tasks and you will be production-ready for Claude-based internal automation flows.
