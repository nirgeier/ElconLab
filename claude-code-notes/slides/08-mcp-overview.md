# 08 · MCP Overview

> How the Model Context Protocol lets Claude Code reach beyond its built-in tools to talk to external systems, data sources, and services through standardized servers.

---

## Slide: What MCP is

- MCP (Model Context Protocol) is an open standard for connecting LLM applications to external tools and data through a uniform interface.
- In Claude Code, MCP is the plugin layer for capabilities that are not built in - databases, issue trackers, browsers, internal APIs, SaaS products.
- A "host" (Claude Code) launches or connects to one or more "MCP servers," each exposing a set of capabilities.
- The protocol is transport-agnostic and JSON-RPC based, so the same server can serve many different MCP clients, not just Claude Code.
- The point: you write or install a server once, and Claude can use it without custom glue code in the model itself.

---

## Slide: The three capability types

- **Tools** - callable functions the model can invoke (e.g. `query_database`, `create_ticket`). These are the most common and are surfaced to Claude as available actions.
- **Resources** - readable data the server exposes by URI (e.g. a file, a row, a document). Claude Code can list and read these via dedicated resource tools.
- **Prompts** - server-defined prompt templates that surface in Claude Code as slash commands, letting a server ship reusable workflows.
- Tools are model-invoked; resources are typically referenced or read on demand; prompts are user-invoked.
- A single server can expose any mix of the three.

---

## Slide: Transports - stdio vs HTTP

- **stdio**: Claude Code spawns the server as a local subprocess and talks over stdin/stdout. Best for local tools, scripts, and anything that runs on your machine.
- **HTTP** (streamable HTTP, the successor to the older SSE transport): Claude Code connects to a server over a URL. Best for remote/hosted servers and shared team services.
- stdio servers start and stop with your Claude Code session; HTTP servers run independently and are reached over the network.
- Remote HTTP servers commonly require auth (headers or OAuth); stdio servers usually inherit your local environment and credentials.
- Choose stdio for "runs here," HTTP for "lives somewhere else."

---

## Slide: Adding servers with the CLI

- The fastest way to register a server is `claude mcp add`, which writes the config for you.
- Example (stdio):

```bash
claude mcp add my-db --scope project \
  -- npx -y @some/db-mcp-server --readonly
```

- Example (HTTP):

```bash
claude mcp add --transport http linear https://mcp.example.com/sse \
  --header "Authorization: Bearer ${TOKEN}"
```

- Useful companions: `claude mcp list` to see configured servers and `claude mcp get <name>` for details.
- The `--` separates Claude's flags from the command/args passed to the server process.

---

## Slide: Config scopes & the JSON shape

- Servers can be configured at three scopes: **local** (just you, this project), **project** (shared via committed `.mcp.json`), and **user** (you, across all projects).
- The `.mcp.json` file is the team-shareable form - commit it so everyone gets the same servers.
- A typical entry looks like:

```json
{
  "mcpServers": {
    "my-db": {
      "command": "npx",
      "args": ["-y", "@some/db-mcp-server", "--readonly"],
      "env": { "DB_URL": "${DB_URL}" }
    }
  }
}
```

- HTTP servers use `"type": "http"`, a `"url"`, and an optional `"headers"` block instead of `command`/`args`.
- Use `${VAR}` expansion to keep secrets out of committed files.

---

## Slide: How MCP tools appear to Claude

- MCP tool names are namespaced as `mcp__<server>__<tool>` so they never collide with built-in tools or other servers.
- Inside Claude Code you can reference a server's prompts as slash commands like `/mcp__<server>__<prompt>`.
- The `/mcp` command shows connected servers, their status, and lets you authenticate servers that need OAuth.
- Because tool names are predictable, you can scope permissions to a whole server (`mcp__linear__*`) or a single tool.
- Servers that fail to start show up as errors in `/mcp` rather than silently disappearing.

---

## Slide: Permissions & allowlisting

- MCP tools obey the same permission system as everything else - by default Claude asks before calling them.
- You can pre-approve trusted tools in `settings.json` to cut down on prompts:

```json
{
  "permissions": {
    "allow": ["mcp__my-db__query_database"],
    "deny":  ["mcp__my-db__drop_table"]
  }
}
```

- Allow rules can target an entire server (`mcp__my-db__*`) or individual tools; deny rules win over allow.
- Plan mode and permission modes still apply: nothing executes until it clears your configured permission gate.
- Prefer allowlisting read-only tools and keeping anything destructive behind explicit approval.

---

## Slide: Security considerations

- An MCP server is third-party code running with your credentials and environment - treat installing one like installing a dependency.
- Prefer servers you trust or can audit; pin versions and avoid pulling unpinned remote code where possible.
- Watch for prompt-injection: tool results and resources are untrusted input and can try to steer Claude - be cautious about auto-approving tools that act on that content.
- Keep secrets in environment variables referenced from config, never hard-coded in committed `.mcp.json`.
- For remote HTTP servers, verify the endpoint and use proper auth; for stdio servers, remember they inherit your local shell access.
- Use `deny` rules and least-privilege allowlists so a compromised or buggy server can't take destructive actions unprompted.

---

## Slide: When to use MCP vs other extension points

- **MCP** - connect to an external system or shared service with a real protocol (DB, API, browser, SaaS).
- **Skills** - package reusable instructions/workflows for Claude; no external process needed.
- **Subagents** - delegate a scoped task to a separate context window.
- **Hooks** - run your own shell commands deterministically on lifecycle events (e.g. format on edit).
- **Plugins** - bundle and distribute any of the above (including MCP servers) as one installable unit.
- Reach for MCP specifically when the capability lives outside Claude Code and benefits from a standardized client/server boundary.

---

## Slide: Key takeaways

- MCP is Claude Code's standard way to reach external tools and data via servers that expose tools, resources, and prompts.
- Pick the transport by location: stdio for local subprocesses, HTTP for remote/hosted services.
- Configure with `claude mcp add` or a committed `.mcp.json`, using scopes and `${VAR}` to share safely.
- MCP tools are namespaced (`mcp__server__tool`) and fully governed by the permission system - allowlist read-only, deny destructive.
- Servers run with your access, so treat them as trusted dependencies and stay alert to prompt injection from tool output.
