# Final Project – Building a CRM with Claude Code + n8n

!!! hint "Overview"

    - In this project, you will build a complete Customer Relationship Management (CRM) system.
    - The frontend and backend are built with **Claude Code** (Supabase + Next.js).
    - The automation layer is built with **n8n** (workflows, notifications, AI).
    - This is a real-world project that combines everything you learned in this course.
    - Work through it step by step – each phase builds on the previous one.

## Project Architecture

```mermaid
graph TB
    subgraph "Frontend (Next.js)"
        UI["CRM Dashboard"]
        FORMS["Forms & Tables"]
        AUTH["Auth (Supabase)"]
    end

    subgraph "Backend (Supabase)"
        DB["PostgreSQL Database"]
        EDGE["Edge Functions"]
        RLS["Row Level Security"]
        STORAGE["File Storage"]
    end

    subgraph "Automation (n8n)"
        WF1["Lead Capture Workflow"]
        WF2["Follow-up Reminders"]
        WF3["Email Campaigns"]
        WF4["AI Lead Scoring"]
        WF5["Weekly Reports"]
        WF6["Data Sync"]
    end

    UI --> DB
    UI --> EDGE
    FORMS --> DB
    AUTH --> DB
    EDGE --> DB
    DB --> WF1
    DB --> WF2
    DB --> WF3
    DB --> WF4
    DB --> WF5
    WF6 --> DB

    style UI fill:#1e293b,stroke:#2563eb,color:#e2e8f0
    style DB fill:#1e293b,stroke:#16a34a,color:#e2e8f0
    style WF1 fill:#1e293b,stroke:#f59e0b,color:#e2e8f0
    style WF2 fill:#1e293b,stroke:#f59e0b,color:#e2e8f0
    style WF3 fill:#1e293b,stroke:#f59e0b,color:#e2e8f0
    style WF4 fill:#1e293b,stroke:#f59e0b,color:#e2e8f0
    style WF5 fill:#1e293b,stroke:#f59e0b,color:#e2e8f0
    style WF6 fill:#1e293b,stroke:#f59e0b,color:#e2e8f0
```

---

## Phase 1: Database Design (Claude Code)

### Database Schema

Use Claude Code to generate the entire database:

```bash
claude "Design and create a Supabase database for a CRM system for Elcon,
an instrumentation and control company. Include these tables with proper
relationships, constraints, and RLS policies:

1. contacts - customers/leads (name, email, phone, company, position, source)
2. companies - organizations (name, industry, size, website, address)
3. deals - sales opportunities (title, value, stage, probability, expected_close)
4. activities - tasks/calls/meetings (type, subject, date, notes, linked to contact/deal)
5. notes - free-text notes linked to contacts/companies/deals
6. email_log - sent/received emails tracked
7. tags - flexible tagging system for contacts/companies/deals

Use proper foreign keys, indexes, timestamps, soft delete.
Set up RLS for multi-user access based on auth.uid().
Create views for common queries (pipeline summary, overdue activities).
Generate seed data: 20 companies, 50 contacts, 30 deals, 100 activities."
```

### Expected ER Diagram

```mermaid
erDiagram
    companies ||--o{ contacts : "has"
    companies ||--o{ deals : "has"
    contacts ||--o{ deals : "primary_contact"
    contacts ||--o{ activities : "linked_to"
    deals ||--o{ activities : "linked_to"
    contacts ||--o{ notes : "about"
    companies ||--o{ notes : "about"
    deals ||--o{ notes : "about"
    contacts ||--o{ email_log : "sent_to"
    contacts }o--o{ tags : "tagged_with"
    companies }o--o{ tags : "tagged_with"
    deals }o--o{ tags : "tagged_with"

    companies {
        uuid id PK
        text name
        text industry
        text size
        text website
        text address
        text phone
        text notes
        boolean is_active
        timestamptz created_at
    }

    contacts {
        uuid id PK
        uuid company_id FK
        text first_name
        text last_name
        text email
        text phone
        text position
        text source
        text status
        integer lead_score
        boolean is_active
        timestamptz created_at
    }

    deals {
        uuid id PK
        uuid company_id FK
        uuid contact_id FK
        text title
        numeric value
        text currency
        text stage
        integer probability
        date expected_close
        text notes
        boolean is_active
        timestamptz created_at
    }

    activities {
        uuid id PK
        uuid contact_id FK
        uuid deal_id FK
        uuid assigned_to FK
        text type
        text subject
        text description
        timestamptz due_date
        boolean completed
        timestamptz completed_at
        timestamptz created_at
    }

    notes {
        uuid id PK
        uuid contact_id FK
        uuid company_id FK
        uuid deal_id FK
        text content
        uuid created_by FK
        timestamptz created_at
    }

    email_log {
        uuid id PK
        uuid contact_id FK
        text subject
        text body
        text direction
        text status
        timestamptz sent_at
    }

    tags {
        uuid id PK
        text name
        text color
    }
```

---

## Phase 2: Backend API (Claude Code)

Build the API layer with Claude Code:

