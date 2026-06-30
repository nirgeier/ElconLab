# 04 · Triggers: Starting Workflows

> Every n8n workflow begins with exactly one trigger node that decides when and how execution starts.

---

## What a trigger is

- A trigger is the entry point of a workflow; it is the node that fires execution rather than just processing data.
- Each workflow has exactly one active trigger path, though you can keep several trigger nodes and switch between them.
- Triggers output the initial data items that flow downstream to the rest of the nodes.
- A trigger node has no input connection on its left side - nothing runs before it.
- Without a trigger, a workflow can be saved but can never run on its own.

---

## Manual trigger

- The "Manual Trigger" (the "Test workflow" / "When clicking Execute workflow" node) runs only when you press the button in the editor.
- It is meant for building, testing, and debugging - not for production automation.
- It emits a single empty item so downstream nodes have something to act on.
- Use it while developing, then swap in a real trigger once the logic works.

---

## Schedule and cron triggers

- The "Schedule Trigger" runs a workflow on a recurring interval - seconds, minutes, hours, days, or a fixed time of day.
- For full control you can switch its mode to a cron expression for precise scheduling.
- Standard 5-field cron is minute, hour, day-of-month, month, day-of-week.

```text
# At 09:30 every weekday (Mon-Fri)
30 9 * * 1-5

# Every 15 minutes
*/15 * * * *
```

- The schedule only fires when the workflow is active and the instance is running.
- Timezone is taken from the workflow settings or the instance default; set it explicitly to avoid off-by-hours surprises.

---

## Webhook trigger

- The "Webhook" node exposes an HTTP endpoint that runs the workflow when an external system sends a request.
- You choose the HTTP method (GET, POST, etc.) and a path; n8n builds the full URL for you.
- Incoming headers, query parameters, and body are made available as the trigger's output data.
- Use it to receive events from third-party services, custom apps, or form submissions.
- You can require authentication (header auth, basic auth) and choose how/when the response is returned (immediately, last node, or via a "Respond to Webhook" node).

```bash
curl -X POST "https://your-n8n-host/webhook/orders" \
  -H "Content-Type: application/json" \
  -d '{"orderId": 123, "status": "paid"}'
```

---

## Test URL vs production URL

- A webhook has two URLs: a test URL and a production URL, with different path prefixes.
- The test URL (`/webhook-test/...`) only listens after you click "Listen for test event" / "Execute workflow" in the editor, and captures one request so you can inspect the payload.
- The production URL (`/webhook/...`) is live whenever the workflow is active and handles real traffic continuously.
- A common mistake is registering the test URL with an external service - it stops working after one call or once you leave the editor.
- Build and inspect with the test URL, then point the external system at the production URL and activate the workflow.

```text
Test:        https://your-n8n-host/webhook-test/orders
Production:  https://your-n8n-host/webhook/orders
```

---

## App triggers

- Many integrations ship a dedicated trigger node, for example "Gmail Trigger", "Telegram Trigger", "Slack Trigger", or "Stripe Trigger".
- Some app triggers are push-based: they register a webhook with the provider so events arrive instantly.
- Others are poll-based: n8n checks the service on a schedule for new items.
- App triggers handle the provider-specific auth and event filtering for you, so you pick an event type rather than parse raw payloads.
- They are the preferred way to start workflows from a supported SaaS tool.

---

## Polling triggers

- A polling trigger asks a service "what is new since last time?" on a fixed interval instead of waiting to be notified.
- n8n stores state between runs so it only emits items it has not seen before, avoiding duplicates.
- Polling is useful when a service has no webhook support but does expose a list/search API.
- Trade-offs: latency equals the poll interval, and frequent polling adds load and may hit rate limits.
- Prefer a push webhook when available; fall back to polling when it is the only option.

---

## Choosing the right trigger

- Need instant reaction to an external event - use a webhook or a push-based app trigger.
- Need work done on a clock (reports, syncs, cleanups) - use the Schedule Trigger.
- A supported SaaS app is the source - reach for its dedicated app trigger first.
- The source has an API but no webhook - use a polling trigger.
- Still building and just want to run it yourself - keep the Manual Trigger until the logic is solid.

---

## Key takeaways

- One workflow, one active trigger - it is the node that decides when execution begins.
- Develop with the test URL and Manual Trigger, then move to the production URL with the workflow activated.
- Webhooks and push app triggers give real-time reactions; schedule and polling triggers run on a clock.
- Prefer push over polling when a service supports it - lower latency and less wasted load.
- Match the trigger to the source: event-driven, time-driven, app-native, or API-polled.
