---
hide:
  - toc
---

# AI-Powered Business Systems – Hands-On Labs

---

- Welcome to the **Elcon AI-Powered Business Systems** training!
- This course is designed for Elcon's internal staff to learn how to independently build, maintain, and extend business systems using AI tools and low-code platforms.
- Each lab is self-contained and builds upon the previous one, though they can be referenced independently.

---

## Course Modules

### Foundations (001–013)

| #   | Lab                                                              | Description                                                              |
| --- | ---------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 001 | [AI Landscape & Setup](001-AILandscape/README.md)                | What are LLMs, tool ecosystem overview, setting up your accounts.        |
| 002 | [Prompt Engineering](002-PromptEngineering/README.md)            | How to effectively describe business systems to AI and get results.      |
| 003 | [Building Apps with Claude](003-BuildingWithClaude/README.md)    | From idea to working prototype – rebuild the Import Management System.   |
| 004 | [Database Fundamentals](004-DatabaseFundamentals/README.md)      | Supabase, PostgreSQL basics, connecting your app to a real database.     |
| 005 | [Hosting & Deployment](005-HostingDeployment/README.md)          | Deploy your apps to Vercel, Netlify, or self-host on your own server.    |
| 006 | [ERP Integration](006-ERPIntegration/README.md)                  | Connect to Hashavshevet – read-only dashboards on top of your ERP data.  |
| 007 | [n8n Basics](007-n8nBasics/README.md)                            | Visual workflow automation – nodes, triggers, and your first workflow.   |
| 008 | [n8n Advanced Workflows](008-n8nAdvanced/README.md)              | Real Elcon automations: import management, CRM sync, task management.    |
| 009 | [n8n + AI Nodes](009-n8nAI/README.md)                            | AI-powered document processing and intelligent routing inside n8n.       |
| 010 | [Cursor & Windsurf](010-CursorWindsurf/README.md)                | AI code editors for maintaining and extending your apps.                 |
| 011 | [System Architecture](011-SystemArchitecture/README.md)          | Designing Elcon's target architecture – ERP, database, apps, automation. |
| 012 | [Security & Best Practices](012-SecurityBestPractices/README.md) | Authentication, backups, safe patterns for internal business tools.      |
| 013 | [Building Your Roadmap](013-BuildingYourRoadmap/README.md)       | Prioritize what to build, assign ownership, and plan your next steps.    |

### Claude Code Deep Dive (020–030)

| #   | Lab                                                              | Description                                                      |
| --- | ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| 020 | [Claude Code: Introduction](020-ClaudeCodeIntro/README.md)       | Installation, CLI commands, permissions model, interactive mode. |
| 021 | [Claude Code: Configuration](021-ClaudeCodeConfig/README.md)     | CLAUDE.md, project memory, settings, and customisation.          |
| 022 | [Claude Code: Full-Stack App](022-ClaudeCodeFullStack/README.md) | Build a Supplier Management system from scratch.                 |
| 023 | [Claude Code: Existing Code](023-ClaudeCodeExisting/README.md)   | Navigate, refactor, and extend an existing codebase.             |
| 024 | [Claude Code: Database](024-ClaudeCodeDatabase/README.md)        | Schema design, migrations, ER diagrams, RLS policies.            |
| 025 | [Claude Code: Git Workflows](025-ClaudeCodeGit/README.md)        | Branching, PRs, code review, GitHub integration.                 |
| 026 | [Claude Code: Testing](026-ClaudeCodeTesting/README.md)          | Debugging, unit/integration tests, health checks.                |
| 027 | [Claude Code: APIs](027-ClaudeCodeAPI/README.md)                 | REST APIs, webhooks, Supabase Edge Functions.                    |
| 028 | [Claude Code: UI/UX](028-ClaudeCodeUIUX/README.md)               | Design systems, components, responsive layouts.                  |
| 029 | [Claude Code: Automation](029-ClaudeCodeAutomation/README.md)    | Scripts, CSV processing, report generation.                      |
| 030 | [Claude Code: Advanced](030-ClaudeCodeAdvanced/README.md)        | Slash commands, templates, performance optimisation.             |

### n8n Deep Dive (031–040)

| #   | Lab                                                               | Description                                                           |
| --- | ----------------------------------------------------------------- | --------------------------------------------------------------------- |
| 031 | [n8n: Installation & Architecture](031-n8nInstallation/README.md) | Install n8n, explore the UI, Docker Compose for production.           |
| 032 | [n8n: Triggers & Data Flow](032-n8nTriggersDataFlow/README.md)    | Trigger types, expressions, data transformation, webhooks.            |
| 033 | [n8n: Database Operations](033-n8nDatabase/README.md)             | Connect to PostgreSQL/Supabase, CRUD, sync, bulk operations.          |
| 034 | [n8n: HTTP, APIs & Webhooks](034-n8nHTTPAPIs/README.md)           | HTTP Request node, authentication, chaining API calls.                |
| 035 | [n8n: Email & Notifications](035-n8nEmailNotifications/README.md) | Templated emails, notification hub, digests, incoming email.          |
| 036 | [n8n: File Processing](036-n8nFileProcessing/README.md)           | CSV import, PDF generation, OCR extraction, batch processing.         |
| 037 | [n8n: AI Integration](037-n8nAIIntegration/README.md)             | Claude/OpenAI in workflows, classification, reports, quality control. |
| 038 | [n8n: Error Handling](038-n8nErrorHandling/README.md)             | Retry logic, dead letter queues, monitoring, structured logging.      |
| 039 | [n8n: Advanced Patterns](039-n8nAdvancedPatterns/README.md)       | Sub-workflows, looping, conditional routing, templates.               |
| 040 | [n8n: Production Deployment](040-n8nProduction/README.md)         | Security, backups, monitoring, operational runbooks.                  |

### Final Project

| #   | Lab                                                     | Description                                                   |
| --- | ------------------------------------------------------- | ------------------------------------------------------------- |
| 050 | [CRM: Claude Code + n8n](050-FinalProjectCRM/README.md) | Build a complete CRM combining Claude Code and n8n workflows. |

---

## Tool Ecosystem

| Tool                   | Category                          | What It Does                          |
| ---------------------- | --------------------------------- | ------------------------------------- |
| **Claude** (Anthropic) | AI Assistant / Code Generation    | Build apps, analyze data, write logic |
| **Claude Code**        | AI Terminal Agent                 | Build full-stack apps from the CLI    |
| **n8n**                | Workflow Automation (self-hosted) | Connect systems, automate flows       |
| **Cursor**             | AI Code Editor                    | Write & edit code with AI assistance  |
| **Bolt.new**           | AI App Builder                    | Generate full-stack apps from prompts |
| **Supabase**           | Database & Backend                | Managed PostgreSQL + Auth + APIs      |
| **v0.dev** (Vercel)    | UI Generator                      | Generate React UI from descriptions   |
| **GitHub**             | Version Control                   | Store, track, and collaborate on code |
| **Windsurf**           | AI Code Editor                    | Alternative to Cursor                 |
| **Coolify**            | Self-Hosting Platform             | Deploy apps on your own server        |
