# Lab 006 – ERP Integration (Hashavshevet)

!!! hint "Overview"

    - In this lab, you will understand how to safely connect to Elcon's Hashavshevet ERP database.
    - You will learn the architecture for read-only access to ERP data.
    - You will build a simple dashboard that reads data from a database (simulated).
    - By the end of this lab, you will understand the path from "ERP data in SQL Server" to "beautiful dashboards in the browser."

## Prerequisites

- Completed Labs 004-005
- Understanding of Supabase basics
- Access to Hashavshevet database information (provided by IT)

## What You Will Learn

- Understanding Hashavshevet's database structure (SQL Server)
- Read-only access patterns: why and how
- Building dashboards on top of ERP data
- API middleware approaches
- Security: why you never expose your ERP directly

---

## Background

### The Dream

> "My dream is to give access to these systems to my server where the ERP database sits,
> and then I could do beautiful things."

This is achievable with the right architecture.

### The Architecture

```
Hashavshevet          Middleware              Frontend
(SQL Server)          (n8n / API)             (Your Apps)
┌──────────┐     ┌───────────────┐     ┌──────────────┐
│  ERP DB  │────▶│ Read-Only     │────▶│  Dashboards  │
│ (tables, │     │ API Layer     │     │  Reports     │
│  views)  │     │ (n8n or       │     │  Custom Apps │
│          │     │  Node.js)     │     │              │
└──────────┘     └───────────────┘     └──────────────┘
                       │
                 Security Layer:
                 - Read-only user
                 - Specific tables only
                 - Rate limiting
                 - Internal network only
```

!!! danger "Critical Security Rules"

    1. **NEVER** expose the ERP database directly to the internet
    2. **ALWAYS** use a read-only database user (no INSERT/UPDATE/DELETE)
    3. **LIMIT** access to specific tables and views only
    4. **KEEP** the middleware on the same internal network as the ERP
    5. **LOG** all access for audit purposes

---

## Lab Steps

### Step 1 – Understand the Hashavshevet Database

Hashavshevet uses Microsoft SQL Server. Common tables you might want to access:

| Table/View   | Contains                    | Use Case            |
| ------------ | --------------------------- | ------------------- |
| Customers    | Customer information        | Customer dashboards |
| Suppliers    | Supplier information        | Supplier analytics  |
| Invoices     | Sales and purchase invoices | Financial reports   |
| Items        | Product/part catalog        | Inventory lookups   |
| Transactions | Financial transactions      | Cash flow analysis  |
| Documents    | Delivery notes, receipts    | Document tracking   |

!!! warning "Check with Your Accountant"

    The exact table names and structure depend on your Hashavshevet version
    and configuration. Always verify with your accountant or IT team.

### Step 2 – Set Up a Read-Only User (Conceptual)

When connecting to the real ERP, you'll need a dedicated read-only user:

```sql
-- Run this on the SQL Server (by your DBA/IT person)
CREATE LOGIN elcon_readonly WITH PASSWORD = 'secure_password_here';
CREATE USER elcon_readonly FOR LOGIN elcon_readonly;

-- Grant read-only access to specific tables
GRANT SELECT ON dbo.Customers TO elcon_readonly;
GRANT SELECT ON dbo.Suppliers TO elcon_readonly;
GRANT SELECT ON dbo.Invoices TO elcon_readonly;
GRANT SELECT ON dbo.Items TO elcon_readonly;

-- Optionally create views for common queries
CREATE VIEW vw_MonthlyRevenue AS
SELECT
    YEAR(InvoiceDate) as Year,
    MONTH(InvoiceDate) as Month,
    SUM(TotalAmount) as Revenue
FROM dbo.Invoices
WHERE InvoiceType = 'Sales'
GROUP BY YEAR(InvoiceDate), MONTH(InvoiceDate);

GRANT SELECT ON dbo.vw_MonthlyRevenue TO elcon_readonly;
```

### Step 3 – Build a Simulated ERP Dashboard

Since we can't connect to the real ERP in class, we'll simulate the data in Supabase:

```sql
-- Create an ERP-like structure in Supabase
CREATE TABLE erp_customers (
    id          SERIAL PRIMARY KEY,
    customer_code TEXT UNIQUE,
    name        TEXT NOT NULL,
    city        TEXT,
    phone       TEXT,
    balance     DECIMAL(12,2) DEFAULT 0,
    last_order  DATE
);

CREATE TABLE erp_invoices (
    id          SERIAL PRIMARY KEY,
    invoice_number TEXT UNIQUE,
    customer_id INTEGER REFERENCES erp_customers(id),
    invoice_date DATE,
    total_amount DECIMAL(12,2),
    status      TEXT CHECK (status IN ('Draft','Sent','Paid','Overdue'))
);

-- Insert sample data
INSERT INTO erp_customers (customer_code, name, city, phone, balance, last_order)
VALUES
    ('C001', 'Israel Electric Corp', 'Haifa', '04-8123456', 150000.00, '2026-04-01'),
    ('C002', 'Mekorot Water Co', 'Tel Aviv', '03-9234567', 85000.00, '2026-03-28'),
    ('C003', 'Dead Sea Works', 'Beer Sheva', '08-6345678', 220000.00, '2026-04-10'),
    ('C004', 'Haifa Chemicals', 'Haifa', '04-8456789', 95000.00, '2026-02-15'),
    ('C005', 'Teva Pharmaceutical', 'Petah Tikva', '03-9567890', 180000.00, '2026-04-05');
```

Now ask Claude to build a dashboard:

```
Build an ERP Dashboard that connects to Supabase and shows:
1. KPI cards: total customers, total revenue, overdue invoices, average balance
2. Revenue chart by month (bar chart)
3. Customer table with balance, last order, and status indicators
4. Invoice list with filtering by status and date range
5. Top 10 customers by revenue

Use the Supabase JavaScript client. My tables are erp_customers and erp_invoices.
Supabase URL: [your-url]
Supabase Anon Key: [your-key]
```

### Step 4 – The n8n Middleware Approach

In production, n8n will serve as the middleware between the ERP and your apps:

```
ERP (SQL Server) ──▶ n8n (scheduled query) ──▶ Supabase (mirror tables) ──▶ Your Apps
```

This approach:

- Keeps the ERP isolated and secure
- Copies only the data you need
- Runs on a schedule (e.g., every hour)
- Can transform data along the way

!!! info "We'll Build This in Lab 008"

    In the n8n labs, we'll create the actual workflow that syncs data from
    a database to Supabase on a schedule.

---

## Summary

In this lab you:

- [x] Understood the architecture for safely connecting to Hashavshevet ERP
- [x] Learned the critical security rules for ERP integration
- [x] Created simulated ERP tables in Supabase
- [x] Built a dashboard reading from database tables
- [x] Understood the n8n middleware approach for production
