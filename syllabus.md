# AI-Powered Business Systems – Training Syllabus

**Company:** Elcon – Instrumentation & Control
**Audience:** Internal staff (operations, procurement, engineering, management)
**Goal:** Enable employees to independently build, maintain, and extend internal business systems using AI tools and low-code/no-code platforms
**Duration:** 5 sessions × 4 hours (20 hours total)

---

## Session 1: Foundations – Understanding the AI Landscape

### 1.1 Where We Stand Today

- Elcon's current system map: Hashavshevet ERP, Wiznet CRM, Monday.com, Smadar, Excel, file server
- Pain points: manual processes, siloed data, lack of integration
- What AI can (and cannot) replace

### 1.2 Key Concepts

- What is an LLM (Large Language Model) and how does it work – demystified
- Prompts, context windows, tokens – the vocabulary you need
- The difference between chat-based AI, code-generation AI, and automation platforms
- When to use AI vs. traditional software

### 1.3 The Tool Ecosystem – Overview

| Tool                   | Category                          | What It Does                          | Cost                             |
| ---------------------- | --------------------------------- | ------------------------------------- | -------------------------------- |
| **Claude** (Anthropic) | AI Assistant / Code Generation    | Build apps, analyze data, write logic | Free tier + paid plans           |
| **n8n**                | Workflow Automation (self-hosted) | Connect systems, automate flows       | Free (self-hosted) / Cloud plans |
| **Cursor**             | AI Code Editor                    | Write & edit code with AI assistance  | Free tier + Pro                  |
| **Bolt.new**           | AI App Builder                    | Generate full-stack apps from prompts | Free tier + paid                 |
| **Supabase**           | Database & Backend                | Managed PostgreSQL + Auth + APIs      | Free tier + paid                 |
| **v0.dev** (Vercel)    | UI Generator                      | Generate React UI from descriptions   | Free tier + paid                 |
| **GitHub**             | Version Control                   | Store, track, and collaborate on code | Free                             |
| **Windsurf**           | AI Code Editor                    | Alternative to Cursor                 | Free tier + paid                 |

### 1.4 Hands-On

- Setting up accounts: Claude, n8n cloud, GitHub
- First prompt engineering exercise: describe a business problem, get a solution

---

## Session 2: Building Applications with Claude

### 2.1 Prompt Engineering for Business Systems

- How to describe a system to Claude effectively
- Iterative development: start simple, add features in rounds
- Structuring complex prompts: role, context, task, constraints, output format
- Common mistakes and how to avoid them

### 2.2 From Idea to Working App

- Step-by-step: rebuilding the Import Management System (the 4-hour success story)
- Understanding what Claude actually generated: HTML, CSS, JavaScript, databases
- File structure and architecture basics – just enough to be dangerous

### 2.3 Claude Artifacts & Projects

- Using Claude Projects to maintain context across conversations
- Uploading documents (specs, CSVs, schemas) for context
- Using Artifacts to preview and iterate on outputs

### 2.4 Hands-On Workshop

- Each participant describes a real Elcon need and builds a prototype with Claude
- Examples:
  - Drawing management lookup tool
  - Supplier order tracker dashboard
  - Delivery note scanner interface

---

## Session 3: Databases, Hosting & Making It Real

### 3.1 Where Does the Data Live?

- Local files vs. databases vs. cloud storage
- Introduction to Supabase: your free managed PostgreSQL database
- Tables, rows, columns – database basics for non-developers
- Connecting a Claude-built app to a real database

### 3.2 Hosting & Deployment

- Options for hosting internal tools:
  - **Vercel / Netlify** – free static hosting
  - **Railway / Render** – backend hosting
  - **Self-hosted on your own server** – full control
- Domain names, HTTPS, and basic security

### 3.3 The Hashavshevet (ERP) Connection – The Dream

- Understanding Hashavshevet's database structure (SQL Server)
- Read-only access: building dashboards on top of ERP data
- API options and middleware approaches
- Security considerations: never expose your ERP directly
- Practical architecture: ERP DB → read-only replica → Supabase/n8n → your apps

### 3.4 Hands-On Workshop

- Set up a Supabase project
- Create tables for a real Elcon use case (e.g., supplier database)
- Connect the Import Management app to Supabase
- Deploy to Vercel

---

## Session 4: Workflow Automation with n8n

### 4.1 What is n8n and Why It Matters

- Visual workflow automation – the "glue" between your systems
- n8n vs. Zapier vs. Make (Integromat): why n8n wins for Elcon
  - Self-hosted = your data stays on your server
  - Unlimited workflows on self-hosted
  - Direct database connections

### 4.2 Core Concepts

- Nodes, triggers, connections, workflows
- HTTP requests, webhooks, cron schedules
- Data mapping and transformation
- Error handling and retry logic

