# 16 · File Operations: Upload, Download, Parse, and Generate

> Automate file handling: upload files to cloud storage, download and parse CSV/JSON/XML files, generate reports, and build workflows that transform files end-to-end.

---

## What you will learn

- **File node basics:** upload, download, and list files
- **Parsing files:** extract data from CSV, JSON, XML, and text files
- **Generating files:** create CSV, JSON, and text files from workflow data
- **Cloud storage:** integrate with AWS S3, Google Drive, Dropbox, OneDrive
- **Base64 encoding:** handle binary data in workflows
- **Error handling:** missing files, format errors, and size limits

---

## Prerequisites

- n8n instance running
- Sample files (CSV, JSON, or text)
- Optional: cloud storage account (AWS S3, Google Drive, Dropbox)

---

## Part 1: Download files from URLs

### Pattern 1: Download and save a file

**Workflow:**
```
Manual Trigger → HTTP Request (download) → File node (save)
```

**HTTP Request node:**

```
Method:                     GET
URL:                        https://example.com/file.csv
Return Full Response:       true
Response Format:            File
```

**Output:** Binary file data.

**File node:**

```
Operation:                  Write
File Format:                Binary
File Path:                  /tmp/downloads/file.csv
Data:                       {{ $json.body }}
```

### Pattern 2: Download multiple files

**Workflow:**
```
Set node (array of URLs) → Loop → HTTP Request → File node → Collect
```

**Set node:**

```
Field: files
Value: [
  { "url": "https://example.com/file1.csv", "name": "data1.csv" },
  { "url": "https://example.com/file2.csv", "name": "data2.csv" }
]
```

**Loop:** iterates over `files` array.

**HTTP Request inside loop:**

```
URL: {{ $json.url }}
```

**File node:**

```
File Path: /tmp/downloads/{{ $json.name }}
Data:      {{ $json.body }}
```

---

## Part 2: Parse CSV files

### Pattern 1: Read CSV and convert to JSON

**Workflow:**
```
File node (read CSV) → Code node (parse) → PostgreSQL (save to DB)
```

**File node:**

```
Operation:  Read
File Path:  /tmp/file.csv
```

**Output:** Binary data.

**Code node to parse CSV:**

```javascript
const fs = require('fs');

// Get the file data
const fileData = items[0];
const content = fileData.toString('utf-8');

// Simple CSV parser (for complex CSVs, use a library like 'csv-parser')
const lines = content.trim().split('\n');
const headers = lines[0].split(',').map(h => h.trim());

const rows = lines.slice(1).map(line => {
  const values = line.split(',').map(v => v.trim());
  const obj = {};
  headers.forEach((header, i) => {
    obj[header] = values[i];
  });
  return obj;
});

return rows;
```

**Output:**

```json
[
  { "name": "Alice", "email": "alice@example.com", "age": "25" },
  { "name": "Bob", "email": "bob@example.com", "age": "30" }
]
```

### Pattern 2: CSV with quoted fields (handles commas inside fields)

**Code node (robust CSV parser):**

```javascript
// For real-world CSVs with quoted fields, use a proper library
// This is a simple regex approach; for production, use npm csv-parser

const content = items[0].toString('utf-8');
const lines = content.trim().split('\n');

// Parse headers
const headers = lines[0]
  .match(/(?:[^,"]|"[^"]*")*(?:,|$)/g)
  .map(h => h.replace(/^"|"$/g, '').trim());

// Parse rows
const rows = lines.slice(1).map(line => {
  const values = line
    .match(/(?:[^,"]|"[^"]*")*(?:,|$)/g)
    .map(v => v.replace(/^"|"$/g, '').trim());
  
  const obj = {};
  headers.forEach((header, i) => {
    obj[header] = values[i];
  });
  return obj;
});

return rows;
```

---

## Part 3: Generate CSV files

### Pattern 1: Create CSV from data

**Workflow:**
```
PostgreSQL (fetch data) → Code node (generate CSV) → File node (save) → Email (send attachment)
```

**PostgreSQL node:**

```
Query: SELECT id, name, email, created_at FROM users LIMIT 100;
```

**Code node to generate CSV:**

```javascript
const rows = items[0];  // Array from database

// Create CSV headers
const headers = Object.keys(rows[0]).join(',');

// Create CSV rows
const csvRows = rows.map(row => {
  return Object.values(row)
    .map(v => `"${v}"`)  // Quote all fields
    .join(',');
});

const csv = [headers, ...csvRows].join('\n');

return [{
  csv: csv,
  fileName: `export_${new Date().toISOString().split('T')[0]}.csv`,
}];
```

**File node:**

```
Operation:  Write
File Format: Text
File Path:  /tmp/{{ $json.fileName }}
Data:       {{ $json.csv }}
```

**Email node (from lesson 15):**

```
Attachments:
  - Data:          {{ $json.csv }}
    File Name:     {{ $json.fileName }}
    MIME Type:     text/csv
```

---

## Part 4: Parse JSON files

### Pattern 1: Read and filter JSON

**Workflow:**
```
File node (read JSON) → Code node (filter) → HTTP Request (send filtered data)
```

**File node:**

```
Operation:  Read
File Path:  /tmp/data.json
```

**Code node to filter:**

```javascript
const fileData = items[0].toString('utf-8');
const data = JSON.parse(fileData);

// Filter: keep only active users
const filtered = data.filter(item => item.status === 'active');

return filtered;
```

---

## Part 5: Cloud storage integration

