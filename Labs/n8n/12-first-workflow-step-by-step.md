# 12 · Build Your First Workflow (Step by Step)

> A complete, hands-on walkthrough: build a workflow that fetches data from a public API on a schedule, filters it, formats a message, and posts it to a webhook - with the full solution given at every step.

---

## What you will build

- A scheduled workflow that runs every morning and fetches a random set of public data from a free API.
- It filters the results to keep only the items you care about, reshapes them into a clean message, and sends that message to a destination (a test webhook here; swap in Slack/Email later).
- You will touch the most common node types: a trigger, an HTTP Request, an IF/Filter, a Set node, and an output node.
- No credentials are required for the core lab - it uses a public, no-auth API so you can finish end to end.
- By the end you will understand the build-test-iterate loop that every n8n workflow follows.

```text
Schedule Trigger → HTTP Request → Filter → Edit Fields (Set) → HTTP Request (send)
```

---

## Before you start

- Have a running n8n instance open at `http://localhost:5678` (see lab 02 if you have not installed it).
- Create a fresh workflow: open the editor, click the workflow menu, and choose "New".
- Rename it to "My First Workflow" so it is easy to find later.
- Keep the Executions panel handy - you will run the workflow after most steps to see the data.

---

## Step 1 - Add a trigger

**Goal:** give the workflow a starting point you can run on demand while building.

- Click the big "+" on the canvas (or "Add first step").
- Search for and add a **Manual Trigger** while you build (you will swap it for a Schedule Trigger at the end).
- The Manual Trigger lets you click "Test workflow" to run everything to the right of it.

**Solution / what you should have:**

- A single "When clicking 'Test workflow'" node on the canvas, with an output connector on its right.
- Nothing else is wired yet. Clicking "Test workflow" now does nothing useful - that is expected.

---

## Step 2 - Fetch data with the HTTP Request node

**Goal:** pull JSON from a public API so you have data to work with.

- Add an **HTTP Request** node and connect the Manual Trigger's output to its input.
- Configure it to GET a free, no-auth endpoint. We will use a public placeholder API that returns a list of posts.

**Solution - node settings:**

```text
Method:        GET
URL:           https://jsonplaceholder.typicode.com/posts
Authentication: None
```

- Click **Execute step** (or "Test workflow"). The node should return ~100 items, each with `userId`, `id`, `title`, and `body`.
- In the output panel, switch between Table, JSON, and Schema views to see the shape of one item.

**Checkpoint:** if you see items with a `title` field, the fetch works. If you get an error, re-check the URL and that your machine has internet access.

---

## Step 3 - Keep only the items you want (Filter)

**Goal:** reduce the 100 posts down to just the ones from a specific user.

- Add a **Filter** node and connect the HTTP Request output to it.
- Add one condition that keeps only items where `userId` equals `1`.

**Solution - Filter condition:**

```text
Value 1:    {{ $json.userId }}
Operation:  is equal to
Value 2:    1
```

- Make sure Value 2 is interpreted as a number (toggle the field type to Number if needed) so `1` matches `1`, not `"1"`.
- Execute the step. The item count should drop from ~100 to 10 (user 1's posts).

**Checkpoint:** the Filter's output shows 10 items, all with `userId: 1`.

---

## Step 4 - Reshape the data (Edit Fields / Set)

**Goal:** build a clean object with just the fields you want to send, plus a friendly message.

- Add an **Edit Fields (Set)** node after the Filter.
- Set it to keep only the fields you define (turn on "Keep Only Set" / include only specified fields).
- Define three fields using expressions that read from the incoming item.

**Solution - fields to add:**

```text
postId    (Number)  =  {{ $json.id }}
title     (String)  =  {{ $json.title }}
message   (String)  =  New post #{{ $json.id }}: {{ $json.title }}
```

- The `message` field mixes static text with two expressions - this is the core of n8n data mapping.
- Execute the step. Each of the 10 items should now have exactly `postId`, `title`, and `message`.

**Checkpoint:** the output has 10 tidy items and no leftover `body`/`userId` fields.

---

## Step 5 - Send the result somewhere

**Goal:** deliver the formatted items to an external destination.

- For a zero-setup test, create a free test bin at a service like `https://webhook.site` and copy your unique URL.
- Add a second **HTTP Request** node after the Set node.

**Solution - send node settings:**

```text
Method:       POST
URL:          <paste your webhook.site URL>
Body Content Type: JSON
Body:         {{ $json }}    (send the current item as the JSON body)
```

- Execute the workflow. Each item triggers one POST; refresh webhook.site to see 10 incoming requests with your `postId`, `title`, and `message`.
- To send a single combined payload instead of 10 requests, add an **Aggregate** node before this step (covered in the data-transformation lessons).

**Checkpoint:** your webhook.site page shows the posted JSON. The end-to-end flow works.

---

## Step 6 - Make it run on a schedule

**Goal:** turn the manual test into an automation that runs by itself.

- Add a **Schedule Trigger** node.
- Delete the Manual Trigger (or leave it - a workflow can keep a manual trigger for testing).
- Wire the Schedule Trigger into the HTTP Request node where the Manual Trigger used to connect.

**Solution - schedule settings (every weekday at 09:00):**

```text
Trigger Rule:  Cron / Custom
Cron expression:  0 9 * * 1-5
```

- Or use the simpler "Interval" mode: every 1 day at hour 9.
- Save the workflow, then toggle it **Active** (top-right switch). Active workflows run automatically on their trigger.

**Checkpoint:** the workflow shows "Active", and the next run time appears on the Schedule Trigger node.

---

## Step 7 - Test, inspect, and iterate

**Goal:** confirm it works and learn the debugging loop.

- Run it once manually with "Test workflow" even while active, to verify without waiting for 09:00.
- Open the **Executions** list (left sidebar) to see each run, its status, and the data at every node.
- Click a past execution to replay the exact data that flowed through - invaluable for debugging.
- Use **pin data** on the HTTP Request node while iterating so you do not re-hit the API on every test run.

**Solution - a healthy run looks like:**

- Executions list shows a green "Success" entry.
- Clicking it shows: Schedule Trigger fired → 100 items fetched → 10 after Filter → 10 reshaped → 10 POSTs sent.

---

## Common mistakes and fixes

- **Filter returns 0 items:** Value 2 is a string `"1"` but `userId` is a number - switch the comparison field to Number.
- **Set node drops everything:** "Keep Only Set" is on but no fields are defined, or field names have typos.
- **Send node posts nothing:** the body is empty - set Body Content Type to JSON and the body to `{{ $json }}`.
- **Workflow does not run on schedule:** it is not toggled Active, or your instance was not running at the scheduled time.
- **API rate-limited:** pin the HTTP Request output while building so repeated tests reuse cached data.

---

## Extend it from here

- Replace the final HTTP Request with a real **Slack**, **Gmail**, or **Telegram** node (needs a credential - see lab 08).
- Add an **IF** node to send a different message when there are no new posts.
- Add an **Aggregate** node to combine all items into one summary message.
- Add an **Error Trigger** workflow so you get notified if a run fails (see lab 10).
- Save the finished workflow as a template so you can reuse the pattern (see lab 11).

---

## Key takeaways

- Every workflow follows the same arc: trigger → fetch → transform → act, built and tested one node at a time.
- Execute each node as you add it; the output panel is your feedback loop.
- Expressions like `{{ $json.field }}` are how data moves and reshapes between nodes.
- Pin data and the Executions list are your core debugging tools.
- Start with a Manual Trigger while building, then swap in a Schedule (or Webhook) trigger and toggle the workflow Active.
