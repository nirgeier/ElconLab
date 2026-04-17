# Supabase & Database Tasks

- Hands-on Supabase and PostgreSQL exercises covering table design, SQL queries, Row Level Security, Edge Functions, Realtime, storage, and migrations.
- Each task includes a clear scenario, helpful hints, and detailed solutions with explanations.
- Practice these tasks to master the database layer for Elcon's business applications.

---

#### Table of Contents

- [01. Create Your First Table](#01-create-your-first-table)
- [02. Define Relationships (Foreign Keys)](#02-define-relationships-foreign-keys)
- [03. Insert and Query Data](#03-insert-and-query-data)
- [04. Aggregate Queries](#04-aggregate-queries)
- [05. JOIN Multiple Tables](#05-join-multiple-tables)
- [06. Subqueries and CTEs](#06-subqueries-and-ctes)
- [07. Indexes for Performance](#07-indexes-for-performance)
- [08. Views for Complex Queries](#08-views-for-complex-queries)
- [09. Row Level Security: Basic](#09-row-level-security-basic)
- [10. Row Level Security: Role-Based](#10-row-level-security-role-based)
- [11. Database Functions (PL/pgSQL)](#11-database-functions-plpgsql)
- [12. Triggers: Auto-Update Timestamps](#12-triggers-auto-update-timestamps)
- [13. Triggers: Audit Trail](#13-triggers-audit-trail)
- [14. Edge Function: CRUD API](#14-edge-function-crud-api)
- [15. Edge Function: Complex Calculation](#15-edge-function-complex-calculation)
- [16. Realtime Subscriptions](#16-realtime-subscriptions)
- [17. Storage: File Upload](#17-storage-file-upload)
- [18. Migrations: Schema Changes](#18-migrations-schema-changes)
- [19. Seed Data Script](#19-seed-data-script)
- [20. Backup and Restore Strategy](#20-backup-and-restore-strategy)

---

#### 01. Create Your First Table

- Create a `suppliers` table in Supabase with proper column types, constraints, and defaults.

#### Scenario:

- You're starting the supplier management module. The table must handle real-world data with proper validation at the database level.

Hint: Use `UUID` for primary key, `TIMESTAMPTZ` for dates, `CHECK` constraints for valid values, and `NOT NULL` for required fields.

??? success "Solution"

    ```sql
    CREATE TABLE suppliers (
        id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name        TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
        email       TEXT UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
        phone       TEXT,
        country     TEXT NOT NULL DEFAULT 'IL',
        address     TEXT,
        website     TEXT,
        payment_terms TEXT DEFAULT 'Net 30'
                    CHECK (payment_terms IN ('Prepaid', 'Net 15', 'Net 30', 'Net 60', 'Net 90')),
        rating      INTEGER CHECK (rating BETWEEN 1 AND 5),
        is_active   BOOLEAN DEFAULT true,
        notes       TEXT,
        created_at  TIMESTAMPTZ DEFAULT now(),
        updated_at  TIMESTAMPTZ DEFAULT now()
    );

    COMMENT ON TABLE suppliers IS 'Elcon supplier directory';
    COMMENT ON COLUMN suppliers.rating IS 'Supplier quality rating 1-5 stars';
    ```

---

#### 02. Define Relationships (Foreign Keys)

- Create a `contacts` table linked to `suppliers` and a `supplier_categories` many-to-many relationship.

#### Scenario:

- Each supplier has multiple contacts, and suppliers can belong to multiple categories (Sensors, Mechanical, Electrical, etc.).

Hint: Use foreign keys with `ON DELETE` actions, and a junction table for many-to-many.

??? success "Solution"

    ```sql
    -- Contacts belong to a supplier
    CREATE TABLE contacts (
        id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        supplier_id  UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
        first_name   TEXT NOT NULL,
        last_name    TEXT NOT NULL,
        email        TEXT,
        phone        TEXT,
        position     TEXT,
        is_primary   BOOLEAN DEFAULT false,
        created_at   TIMESTAMPTZ DEFAULT now()
    );

    -- Categories
    CREATE TABLE categories (
        id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name        TEXT NOT NULL UNIQUE,
        description TEXT
    );

    -- Many-to-many junction
    CREATE TABLE supplier_categories (
        supplier_id  UUID REFERENCES suppliers(id) ON DELETE CASCADE,
        category_id  UUID REFERENCES categories(id) ON DELETE CASCADE,
        PRIMARY KEY (supplier_id, category_id)
    );

    -- Ensure only one primary contact per supplier
    CREATE UNIQUE INDEX idx_one_primary_contact
        ON contacts (supplier_id) WHERE is_primary = true;
    ```

---

#### 03. Insert and Query Data

- Insert 10 supplier records and write queries to: list all, filter by country, search by name, and sort by rating.

#### Scenario:

- The database is set up. Now practice the fundamental CRUD operations.

Hint: Use `INSERT INTO ... VALUES`, `WHERE`, `ILIKE` for search, `ORDER BY`.

??? success "Solution"

    ```sql
    -- Insert sample data
    INSERT INTO suppliers (name, email, country, payment_terms, rating) VALUES
    ('TechSensors Ltd',   'info@techsensors.com',   'US', 'Net 30', 5),
    ('MechSupply GmbH',   'sales@mechsupply.de',    'DE', 'Net 60', 4),
    ('SensorWorld',        'contact@sensorworld.cn', 'CN', 'Prepaid', 3),
    ('FlowDynamics Inc',   'hello@flowdyn.com',      'US', 'Net 30', 4),
    ('PrecisionTools IL',  'info@precisiontools.il', 'IL', 'Net 30', 5),
    ('EuroParts SARL',     'order@europarts.fr',     'FR', 'Net 60', 3),
    ('AsiaComponents',     'buy@asiacomp.jp',        'JP', 'Net 90', 4),
    ('ControlSys UK',      'sales@controlsys.co.uk', 'GB', 'Net 30', 5),
    ('ValveMaster',        'info@valvemaster.it',    'IT', 'Net 30', 2),
    ('InstruTech Israel',  'sales@instrutech.co.il', 'IL', 'Net 15', 4);

    -- List all active suppliers
    SELECT * FROM suppliers WHERE is_active = true;

    -- Filter by country
    SELECT name, email, rating FROM suppliers WHERE country = 'IL';

    -- Search by name (case-insensitive)
    SELECT * FROM suppliers WHERE name ILIKE '%sensor%';

    -- Sort by rating descending
    SELECT name, country, rating FROM suppliers ORDER BY rating DESC, name ASC;
    ```

---

#### 04. Aggregate Queries

- Write queries using COUNT, AVG, SUM, GROUP BY to analyze supplier data.

#### Scenario:

- Management wants summary statistics: how many suppliers per country, average rating, etc.

Hint: Use `GROUP BY` with aggregate functions, `HAVING` for post-group filtering.

??? success "Solution"

    ```sql
    -- Count suppliers per country
    SELECT country, COUNT(*) as supplier_count
    FROM suppliers WHERE is_active = true
    GROUP BY country ORDER BY supplier_count DESC;

    -- Average rating per country
    SELECT country, ROUND(AVG(rating), 1) as avg_rating, COUNT(*) as count
    FROM suppliers WHERE rating IS NOT NULL
    GROUP BY country HAVING COUNT(*) >= 2
    ORDER BY avg_rating DESC;

    -- Suppliers by payment terms
    SELECT payment_terms, COUNT(*) as count,
           ROUND(AVG(rating), 1) as avg_rating
    FROM suppliers GROUP BY payment_terms;

    -- Countries with average rating below 4
    SELECT country, ROUND(AVG(rating), 1) as avg_rating
    FROM suppliers GROUP BY country
    HAVING AVG(rating) < 4;
    ```

---

#### 05. JOIN Multiple Tables

- Write queries that JOIN suppliers with contacts and categories to get comprehensive views.

#### Scenario:

- A single query needs to show a supplier, their primary contact, and all categories.

Hint: Use LEFT JOIN to include suppliers even without contacts, and `string_agg` to combine categories.

??? success "Solution"

    ```sql
    -- Supplier with primary contact
    SELECT s.name as supplier, s.email, s.rating,
           c.first_name || ' ' || c.last_name as primary_contact,
           c.phone as contact_phone
    FROM suppliers s
    LEFT JOIN contacts c ON c.supplier_id = s.id AND c.is_primary = true
    WHERE s.is_active = true
    ORDER BY s.name;

    -- Supplier with all categories
    SELECT s.name, s.country,
           string_agg(cat.name, ', ' ORDER BY cat.name) as categories
    FROM suppliers s
    LEFT JOIN supplier_categories sc ON sc.supplier_id = s.id
    LEFT JOIN categories cat ON cat.id = sc.category_id
    WHERE s.is_active = true
    GROUP BY s.id, s.name, s.country
    ORDER BY s.name;

    -- Full supplier card (name, contact, categories, contact count)
    SELECT s.name, s.country, s.rating,
           COUNT(DISTINCT c.id) as contact_count,
           string_agg(DISTINCT cat.name, ', ') as categories
    FROM suppliers s
    LEFT JOIN contacts c ON c.supplier_id = s.id
    LEFT JOIN supplier_categories sc ON sc.supplier_id = s.id
    LEFT JOIN categories cat ON cat.id = sc.category_id
    WHERE s.is_active = true
    GROUP BY s.id, s.name, s.country, s.rating;
    ```

---

#### 06. Subqueries and CTEs

- Write advanced queries using Common Table Expressions (CTEs) and subqueries for complex analytics.

#### Scenario:

- Find suppliers with above-average ratings who have more contacts than the median.

Hint: Use `WITH` for CTEs, subqueries in `WHERE` clauses.

??? success "Solution"

    ```sql
    -- CTE: Supplier summary with ranking
    WITH supplier_stats AS (
        SELECT s.id, s.name, s.rating,
               COUNT(c.id) as contact_count,
               RANK() OVER (ORDER BY s.rating DESC) as rating_rank
        FROM suppliers s
        LEFT JOIN contacts c ON c.supplier_id = s.id
        WHERE s.is_active = true
        GROUP BY s.id, s.name, s.rating
    ),
    averages AS (
        SELECT AVG(rating) as avg_rating,
               AVG(contact_count) as avg_contacts
        FROM supplier_stats
    )
    SELECT ss.name, ss.rating, ss.contact_count, ss.rating_rank
    FROM supplier_stats ss, averages a
    WHERE ss.rating > a.avg_rating
      AND ss.contact_count > a.avg_contacts
    ORDER BY ss.rating_rank;

    -- Subquery: Suppliers with no orders in the last 6 months
    SELECT name, email
    FROM suppliers
    WHERE id NOT IN (
        SELECT DISTINCT supplier_id
        FROM purchase_orders
        WHERE order_date > CURRENT_DATE - INTERVAL '6 months'
    )
    AND is_active = true;
    ```

---

#### 07. Indexes for Performance

- Create appropriate indexes for common query patterns on the supplier tables.

#### Scenario:

- As data grows to 10,000+ rows, queries slow down. Indexes dramatically improve performance.

Hint: Index columns used in WHERE, JOIN, and ORDER BY. Use partial indexes for filtered queries.

??? success "Solution"

    ```sql
    -- B-tree index on frequently filtered columns
    CREATE INDEX idx_suppliers_country ON suppliers(country);
    CREATE INDEX idx_suppliers_rating ON suppliers(rating) WHERE is_active = true;
    CREATE INDEX idx_suppliers_active ON suppliers(is_active);

    -- Composite index for common filter + sort
    CREATE INDEX idx_suppliers_country_rating
        ON suppliers(country, rating DESC) WHERE is_active = true;

    -- Text search index for name search
    CREATE INDEX idx_suppliers_name_search
        ON suppliers USING gin(to_tsvector('english', name));

    -- Foreign key indexes (critical for JOIN performance)
    CREATE INDEX idx_contacts_supplier ON contacts(supplier_id);
    CREATE INDEX idx_supplier_categories_supplier ON supplier_categories(supplier_id);
    CREATE INDEX idx_supplier_categories_category ON supplier_categories(category_id);

    -- Verify indexes are being used
    EXPLAIN ANALYZE SELECT * FROM suppliers WHERE country = 'IL' AND is_active = true;
    ```

---

#### 08. Views for Complex Queries

- Create database views that simplify complex queries for the application layer.

#### Scenario:

- The application needs a "supplier card" view that combines data from 3 tables. A view hides the complexity.

Hint: Use `CREATE VIEW` to encapsulate JOINs and aggregations.

??? success "Solution"

    ```sql
    -- Supplier card view
    CREATE VIEW v_supplier_cards AS
    SELECT s.id, s.name, s.email, s.phone, s.country, s.rating,
           s.payment_terms, s.is_active,
           pc.first_name || ' ' || pc.last_name as primary_contact,
           pc.email as primary_contact_email,
           COUNT(DISTINCT c.id) as total_contacts,
           string_agg(DISTINCT cat.name, ', ' ORDER BY cat.name) as categories,
           s.created_at
    FROM suppliers s
    LEFT JOIN contacts pc ON pc.supplier_id = s.id AND pc.is_primary = true
    LEFT JOIN contacts c ON c.supplier_id = s.id
    LEFT JOIN supplier_categories sc ON sc.supplier_id = s.id
    LEFT JOIN categories cat ON cat.id = sc.category_id
    GROUP BY s.id, s.name, s.email, s.phone, s.country, s.rating,
             s.payment_terms, s.is_active, pc.first_name, pc.last_name,
             pc.email, s.created_at;

    -- Usage
    SELECT * FROM v_supplier_cards WHERE is_active = true AND rating >= 4;
    ```

---

#### 09. Row Level Security: Basic

- Enable RLS on the suppliers table so users can only see records they created.

#### Scenario:

- Multiple users access the same table. Each user should only see their own data.

Hint: Enable RLS, create policies using `auth.uid()`.

??? success "Solution"

    ```sql
    -- Add created_by column
    ALTER TABLE suppliers ADD COLUMN created_by UUID REFERENCES auth.users(id);

    -- Enable RLS
    ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

    -- Policy: Users see their own records
    CREATE POLICY "Users see own suppliers"
        ON suppliers FOR SELECT
        USING (created_by = auth.uid());

    -- Policy: Users create with their own ID
    CREATE POLICY "Users create own suppliers"
        ON suppliers FOR INSERT
        WITH CHECK (created_by = auth.uid());

    -- Policy: Users update their own
    CREATE POLICY "Users update own suppliers"
        ON suppliers FOR UPDATE
        USING (created_by = auth.uid())
        WITH CHECK (created_by = auth.uid());

    -- Policy: Users soft-delete their own
    CREATE POLICY "Users delete own suppliers"
        ON suppliers FOR DELETE
        USING (created_by = auth.uid());
    ```

---

#### 10. Row Level Security: Role-Based

- Implement role-based access: admins see everything, managers see their department, users see their own.

#### Scenario:

- Elcon has different access levels. The database must enforce this regardless of which app accesses it.

Hint: Use a `user_roles` table and reference it in RLS policies.

??? success "Solution"

    ```sql
    -- Role table
    CREATE TABLE user_roles (
        user_id    UUID PRIMARY KEY REFERENCES auth.users(id),
        role       TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'user')),
        department TEXT
    );

    -- Function to get current user's role
    CREATE FUNCTION auth.user_role() RETURNS TEXT AS $$
        SELECT role FROM user_roles WHERE user_id = auth.uid();
    $$ LANGUAGE sql SECURITY DEFINER STABLE;

    -- RLS policy with role check
    CREATE POLICY "Role-based supplier access"
        ON suppliers FOR SELECT
        USING (
            auth.user_role() = 'admin'
            OR (auth.user_role() = 'manager'
                AND department = (SELECT department FROM user_roles WHERE user_id = auth.uid()))
            OR created_by = auth.uid()
        );
    ```

---

#### 11. Database Functions (PL/pgSQL)

- Create a database function that calculates a supplier's performance score based on multiple metrics.

#### Scenario:

- The performance score combines delivery rate, quality rating, and price competitiveness into a single number.

Hint: Use `CREATE FUNCTION` with PL/pgSQL, accept a supplier ID, query multiple tables, return a score.

??? success "Solution"

    ```sql
    CREATE OR REPLACE FUNCTION calculate_supplier_score(p_supplier_id UUID)
    RETURNS JSONB AS $$
    DECLARE
        v_delivery_score NUMERIC;
        v_quality_score NUMERIC;
        v_total_score NUMERIC;
        v_result JSONB;
    BEGIN
        -- Delivery score: on-time delivery percentage
        SELECT COALESCE(
            ROUND(COUNT(*) FILTER (WHERE actual_delivery <= expected_delivery)::NUMERIC
                  / NULLIF(COUNT(*), 0) * 100, 1), 0)
        INTO v_delivery_score
        FROM purchase_orders
        WHERE supplier_id = p_supplier_id AND status = 'Delivered';

        -- Quality score: average rating × 20
        SELECT COALESCE(ROUND(AVG(rating) * 20, 1), 50)
        INTO v_quality_score
        FROM suppliers WHERE id = p_supplier_id;

        -- Weighted total: delivery 60%, quality 40%
        v_total_score := ROUND(v_delivery_score * 0.6 + v_quality_score * 0.4, 1);

        v_result := jsonb_build_object(
            'supplier_id', p_supplier_id,
            'delivery_score', v_delivery_score,
            'quality_score', v_quality_score,
            'total_score', v_total_score,
            'calculated_at', now()
        );

        RETURN v_result;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Usage
    SELECT calculate_supplier_score('some-uuid-here');
    ```

---

#### 12. Triggers: Auto-Update Timestamps

- Create a trigger that automatically updates the `updated_at` column on every row change.

#### Scenario:

- Every table needs an accurate `updated_at` timestamp for sync and auditing.

Hint: Create a reusable trigger function, then attach it to each table.

??? success "Solution"

    ```sql
    -- Reusable trigger function
    CREATE OR REPLACE FUNCTION update_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = now();
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Attach to suppliers table
    CREATE TRIGGER trg_suppliers_updated_at
        BEFORE UPDATE ON suppliers
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();

    -- Attach to contacts table
    CREATE TRIGGER trg_contacts_updated_at
        BEFORE UPDATE ON contacts
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();

    -- Test: update a supplier, check updated_at changed
    UPDATE suppliers SET rating = 5 WHERE name = 'TechSensors Ltd';
    SELECT name, updated_at FROM suppliers WHERE name = 'TechSensors Ltd';
    ```

---

#### 13. Triggers: Audit Trail

- Create an audit log that tracks all changes (INSERT, UPDATE, DELETE) to the suppliers table.

#### Scenario:

- Compliance requires a record of who changed what and when. The audit trail must be tamper-proof.

Hint: Create an `audit_log` table and a trigger that logs old and new values as JSONB.

??? success "Solution"

    ```sql
    CREATE TABLE audit_log (
        id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        table_name  TEXT NOT NULL,
        record_id   UUID NOT NULL,
        action      TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
        old_data    JSONB,
        new_data    JSONB,
        changed_by  UUID DEFAULT auth.uid(),
        changed_at  TIMESTAMPTZ DEFAULT now()
    );

    CREATE OR REPLACE FUNCTION audit_trigger()
    RETURNS TRIGGER AS $$
    BEGIN
        IF TG_OP = 'INSERT' THEN
            INSERT INTO audit_log (table_name, record_id, action, new_data)
            VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW));
        ELSIF TG_OP = 'UPDATE' THEN
            INSERT INTO audit_log (table_name, record_id, action, old_data, new_data)
            VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
        ELSIF TG_OP = 'DELETE' THEN
            INSERT INTO audit_log (table_name, record_id, action, old_data)
            VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD));
        END IF;
        RETURN COALESCE(NEW, OLD);
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    CREATE TRIGGER trg_suppliers_audit
        AFTER INSERT OR UPDATE OR DELETE ON suppliers
        FOR EACH ROW EXECUTE FUNCTION audit_trigger();
    ```

---

#### 14. Edge Function: CRUD API

- Create a Supabase Edge Function that provides a REST API for suppliers with proper validation.

#### Scenario:

- Your frontend needs server-side validation and complex logic that can't be done with direct Supabase calls.

Hint: Edge Functions run Deno. Handle GET/POST/PATCH/DELETE in a single function using the request method.

??? success "Solution"

    ```typescript
    // supabase/functions/suppliers/index.ts
    import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

    Deno.serve(async (req) => {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      )

      const url = new URL(req.url)
      const method = req.method

      if (method === 'GET') {
        const page = parseInt(url.searchParams.get('page') || '1')
        const limit = parseInt(url.searchParams.get('limit') || '20')
        const offset = (page - 1) * limit

        const { data, count, error } = await supabase
          .from('suppliers')
          .select('*', { count: 'exact' })
          .eq('is_active', true)
          .range(offset, offset + limit - 1)
          .order('name')

        return Response.json({ data, meta: { total: count, page, limit } })
      }

      if (method === 'POST') {
        const body = await req.json()
        if (!body.name || !body.email) {
          return Response.json(
            { error: 'name and email are required' },
            { status: 400 }
          )
        }
        const { data, error } = await supabase
          .from('suppliers').insert(body).select().single()
        return Response.json({ data }, { status: 201 })
      }

      return Response.json({ error: 'Method not allowed' }, { status: 405 })
    })
    ```

---

#### 15. Edge Function: Complex Calculation

- Create an Edge Function that generates a procurement KPI dashboard with aggregated metrics.

#### Scenario:

- The dashboard needs server-side calculations that are too complex for client-side Supabase queries.

Hint: Use raw SQL via `supabase.rpc()` or multiple queries combined in the function.

??? success "Solution"

    ```typescript
    // supabase/functions/dashboard-kpi/index.ts
    Deno.serve(async (req) => {
      const supabase = createClient(/* ... */)
      const { month } = await req.json() // e.g., "2026-04"

      const { data: orders } = await supabase.rpc('get_monthly_kpis', { p_month: month })

      // The SQL function does the heavy lifting:
      // total_orders, total_value, avg_value, on_time_rate,
      // top_suppliers, category_breakdown, month_over_month

      return Response.json({ data: orders })
    })
    ```

    **Supporting SQL function:**
    ```sql
    CREATE FUNCTION get_monthly_kpis(p_month TEXT)
    RETURNS JSONB AS $$
    -- Complex aggregation logic here
    $$ LANGUAGE plpgsql;
    ```

---

#### 16. Realtime Subscriptions

- Set up Supabase Realtime to listen for changes to the suppliers table and display live updates.

#### Scenario:

- When one user adds a supplier, all other users should see it appear in real-time.

Hint: Enable Realtime on the table in Supabase dashboard, then subscribe in the frontend.

??? success "Solution"

    ```sql
    -- Enable realtime (via Supabase dashboard or SQL)
    ALTER PUBLICATION supabase_realtime ADD TABLE suppliers;
    ```

    ```typescript
    // Frontend subscription
    const channel = supabase
      .channel('suppliers-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'suppliers' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // Add to list
          } else if (payload.eventType === 'UPDATE') {
            // Update in list
          } else if (payload.eventType === 'DELETE') {
            // Remove from list
          }
        }
      )
      .subscribe()
    ```

---

#### 17. Storage: File Upload

- Set up a Supabase Storage bucket for supplier documents (contracts, certifications) with access policies.

#### Scenario:

- Suppliers send contracts and certificates. These need to be stored securely and linked to supplier records.

Hint: Create a storage bucket, set up RLS policies, and create an upload function.

??? success "Solution"

    ```sql
    -- Create storage bucket
    INSERT INTO storage.buckets (id, name, public) VALUES ('supplier-docs', 'supplier-docs', false);

    -- Storage policy: authenticated users can upload to their supplier folder
    CREATE POLICY "Upload supplier docs"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'supplier-docs' AND auth.uid() IS NOT NULL);

    -- Storage policy: read own uploads
    CREATE POLICY "Read supplier docs"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'supplier-docs' AND auth.uid() IS NOT NULL);
    ```

    ```typescript
    // Upload file
    const { data, error } = await supabase.storage
      .from('supplier-docs')
      .upload(`${supplierId}/${file.name}`, file)
    ```

---

#### 18. Migrations: Schema Changes

- Create a migration that adds a `lead_score` column, a `tags` JSONB column, and updates existing data.

#### Scenario:

- The schema needs to evolve. Migrations track changes and ensure all environments stay in sync.

Hint: Use Supabase CLI migrations or write UP/DOWN SQL scripts.

??? success "Solution"

    ```sql
    -- UP migration: 20260417_add_lead_score_and_tags.sql
    ALTER TABLE suppliers ADD COLUMN lead_score INTEGER DEFAULT 0 CHECK (lead_score BETWEEN 0 AND 100);
    ALTER TABLE suppliers ADD COLUMN tags JSONB DEFAULT '[]'::jsonb;

    COMMENT ON COLUMN suppliers.lead_score IS 'AI-calculated lead quality score 0-100';
    COMMENT ON COLUMN suppliers.tags IS 'Flexible tags array: ["preferred", "local", "certified"]';

    -- Backfill existing data
    UPDATE suppliers SET lead_score = rating * 20 WHERE rating IS NOT NULL;
    UPDATE suppliers SET tags = '["existing"]'::jsonb;

    -- DOWN migration (rollback)
    ALTER TABLE suppliers DROP COLUMN IF EXISTS lead_score;
    ALTER TABLE suppliers DROP COLUMN IF EXISTS tags;
    ```

---

#### 19. Seed Data Script

- Create a comprehensive seed script that populates all tables with realistic Elcon test data.

#### Scenario:

- Development and testing need realistic data. A seed script ensures everyone works with the same dataset.

Hint: Use INSERT statements with realistic data that covers edge cases (missing fields, special characters, various countries).

??? success "Solution"

    ```sql
    -- Seed script: seed.sql
    -- Run with: psql $DATABASE_URL -f seed.sql

    -- Clear existing data (development only!)
    TRUNCATE suppliers, contacts, categories, supplier_categories CASCADE;

    -- Categories
    INSERT INTO categories (name, description) VALUES
    ('Sensors',     'Temperature, pressure, flow sensors'),
    ('Mechanical',  'Valves, actuators, fittings'),
    ('Electrical',  'Panels, wiring, controllers'),
    ('Calibration', 'Calibration equipment and services'),
    ('Safety',      'Safety systems and instrumentation');

    -- Suppliers (20 records with variety)
    INSERT INTO suppliers (name, email, country, payment_terms, rating, notes) VALUES
    ('TechSensors Ltd',    'info@techsensors.com',    'US', 'Net 30', 5, 'Preferred supplier'),
    ('MechSupply GmbH',    'sales@mechsupply.de',     'DE', 'Net 60', 4, NULL),
    ('SensorWorld Co.',    'buy@sensorworld.cn',      'CN', 'Prepaid', 3, 'Long lead times'),
    -- ... (add 17 more)
    ;

    -- Contacts (2-3 per supplier)
    -- ... (generate contacts for each supplier)
    ```

---

#### 20. Backup and Restore Strategy

- Document and implement a backup strategy for the Supabase database with automated testing.

#### Scenario:

- Production data must be backed up daily. You need to verify backups work by testing restores.

Hint: Use `pg_dump` for backups, automate with cron or n8n, test restores on a separate database.

??? success "Solution"

    ```bash
    # Backup script: backup.sh
    #!/bin/bash
    DATE=$(date +%Y%m%d_%H%M%S)
    BACKUP_DIR="/backups/supabase"
    DB_URL="postgresql://postgres:password@db.project.supabase.co:5432/postgres"

    # Create compressed backup
    pg_dump "$DB_URL" --format=custom --file="$BACKUP_DIR/backup_$DATE.dump"

    # Keep only last 30 days
    find "$BACKUP_DIR" -name "*.dump" -mtime +30 -delete

    # Verify backup is valid
    pg_restore --list "$BACKUP_DIR/backup_$DATE.dump" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
      echo "Backup verified: backup_$DATE.dump"
    else
      echo "BACKUP VERIFICATION FAILED" | mail -s "Backup Alert" admin@elcon.co.il
    fi
    ```

    **n8n workflow for automated backup monitoring:**
    1. Schedule: Daily 3 AM
    2. Execute Command: Run backup script
    3. IF: Check exit code
    4. Email: Alert on failure
