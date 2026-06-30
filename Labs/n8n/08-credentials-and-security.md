# 08 · Credentials & Security

> How n8n encrypts and stores credentials, why the encryption key matters, and the baseline steps to harden a self-hosted instance.

---

## How n8n stores credentials

- Credentials (API keys, OAuth tokens, passwords) are stored in n8n's database, not in plain text inside workflows.
- The sensitive fields of each credential are encrypted at rest using AES before being written to the `credentials_entity` table.
- Workflows reference a credential by its ID and name, so the secret value never lives inside the exported workflow JSON.
- Decryption happens only at execution time, in memory, when a node actually needs to authenticate.
- Because secrets are not embedded in the workflow, you can export and share a workflow without leaking the underlying keys.

---

## The encryption key

- All credential encryption keys derive from a single instance-level secret called the encryption key.
- On first start, n8n generates a random key and writes it to `~/.n8n/config` (the default `N8N_USER_FOLDER`).
- You can pin the key explicitly with the `N8N_ENCRYPTION_KEY` environment variable, which is strongly recommended for production and containers.
- If the key changes or is lost, every stored credential becomes undecryptable and must be re-entered.
- Keep the key identical across every node when running n8n in queue mode or multiple replicas, otherwise workers cannot decrypt shared credentials.

```bash
# Pin the encryption key so it survives container restarts and rebuilds
export N8N_ENCRYPTION_KEY="a-long-random-string-you-generate-once"

# Generate a suitable value
openssl rand -hex 32
```

---

## Creating and reusing credentials

- Create credentials from the Credentials section in the UI, or inline from a node's Credential dropdown.
- Each credential has a type tied to a specific integration (for example, "Header Auth", "HTTP Basic Auth", or a service-specific OAuth2 type).
- One saved credential can be reused across many nodes and workflows, so you update a rotated key in exactly one place.
- Use the built-in Connection / "Test" action where available to validate a credential before relying on it in a workflow.
- OAuth2 credentials store the refresh token and let n8n renew access tokens automatically without re-authenticating each run.

---

## Environment variables and external secrets

- Configure instance behavior through environment variables rather than editing files inside the container.
- Common variables include `N8N_ENCRYPTION_KEY`, `N8N_HOST`, `N8N_PORT`, `WEBHOOK_URL`, and the `DB_*` settings for an external database.
- You can reference environment variables inside expressions with `$env`, for example `{{ $env.MY_API_BASE }}`, useful for non-secret config like base URLs.
- By default `$env` access is enabled; set `N8N_BLOCK_ENV_ACCESS_IN_NODE=true` to stop workflows from reading process environment variables.
- External secrets stores (such as HashiCorp Vault, AWS Secrets Manager, Azure Key Vault, and GCP Secret Manager) are an Enterprise feature exposed through the `$secrets` expression.

```yaml
# docker-compose excerpt: inject config and secrets as env vars
services:
  n8n:
    image: docker.n8n.io/n8nio/n8n
    environment:
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PASSWORD=${POSTGRES_PASSWORD}
      - WEBHOOK_URL=https://n8n.example.com/
```

---

## Hardening a self-hosted instance

- Always run n8n behind HTTPS; terminate TLS at a reverse proxy (nginx, Caddy, Traefik) so credentials and the editor session are never sent in clear text.
- Enable user management and use strong, unique accounts; the owner account should not be shared.
- Move off the default SQLite to PostgreSQL for production, and back up both the database and the encryption key together.
- Restrict network exposure: keep the editor on a private network or VPN and expose only the webhook paths you actually need.
- Keep n8n updated to pick up security patches, and consider `N8N_SECURE_COOKIE=true` plus a configured `N8N_HOST`/`WEBHOOK_URL` for correct cookie and callback behavior.

---

## Key takeaways

- Credential secrets are encrypted at rest and never stored inside workflow JSON; only IDs and names are referenced.
- The `N8N_ENCRYPTION_KEY` is the single most important secret to set explicitly and back up; lose it and every credential is gone.
- Save credentials once and reuse them everywhere so rotation is a single edit.
- Drive configuration through environment variables, and reserve true secret stores (`$secrets`) for the Enterprise external-secrets feature.
- Production self-hosting means HTTPS, user management, an external database, restricted exposure, and regular updates.