### 4.3 Real Elcon Use Cases with n8n

- **Import Management Automation:**
  - Trigger: new order in system → email supplier → update status → notify team
- **Monday.com Replacement:**
  - n8n + Supabase can replicate Monday's task management for free
- **Smadar Integration:**
  - Scan delivery note → OCR → match to PO → update ERP
- **CRM Sync:**
  - Wiznet CRM ↔ your custom dashboards ↔ email notifications
- **ERP Dashboard:**
  - Scheduled query from Hashavshevet DB → generate weekly reports → email to management

### 4.4 n8n + AI Nodes

- Using Claude/OpenAI nodes inside n8n workflows
- Example: incoming email → AI classifies urgency → routes to correct team member
- Example: supplier price list PDF → AI extracts data → updates database

### 4.5 Hands-On Workshop

- Install/configure n8n (cloud or self-hosted)
- Build 2 workflows:
  1. Automated supplier order status notification
  2. AI-powered document processing pipeline

---

## Session 5: Putting It All Together – Architecture & Independence

### 5.1 AI-Assisted Development with Cursor / Windsurf

- When Claude chat isn't enough: using an AI code editor
- Opening a Claude-generated project in Cursor
- Making changes, fixing bugs, adding features with AI assistance
- Understanding just enough Git to not lose your work

### 5.2 System Architecture for Elcon

- Mapping the target architecture:

```
┌─────────────────────────────────────────────────────┐
│                   Elcon Server                       │
│                                                      │
│  ┌──────────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Hashavshevet │  │ Supabase │  │     n8n       │  │
│  │   ERP DB     │──│ (or local│──│  Workflows    │  │
│  │  (read-only) │  │   PG DB) │  │               │  │
│  └──────────────┘  └──────────┘  └───────────────┘  │
│         │               │               │            │
│         └───────────────┼───────────────┘            │
│                         │                            │
│              ┌──────────┴──────────┐                 │
│              │   Custom Web Apps   │                 │
│              │  (Built with Claude │                 │
│              │   / Cursor / Bolt)  │                 │
│              └─────────────────────┘                 │
└─────────────────────────────────────────────────────┘
```

### 5.3 Security & Best Practices

- Never expose databases directly to the internet
- User authentication and role-based access
- Backup strategies
- When to call a professional vs. DIY

### 5.4 Building Your Roadmap

- Prioritizing systems to build/replace:
  1. **Quick wins:** Excel-based processes → custom apps (Import Management ✅)
  2. **Medium effort:** Monday.com replacement, drawing management
  3. **Advanced:** ERP integration, automated reporting, AI-powered workflows
- Assigning ownership: who maintains what
- How to keep learning: communities, YouTube channels, documentation

### 5.5 Final Workshop

- Each team presents their project built during the course
- Live troubleshooting and improvement session
- Q&A and next steps

---

## Recommended Tools Summary

### Must-Have (Start Here)

| Tool           | Purpose                                 | Setup                       |
| -------------- | --------------------------------------- | --------------------------- |
| **Claude Pro** | Build apps, analyze data, problem-solve | claude.ai – subscription    |
| **n8n**        | Automate workflows between systems      | Self-hosted on Elcon server |
| **Supabase**   | Database for custom apps                | supabase.com or self-hosted |
| **Cursor**     | Edit and maintain code with AI          | cursor.com                  |
| **GitHub**     | Version control and backup              | github.com                  |

### Nice-to-Have (Add Later)

| Tool         | Purpose                          | When to Add                             |
| ------------ | -------------------------------- | --------------------------------------- |
| **Bolt.new** | Rapid full-stack app generation  | When you need apps fast                 |
| **v0.dev**   | Generate beautiful UI components | When design matters                     |
| **Windsurf** | Alternative AI code editor       | If Cursor doesn't fit                   |
| **Coolify**  | Self-hosted deployment platform  | When you want everything on your server |

### Can Potentially Replace

| Current Tool     | Replacement                  | Savings             |
| ---------------- | ---------------------------- | ------------------- |
| Monday.com       | n8n + Supabase + custom app  | Monday subscription |
| Excel processes  | Claude-built apps + Supabase | Time & errors       |
| Smadar (partial) | n8n + AI OCR workflow        | Depends on scope    |

---

## Prerequisites for Participants

- Laptop with Chrome/Edge browser
- Google account (for various sign-ups)
- Basic computer literacy (no coding experience required)
- Access to a real business problem they want to solve
- Enthusiasm for learning 🚀

---

## Post-Training Support

- Shared Claude Project with Elcon-specific prompts and templates
- n8n workflow templates for common Elcon scenarios
- GitHub repository with all course materials and example projects
- Recommended learning path for continued self-study

---

_Syllabus prepared for Elcon – April 2026_
