# Lab 010 - AI Code Editors: Cursor & Windsurf

!!! hint "Overview"

    - In this lab, you will learn to use AI-powered code editors to maintain and extend your applications.
    - You will open a Claude-generated project in Cursor and make changes using AI assistance.
    - You will learn just enough Git to safely track and revert changes.
    - By the end of this lab, you will be able to modify, debug, and extend existing applications without deep coding knowledge.

## Prerequisites

- Cursor installed (from Lab 001)
- A working app from earlier labs
- GitHub account

## What You Will Learn

- When to use Cursor/Windsurf vs. Claude chat
- Opening and navigating a project in Cursor
- Making changes with AI chat and inline editing
- Understanding Git basics: commit, push, pull, revert
- Debugging with AI assistance

---

## Background

## When to Use What?

| Scenario                          | Best Tool             |
| --------------------------------- | --------------------- |
| Building a new app from scratch   | Claude (claude.ai)    |
| Generating a full-stack app fast  | Bolt.new              |
| Editing existing code             | **Cursor / Windsurf** |
| Fixing a bug in existing code     | **Cursor / Windsurf** |
| Adding a feature to existing code | **Cursor / Windsurf** |
| Understanding unfamiliar code     | **Cursor / Windsurf** |
| Quick UI prototyping              | v0.dev                |

## What Is Cursor?

Cursor is VS Code (the world's most popular code editor) with AI built in:

- **Chat** - Ask questions about your code, get explanations
- **Inline Edit** - Select code, press `Cmd+K`, describe the change
- **Agent Mode** - Describe a task, Cursor edits multiple files automatically
- **Tab Completion** - AI autocomplete as you type

---

## Lab Steps

## Step 1 - Set Up Your Project in Cursor

1. Open Cursor
2. Clone your GitHub repo: **File** → **Clone Repository** → paste your repo URL
3. Or open the folder: **File** → **Open Folder** → select your project folder

## Step 2 - Explore Your Code with AI

Select any section of code in your HTML file and try these:

**Ask a question (Cmd+L to open chat):**

```
What does this file do? Give me a high-level overview of the main functions
and how they interact.
```

**Explain a function:**

```
Explain what the renderDashboard() function does in simple terms.
```

**Find a bug:**

```
I click the "Add Supplier" button and nothing happens.
What could be wrong? Look at the event listener and the form handling code.
```

## Step 3 - Make Changes with Inline Edit

1. Select the code you want to change
2. Press `Cmd+K` (Mac) or `Ctrl+K` (Windows)
3. Describe the change in natural language

**Examples:**

```
Change the header color from blue to dark green
```

```
Add a "Last Updated" timestamp to each row in the table
```

```
Make this table sortable by clicking on column headers
```

```
Add input validation: email must contain @, phone must be digits only
```

## Step 4 - Agent Mode for Bigger Changes

For changes that span multiple parts of the file:

1. Open Chat (`Cmd+L`)
2. Describe the change:

```
Add a dark mode toggle to this app. When toggled:
- Background should change to dark gray (#1a1a2e)
- Text should change to light gray (#eee)
- Cards should have dark backgrounds
- Save the preference in LocalStorage
- Add a toggle button in the top-right corner
```

Cursor will show you all the changes it wants to make. Review and accept.

## Step 5 - Git Basics: Don't Lose Your Work

!!! danger "Golden Rule"

    **Always commit before making big changes.** If something goes wrong, you can revert.

**Essential Git commands in Cursor's terminal:**

```bash
# Check what changed
git status

# Save your current work (commit)
git add .
git commit -m "Add dark mode feature"

# Push to GitHub (backup)
git push

# Undo the last commit (keep the changes)
git reset --soft HEAD~1

# Undo all uncommitted changes (CAREFUL - destructive!)
git checkout -- .

# See history of all commits
git log --oneline
```

**Using Cursor's Git UI:**

1. Click the **Source Control** icon in the left sidebar (branch icon)
2. See all changed files
3. Click `+` to stage files
4. Type a commit message and click ✓ to commit
5. Click **Sync** to push/pull from GitHub

## Step 6 - Cursor vs. Windsurf

| Feature        | Cursor             | Windsurf        |
| -------------- | ------------------ | --------------- |
| Base editor    | VS Code fork       | VS Code fork    |
| AI chat        | ✅ Excellent       | ✅ Good         |
| Agent mode     | ✅ Strong          | ✅ Strong       |
| Free tier      | Limited            | More generous   |
| Speed          | Fast               | Fast            |
| Unique feature | Multi-file editing | "Cascade" agent |

!!! tip "Try Both"

    Download both and use whichever feels more comfortable.
    They're similar enough that skills transfer between them.

---

## Hands-On Exercise

1. Open your Import Management app in Cursor
2. Use AI to add **three new features**:
   - A notification badge for overdue orders
   - Keyboard shortcuts (e.g., `N` for new order, `/` for search)
   - A print-friendly stylesheet
3. Commit each change separately with a descriptive message
4. Push to GitHub

---

## Summary

In this lab you:

- [x] Set up a project in Cursor
- [x] Used AI chat to understand existing code
- [x] Made changes using inline edit (Cmd+K)
- [x] Used Agent Mode for multi-part changes
- [x] Learned essential Git commands
- [x] Compared Cursor and Windsurf
