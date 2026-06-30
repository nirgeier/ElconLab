# 14 · Database Operations: Query, Insert, and Sync

> Connect n8n to databases and automate data operations: execute SELECT, INSERT, UPDATE queries; sync data between APIs and databases; handle transactions; and avoid common pitfalls like duplicate inserts and data loss.

---

## What you will learn

- **Supported databases:** PostgreSQL, MySQL, MongoDB, SQLite (and more via HTTP adapters)
- **Query patterns:** SELECT, INSERT, UPDATE, DELETE with parameters
- **Data sync workflows:** bi-directional sync between APIs and databases
- **Avoiding duplicates:** upsert patterns and conflict resolution
- **Transactions:** atomic operations (all or nothing)
- **Debugging database workflows:** common errors and how to fix them

---

## Prerequisites

- A running database (PostgreSQL recommended for this lab). For quick setup: `docker run -e POSTGRES_PASSWORD=password -p 5432:5432 postgres`
- n8n instance running locally
- Basic SQL knowledge (SELECT, INSERT, UPDATE)

---

## Part 1: PostgreSQL Setup in n8n

### Step 1: Add credentials

1. Open n8n and go to **Credentials** (left sidebar, bottom)
2. Click **Create new** → Search for **PostgreSQL**
3. Fill in:
   ```
   Host:       localhost
   Port:       5432
   Database:   postgres
   User:       postgres
   Password:   password
   ```
4. Click **Create** and name it "My PostgreSQL"

### Step 2: Create a test table

In your PostgreSQL client (e.g., `psql`), run:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (email, name) VALUES 
  ('alice@example.com', 'Alice'),
  ('bob@example.com', 'Bob');
```

---

## Part 2: Basic Queries

### Pattern 1: SELECT - fetch data

**Workflow:**
```
Manual Trigger → PostgreSQL node (SELECT) → HTTP Request (send to webhook)
```

**PostgreSQL node settings:**

```
Credentials:    My PostgreSQL
Query:          SELECT * FROM users WHERE id > 0
```

**Execute and see:**
- Output: `[{ id: 1, email: "alice@example.com", name: "Alice", ... }, ...]`

### Pattern 2: SELECT with parameters (avoid SQL injection)

**Workflow:**
```
Set node (input: userId = 1) → PostgreSQL node (SELECT WHERE id = $1) → Output
```

**PostgreSQL node settings:**

```
Credentials:    My PostgreSQL
Query:          SELECT * FROM users WHERE id = $1
Parameters:     [{{ $json.userId }}]  (use array, order matters)
```

**Why?** Parameters are safely escaped; direct string concatenation allows SQL injection attacks.

### Pattern 3: COUNT - check if data exists

**Workflow:**
```
Set node (email: "alice@example.com") → PostgreSQL node (SELECT COUNT) → IF (exists?) → Email user or skip
```

**PostgreSQL node:**

```
Query:          SELECT COUNT(*) as count FROM users WHERE email = $1
Parameters:     [{{ $json.email }}]
```

**Output:**
```json
[{ "count": 1 }]
```

**Use in IF node:**
```
Condition: $json.count > 0  (evaluates to true if user exists)
```

---

## Part 3: INSERT - add new data

### Pattern 1: Simple INSERT

**Workflow:**
```
HTTP Webhook (receive form data) → PostgreSQL node (INSERT) → HTTP Response (success)
```

**PostgreSQL node settings:**

```
Credentials:    My PostgreSQL
Query:          INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *
Parameters:     [{{ $json.email }}, {{ $json.name }}]
```

**RETURNING \* means:** return the inserted row (with auto-generated `id`)

**Output:**
```json
[{ "id": 3, "email": "charlie@example.com", "name": "Charlie", "created_at": "2026-07-01T...", ... }]
```

### Pattern 2: INSERT multiple rows (batch)

**Workflow:**
```
Set node (create array of users) → Code node (build INSERT statement) → PostgreSQL → Output
```

**Code node to build multi-row INSERT:**

```javascript
const users = items[0].users;  // [{ email: "...", name: "..." }, ...]

// Build VALUES clause: ($1, $2), ($3, $4), ...
const valuesClauses = users.map((_, i) => {
  const paramStart = i * 2 + 1;
  return `($${paramStart}, $${paramStart + 1})`;
}).join(', ');

const query = `INSERT INTO users (email, name) VALUES ${valuesClauses} RETURNING *`;

// Flatten all parameters into one array
const params = users.flatMap(u => [u.email, u.name]);

return [{
  query,
  params,
}];
```

**PostgreSQL node:**

```
Query:          {{ $json.query }}
Parameters:     {{ $json.params }}
```

---

## Part 4: UPDATE - modify existing data

### Pattern 1: Update one row

**Workflow:**
```
HTTP Request (trigger with userId) → PostgreSQL node (UPDATE) → Response
```

**PostgreSQL node settings:**

```
Credentials:    My PostgreSQL
Query:          UPDATE users SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *
Parameters:     [{{ $json.newName }}, {{ $json.userId }}]
```

**Output:**
```json
[{ "id": 1, "email": "alice@example.com", "name": "UpdatedName", "updated_at": "2026-07-01T...", ... }]
```

### Pattern 2: UPSERT (insert or update)

**Problem:** You receive user data from an external API. If the user exists, update them. If not, insert them.

**Solution:**

```sql
INSERT INTO users (email, name) 
VALUES ($1, $2)
ON CONFLICT (email) 
DO UPDATE SET name = EXCLUDED.name, updated_at = CURRENT_TIMESTAMP
RETURNING *;
```

**PostgreSQL node:**

```
Query:          [SQL above]
Parameters:     [{{ $json.email }}, {{ $json.name }}]
```

**What happens:**
- If email doesn't exist: inserts new row
- If email exists: updates the `name` field

**This prevents duplicate inserts!**

---

## Part 5: DELETE - remove data

### Pattern 1: Delete by condition

```sql
DELETE FROM users WHERE id = $1 RETURNING *;
```

**Be careful!** Always use a WHERE clause. Without it, all rows are deleted.

### Pattern 2: Soft delete (don't actually delete)

**Better practice:** add a `deleted_at` column instead of removing rows.

```sql
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP;

UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1;

-- When selecting, exclude soft-deleted rows:
SELECT * FROM users WHERE deleted_at IS NULL;
```

---

## Part 6: Complete workflow - API to Database sync

**What you will build:** A workflow that fetches user data from an external API every hour, and syncs it to the database (insert new, update existing, skip duplicates).

### Workflow structure:

```
Schedule (hourly) → HTTP GET /users → Loop each user → UPSERT to DB → Notify on errors
```

### Step 1: Set up the Schedule Trigger

```
Trigger rule:  Cron
Cron:          0 * * * *     (every hour)
```

### Step 2: Fetch data from API

Add **HTTP Request** node:

```
Method:        GET
URL:           https://jsonplaceholder.typicode.com/users
Return Full Response: false
```

Output: array of 10 users with `id`, `name`, `email`, etc.

### Step 3: Loop and sync each user

Add a **Loop** node (one iteration per user).

Inside loop, add **PostgreSQL** node:

```
Query:         INSERT INTO users (email, name) 
               VALUES ($1, $2)
               ON CONFLICT (email) 
               DO UPDATE SET name = EXCLUDED.name, updated_at = CURRENT_TIMESTAMP
               RETURNING id;

Parameters:    [{{ $json.email }}, {{ $json.name }}]
```

### Step 4: Verify results

Add another **PostgreSQL** node after loop:

```
Query:         SELECT COUNT(*) as total_users FROM users;
```

### Step 5: Send completion notification

Add **HTTP Request** (to webhook.site or Slack):

```
Method:        POST
URL:           <your webhook URL>
Body:          Synced {{ $json.total_users }} users
```

### Execute and verify:
- Check webhook.site (you should see the count)
- Query the database: `SELECT * FROM users;` should show 10 new rows
- Run the workflow again: no errors, same count (upsert worked)

---

## Part 7: Common errors and solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `connection refused` | Database not running | Start Docker container: `docker run -e POSTGRES_PASSWORD=password -p 5432:5432 postgres` |
| `column "email" of relation "users" already exists` | Table already has that column | Use different table name or drop and recreate: `DROP TABLE users; CREATE TABLE users (...);` |
| `duplicate key value violates unique constraint` | Trying to insert duplicate email | Use UPSERT pattern (ON CONFLICT DO UPDATE) |
| `syntax error at $1` | SQL syntax error | Check SQL query syntax; test in `psql` first |
| `Parameter out of range` | Wrong number of parameters | Count `$1`, `$2`, etc. in query; array must have same count |

---

## Part 8: Transactions and error handling

### Wrapping operations in a transaction

**Problem:** You want to insert a user AND a related record (e.g., user + subscription). If one fails, both should fail.

**Solution:**

```sql
BEGIN;

INSERT INTO users (email, name) VALUES ($1, $2);
INSERT INTO subscriptions (user_id, plan) VALUES (currval('users_id_seq'), $3);

COMMIT;
```

If any statement fails, all changes are rolled back automatically.

**In n8n:**

```
PostgreSQL node:
Query:  BEGIN;
        INSERT INTO users (email, name) VALUES ($1, $2);
        INSERT INTO subscriptions (user_id, plan) VALUES (currval('users_id_seq'), $3);
        COMMIT;
Parameters: [{{ $json.email }}, {{ $json.name }}, {{ $json.plan }}]
```

### Error handling workflow

```
PostgreSQL node → IF (success?) → YES: Notify success
                                → NO: Error Trigger workflow + Slack alert
```

In the error workflow, capture the error and log it:

```
Error Trigger → Code node → Log to webhook/email
```

---

## Part 9: Performance tips

- **Use indexes** on frequently queried columns:
  ```sql
  CREATE INDEX idx_users_email ON users(email);
  ```

- **Batch operations** instead of looping:
  ```
  Use multi-row INSERT instead of Loop → INSERT for each row
  ```

- **Pin data during development:**
  - After fetching data, right-click the HTTP node and select "Pin data"
  - This stops re-fetching from the API on every test run

- **Use LIMIT** to fetch sample data first:
  ```sql
  SELECT * FROM users LIMIT 10;
  ```

---

## Key takeaways

- **Always use parameterized queries** (`$1`, `$2`, etc.) to prevent SQL injection
- **UPSERT pattern** prevents duplicate inserts (use ON CONFLICT)
- **RETURNING \*** lets you confirm what was inserted/updated
- **Loop through results** when you need to process data row-by-row
- **Use transactions** for multi-step operations that must all succeed together
- **Pin data** during development to avoid repeated API calls
- **Test SQL in `psql` first** before putting it in n8n

---

## Next steps

- Combine this lesson with lesson 13 (data transformation) to clean + validate data before inserting
- Build a bi-directional sync (database → API, API → database)
- Set up error workflows that alert you on failed syncs
- Explore MongoDB nodes for document database workflows
