# 01 · Introduction to n8n

> n8n is a fair-code, node-based workflow automation tool you can self-host or run in the cloud to connect apps, APIs, and AI into automated pipelines.

---

## What n8n is

- A workflow automation platform where you wire together steps visually instead of writing all the glue code by hand.
- Distributed under the Sustainable Use License - "fair-code" rather than strict open source, but the source is public and free to self-host.
- The name is short for "nodemation" (node + automation); it is built on Node.js and runs as a single web application.
- Targets technical and semi-technical users: you can stay no-code for simple flows, but drop into JavaScript or Python expressions when you need precision.
- Strong, growing focus on AI workflows, including LangChain-based nodes and AI Agent nodes for building assistants and RAG pipelines.

---

## Node-based visual workflows

- A workflow is a graph of nodes connected by lines; data flows left to right from a trigger through one or more action nodes.
- Trigger nodes start a run - examples include Schedule, Webhook, and app-specific triggers that fire on external events.
- Action and app nodes do the work: call an HTTP API, read or write a database, send a Slack message, transform data, and so on.
- Logic nodes like IF, Switch, Merge, and Loop Over Items control branching and iteration without custom code.
- Every node passes structured JSON items downstream; you reference upstream data with expressions such as `{{ $json.email }}`.
- The Code node lets you run arbitrary JavaScript or Python when the built-in nodes are not enough.

---

## Self-hosted vs cloud

- Self-hosting gives you full control, data residency, and no per-execution metering - you run it on your own infrastructure.
- n8n Cloud is the managed offering: Anthropic-style hands-off hosting where the vendor handles updates, scaling, and uptime for a subscription.
- The quickest local start is Docker or npx:

```bash
# Run with Docker, persisting data to a named volume
docker volume create n8n_data
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n
```

```bash
# Or try it without installing
npx n8n
```

- For production self-hosting, point n8n at PostgreSQL and configure queue mode with Redis so executions scale across workers.

```yaml
# Minimal docker-compose snippet using Postgres
services:
  n8n:
    image: docker.n8n.io/n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=changeme
    volumes:
      - n8n_data:/home/node/.n8n
```

---

## Where it fits vs Zapier and Make

- Zapier is the easiest pure SaaS option but bills per task and hides most of the underlying logic; n8n exposes the full data flow.
- Make (formerly Integromat) offers a richer visual canvas than Zapier; n8n sits close to it but adds self-hosting and open access to the code.
- n8n's edge is cost control and ownership: self-hosting means no per-execution fees and your data never has to leave your network.
- It is more developer-friendly - raw HTTP Request nodes, code nodes, and Git-based version control of workflows let you treat automations like software.
- Trade-off: with self-hosting you own the maintenance, upgrades, scaling, and security that a fully managed SaaS would handle for you.

---

## Who it is for

- Developers and technical teams who want automation they can extend with code and host themselves.
- Ops, IT, and growth teams automating repetitive cross-app tasks like syncing records, notifications, and reporting.
- Organizations with data-privacy or compliance requirements that prefer keeping workflow data on their own infrastructure.
- Builders creating AI agents and LLM-powered pipelines that need tool calling, memory, and multi-step orchestration.
- Anyone hitting the cost ceiling of per-task SaaS automation who wants predictable, flat-rate self-hosted pricing.

---

## Key takeaways

- n8n is fair-code, node-based automation you can self-host for free or run as managed n8n Cloud.
- Workflows are visual graphs of trigger and action nodes passing JSON, with expressions and code nodes for full control.
- Versus Zapier and Make, n8n trades managed simplicity for ownership, lower cost at scale, and developer extensibility.
- It increasingly targets AI workflows, with dedicated AI Agent and LangChain-based nodes.
- Best fit for technical teams and privacy-conscious organizations that want to own their automation stack.
