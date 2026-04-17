# Lab 002 – Prompt Engineering for Business Systems

!!! hint "Overview"

    - In this lab, you will learn how to write effective prompts that produce useful business applications.
    - You will practice the structured prompt format: role, context, task, constraints, output format.
    - You will iterate on prompts to refine outputs and learn common mistakes to avoid.
    - By the end of this lab, you will be able to describe any Elcon business need to Claude and get a working prototype.

## Prerequisites

- Claude account (from Lab 001)
- A real Elcon business problem in mind

## What You Will Learn

- How to structure prompts for maximum effectiveness
- Iterative development: start simple, add features in rounds
- Common mistakes and how to avoid them
- The difference between one-shot and conversational prompting

---

## Background

### Why Prompt Engineering Matters

The difference between a mediocre AI output and an excellent one is almost always **the quality of the prompt**. A well-structured prompt can save hours of back-and-forth.

### The RCTCO Framework

| Component       | What It Does                                  | Example                                                  |
| --------------- | --------------------------------------------- | -------------------------------------------------------- |
| **R**ole        | Tell the AI who it should be                  | "You are a senior full-stack developer"                  |
| **C**ontext     | Provide background about your company/problem | "Elcon has 200 suppliers, orders managed in Excel..."    |
| **T**ask        | What exactly should the AI produce            | "Build a web app for managing purchase orders"           |
| **C**onstraints | Limitations and requirements                  | "Must work offline, use Hebrew interface, simple to use" |
| **O**utput      | What format do you want                       | "Generate a single HTML file with embedded CSS and JS"   |

---

## Lab Steps

### Step 1 – Bad Prompt vs. Good Prompt

Try this **bad prompt** in Claude:

```
Make me an app for managing orders
```

Now try this **good prompt**:

```
Role: You are a senior full-stack developer building internal business tools.

Context: I work at Elcon, an instrumentation and control company in Israel.
We have 200 active suppliers. Every week, our procurement team creates purchase
orders in Excel. Each order has: supplier name, part number, description,
quantity, unit price, total price, expected delivery date, and status
(draft / sent / confirmed / received).

Task: Build a web-based Purchase Order Management system with the following features:
1. A dashboard showing all active orders grouped by status
2. A form to create new purchase orders
3. Ability to filter and search by supplier, date range, or status
4. Export to Excel functionality
5. Simple statistics: total orders this month, total value, average delivery time

Constraints:
- Single HTML file with embedded CSS and JavaScript
- Use LocalStorage for data persistence (no backend needed for now)
- Clean, modern UI with a professional look
- Support for Hebrew text (RTL) in data fields
- Mobile-friendly responsive design

Output: Generate the complete HTML file with all CSS and JavaScript embedded.
```

!!! success "Compare the Results"

    Notice how the structured prompt produces a dramatically better, more complete, and more relevant application.

### Step 2 – Iterative Development

Start with a minimal prompt and build up through conversation:

**Round 1 – Core functionality:**

```
Build a simple supplier management table. I need: supplier name, contact person,
email, phone, and category. Use a single HTML file with LocalStorage.
```

**Round 2 – Add features:**

```
Great! Now add:
- A search/filter bar at the top
- The ability to edit existing suppliers inline
- Color coding by category
```

**Round 3 – Polish:**

```
Now add:
- Import from CSV functionality
- Export to Excel
- A counter showing total suppliers and breakdown by category
```

!!! tip "The Power of Iteration"

    Building in rounds is often faster than trying to describe everything at once.
    Each round gives you a working version you can test and refine.

### Step 3 – Common Prompt Patterns for Business Apps

Practice these common patterns:

#### Pattern: Dashboard

```
Build a dashboard that shows:
- [KPI cards at the top: total X, total Y, average Z]
- [A table with the main data, sortable and filterable]
- [A chart showing trends over time]
Data should be stored in LocalStorage with sample data pre-loaded.
```

#### Pattern: Form + List

```
Build a [thing] management tool with:
- A form to add new [things] with fields: [field1, field2, field3]
- A list/table showing all [things] with edit and delete buttons
- Search and filter functionality
- Export to CSV
```

#### Pattern: Process Tracker

```
Build a [process name] tracker where items move through stages:
[Stage 1] → [Stage 2] → [Stage 3] → [Stage 4]
Show a Kanban board view and a table view.
Include date tracking for when each item entered each stage.
```

### Step 4 – Hands-On: Build Your Prototype

Choose one of these real Elcon use cases and build it with Claude:

1. **Drawing Management Lookup** – Search and browse technical drawings by customer, project, or drawing number
2. **Supplier Order Tracker** – Track purchase orders through their lifecycle with status updates
3. **Delivery Note Scanner Interface** – Upload an image, display extracted data, match to a PO

!!! note "Workshop Instructions"

    1. Write your prompt using the RCTCO framework
    2. Submit to Claude and review the output
    3. Iterate at least 3 times to add features and fix issues
    4. Save the final HTML file and test it in your browser
    5. Share your prompt and results with the group

---

## Common Mistakes to Avoid

| Mistake                        | Why It's Bad                    | Fix                                      |
| ------------------------------ | ------------------------------- | ---------------------------------------- |
| Too vague                      | AI guesses and gets it wrong    | Be specific about fields, features, UI   |
| Too much at once               | AI gets confused, misses things | Build in rounds                          |
| No context                     | AI doesn't know your business   | Always explain your company and use case |
| No constraints                 | AI picks random tech stack      | Specify: single file, no framework, etc. |
| Not testing between iterations | Errors compound                 | Test each round before adding features   |

---

## Summary

In this lab you:

- [x] Learned the RCTCO prompt framework (Role, Context, Task, Constraints, Output)
- [x] Compared bad vs. good prompts and saw the dramatic difference
- [x] Practiced iterative development through conversation
- [x] Used common prompt patterns for dashboards, forms, and trackers
- [x] Built a prototype for a real Elcon business need
