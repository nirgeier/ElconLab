# Lab 013 – Building Your Roadmap

!!! hint "Overview"

    - In this lab, you will create a prioritized implementation roadmap for Elcon's systems.
    - You will evaluate which manual processes to automate first for maximum impact.
    - You will assign ownership and plan continued learning.
    - By the end of this lab, each team will have a clear action plan for the next 3-6 months.

## Prerequisites

- All previous labs completed
- Knowledge of Elcon's current processes and pain points

## What You Will Learn

- How to prioritize which systems to build or replace
- Effort vs. impact analysis for internal tools
- Assigning ownership and maintenance responsibilities
- Resources for continued learning
- How to keep momentum after the training

---

## Lab Steps

### Step 1 – Evaluate Current Systems

For each current system, evaluate the pain level and replacement feasibility:

| Current System   | Pain Level | Replacement Effort | Potential Savings          | Priority  |
| ---------------- | ---------- | ------------------ | -------------------------- | --------- |
| Excel (imports)  | 🔴 High    | 🟢 Easy (done!)    | Hours/week of manual work  | ✅ Done   |
| Monday.com       | 🟡 Medium  | 🟢 Easy            | Monthly subscription       | High      |
| Drawing Mgmt     | 🟡 Medium  | 🟡 Medium          | Search time, lost drawings | High      |
| Smadar           | 🟡 Medium  | 🟡 Medium          | Manual data entry          | Medium    |
| Wiznet CRM       | 🟢 Low     | 🔴 Hard            | Better integration         | Low       |
| Hashavshevet ERP | 🔴 High    | 🔴 Very Hard       | Better visibility          | Long-term |

### Step 2 – Define the Phases

#### Phase 1: Quick Wins (Month 1-2)

!!! success "Low effort, high impact"

    1. **Import Management System** ✅ Already built!
       - Migrate from LocalStorage to Supabase
       - Deploy to Vercel
       - Roll out to procurement team

    2. **Monday.com Replacement**
       - Build task management app with Claude
       - Set up n8n notifications
       - Migrate existing tasks

    3. **Drawing Management Lookup**
       - Build search interface with Claude
       - Index existing file server drawings
       - Deploy internally

#### Phase 2: Core Automation (Month 2-4)

!!! info "Medium effort, high impact"

    4. **n8n Workflow Engine**
       - Deploy n8n on Elcon server
       - Build PO → Supplier email automation
       - Build overdue order notifications
       - Build weekly management reports

    5. **Delivery Note Processing**
       - n8n + Claude API for OCR
       - Auto-match to purchase orders
       - Replace/complement Smadar

    6. **Self-Hosted Infrastructure**
       - Install Coolify on Elcon server
       - Deploy PostgreSQL database
       - Migrate apps from Vercel to self-hosted

#### Phase 3: Integration (Month 4-6)

!!! warning "Higher effort, transformational impact"

    7. **Hashavshevet ERP Connection**
       - Create read-only database user
       - Build n8n sync workflows
       - Create ERP dashboards
       - Financial reporting automation

    8. **CRM Integration**
       - Sync Wiznet data to central database
       - Build customer 360° dashboard
       - Automate customer communication

    9. **Full System Integration**
       - Connect all systems through n8n
       - Central dashboard for management
       - Automated end-to-end processes

### Step 3 – Assign Ownership

For each system, assign clear ownership:

| System             | Owner (Builder) | Owner (Maintainer) | Stakeholder     |
| ------------------ | --------------- | ------------------ | --------------- |
| Import Management  | [Name]          | [Name]             | Procurement Mgr |
| Task Management    | [Name]          | [Name]             | Operations Mgr  |
| Drawing Management | [Name]          | [Name]             | Engineering Mgr |
| n8n Workflows      | [Name]          | [Name]             | IT / Operations |
| ERP Dashboards     | [Name]          | [Name]             | Management      |

!!! tip "Ownership Rules"

    1. Every system must have **one owner** (not a committee)
    2. The owner doesn't do everything – they make sure it gets done
    3. The builder and maintainer can be different people
    4. Schedule monthly reviews for each system

### Step 4 – Continued Learning Resources

#### YouTube Channels

| Channel           | Focus               | Level        |
| ----------------- | ------------------- | ------------ |
| n8n Official      | n8n tutorials       | Beginner     |
| Supabase Official | Database & backend  | Beginner     |
| Fireship          | Web dev, fast-paced | Intermediate |
| NetworkChuck      | IT infrastructure   | Beginner     |

#### Communities

| Community             | Platform             | Language |
| --------------------- | -------------------- | -------- |
| n8n Community         | community.n8n.io     | English  |
| Supabase Discord      | discord.supabase.com | English  |
| Claude Discord        | discord.gg/anthropic | English  |
| Israeli Tech Facebook | Various groups       | Hebrew   |

#### Practice

- **Daily habit**: Spend 15 minutes in Claude trying to solve a real problem
- **Weekly**: Build or improve one small tool
- **Monthly**: Review and update your roadmap
- **Quarterly**: Evaluate new tools and approaches

### Step 5 – Final Presentations

Each team presents:

1. **The Problem** – What manual process did you target?
2. **The Solution** – Demo your working prototype
3. **The Architecture** – How does it fit into Elcon's systems?
4. **Next Steps** – What would you add in the next iteration?
5. **Lessons Learned** – What worked, what didn't, what surprised you?

---

## Your Toolkit Summary

```
┌──────────────────────────────────────────────┐
│              Your AI Toolkit                  │
│                                               │
│  🧠 THINK          🛠️ BUILD         🔄 AUTOMATE │
│  Claude            Cursor           n8n       │
│                    Bolt.new                   │
│                    v0.dev                     │
│                                               │
│  💾 STORE          🚀 DEPLOY        🔒 SECURE  │
│  Supabase          Vercel           Auth      │
│  PostgreSQL        Coolify          RLS       │
│  GitHub                             Backups   │
└──────────────────────────────────────────────┘
```

---

## Summary

In this lab you:

- [x] Evaluated all current systems for replacement priority
- [x] Created a 3-phase implementation roadmap
- [x] Assigned ownership for each system
- [x] Identified learning resources for continued growth
- [x] Presented your project to the team
- [x] Left with a clear action plan for the next 6 months

---

!!! success "Congratulations! 🎉"

    You've completed the AI-Powered Business Systems training.
    You now have the knowledge and tools to transform Elcon's internal operations.

    Remember: **Start small, iterate fast, and don't be afraid to ask Claude for help.**
