# Integration Tasks

- Hands-on exercises combining Claude Code + n8n + Supabase to build end-to-end business automations.
- Each task integrates multiple tools into a working system.
- Practice these tasks to master building complete business solutions for Elcon.

---

#### Table of Contents

- [01. Webhook Form Submission Pipeline](#01-webhook-form-submission-pipeline)
- [02. Supplier Onboarding Automation](#02-supplier-onboarding-automation)
- [03. PO Approval Workflow End-to-End](#03-po-approval-workflow-end-to-end)
- [04. Email-to-Database Pipeline](#04-email-to-database-pipeline)
- [05. Scheduled Dashboard Report](#05-scheduled-dashboard-report)
- [06. AI-Powered Data Entry](#06-ai-powered-data-entry)
- [07. CSV Import with Notification](#07-csv-import-with-notification)
- [08. Realtime Activity Feed](#08-realtime-activity-feed)
- [09. ERP Data Sync Bridge](#09-erp-data-sync-bridge)
- [10. Document OCR Pipeline](#10-document-ocr-pipeline)
- [11. Multi-Currency PO System](#11-multi-currency-po-system)
- [12. Supplier Performance Scorecard](#12-supplier-performance-scorecard)
- [13. Inventory Alert System](#13-inventory-alert-system)
- [14. Customer Portal API Gateway](#14-customer-portal-api-gateway)
- [15. Complete Business Process: Quote-to-Cash](#15-complete-business-process-quote-to-cash)

---

#### 01. Webhook Form Submission Pipeline

- Build a complete pipeline: Next.js form → n8n webhook → validate → Supabase insert → confirmation email.

#### Scenario:

- A public contact form on Elcon's website sends data through n8n for processing before storing.

Hint: Frontend form POSTs to n8n webhook URL. n8n validates, inserts to Supabase, sends confirmation email.

??? success "Solution"

    **Frontend (Claude Code):**
    ```bash
    claude "Create a contact form component that POSTs to an n8n webhook URL
    (from env var). Fields: name, email, company, message.
    Show loading spinner, success toast, error handling."
    ```

    **n8n Workflow:**
    1. **Webhook**: POST `/contact/submit`
    2. **Code**: Validate (name, email required, email format)
    3. **IF**: Valid?
       - Yes: Supabase insert → Send email confirmation → Respond 200
       - No: Respond 400 with errors

    **Database (Claude Code):**
    ```bash
    claude "Create a contact_submissions table in Supabase with
    name, email, company, message, status, created_at"
    ```

---

#### 02. Supplier Onboarding Automation

- Build the full supplier onboarding flow: form submission → AI enrichment → database creation → welcome email → task assignment.

#### Scenario:

- When a new supplier is registered, the system automatically researches them, creates all records, and assigns follow-up tasks.

Hint: Combine all three tools: Claude Code for UI/DB, n8n for orchestration, AI for enrichment.

??? success "Solution"

    **Step 1 - Frontend (Claude Code):**
    ```bash
    claude "Create a supplier onboarding form with: company name, website,
    primary contact (name, email, phone), product categories (multi-select),
    expected annual volume. Submit to n8n webhook."
    ```

    **Step 2 - n8n Workflow:**
    1. **Webhook**: Receive form data
    2. **Code**: Validate all fields
    3. **AI Agent (Claude)**: "Research this company. Given their name and website,
       determine: industry, company size, key products, geographic presence.
       Return JSON."
    4. **Supabase**: Insert supplier with enriched data
    5. **Supabase**: Create primary contact record
    6. **Supabase**: Assign categories
    7. **Supabase**: Create activity "Review new supplier" due in 3 days
    8. **Email**: Welcome email to supplier contact
    9. **Email**: Notify procurement team of new supplier
    10. **Respond**: Return supplier ID and status

---

#### 03. PO Approval Workflow End-to-End

- Build the complete PO lifecycle: create in app → route for approval (n8n) → email notification → update status.

#### Scenario:

- When a user creates a PO in the app, it must go through approval based on amount thresholds.

Hint: Frontend creates PO in Supabase → Supabase trigger calls n8n → n8n routes based on amount → approval link in email → callback updates status.

??? success "Solution"

    **Database (Claude Code):**
    ```bash
    claude "Create purchase_orders and po_line_items tables. Add a
    database function that calls an n8n webhook when a PO is created
    (using pg_net extension)."
    ```

    **n8n Workflow:**
    1. **Webhook**: Triggered by Supabase on PO creation
    2. **Switch** on amount: <$1K auto-approve, $1K-$10K manager, >$10K director
    3. Auto-approve path: Update status → Email requester
    4. Manager path: Email manager with approve/reject links (webhook URLs with token)
    5. **Approval webhook**: Receives approve/reject → Update PO status → Notify requester

    **Frontend (Claude Code):**
    ```bash
    claude "Create a PO creation page with line items (add/remove rows),
    auto-calculate totals, and a PO list page showing status badges.
    Use Supabase Realtime to update status in real-time."
    ```

---

#### 04. Email-to-Database Pipeline

- Build a system that monitors an inbox, extracts data from emails using AI, and stores structured records.

#### Scenario:

- Suppliers send quotes via email. The system automatically extracts pricing data and stores it.

Hint: n8n Email Trigger → AI extraction → Supabase insert → Frontend displays extracted quotes.

??? success "Solution"

    **n8n Workflow:**
    1. **Email Trigger (IMAP)**: Watch inbox for new emails
    2. **IF**: Subject contains "quote" or "price" or "proposal"
    3. **AI Agent (Claude)**: Extract from email body:
       ```
       { supplier_name, items: [{part_number, description, unit_price, currency, moq}],
         valid_until, payment_terms }
       ```
    4. **Supabase**: Insert into `supplier_quotes` table
    5. **Supabase**: Link to existing supplier (match by email domain)
    6. **Email**: Auto-reply "Quote received, reference #QR-XXXX"
    7. **Notification Hub**: Alert procurement team

    **Frontend (Claude Code):**
    ```bash
    claude "Create a quotes list page showing AI-extracted quotes.
    Each row shows: supplier, items count, total value, valid until, status.
    Click to see full extracted data with option to create PO from quote."
    ```

---

#### 05. Scheduled Dashboard Report

- Build a system that generates weekly analytics, creates a PDF report, and emails it to management.

#### Scenario:

- Every Friday at 5 PM, management receives a comprehensive procurement report.

Hint: n8n Schedule → Supabase queries → AI analysis → HTML report → PDF → Email.

??? success "Solution"

    **n8n Workflow:**
    1. **Schedule**: Friday 5 PM
    2. **Supabase** (multiple queries in parallel):
       - Week's PO count and total value
       - Overdue deliveries
       - Top 5 suppliers by volume
       - Category spending breakdown
       - New suppliers this week
    3. **Merge**: Combine all data
    4. **AI Agent**: Generate executive summary and recommendations
    5. **Code**: Build HTML report with tables and inline charts
    6. **HTTP Request**: Convert HTML to PDF (using PDF API)
    7. **Email**: Send to management distribution list with PDF attachment
    8. **Supabase**: Log report generation to `reports` table

    **Frontend (Claude Code):**
    ```bash
    claude "Create a reports page that lists past generated reports
    from the reports table. Each row links to download the PDF from
    Supabase Storage."
    ```

---

#### 06. AI-Powered Data Entry

- Build a system where users paste or dictate raw text and AI extracts structured data for the form.

#### Scenario:

- Instead of filling 10 form fields manually, paste a business card scan or email signature and let AI fill the form.

Hint: Frontend sends raw text to n8n → AI extracts fields → return structured data → auto-fill form.

??? success "Solution"

    **Frontend (Claude Code):**
    ```bash
    claude "Add an 'AI Fill' button to the supplier form. It opens a
    dialog with a textarea. User pastes raw text (business card, email sig, etc.).
    On submit, send to n8n webhook. When response comes back, auto-populate
    all matching form fields. Show a diff of what was filled."
    ```

    **n8n Workflow:**
    1. **Webhook**: POST `/ai/extract-contact`
    2. **AI Agent**: Extract { name, email, phone, company, position, address, website }
    3. **Code**: Validate and clean extracted data
    4. **Respond to Webhook**: Return structured JSON

---

#### 07. CSV Import with Notification

- Build a complete CSV import pipeline: upload in UI → process in n8n → validate → import → notify user.

#### Scenario:

- Users upload CSV files of suppliers. The system processes them in the background and notifies when done.

Hint: Frontend uploads file → n8n processes → Supabase inserts → n8n notifies user via Supabase Realtime.

??? success "Solution"

    **Frontend:** File upload component that POSTs CSV to n8n webhook.

    **n8n:**
    1. Webhook receives file → Parse CSV → Validate each row
    2. Batch insert valid rows → Generate error CSV for invalid rows
    3. Upload error CSV to Supabase Storage
    4. Insert import report to `import_logs` table
    5. Notify user (email + Supabase Realtime)

    **Frontend:** Import history page showing past imports with download links for error files.

---

#### 08. Realtime Activity Feed

- Build a live activity feed that shows all system events in real-time.

#### Scenario:

- When anyone creates a supplier, approves a PO, or completes a task, all users see it instantly.

Hint: All n8n workflows log events to an `activity_feed` table. Frontend subscribes via Supabase Realtime.

??? success "Solution"

    **Database:**
    ```sql
    CREATE TABLE activity_feed (
        id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id    UUID REFERENCES auth.users(id),
        action     TEXT NOT NULL, -- 'created_supplier', 'approved_po', etc.
        entity     TEXT NOT NULL, -- 'supplier', 'purchase_order', etc.
        entity_id  UUID,
        details    JSONB,
        created_at TIMESTAMPTZ DEFAULT now()
    );
    ALTER PUBLICATION supabase_realtime ADD TABLE activity_feed;
    ```

    **n8n:** Every workflow adds a step to insert into `activity_feed`.

    **Frontend:** Sidebar widget with Supabase Realtime subscription showing live events.

---

#### 09. ERP Data Sync Bridge

- Build a bridge between Elcon's ERP (Hashavshevet) and Supabase using n8n as middleware.

#### Scenario:

- ERP data needs to be accessible in the modern web app. n8n syncs data on a schedule.

Hint: n8n Schedule → HTTP Request to ERP API → Transform data → Supabase upsert → Log sync.

??? success "Solution"

    **n8n Workflow:**
    1. **Schedule**: Every 2 hours
    2. **HTTP Request**: GET from Hashavshevet API (items, customers, transactions)
    3. **Code**: Transform ERP data format to Supabase schema
    4. **Supabase**: Upsert records (match on ERP ID)
    5. **Code**: Compare and detect changes
    6. **Supabase**: Log sync results (new, updated, errors)
    7. **IF**: Errors > threshold → Alert admin

    **Frontend (Claude Code):**
    ```bash
    claude "Create an ERP sync status page showing: last sync time,
    records synced, errors, and a 'Sync Now' button that triggers
    the n8n workflow via webhook."
    ```

---

#### 10. Document OCR Pipeline

- Build a system that scans uploaded documents (delivery notes, invoices) using AI vision and stores extracted data.

#### Scenario:

- Paper delivery notes are photographed and uploaded. AI reads them and updates PO status automatically.

Hint: Frontend uploads image → n8n sends to Claude Vision API → Extract data → Match to PO → Update status.

??? success "Solution"

    **Frontend:** Upload component that accepts images/PDFs.

    **n8n:**
    1. Webhook receives image
    2. AI Agent (Claude Vision): "Extract from this delivery note: PO number, date, items received (part, qty)"
    3. Supabase: Find matching PO
    4. Supabase: Update PO status, record quantities received
    5. IF: All items received → Mark PO complete
    6. Notification: Alert procurement of delivery

    **Frontend:** Delivery tracking page showing PO status with received quantities.

---

#### 11. Multi-Currency PO System

- Build a PO system that handles multiple currencies with live exchange rate conversion.

#### Scenario:

- Elcon orders from suppliers worldwide. POs are in the supplier's currency but need ILS totals.

Hint: n8n fetches daily rates → Supabase stores rates → Frontend shows dual-currency totals.

??? success "Solution"

    **n8n:** Daily workflow fetching exchange rates → Supabase `exchange_rates` table.

    **Claude Code:**
    ```bash
    claude "Create a PO form where:
    - Supplier currency is auto-selected based on supplier country
    - Line items are entered in supplier currency
    - Real-time conversion to ILS shown alongside
    - Exchange rate pulled from exchange_rates table
    - Both currencies stored on the PO record"
    ```

---

#### 12. Supplier Performance Scorecard

- Build an automated supplier scoring system that combines delivery data, quality ratings, and AI analysis.

#### Scenario:

- Every quarter, suppliers are scored automatically. Low-scoring suppliers trigger review workflows.

Hint: n8n Schedule → Calculate scores → AI analysis → Store → Notify for low scores.

??? success "Solution"

    **n8n Quarterly Workflow:**
    1. Get all active suppliers
    2. For each: Calculate delivery score, quality score, price competitiveness
    3. AI Agent: Analyze trends and generate recommendation
    4. Supabase: Store scorecard results
    5. IF score < 60: Create "Review supplier" task → Email procurement manager

    **Frontend:** Scorecard dashboard showing all suppliers with visual scorecards and historical trends.

---

#### 13. Inventory Alert System

- Build a system that monitors inventory levels and triggers reorder workflows automatically.

#### Scenario:

- When stock drops below minimum level, automatically create a PO draft and alert procurement.

Hint: n8n checks inventory levels hourly → IF below minimum → Create draft PO → Notify.

??? success "Solution"

    **n8n Workflow:**
    1. **Schedule**: Hourly
    2. **Supabase**: Query items where `quantity <= reorder_point`
    3. **Code**: For each, determine preferred supplier and standard order quantity
    4. **Supabase**: Create draft PO
    5. **Email**: Alert procurement with list of items needing reorder
    6. **Supabase**: Log alert to prevent duplicate notifications

    **Frontend:** Inventory dashboard with visual stock levels (green/yellow/red).

---

#### 14. Customer Portal API Gateway

- Build an API gateway using n8n webhooks that serves as the backend for a customer-facing portal.

#### Scenario:

- Elcon's customers need a portal to check order status. n8n provides the API layer.

Hint: Multiple n8n webhook endpoints provide a REST API consumed by a separate customer frontend.

??? success "Solution"

    **n8n API Endpoints:**
    - `GET /portal/orders?customer_id=XXX` → List customer's orders
    - `GET /portal/orders/:id` → Order detail with line items and tracking
    - `POST /portal/support` → Create support ticket
    - `GET /portal/invoices` → List invoices with download links

    Each endpoint: Authenticate (API key) → Query Supabase → Return filtered data (customer sees only their own records).

    **Frontend (Claude Code):**
    ```bash
    claude "Create a simple customer portal with: login, order list,
    order detail with tracking timeline, support ticket form.
    Use the n8n webhook API endpoints."
    ```

---

#### 15. Complete Business Process: Quote-to-Cash

- Build the entire business process: receive quote → create PO → track delivery → receive goods → process invoice → payment.

#### Scenario:

- This is the ultimate integration task. Every step involves Frontend + n8n + Supabase working together.

Hint: Each stage is a separate workflow connected by database events and webhooks.

??? success "Solution"

    **Stage 1: Quote** (Frontend form → Supabase)
    - Supplier sends quote → User enters in system → Store in `quotes` table

    **Stage 2: PO Creation** (Frontend → n8n approval)
    - User selects quote → Creates PO → n8n routes for approval → Status updates via Realtime

    **Stage 3: Order** (n8n → External API)
    - Approved PO → n8n sends to supplier API/email → Track acknowledgment

    **Stage 4: Delivery** (n8n + AI)
    - Delivery note uploaded → AI OCR extracts data → Match to PO → Update received quantities

    **Stage 5: Invoice** (n8n + AI)
    - Invoice received → AI extracts amount → 3-way match (PO vs Delivery vs Invoice)
    - Match OK → Approve for payment
    - Mismatch → Flag for review → Notify accounting

    **Stage 6: Payment** (n8n)
    - Approved invoice → Schedule payment based on payment terms
    - n8n reminder: Payment due in 3 days → Notify accounting
    - After payment: Update status → Email supplier confirmation

    **Dashboard:** Visual pipeline showing all POs at each stage with counts and values.
