# 15 · Email Workflows: Send, Receive, and Templates

> Build complete email automation: send emails with templates and attachments, receive and parse incoming emails, handle bounces, and integrate email with your other workflows.

---

## What you will learn

- **Email providers:** Gmail, Outlook, SMTP, and hosted email services
- **Sending emails:** single and batch sends with templates
- **Attachments:** generate CSV/PDF files and attach them to emails
- **Receiving emails:** trigger workflows on incoming mail
- **Email parsing:** extract data from email bodies and attachments
- **Error handling:** bounces, delivery failures, and retry logic

---

## Prerequisites

- n8n instance running
- Email account (Gmail, Outlook, or SMTP server access)
- For Gmail: [App-specific password](https://support.google.com/accounts/answer/185833)

---

## Part 1: Gmail setup in n8n

### Step 1: Create Gmail app credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Gmail API
4. Create OAuth 2.0 credentials (Desktop application)
5. In n8n, click **Credentials** → **Gmail** → paste your credentials

**Or use an app-specific password (simpler):**

1. Enable 2FA on your Google account
2. Go to [App passwords](https://myaccount.google.com/apppasswords)
3. Generate a password for "Mail"
4. In n8n, choose **Gmail (SMTP)** and use your email + app password

### Step 2: Test connection

Create a workflow with **Gmail** node and test by sending yourself an email.

---

## Part 2: Send simple emails

### Pattern 1: Send a single email

**Workflow:**
```
Manual Trigger → Gmail node → Output
```

**Gmail node settings:**

```
Credential:     Gmail (your account)
To:             {{ $json.recipientEmail }}
Subject:        Hello {{ $json.name }}!
Text:           Hi {{ $json.name }}, this is a test email.
```

**Execute and verify:** Check your inbox.

### Pattern 2: Send multiple emails (batch)

**Workflow:**
```
Set node (array of recipients) → Loop → Gmail node → Output
```

**Set node creates data:**

```
Field: recipients
Value: [
  { "email": "alice@example.com", "name": "Alice" },
  { "email": "bob@example.com", "name": "Bob" }
]
```

**Loop node:** loops over `recipients` array.

**Gmail node inside loop:**

```
To:         {{ $json.email }}
Subject:    Hello {{ $json.name }}!
Text:       Hi {{ $json.name }}, thanks for signing up!
```

**Result:** 2 emails sent, one per iteration.

---

## Part 3: Email templates

### Pattern 1: Simple HTML template

**Gmail node settings:**

```
Credential:     Gmail
To:             {{ $json.email }}
Subject:        Your report is ready
Text:           (leave blank)
HTML:           <html>
                  <body style="font-family: Arial; background: #f5f5f5;">
                    <h1>Hello {{ $json.name }}!</h1>
                    <p>Your report for {{ $json.month }} is attached.</p>
                    <p><a href="https://example.com/reports/{{ $json.reportId }}" style="background: blue; color: white; padding: 10px;">View Report</a></p>
                    <p>Thanks,<br/>The Team</p>
                  </body>
                </html>
```

### Pattern 2: Template from a file

**Workflow:**
```
Read File node (template.html) → Code node (replace placeholders) → Gmail node
```

**Code node:**

```javascript
const template = items[0].fileContent;  // Read from file

// Replace placeholders
const html = template
  .replace("{{ name }}", items[0].name)
  .replace("{{ month }}", items[0].month)
  .replace("{{ reportId }}", items[0].reportId);

return [{
  html: html,
  email: items[0].email,
  subject: "Your report is ready",
}];
```

**Gmail node:**

```
To:      {{ $json.email }}
Subject: {{ $json.subject }}
HTML:    {{ $json.html }}
```

---

## Part 4: Attachments

### Pattern 1: CSV attachment

**Workflow:**
```
PostgreSQL (fetch data) → Code node (format as CSV) → Gmail node (attach)
```

**Code node to generate CSV:**

```javascript
const rows = items[0];  // Array of data from DB

// Create CSV headers
const headers = Object.keys(rows[0]).join(',');

// Create CSV rows
const csvRows = rows.map(row => {
  return Object.values(row)
    .map(v => `"${v}"`)
    .join(',');
});

const csv = [headers, ...csvRows].join('\n');

return [{
  csv: csv,
  fileName: `report_${new Date().toISOString().split('T')[0]}.csv`,
}];
```

**Gmail node:**

```
To:         {{ $json.recipientEmail }}
Subject:    Monthly report attached
Text:       Your report is attached.
Attachments: Add item
  - Data Name:     Attachment Data
    Data:          {{ $json.csv }}
    File Name:     {{ $json.fileName }}
    MIME Type:     text/csv
```

### Pattern 2: PDF attachment (from HTML)

**Note:** n8n doesn't have a built-in PDF generator, so use a code node with `html2pdf` library or call an external service:

**Code node (call external PDF API):**

```javascript
const html = items[0].html;

const response = await fetch('https://api.example.com/html2pdf', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ html }),
});

const pdfBuffer = await response.arrayBuffer();
const base64 = Buffer.from(pdfBuffer).toString('base64');

return [{
  pdfBase64: base64,
  fileName: 'report.pdf',
}];
```

---

## Part 5: Receive emails (trigger)

### Pattern 1: Trigger workflow on new email

**Workflow:**
```
Gmail Trigger (new email) → Code node (parse) → Store in database
```

**Gmail Trigger settings:**

```
Credential:     Gmail
Search Query:   from:notifications@example.com   (filter by sender)
                OR
                subject:Order              (filter by subject)
Access:         Manual/Trigger when new emails arrive
```

**Output from Gmail Trigger:**

```json
{
  "subject": "Order #12345",
  "from": "notifications@example.com",
  "text": "Your order has been confirmed...",
  "html": "<html>...</html>",
  "attachments": [...]
}
```

### Pattern 2: Parse email and extract data

**Code node:**

```javascript
const email = items[0];

// Extract order ID from subject (e.g., "Order #12345")
const orderMatch = email.subject.match(/Order #(\d+)/);
const orderId = orderMatch ? orderMatch[1] : null;

// Extract HTML content
const htmlContent = email.html;

// Check for attachments
const hasAttachments = email.attachments && email.attachments.length > 0;

return [{
  orderId: orderId,
  from: email.from,
  subject: email.subject,
  body: email.text,
  hasAttachments: hasAttachments,
  timestamp: new Date().toISOString(),
}];
```

### Pattern 3: Save email data to database

**PostgreSQL node:**

```
Query:  INSERT INTO emails (order_id, from_address, subject, body, received_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (subject) DO NOTHING;

Parameters: [{{ $json.orderId }}, {{ $json.from }}, {{ $json.subject }}, {{ $json.body }}, {{ $json.timestamp }}]
```

---

## Part 6: Complete workflow - Customer onboarding emails

**What you will build:** When a new user signs up via webhook, send them a welcome email, add them to the database, and then send a follow-up email 1 hour later.

### Workflow 1: Signup → Welcome email + Database

```
HTTP Webhook (POST /signup) → Set node (format data) → Gmail node (welcome) → PostgreSQL (save user) → Response
```

**HTTP Webhook settings:**
- Path: `/signup`
- Method: `POST`

**Set node:**

```
Field: userEmail
Value: {{ $json.email }}

Field: userName
Value: {{ $json.name }}
```

**Gmail node:**

```
To:      {{ $json.userEmail }}
Subject: Welcome to our service, {{ $json.userName }}!
HTML:    <html>
          <body>
            <h1>Welcome {{ $json.userName }}!</h1>
            <p>We're excited to have you join us.</p>
            <p><a href="https://example.com/onboarding">Start onboarding</a></p>
            <p>Questions? Reply to this email anytime.</p>
          </body>
        </html>
```

**PostgreSQL node:**

```
Query:  INSERT INTO users (email, name, signed_up_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING id;
Parameters: [{{ $json.userEmail }}, {{ $json.userName }}]
```

**Response node:**

```
Status: 200
Body: {"message": "Welcome email sent!", "userId": {{ $json.id }}}
```

### Workflow 2: Scheduled follow-up (delay 1 hour, then send)

```
Schedule Trigger (every hour) → PostgreSQL (find users from last hour) → Loop → Delay (wait 1h) → Gmail (follow-up)
```

**Schedule Trigger:**
```
Cron: 0 * * * *     (every hour)
```

**PostgreSQL node:**

```
Query:  SELECT id, email, name FROM users 
        WHERE signed_up_at > NOW() - INTERVAL '1 hour';
```

**Loop node:** iterates over results.

**Delay node:** wait 1 hour.

**Gmail node:**

```
To:      {{ $json.email }}
Subject: Here's your next step, {{ $json.name }}
Text:    Check out our getting started guide: https://example.com/guide
```

---

## Part 7: Error handling

### Common email errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid credentials` | Gmail password or app password is wrong | Regenerate app password; re-authenticate |
| `Daily send limit exceeded` | Gmail rate limit (500/day) | Spread sends over time using delays |
| `Invalid recipient` | Email address has typos or is unsubscribed | Validate emails before sending; maintain unsubscribe list |
| `Attachment too large` | File > 25MB | Compress or split into multiple emails |

### Bounce handling

**Create an error workflow:**

```
Gmail Trigger (search for bounce emails) → Error Trigger → Mark as invalid → Notify
```

**Gmail Trigger settings:**

```
Search Query: from:mailer-daemon@... OR subject:Delivery Status Notification
```

**Code node to extract bounced email:**

```javascript
const bounceText = items[0].text;
const bounceMatch = bounceText.match(/Recipient address rejected: (\S+@\S+)/);
const bouncedEmail = bounceMatch ? bounceMatch[1] : null;

return [{
  bouncedEmail: bouncedEmail,
  timestamp: new Date().toISOString(),
}];
```

**PostgreSQL node:**

```
Query:  UPDATE users SET bounced = true WHERE email = $1;
Parameters: [{{ $json.bouncedEmail }}]
```

---

## Part 8: Advanced patterns

### Conditional email based on data

**IF node:**

```
Condition: $json.orderTotal > 100

YES branch: Send "Thank you for your large order!" email + 10% coupon
NO branch:  Send "Thanks for your order!" email
```

### Unsubscribe list

**PostgreSQL node (before sending):**

```
Query:  SELECT COUNT(*) as count FROM unsubscribed WHERE email = $1;
Parameters: [{{ $json.email }}]
```

**IF node:**

```
Condition: $json.count === 0

YES: Send email
NO:  Skip (user unsubscribed)
```

---

## Key takeaways

- **Always validate email addresses** before sending to prevent bounces
- **Use templates** for consistent, professional emails
- **Batch sends** by looping over recipients (not one workflow per email)
- **Implement unsubscribe links** to comply with CAN-SPAM regulations
- **Handle bounces** by catching delivery failure emails
- **Use delays** between sends to avoid rate limits
- **Test templates** with real email clients (Gmail, Outlook, mobile)

---

## Next steps

- Combine with lesson 14 (databases) to send emails triggered by data changes
- Add Slack notifications alongside email sends
- Build a newsletter system that pulls data from a database and sends personalized emails
- Implement SMS fallback if email bounces