```bash
claude "Create Supabase Edge Functions for the CRM:

1. /api/contacts - CRUD + search + filter by company/tag/status
2. /api/companies - CRUD + search + filter by industry/size
3. /api/deals - CRUD + pipeline view + move between stages
4. /api/activities - CRUD + list overdue + list by contact/deal
5. /api/dashboard - Summary stats (total contacts, deals by stage, revenue forecast)
6. /api/search - Global search across contacts, companies, deals

Each endpoint should handle GET (list/search), POST (create), PATCH (update), DELETE (soft delete).
Add pagination, sorting, and filtering support.
Return proper error responses with status codes."
```

### Deal Pipeline Stages

```mermaid
graph LR
    A["Lead"] --> B["Qualified"]
    B --> C["Proposal"]
    C --> D["Negotiation"]
    D --> E["Closed Won ✅"]
    D --> F["Closed Lost ❌"]

    style E fill:#1e293b,stroke:#16a34a,color:#e2e8f0
    style F fill:#1e293b,stroke:#ef4444,color:#e2e8f0
```

---

## Phase 3: Frontend Dashboard (Claude Code)

Build the UI with Claude Code:

```bash
claude "Build a Next.js CRM dashboard with Supabase auth:

Pages:
1. /dashboard - KPI cards (contacts, deals, revenue), pipeline chart, recent activities
2. /contacts - Table with search/filter/sort, click to view detail
3. /contacts/[id] - Contact detail with timeline, deals, activities, notes
4. /companies - Company list with contacts count, total deal value
5. /deals - Kanban board view of deal pipeline (drag between stages)
6. /activities - Activity list with calendar view, overdue highlighted
7. /reports - Charts: revenue forecast, deal conversion, activity metrics

Components:
- Layout with sidebar navigation
- Search bar with global search
- KPI cards with sparklines
- Data tables with pagination
- Kanban board for deals
- Activity timeline
- Notes editor
- Tag manager

Use shadcn/ui components, Tailwind CSS, dark mode.
Connect to Supabase for auth and data.
Use React Query for data fetching."
```

### Dashboard Wireframe

```mermaid
graph TD
    subgraph "CRM Dashboard"
        subgraph "Top Bar"
            SEARCH["🔍 Global Search"]
            USER["👤 User Menu"]
        end

        subgraph "Sidebar"
            NAV1["📊 Dashboard"]
            NAV2["👥 Contacts"]
            NAV3["🏢 Companies"]
            NAV4["💰 Deals"]
            NAV5["📋 Activities"]
            NAV6["📈 Reports"]
        end

        subgraph "Main Content"
            subgraph "KPI Row"
                K1["Contacts<br/>247"]
                K2["Open Deals<br/>$1.2M"]
                K3["Win Rate<br/>34%"]
                K4["Activities Due<br/>12"]
            end

            subgraph "Charts"
                C1["Pipeline<br/>(Bar Chart)"]
                C2["Revenue Forecast<br/>(Line Chart)"]
            end

            subgraph "Recent"
                R1["Recent Activities"]
                R2["Recent Deals"]
            end
        end
    end
```

---

## Phase 4: n8n Automation Workflows

### Workflow 1: Lead Capture

```mermaid
graph LR
    A["Webhook:<br/>New lead from website"] --> B["Validate &<br/>clean data"]
    B --> C["Supabase:<br/>Create contact"]
    C --> D["AI: Score lead<br/>(Claude)"]
    D --> E["Supabase:<br/>Update score"]
    E --> F["Email:<br/>Welcome email"]
    F --> G["Activity:<br/>Create follow-up task"]
```

**n8n implementation:**

1. **Webhook** – POST `/webhook/lead/capture`
2. **Code** – Validate: name, email required; clean phone format
3. **Supabase** – Insert to `contacts` table
4. **HTTP Request** – Call Claude API:
   ```
   Score this lead 1-100 based on:
   - Company size and industry match (Elcon targets industrial/manufacturing)
   - Position seniority
   - Source quality (referral > website > cold)
   Return JSON: { score: number, reasoning: string }
   ```
5. **Supabase** – Update `lead_score`
6. **Send Email** – Templated welcome email
7. **Supabase** – Create activity: "Follow up with new lead" due in 2 days

### Workflow 2: Follow-up Reminders

```mermaid
graph TD
    A["⏰ Daily 8 AM"] --> B["Query: Overdue activities"]
    B --> C{Any overdue?}
    C -->|Yes| D["Group by assigned user"]
    D --> E["For each user"]
    E --> F["Build reminder email"]
    F --> G["Send email"]
    C -->|No| H["Log: All clear"]
```

### Workflow 3: AI Deal Analysis

```mermaid
graph LR
    A["Deal stage changed"] --> B["Fetch deal +<br/>all activities"]
    B --> C["AI: Analyze<br/>deal health"]
    C --> D["Update deal<br/>probability"]
    D --> E{Risk detected?}
    E -->|Yes| F["Alert sales manager"]
    E -->|No| G["Log analysis"]
```

**AI prompt for deal analysis:**

