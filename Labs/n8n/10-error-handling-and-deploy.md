# 10 · Error Handling, Production & Next Steps

> Take an n8n workflow from "it works on my machine" to a resilient, observable, and maintainable production automation.

---

## Why error handling matters

- A workflow that runs unattended will eventually hit a flaky API, a rate limit, bad input, or an expired credential
- Without explicit handling, a single failed execution can silently stop a critical automation and nobody notices
- n8n separates the happy path from failure handling so your main workflow stays readable
- Production reliability is mostly about three things: catching failures, retrying transient ones, and getting alerted on the rest
- Treat every external call (HTTP, database, third-party node) as something that can and will fail

---

## Error workflows and the Error Trigger

- An error workflow is a normal workflow that starts with the `Error Trigger` node and runs automatically when another workflow fails
- Build one once, then assign it under a workflow's Settings -> Error Workflow; you can reuse the same error workflow across many workflows
- The Error Trigger receives a structured payload describing what broke, so your handler can route, log, or alert on it
- Typical handler actions: send a Slack/email/Telegram alert, write a row to a database or sheet, or open a ticket
- The error workflow itself does not re-run the failed workflow; it reacts to the failure

The error payload looks roughly like this:

```json
{
  "execution": {
    "id": "231",
    "url": "https://n8n.example.com/workflow/42/executions/231",
    "error": {
      "message": "Request failed with status code 429",
      "stack": "..."
    },
    "lastNodeExecuted": "HTTP Request",
    "mode": "trigger"
  },
  "workflow": { "id": "42", "name": "Sync orders" }
}
```

---

## Retries and per-node error control

- Most nodes expose retry options in their Settings tab: "Retry On Fail", number of tries, and wait time between attempts
- Use retries for transient problems (timeouts, 429 rate limits, brief 5xx outages), not for permanent ones like a 401 or malformed input
- "Continue On Fail" (Continue / Continue using error output) lets the workflow keep running instead of stopping at the failed node
- With the error output enabled, a node exposes a separate error branch so you can handle good and bad items differently
- The `Stop And Error` node lets you fail a workflow deliberately when a business rule is violated, which then triggers the error workflow
- Combine retries with idempotency: make sure a retried request will not create duplicate records

---

## Executions log and debugging

- The Executions list (per workflow and globally) shows every run with status, mode, start time, and duration
- Open any execution to inspect the exact data in and out of each node - this is your primary debugging tool
- Use "Retry" on a failed execution to re-run it, optionally with the originally saved data
- Pin data on a node during development to freeze test input so you iterate without re-calling live services
- Control retention with environment variables so the database does not grow without bound
- Save execution data deliberately: success vs error runs can be saved or skipped independently

```bash
# Keep execution data but prune old runs automatically
export EXECUTIONS_DATA_PRUNE=true
export EXECUTIONS_DATA_MAX_AGE=336        # hours (14 days)
export EXECUTIONS_DATA_SAVE_ON_ERROR=all
export EXECUTIONS_DATA_SAVE_ON_SUCCESS=none
```

---

## Environment management

- Separate development, staging, and production instances so you never test against live data and credentials
- Keep configuration in environment variables, not hard-coded in nodes, so the same workflow runs in every environment
- Store secrets in n8n credentials (and, on supported plans, an external secrets manager) rather than in plain node fields
- Use git-based source control / environments (an n8n Enterprise feature) to version workflows and promote them between stages
- For self-hosted setups, pin a specific image version per environment so promotions are deliberate, not accidental
- Always run behind HTTPS and set `N8N_ENCRYPTION_KEY` consistently - losing it means losing access to stored credentials

```yaml
# docker-compose excerpt - production-style config
services:
  n8n:
    image: docker.n8n.io/n8nio/n8n:1.123.0
    environment:
      - N8N_HOST=n8n.example.com
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://n8n.example.com/
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
      - GENERIC_TIMEZONE=Europe/Berlin
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
    volumes:
      - n8n_data:/home/node/.n8n
```

---

## Keeping a self-hosted instance updated

- Self-hosted n8n ships frequent releases; track the changelog and release notes before upgrading
- Always back up first: the SQLite/Postgres database and the `.n8n` data directory (or the named Docker volume)
- For Docker, pull the new tag, recreate the container, and let n8n run its database migrations on startup
- Prefer pinning an explicit version tag over `latest` in production so upgrades are intentional and reproducible
- Read for breaking changes between minor/major versions, and test the upgrade in staging before production
- Use PostgreSQL rather than the default SQLite for production-scale instances and reliable backups

```bash
# Back up the named volume, then upgrade a Docker install
docker run --rm -v n8n_data:/data -v "$PWD":/backup alpine \
  tar czf /backup/n8n-backup.tgz -C /data .

docker compose pull n8n
docker compose up -d n8n        # migrations run automatically on boot
docker compose logs -f n8n      # confirm a clean startup
```

---

## Where to go next

- Scale execution throughput with queue mode (a Redis-backed main + worker setup) when one process is no longer enough
- Add monitoring: health/readiness endpoints, log aggregation, and external uptime checks on your webhook URLs
- Explore the AI/LangChain nodes and the built-in AI Agent to add LLM-driven steps to workflows
- Deepen skills with the official docs, the template library, and the community forum for real-world patterns
- Learn the public REST API and the CLI (`n8n export:workflow`, `n8n import:workflow`) for automation and CI pipelines
- Contribute or build custom nodes when a needed integration does not exist yet

---

## Key takeaways

- Design for failure: assign an Error Trigger workflow and decide what to retry versus what to alert on
- Use per-node retries and error outputs to isolate transient failures from permanent ones
- The Executions log is your debugging core - inspect node data, retry runs, and prune old data
- Separate environments, keep secrets and config in env vars and credentials, and protect your encryption key
- Back up before every upgrade, pin versions, and move to Postgres plus queue mode as you grow
```
