# Lab 003 – Building Applications with Claude

!!! hint "Overview"

    - In this lab, you will rebuild the Import Management System that was originally created in 4 hours with Claude.
    - You will understand what Claude actually generates: HTML, CSS, JavaScript, and how they fit together.
    - You will learn to use Claude Projects and Artifacts for maintaining context across conversations.
    - By the end of this lab, you will have a fully working business application and understand its structure.

## Prerequisites

- Claude account (Pro recommended)
- Completed Lab 002 (Prompt Engineering)
- Browser (Chrome/Edge)

## What You Will Learn

- Step-by-step process of building a real business app with Claude
- Understanding HTML, CSS, and JavaScript at a high level
- Using Claude Projects to maintain context
- Using Claude Artifacts to preview and iterate
- File structure and architecture basics

---

## Background

### The Import Management Success Story

Elcon's procurement team manages 200+ suppliers with weekly purchase orders – all in Excel. In just 4 hours with Claude, a fully functional Import Management System was created. This lab recreates that process step-by-step so you understand every part.

### What Does Claude Generate?

When you ask Claude to build a web app, it typically generates three types of code:

| Technology     | What It Does                          | Analogy                         |
| -------------- | ------------------------------------- | ------------------------------- |
| **HTML**       | The structure and content of the page | The skeleton of a building      |
| **CSS**        | The styling and visual appearance     | The paint, furniture, decor     |
| **JavaScript** | The behavior and interactivity        | The electrical system, plumbing |

For simple internal tools, all three can live in a **single HTML file** – no server needed.

---

## Lab Steps

### Step 1 – Set Up a Claude Project

1. Go to [claude.ai](https://claude.ai)
2. Click **Projects** in the left sidebar
3. Create a new project called **"Elcon Import Management"**
4. Add these instructions to the project:

   ```
   You are helping Elcon, an instrumentation and control company in Israel,
   build internal business tools. Elcon has 200+ active suppliers and manages
   all purchase orders manually. Applications should be:
   - Single HTML files with embedded CSS and JavaScript
   - Clean, modern, professional UI
   - LocalStorage for data persistence
   - Support Hebrew text in data fields (RTL where needed)
   - Mobile-friendly and responsive
   ```

!!! tip "Why Projects?"

    Claude Projects remember your context across conversations. You don't need to
    re-explain who Elcon is every time you start a new chat.

### Step 2 – Build the Import Management System

In your project, start a new conversation. Use this prompt:

```
Build an Import Management System for Elcon with the following requirements:

CORE DATA MODEL:
- Purchase Order (PO): PO number (auto-generated), supplier name, order date,
  expected delivery date, status (Draft/Sent/Confirmed/Shipped/Received/Cancelled),
  total value, notes
- Line Items: part number, description, quantity, unit price, currency (USD/EUR/ILS),
  total price

VIEWS:
1. Dashboard: KPI cards (total POs, total value, pending deliveries, overdue orders),
   recent activity list
2. PO List: sortable/filterable table with all POs, color-coded by status
3. PO Detail/Edit: form to create or edit a PO with line items
4. Supplier Directory: list of all suppliers with contact info and order history

FEATURES:
- Search across all fields
- Filter by status, supplier, date range
- Export to CSV
- Import suppliers from CSV
- Status timeline showing when each PO changed status
- Overdue alerts (highlight POs past expected delivery date)
- Simple charts: orders by month, orders by supplier, orders by status

Generate a single HTML file with all CSS and JavaScript embedded.
Include realistic sample data for 10 suppliers and 20 purchase orders.
```

### Step 3 – Test and Iterate

1. Copy the generated HTML into a file called `import-management.html`
2. Open it in your browser
3. Test every feature – click buttons, add data, search, filter

For each issue you find, go back to Claude and describe it:

```
The system works great! A few changes needed:
1. The date picker should default to today's date
2. The export CSV is missing the supplier contact info
3. Add a "duplicate PO" button that copies an existing PO as a new draft
4. The status colors should be: Draft=gray, Sent=blue, Confirmed=green,
   Shipped=orange, Received=dark-green, Cancelled=red
```

### Step 4 – Understand the Code Structure

Ask Claude to explain the code:

```
Can you give me a high-level overview of the code you generated?
Explain the main sections (HTML structure, CSS styling, JavaScript functions)
in simple terms that a non-developer can understand.
Use a table format to list the main functions and what they do.
```

!!! info "You Don't Need to Understand Every Line"

    The goal is to understand the **structure** well enough to:

    - Know which section to point Claude at when something is wrong
    - Be able to make simple text changes yourself (labels, colors)
    - Understand what's possible and what requires a different approach

### Step 5 – Using Artifacts

When Claude generates code, it appears as an **Artifact** – a preview panel on the right side of the screen.

Things you can do with Artifacts:

- **Preview** – See the app running directly in Claude
- **Copy** – Copy the full code to save as an HTML file
- **Remix** – Ask Claude to modify the Artifact
- **Publish** – Share a link (Claude Pro feature)

!!! warning "Artifact Limitations"

    - Artifacts preview may not support all JavaScript features
    - LocalStorage may not persist in the Artifact preview
    - Always test the final version in a real browser

### Step 6 – Extend the System

Now that you have the base system, add these advanced features one at a time:

**Round 1 – Notifications:**

```
Add a notification system: when a PO is overdue (past expected delivery date
and not in Received/Cancelled status), show a red badge on the dashboard
and a notification bell icon in the top-right corner.
```

**Round 2 – Multi-currency:**

```
Add multi-currency support: each line item can be in USD, EUR, or ILS.
Show the total in each currency and also a combined total in ILS using
fixed exchange rates (1 USD = 3.7 ILS, 1 EUR = 4.0 ILS).
```

**Round 3 – Print-friendly:**

```
Add a "Print PO" button that opens a clean, print-friendly version
of a specific purchase order – suitable for sending to a supplier
(include Elcon logo placeholder, PO details, line items table,
and space for signature).
```

---

## Hands-On Workshop

Each participant should:

1. Choose a different Elcon business need (not Import Management)
2. Create a Claude Project with relevant context
3. Write a detailed prompt using the RCTCO framework
4. Build the prototype through iterative conversation
5. Present the working app to the group

**Suggested projects:**

- Drawing Management Lookup Tool
- Supplier Rating & Evaluation System
- Delivery Schedule Calendar
- Inventory Tracking Dashboard
- Meeting Notes & Action Items Tracker

---

## Summary

In this lab you:

- [x] Set up a Claude Project with Elcon-specific context
- [x] Built a complete Import Management System step-by-step
- [x] Tested, iterated, and extended the application
- [x] Understood the HTML/CSS/JavaScript structure at a high level
- [x] Used Claude Artifacts for previewing and iterating
- [x] Built your own prototype for a real Elcon business need