```
Analyze this sales deal for Elcon (instrumentation company):

Deal: {{ $json.title }} - {{ $json.value }} {{ $json.currency }}
Stage: {{ $json.stage }}
Days in pipeline: {{ $json.days_open }}
Expected close: {{ $json.expected_close }}
Activities: {{ JSON.stringify($json.activities) }}
Last contact: {{ $json.last_activity_date }}

Assess:
1. Deal health (HEALTHY / AT_RISK / CRITICAL)
2. Adjusted win probability (0-100)
3. Risk factors (list)
4. Recommended next actions (list)
5. Predicted close date

Return as JSON.
```

### Workflow 4: Weekly CRM Report

```mermaid
sequenceDiagram
    participant Cron as Friday 5 PM
    participant DB as Supabase
    participant AI as Claude
    participant Email as Email

    Cron->>DB: Fetch week's metrics
    DB->>AI: Raw data
    AI->>AI: Generate insights
    AI->>Email: Send report to management
```

### Workflow 5: Data Enrichment

Automatically enrich new companies:

1. **Trigger** – New company created
2. **HTTP Request** – Look up company info (website scraping or API)
3. **AI** – Extract: industry, size, key products, relevant contacts
4. **Supabase** – Update company record
5. **Activity** – Create "Review enriched data" task

### Workflow 6: Email Tracking

```mermaid
graph TD
    A["Send email to contact"] --> B["Log in email_log"]
    B --> C["Track open/click<br/>(webhook)"]
    C --> D["Update contact<br/>engagement score"]
    D --> E{High engagement?}
    E -->|Yes| F["Create follow-up activity"]
    E -->|No| G["Schedule next touchpoint"]
```

---

## Phase 5: Integration & Testing

### Connect Frontend to n8n

```mermaid
graph TB
    subgraph "Frontend (Next.js)"
        FORM["Lead Capture Form"]
        DASH["Dashboard"]
    end

    subgraph "Supabase"
        DB["Database"]
        FUNC["Edge Functions"]
        RT["Realtime"]
    end

    subgraph "n8n"
        WH["Webhooks"]
        WF["Workflows"]
    end

    FORM -->|submit| WH
    WH --> WF
    WF --> DB
    DB -->|realtime| RT
    RT --> DASH
    DASH --> FUNC
    FUNC --> DB
```

### Testing Checklist

| Test                    | How to Verify                                   |
| ----------------------- | ----------------------------------------------- |
| Lead capture end-to-end | Submit form → check DB → check welcome email    |
| Deal pipeline Kanban    | Drag deal → check stage updated → check n8n     |
| Activity reminders      | Create overdue activity → wait for 8 AM → email |
| AI lead scoring         | Submit lead → check score updated in DB         |
| Weekly report           | Trigger manually → check email received         |
| Global search           | Search by name → verify results from all tables |

---

## Phase 6: Deploy & Launch

### Deployment Architecture

```mermaid
graph TB
    subgraph "Cloud Services"
        VERCEL["Vercel<br/>(Next.js Frontend)"]
        SUPA["Supabase<br/>(Database + Auth + API)"]
    end

    subgraph "Self-Hosted (Coolify)"
        N8N["n8n<br/>(Automation)"]
        REDIS["Redis"]
    end

    VERCEL --> SUPA
    N8N --> SUPA
    VERCEL -.->|webhooks| N8N
```

**Deployment steps:**

1. **Supabase** – Already hosted (apply migrations)
2. **Vercel** – Connect GitHub repo, auto-deploy
3. **n8n** – Deploy on Coolify with Docker Compose
4. **DNS** – Set up custom domains
5. **Monitoring** – n8n self-monitoring workflow
6. **Backup** – Automated daily backups

---

## Deliverables

By the end of this project, you should have:

- [ ] **Database**: Full CRM schema in Supabase with RLS, views, and seed data
- [ ] **API**: Edge Functions for CRUD operations on all entities
- [ ] **Frontend**: Next.js dashboard with all pages (contacts, companies, deals, activities, reports)
- [ ] **Automation**: 6 n8n workflows (lead capture, reminders, AI scoring, reports, enrichment, email tracking)
- [ ] **Integration**: Frontend connected to n8n via webhooks, Supabase realtime updates
- [ ] **Deployment**: Everything deployed and running on cloud services

---

## Bonus Challenges

!!! tip "Extra Credit"

    1. **WhatsApp Integration**: Add WhatsApp messaging via n8n (Twilio or official API)
    2. **AI Chatbot**: Build a chatbot that answers questions about contacts/deals using Claude
    3. **Mobile View**: Make the dashboard fully responsive for mobile use
    4. **Import/Export**: Build CSV import for contacts and Excel export for reports
    5. **Audit Trail**: Track all changes to contacts/deals with a full audit log
    6. **Multi-language**: Add Hebrew support to the frontend

---

## Summary

In this project you:

- [x] Designed a complete CRM database schema
- [x] Built a full-stack application with Claude Code
- [x] Created 6 n8n automation workflows
- [x] Integrated AI for lead scoring and deal analysis
- [x] Deployed to production with monitoring
- [x] Combined Claude Code + n8n into a complete business solution

!!! success "Course Complete 🎉"

    You now have the skills to build and automate any internal business system using AI tools.
    Keep building, keep automating, keep learning.
