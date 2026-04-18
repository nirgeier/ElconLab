# Lab 004 - Database Fundamentals with Supabase

!!! hint "Overview"

    - In this lab, you will learn the basics of databases and why they matter for real business applications.
    - You will set up a Supabase project - a free managed PostgreSQL database with a user-friendly UI.
    - You will create tables, insert data, and connect your Claude-built app to a real database.
    - By the end of this lab, your application will store data in the cloud instead of LocalStorage.

## Prerequisites

- Supabase account (from Lab 001)
- A working Claude-built app from Lab 003
- Browser

## What You Will Learn

- The difference between LocalStorage and a real database
- Database basics: tables, rows, columns, relationships
- Setting up Supabase and creating your first tables
- Connecting a web app to Supabase
- Basic SQL queries

---

## Background

## Why Move Beyond LocalStorage?

| Feature        | LocalStorage                  | Supabase (PostgreSQL)         |
| -------------- | ----------------------------- | ----------------------------- |
| Data size      | ~5 MB per domain              | Unlimited (500 MB free tier)  |
| Multi-user     | No - each browser is separate | Yes - shared database         |
| Data safety    | Lost if browser cleared       | Cloud-backed, persistent      |
| Search         | Manual JavaScript filtering   | SQL queries, full-text search |
| API access     | None                          | Auto-generated REST & GraphQL |
| Authentication | None                          | Built-in user management      |

## What Is Supabase?

Supabase is an open-source alternative to Firebase that gives you:

- **PostgreSQL database** with a visual table editor
- **Auto-generated APIs** (REST + GraphQL) from your tables
- **Authentication** (email, Google, GitHub login)
- **Storage** for files (images, PDFs, documents)
- **Realtime** subscriptions (live updates)
- **Free tier** that is generous enough for internal tools

---

## Lab Steps

## Step 1 - Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Settings:
   - Name: `elcon-apps`
   - Database Password: (save this somewhere safe!)
   - Region: Choose the closest (e.g., Frankfurt for Israel)
4. Wait for the project to be created (~2 minutes)

## Step 2 - Create Your First Table

Go to the **Table Editor** in the left sidebar and create a `suppliers` table:

| Column Name    | Type        | Default           | Notes                         |
| -------------- | ----------- | ----------------- | ----------------------------- |
| id             | uuid        | gen_random_uuid() | Primary key (auto)            |
| created_at     | timestamptz | now()             | Auto timestamp                |
| name           | text        |                   | Supplier company name         |
| contact_person | text        |                   | Primary contact name          |
| email          | text        |                   | Contact email                 |
| phone          | text        |                   | Contact phone                 |
| category       | text        |                   | e.g., Electronics, Mechanical |
| country        | text        |                   | Supplier country              |
| is_active      | boolean     | true              | Active/inactive flag          |

!!! tip "Using the SQL Editor"

    Alternatively, go to the **SQL Editor** and run:

    ```sql
    CREATE TABLE suppliers (
        id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at  TIMESTAMPTZ DEFAULT now(),
        name        TEXT NOT NULL,
        contact_person TEXT,
        email       TEXT,
        phone       TEXT,
        category    TEXT,
        country     TEXT,
        is_active   BOOLEAN DEFAULT true
    );

    -- Insert sample data
    INSERT INTO suppliers (name, contact_person, email, phone, category, country)
    VALUES
        ('TechParts Ltd', 'John Smith', 'john@techparts.com', '+1-555-0101', 'Electronics', 'USA'),
        ('MechSupply GmbH', 'Hans Mueller', 'hans@mechsupply.de', '+49-555-0202', 'Mechanical', 'Germany'),
        ('SensorWorld', 'Li Wei', 'li@sensorworld.cn', '+86-555-0303', 'Sensors', 'China'),
        ('ValveTech Israel', 'Moshe Cohen', 'moshe@valvetech.co.il', '+972-555-0404', 'Valves', 'Israel'),
        ('CablePro UK', 'James Brown', 'james@cablepro.co.uk', '+44-555-0505', 'Cables', 'UK');
    ```

## Step 3 - Create a Purchase Orders Table

```sql
CREATE TABLE purchase_orders (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at      TIMESTAMPTZ DEFAULT now(),
    po_number       TEXT NOT NULL UNIQUE,
    supplier_id     UUID REFERENCES suppliers(id),
    order_date      DATE DEFAULT CURRENT_DATE,
    expected_delivery DATE,
    status          TEXT DEFAULT 'Draft'
                    CHECK (status IN ('Draft','Sent','Confirmed','Shipped','Received','Cancelled')),
    total_value     DECIMAL(12,2) DEFAULT 0,
    currency        TEXT DEFAULT 'USD' CHECK (currency IN ('USD','EUR','ILS')),
    notes           TEXT
);

CREATE TABLE po_line_items (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    po_id           UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
    part_number     TEXT NOT NULL,
    description     TEXT,
    quantity        INTEGER NOT NULL DEFAULT 1,
    unit_price      DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_price     DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);
```

## Step 4 - Connect Your App to Supabase

Get your Supabase credentials:

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy the **Project URL** and **anon/public key**

Now ask Claude to update your app:

```
I want to connect my Import Management app to Supabase instead of LocalStorage.

Here are my Supabase credentials:
- URL: https://xxxxx.supabase.co
- Anon Key: eyJhbGci...

My tables are:
- suppliers (id, name, contact_person, email, phone, category, country, is_active)
- purchase_orders (id, po_number, supplier_id, order_date, expected_delivery, status, total_value, currency, notes)
- po_line_items (id, po_id, part_number, description, quantity, unit_price, total_price)

Update the app to:
1. Use the Supabase JavaScript client (@supabase/supabase-js via CDN)
2. Load data from Supabase on page load
3. Save new records to Supabase
4. Update existing records in Supabase
5. Keep the same UI and features
```

## Step 5 - Explore the Supabase Dashboard

Supabase comes with powerful built-in tools:

- **Table Editor** - Visual spreadsheet-like interface for viewing/editing data
- **SQL Editor** - Write and run SQL queries directly
- **API Docs** - Auto-generated documentation for your tables
- **Logs** - See all API requests to debug issues
- **Authentication** - Set up user accounts (we'll use this in Lab 012)

!!! note "Practice SQL Queries"

    Go to the SQL Editor and try these queries:

    ```sql
    -- Count orders by status
    SELECT status, COUNT(*) as count
    FROM purchase_orders
    GROUP BY status;

    -- Find overdue orders
    SELECT po_number, expected_delivery, status
    FROM purchase_orders
    WHERE expected_delivery < CURRENT_DATE
    AND status NOT IN ('Received', 'Cancelled');

    -- Top suppliers by order value
    SELECT s.name, SUM(po.total_value) as total
    FROM purchase_orders po
    JOIN suppliers s ON po.supplier_id = s.id
    GROUP BY s.name
    ORDER BY total DESC;
    ```

---

## Summary

In this lab you:

- [x] Understood why a real database is better than LocalStorage for business apps
- [x] Set up a Supabase project with PostgreSQL database
- [x] Created tables for suppliers and purchase orders
- [x] Connected your Claude-built app to Supabase
- [x] Ran SQL queries to analyze data
- [x] Explored the Supabase dashboard tools
