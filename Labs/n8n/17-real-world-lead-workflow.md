# 17 · Real-World Workflows: Lead Capture & Auto-Response System

> Build a complete production-ready workflow: capture leads from a web form, validate data, store in database, send personalized welcome emails, trigger follow-ups, and track engagement—using all n8n concepts combined.

---

## What you will build

A **lead capture → nurture → follow-up system** that:

1. **Receives form submissions** via webhook
2. **Validates and cleans data** (remove duplicates, format phone numbers)
3. **Saves to database** for CRM
4. **Sends instant welcome email** with customized content
5. **Triggers 3-day follow-up** workflow
6. **Tracks engagement** (email opens, link clicks)
7. **Handles errors** gracefully with notifications

**Real-world use:** Capture leads from your website → automatically nurture them → track which leads convert.

---

## Architecture overview

```
┌─────────────────────────────────────────────────────────────┐
│ WEBHOOK: Receive form submission                             │
│ POST /lead-capture { name, email, company, message }         │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│ VALIDATE & CLEAN                                             │
│ • Check email format                                         │
│ • Remove duplicates                                          │
│ • Format data                                                │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│ DATABASE: Store lead in PostgreSQL                           │
│ INSERT INTO leads (name, email, company, source, status)     │
│ ON CONFLICT (email) DO NOTHING;                              │
└────────┬────────────────────────────────────────────────────┘
         │
         ├──────────────┬──────────────┬──────────────┐
         ▼              ▼              ▼              ▼
    ┌────────┐    ┌──────────┐  ┌──────────┐  ┌────────────┐
    │ Send   │    │ Slack    │  │ Follow-  │  │ Error      │
    │ Welcome│    │ Notify   │  │ up Email │  │ Notify     │
    │ Email  │    │ Sales    │  │ at Day 3 │  │ Admin      │
    └────────┘    └──────────┘  └──────────┘  └────────────┘
```

---

## Prerequisites

- n8n running locally or hosted
- PostgreSQL database (or use existing DB)
- Gmail account for emails
- Slack account (optional, for sales notifications)
- ngrok or public webhook URL for testing

---

## Part 1: Set up the database

### Create leads table

```sql
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  company VARCHAR(255),
  phone VARCHAR(20),
  message TEXT,
  source VARCHAR(100) DEFAULT 'web_form',
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_email_sent_at TIMESTAMP,
  contacted_count INTEGER DEFAULT 0
);

CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
```

---

## Part 2: Webhook - receive form submission

### Workflow 1: Main lead capture flow

**Name:** "Lead Capture & Welcome Email"

**Step 1: Add HTTP Webhook Trigger**

```
Node type:      HTTP Webhook
Method:         POST
Path:           /lead-capture
Response mode:  Immediately (with data response)
```

**Expected input:**

```json
{
  "name": "John Doe",
  "email": "john@company.com",
  "company": "Acme Corp",
  "message": "I'm interested in your product"
}
```

---

## Part 3: Validate and clean data

### Step 2: Validate with Code node

```
Node type:      Code node
Input:          Webhook data
Output:         Validated lead object
```

**Code node:**

```javascript
const lead = items[0];

// Validation helper
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Validate required fields
if (!lead.name || !lead.email) {
  return [{
    valid: false,
    error: "Name and email are required"
  }];
}

// Validate email format
if (!isValidEmail(lead.email)) {
  return [{
    valid: false,
    error: "Invalid email format"
  }];
}

// Normalize data
const cleaned = {
  name: lead.name.trim(),
  email: lead.email.toLowerCase().trim(),
  company: (lead.company || "").trim() || null,
  message: (lead.message || "").trim(),
  phone: (lead.phone || "").replace(/\D/g, ""),  // Keep only digits
  timestamp: new Date().toISOString(),
};

return [{
  valid: true,
  ...cleaned
}];
```

### Step 3: Check for duplicates

**Node type:** PostgreSQL

```
Query:  SELECT COUNT(*) as count FROM leads WHERE email = $1;
Parameters: [{{ $json.email }}]
```

### Step 4: Branch on duplicate

**Node type:** IF