### Pattern 1: AWS S3 upload

**Workflow:**
```
Code node (generate file) → AWS S3 node (upload)
```

**S3 node setup:**

1. In n8n, go to **Credentials** → **AWS S3**
2. Add your AWS access key and secret key
3. Create the node

**S3 node settings:**

```
Credential:     AWS S3
Operation:      Upload a file
Bucket Name:    my-bucket
File Name:      reports/daily_{{ new Date().toISOString().split('T')[0] }}.csv
File Content:   {{ $json.csvContent }}
```

### Pattern 2: Google Drive upload

**Workflow:**
```
File node (generate) → Google Drive node (upload)
```

**Google Drive node:**

```
Credential:     Google Drive
Operation:      Upload a file
File Name:      {{ $json.fileName }}
Parent Folder:  Reports
File Content:   {{ $json.csvContent }}
```

---

## Part 6: Complete workflow - Daily report generation

**What you will build:** A workflow that runs daily, fetches data from a database, generates a CSV report, and uploads it to cloud storage + sends via email.

### Workflow structure:

```
Schedule Trigger (daily 9 AM) 
  → PostgreSQL (fetch sales data)
  → Code node (generate CSV)
  → AWS S3 (upload)
  → Gmail (send link)
  → Update database (log report)
```

### Step 1: Schedule

```
Trigger Rule:  Cron
Cron:          0 9 * * *     (daily at 9 AM)
```

### Step 2: Fetch data

**PostgreSQL node:**

```
Query:  SELECT date, product, quantity, revenue 
        FROM sales 
        WHERE date = CURRENT_DATE - INTERVAL '1 day'
        ORDER BY revenue DESC;
```

### Step 3: Generate CSV

**Code node:**

```javascript
const rows = items[0];

const headers = 'Date,Product,Quantity,Revenue';
const csvRows = rows.map(row => 
  `${row.date},${row.product},${row.quantity},${row.revenue}`
);

const csv = [headers, ...csvRows].join('\n');
const fileName = `sales_report_${new Date().toISOString().split('T')[0]}.csv`;

return [{
  csv: csv,
  fileName: fileName,
  reportDate: new Date().toISOString().split('T')[0],
}];
```

### Step 4: Upload to S3

**S3 node:**

```
Bucket Name:    company-reports
File Name:      {{ $json.fileName }}
File Content:   {{ $json.csv }}
```

### Step 5: Send email with link

**Gmail node:**

```
To:         reports@company.com
Subject:    Daily sales report - {{ $json.reportDate }}
HTML:       <html>
              <body>
                <h2>Sales Report for {{ $json.reportDate }}</h2>
                <p><a href="https://s3.amazonaws.com/company-reports/{{ $json.fileName }}">Download Report</a></p>
              </body>
            </html>
```

### Step 6: Log to database

**PostgreSQL node:**

```
Query:  INSERT INTO report_logs (file_name, generated_at, status)
        VALUES ($1, CURRENT_TIMESTAMP, 'success');
Parameters: [{{ $json.fileName }}]
```

---

## Part 7: XML parsing

### Pattern 1: Parse XML file

**Workflow:**
```
File node (read XML) → Code node (parse XML to JSON)
```

**Code node:**

```javascript
const xml2js = require('xml2js');  // Requires npm package

const fileData = items[0].toString('utf-8');
const parser = new xml2js.Parser();

const result = await parser.parseStringPromise(fileData);

return [result];
```

**Alternative (without library - simple regex for basic XML):**

```javascript
const xml = items[0].toString('utf-8');

// Extract tags: <name>value</name>
const data = {};
const matches = xml.matchAll(/<(\w+)>([^<]+)<\/\1>/g);

for (const match of matches) {
  data[match[1]] = match[2];
}

return [data];
```

---

## Part 8: Error handling

### Common file errors

| Error | Cause | Solution |
|-------|-------|----------|
| `File not found` | Path is wrong or file was deleted | Check path; add IF node to verify file exists first |
| `Permission denied` | Insufficient file/folder permissions | Check folder permissions; run with correct user |
| `File too large` | File > memory limit | Stream large files instead of loading into memory; use pagination |
| `Invalid JSON` | Malformed JSON in file | Add try/catch in Code node |
| `CSV parse error` | Unexpected format (quotes, delimiters) | Use robust CSV parser library |

### Try-catch in Code node

```javascript
try {
  const data = JSON.parse(items[0].toString('utf-8'));
  return [data];
} catch (error) {
  return [{
    error: "Failed to parse JSON",
    message: error.message,
  }];
}
```

---

## Part 9: Performance tips

- **Stream large files** instead of loading all at once
- **Batch file processing** with Loop node for multiple files
- **Compress files** before uploading (CSV → ZIP)
- **Use S3 pre-signed URLs** for download links that expire after a time
- **Add retry logic** for cloud storage uploads (network failures)

---

## Key takeaways

- **File node** operations: Read, Write, List, Delete
- **CSV parsing** in Code node (simple regex) or with library (robust)
- **CSV generation** by joining headers + rows
- **Cloud storage** requires credentials (S3, Drive, Dropbox)
- **Error handling** for missing files, format errors, size limits
- **Base64 encoding** for binary data in JSON workflows

---

## Next steps

- Combine with lesson 15 (email) to send generated reports
- Build a file import workflow (upload CSV → parse → save to database)
- Create a document generator (merge data + template → PDF)
- Set up automated backups (database → CSV → S3)
