# 02 · Install n8n Locally

> A hands-on lab to get n8n running on your own machine - Docker first (the recommended path), with npx and npm as quick alternatives, plus data persistence, updates, and troubleshooting.

---

## What you are building

- A local n8n instance reachable at `http://localhost:5678`, with your own owner account
- n8n is a fair-code workflow automation tool: you build flows by wiring nodes on a canvas
- Self-hosting locally means your credentials and workflow data stay on your machine
- Primary install path is Docker; `npx` and global `npm` are lighter alternatives for quick trials
- Goal: reach the editor UI, create an owner account, and keep your data across restarts

---

## Prerequisites

- A terminal and one of: Docker (recommended), or Node.js 20+ for the `npx` / `npm` paths
- For Docker on Mac or Windows, install Docker Desktop; on Linux, Docker Engine is enough
- Verify what you have installed before starting:

```bash
docker --version
docker compose version
node --version
```

- TCP port `5678` must be free (that is the default n8n port)

---

## Method A - Docker run (one-liner)

- This is the fastest way to a persistent Docker setup. First create a named volume so data survives container removal:

```bash
docker volume create n8n_data
```

- Then start n8n, mapping the port and mounting the volume at `/home/node/.n8n`:

```bash
docker run -d --name n8n \
  -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n
```

- `-d` runs it in the background; `--name n8n` lets you reference it later
- The `/home/node/.n8n` directory holds the SQLite database, encryption key, and config
- Check it is up with `docker ps` and follow logs with `docker logs -f n8n`

---

## Method B - Docker Compose (recommended)

- Compose makes the setup reproducible and easy to edit. Create a project folder:

```bash
mkdir n8n-local && cd n8n-local
```

- Create a `.env` file with your settings. Generate a strong encryption key once and keep it stable:

```bash
N8N_ENCRYPTION_KEY=replace-with-a-long-random-string
N8N_HOST=localhost
N8N_PORT=5678
N8N_PROTOCOL=http
GENERIC_TIMEZONE=UTC
```

- Generate a random key for that file, for example:

```bash
openssl rand -hex 32
```

- Then create `docker-compose.yml`:

```yaml
services:
  n8n:
    image: docker.n8n.io/n8nio/n8n
    container_name: n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    env_file:
      - .env
    environment:
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
      - N8N_HOST=${N8N_HOST}
      - N8N_PORT=${N8N_PORT}
      - N8N_PROTOCOL=${N8N_PROTOCOL}
      - GENERIC_TIMEZONE=${GENERIC_TIMEZONE}
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:
```

---

## Start and manage the Compose stack

- From the folder containing `docker-compose.yml`, bring it up in the background:

```bash
docker compose up -d
```

- Watch the startup logs until you see the editor is ready:

```bash
docker compose logs -f n8n
```

- Stop the stack without deleting data (the named volume persists):

```bash
docker compose down
```

- Bring it back with `docker compose up -d` - your workflows and account are still there
- `docker compose down -v` would also delete the volume, wiping all data, so avoid `-v` unless you mean it

---

## Verify it works

- Open a browser to `http://localhost:5678`
- On first launch n8n shows the owner account setup screen - this is the admin user for your instance
- Enter your email, a first and last name, and a strong password, then submit
- You land on the workflow editor canvas; create a new workflow and add a Manual Trigger node to confirm the editor is functional
- If the page does not load, check the container is running with `docker ps` and review `docker logs n8n`

---

## Persist your data

- All state lives in `/home/node/.n8n` inside the container: the SQLite database, the encryption key file, and settings
- Mounting a named volume (`n8n_data`) there is what keeps data across container restarts and recreations
- The `N8N_ENCRYPTION_KEY` encrypts stored credentials - if it changes, existing saved credentials become unreadable
- Set `N8N_ENCRYPTION_KEY` explicitly in `.env` so it stays identical when you recreate the container; do not let it regenerate
- To back up, you can copy the volume contents out:

```bash
docker run --rm -v n8n_data:/data -v "$PWD":/backup \
  alpine tar czf /backup/n8n-backup.tar.gz -C /data .
```

---

## Method C - npx (quick try)

- Best for a fast look with no install footprint; requires Node.js 20+
- Run a one-off instance directly:

```bash
npx n8n
```

- It downloads and starts n8n, then serves the editor at `http://localhost:5678`
- By default data is stored in `~/.n8n` on your host, so workflows persist between runs
- Stop it with `Ctrl+C`; this path is convenient but less isolated than Docker

---

## Method D - npm global install

- Installs the `n8n` command system-wide; also needs Node.js 20+:

```bash
npm install -g n8n
```

- Start it any time with:

```bash
n8n
```

- Run it in tunnel mode only for testing webhooks from external services:

```bash
n8n start --tunnel
```

- Data again lives in `~/.n8n`; the tunnel is for development only and should not be used in production

---

## Update n8n

- Docker (run): pull the new image, remove the old container, and start fresh - the volume keeps your data:

```bash
docker pull docker.n8n.io/n8nio/n8n
docker stop n8n && docker rm n8n
docker run -d --name n8n -p 5678:5678 -v n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n
```

- Docker Compose: pull and recreate in two commands:

```bash
docker compose pull
docker compose up -d
```

- To pin a version instead of `latest`, use a tag like `docker.n8n.io/n8nio/n8n:1.0.0` in the image reference
- npm global: re-run `npm install -g n8n` to upgrade; npx fetches the latest on each run by default

---

## Troubleshooting

- Port already in use: an error mentioning `5678` or `EADDRINUSE` means something else holds the port. Find it with `lsof -i :5678` (macOS/Linux), or remap with `-p 5679:5678` and open `http://localhost:5679`
- Data not persisting: confirm the volume mount path is exactly `/home/node/.n8n` and that you are not running `docker compose down -v`. Check the volume exists with `docker volume ls`
- Lost credentials after recreate: the `N8N_ENCRYPTION_KEY` changed. Restore the same key in `.env` and recreate the container
- Permission errors on the volume: the official image runs as the `node` user (UID 1000); a bind mount owned by root can fail, so prefer a named volume
- Container exits immediately: read `docker logs n8n` for the actual error - usually a bad env var or an occupied port
- Cannot reach the UI: verify `docker ps` shows the container as `Up` and that the port mapping column reads `0.0.0.0:5678->5678/tcp`

---

## Key takeaways

- Docker with a named volume mounted at `/home/node/.n8n` is the most reliable local setup
- Set and preserve `N8N_ENCRYPTION_KEY` in a `.env` file so stored credentials stay decryptable across recreations
- Compose makes the configuration reproducible; `up -d` and `down` (without `-v`) safely cycle the instance
- `npx n8n` and `npm install -g n8n` are quick alternatives but offer less isolation than containers
- Updating means pulling a new image and recreating the container - the data volume carries your workflows forward