```
Condition:  $json.count > 0

YES branch: Skip saving, just respond (user already exists)
NO branch:  Continue to save
```

---

## Part 4: Save to database

### Step 5: Insert lead

**Node type:** PostgreSQL

```
Query:  INSERT INTO leads (name, email, company, phone, message, source)
        VALUES ($1, $2, $3, $4, $5, 'web_form')
        RETURNING id, email, name;

Parameters: [
  {{ $json.name }},
  {{ $json.email }},
  {{ $json.company }},
  {{ $json.phone }},
  {{ $json.message }}
]
```

**Output:**
```json
{ "id": 42, "email": "john@company.com", "name": "John Doe" }
```

---

## Part 5: Send welcome email

### Step 6: Send Gmail

**Node type:** Gmail

```
To:         {{ $json.email }}
Subject:    Welcome, {{ $json.name }}! Here's your next step
HTML:       <html>
              <body style="font-family: Arial; max-width: 600px; margin: 0 auto;">
                <h2>Hi {{ $json.name }},</h2>
                <p>Thanks for reaching out! We're excited to hear from {{ $json.company || "you" }}.</p>
                
                <p>Here's what happens next:</p>
                <ol>
                  <li><strong>Tomorrow:</strong> Our team reviews your message</li>
                  <li><strong>Day 2-3:</strong> We send you a personalized demo video</li>
                  <li><strong>Day 4:</strong> Schedule a call with our sales team</li>
                </ol>
                
                <p><a href="https://example.com/demo?leadId={{ $json.id }}" 
                      style="background: blue; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; border-radius: 5px;">
                   Start with a Quick Demo
                </a></p>
                
                <p>Questions before then? Reply to this email anytime.</p>
                
                <p>Best regards,<br/>
                The Team</p>
              </body>
            </html>
```

### Step 7: Update sent timestamp

**Node type:** PostgreSQL

```
Query:  UPDATE leads SET last_email_sent_at = CURRENT_TIMESTAMP WHERE id = $1;
Parameters: [{{ $json.id }}]
```

---

## Part 6: Notify sales team

### Step 8: Send Slack notification

**Node type:** Slack

```
Channel:    #sales-leads
Message:    "New lead: {{ $json.name }} from {{ $json.company }}
            Email: {{ $json.email }}
            Message: {{ $json.message }}"
```

Or email to sales@company.com:

**Node type:** Gmail

```
To:      sales@company.com
Subject: New Lead: {{ $json.name }} ({{ $json.company }})
Text:    Name: {{ $json.name }}
         Email: {{ $json.email }}
         Company: {{ $json.company }}
         Message: {{ $json.message }}
```

---

## Part 7: HTTP response

### Step 9: Respond to webhook

**Node type:** Respond to Webhook

```
Status Code:  200
Response:     { "success": true, "leadId": {{ $json.id }}, "message": "Welcome email sent!" }
```

---

## Part 8: Follow-up workflow (separate)

### Workflow 2: "3-Day Follow-up Email"

**Trigger:** Schedule (runs daily at 9 AM)

**Goal:** Find leads from 3 days ago, send follow-up email, mark as contacted.

### Step 1: Find leads to follow up

**Node type:** PostgreSQL

```
Query:  SELECT id, name, email FROM leads
        WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '3 days'
        AND status = 'new';
```

### Step 2: Loop through leads

**Node type:** Loop

```
Loops over results from PostgreSQL node
```

### Step 3: Send follow-up email (inside loop)

**Node type:** Gmail

```
To:      {{ $json.email }}
Subject: Your personalized demo is ready, {{ $json.name }}
HTML:    <html>
           <body>
             <h2>Hi {{ $json.name }},</h2>
             <p>Three days ago you asked about our product. We've prepared a personalized demo.</p>
             <p><a href="https://example.com/demo/personalized?leadId={{ $json.id }}">Watch 5-min Demo</a></p>
             <p>Still have questions? <a href="https://calendly.com/sales">Schedule a call</a></p>
           </body>
         </html>
```

### Step 4: Update contact count

**Node type:** PostgreSQL

