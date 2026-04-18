# Lab 012 - Security & Best Practices

!!! hint "Overview"

    - In this lab, you will learn essential security practices for internal business applications.
    - You will add authentication to your apps using Supabase Auth.
    - You will understand backup strategies and data protection.
    - By the end of this lab, your applications will be properly secured for production use.

## Prerequisites

- Supabase project from earlier labs
- A deployed application

## What You Will Learn

- Why security matters even for internal tools
- User authentication with Supabase Auth
- Role-based access control
- Database security: Row Level Security (RLS)
- Backup strategies
- When to DIY vs. call a professional

---

## Background

## The Security Mindset

!!! danger "Common Misconception"

    "It's just an internal tool, security doesn't matter."

    **Wrong.** Internal tools often have access to sensitive data:
    supplier pricing, customer information, financial data.
    One compromised tool can expose your entire business.

## Security Layers

```
┌─────────────────────────────────────┐
│  Layer 1: Network                   │
│  (Firewall, VPN, internal-only)     │
├─────────────────────────────────────┤
│  Layer 2: Authentication            │
│  (Login, passwords, MFA)            │
├─────────────────────────────────────┤
│  Layer 3: Authorization             │
│  (Who can access what)              │
├─────────────────────────────────────┤
│  Layer 4: Data Protection           │
│  (Encryption, backups, audit logs)  │
├─────────────────────────────────────┤
│  Layer 5: Application Security      │
│  (Input validation, safe coding)    │
└─────────────────────────────────────┘
```

---

## Lab Steps

## Step 1 - Add Authentication with Supabase Auth

**Enable email authentication in Supabase:**

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Email is enabled by default
3. Optionally enable Google login for convenience

**Add login to your app - ask Claude:**

```
Add a login page to my app using Supabase Auth. Requirements:
- Email + password login form
- "Forgot password" functionality
- Store the session in the browser
- Redirect to login page if not authenticated
- Show current user's email in the header
- Add a logout button

Supabase URL: [your-url]
Supabase Anon Key: [your-key]

Use the Supabase JavaScript client for authentication.
```

## Step 2 - Role-Based Access Control

Not everyone should have the same access. Create a roles system:

```sql
-- Create a profiles table that extends auth.users
CREATE TABLE profiles (
    id      UUID REFERENCES auth.users(id) PRIMARY KEY,
    email   TEXT,
    role    TEXT DEFAULT 'viewer'
            CHECK (role IN ('admin', 'editor', 'viewer')),
    name    TEXT,
    department TEXT
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();
```

**Role permissions:**

| Action         | Admin | Editor | Viewer |
| -------------- | ----- | ------ | ------ |
| View data      | ✅    | ✅     | ✅     |
| Create records | ✅    | ✅     | ❌     |
| Edit records   | ✅    | ✅     | ❌     |
| Delete records | ✅    | ❌     | ❌     |
| Manage users   | ✅    | ❌     | ❌     |
| Export data    | ✅    | ✅     | ❌     |

## Step 3 - Row Level Security (RLS)

Supabase RLS ensures that even if someone bypasses your app, the database itself enforces access rules:

```sql
-- Enable RLS on the purchase_orders table
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

-- Policy: everyone can read
CREATE POLICY "Anyone can view orders" ON purchase_orders
    FOR SELECT
    USING (true);

-- Policy: only editors and admins can insert
CREATE POLICY "Editors can create orders" ON purchase_orders
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'editor')
        )
    );

-- Policy: only admins can delete
CREATE POLICY "Admins can delete orders" ON purchase_orders
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );
```

## Step 4 - Backup Strategy

!!! warning "The 3-2-1 Backup Rule"

    - **3** copies of your data
    - **2** different storage types
    - **1** offsite (off your server)

**Supabase backups:**

- Supabase Pro plans include daily backups
- Self-hosted: set up `pg_dump` on a cron schedule

**n8n backup workflow:**

```
Schedule (daily 2 AM) → Export Supabase tables → Save to cloud storage → Verify backup → Log result
```

**Git is your code backup:**

- Every commit is a snapshot
- GitHub stores your code offsite
- You can always revert to any previous version

## Step 5 - Security Checklist

Use this checklist for every app you deploy:

!!! note "Production Security Checklist"

    **Authentication:**

    - [ ] Login required for all pages
    - [ ] Passwords must be at least 8 characters
    - [ ] Session timeout after inactivity
    - [ ] HTTPS only (no HTTP)

    **Database:**

    - [ ] Row Level Security enabled on all tables
    - [ ] API keys are not hardcoded in public code
    - [ ] Database not directly accessible from internet
    - [ ] Regular backups configured and tested

    **Application:**

    - [ ] Input validation on all forms
    - [ ] No sensitive data in URL parameters
    - [ ] Error messages don't expose internal details
    - [ ] Audit log for important actions

    **Infrastructure:**

    - [ ] Server firewall configured
    - [ ] SSH key authentication (no password login)
    - [ ] Regular OS and software updates
    - [ ] Monitoring and alerting configured

---

## Summary

In this lab you:

- [x] Added user authentication to your app with Supabase Auth
- [x] Implemented role-based access control (admin/editor/viewer)
- [x] Configured Row Level Security on database tables
- [x] Designed a backup strategy
- [x] Worked through a production security checklist