```
Query:  UPDATE leads
        SET contacted_count = contacted_count + 1,
            last_email_sent_at = CURRENT_TIMESTAMP
        WHERE id = $1;
Parameters: [{{ $json.id }}]
```

---

## Part 9: Error handling

### Workflow 3: "Error Notifications"

**Trigger:** Error Trigger

```
When workflows above fail
```

**Steps:**

1. **Capture error details:**
   ```javascript
   return [{
     errorMessage: items[0].error.message,
     errorNode: items[0].error.nodeName,
     leadEmail: items[0].executionData?.webhook?.email || "unknown",
     timestamp: new Date().toISOString(),
   }];
   ```

2. **Send alert to admin:**
   ```
   Gmail to: admin@company.com
   Subject: Lead capture error on {{ $json.timestamp }}
   Text: {{ $json.errorMessage }} at node {{ $json.errorNode }}
   ```

3. **Log to database (optional):**
   ```sql
   INSERT INTO error_logs (error_message, error_node, created_at)
   VALUES ($1, $2, CURRENT_TIMESTAMP);
   ```

---

## Part 10: Dashboard query

### Track leads in database

**Query to check workflow success:**

```sql
-- New leads today
SELECT COUNT(*) FROM leads WHERE DATE(created_at) = CURRENT_DATE;

-- Leads by status
SELECT status, COUNT(*) FROM leads GROUP BY status;

-- Email conversion (opened welcome email)
SELECT 
  COUNT(DISTINCT id) as total_leads,
  COUNT(DISTINCT CASE WHEN last_email_sent_at IS NOT NULL THEN id END) as emailed,
  COUNT(DISTINCT CASE WHEN contacted_count > 1 THEN id END) as followed_up
FROM leads;
```

---

## Part 11: Testing the workflow

### Test form submission

1. Get your webhook URL from n8n:
   - Click HTTP Webhook node
   - Copy "Testing URL"
   - Or use ngrok if local: `ngrok http 5678`

2. Send test data:

```bash
curl -X POST http://localhost:5678/webhook/lead-capture \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@techcorp.com",
    "company": "Tech Corp",
    "message": "We need automation for our sales process"
  }'
```

3. Verify:
   - ✅ Lead saved to database
   - ✅ Welcome email received
   - ✅ Slack notification sent
   - ✅ HTTP response returned

### Monitor executions

1. Go to workflow
2. Click **Executions** (left sidebar)
3. Click latest execution to see full flow
4. Check each node's output

---

## Part 12: Production checklist

- [ ] **Database backup:** Set up automated PostgreSQL backups
- [ ] **Email reputation:** Warm up email sending gradually (start low, increase volume)
- [ ] **GDPR compliance:** Add unsubscribe link, store consent
- [ ] **Rate limiting:** Add delays between emails to avoid spam filters
- [ ] **Monitoring:** Set up alerts for workflow failures
- [ ] **Testing:** Test with invalid emails, duplicates, SQL edge cases
- [ ] **Documentation:** Document webhook schema for developers integrating the form

---

## Extension ideas

- **Lead scoring:** Add points for actions (form submit +10, email open +5, demo watch +20)
- **SMS follow-up:** Add Twilio node to text leads who don't open emails
- **Calendar integration:** Auto-create Calendly slots and send to hot leads
- **Salesforce sync:** Push leads to Salesforce CRM in real-time
- **Analytics:** Track lead source, conversion rate, time-to-response
- **A/B testing:** Send variant email subject lines, track which converts better
- **Feedback loop:** Reply-to-email triggers sentiment analysis → update lead status

---

## Key takeaways

- **Webhook + validation = reliable data entry**
- **Check for duplicates before insert** (prevents corruption)
- **Multi-step email nurture** beats single send
- **Error handling = production readiness**
- **Database + workflow logs = visibility**
- **Branch on conditions** to handle different scenarios

---

## Next steps

- Deploy this to production with proper error monitoring
- Add SMS as backup channel
- Build lead scoring based on engagement
- Create dashboard to visualize conversion funnel
- Combine with lesson 14 (databases) for advanced queries
