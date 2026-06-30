# 12 · Plugins Overview

> Plugins are installable bundles that package skills, slash commands, hooks, subagents, and MCP servers together so a whole team can extend Claude Code the same way with one command.

---

## What a plugin is

- A plugin is a single distributable unit that bundles one or more Claude Code extensions into a versioned package
- It can contain any mix of: skills, slash commands, hooks, subagents (custom agents), and MCP server definitions
- The point is packaging and sharing - instead of hand-copying files into `.claude/`, you install one plugin and get everything
- Plugins are loaded by Claude Code at startup; their contents appear alongside your own project and user-level config
- Each plugin has a manifest (`plugin.json`) declaring its name, version, and what it provides

---

## The five things a plugin can bundle

- **Skills** - model-invoked capability folders (a `SKILL.md` plus optional scripts/references) that Claude loads on demand
- **Slash commands** - `/name` prompt templates the user triggers explicitly
- **Hooks** - shell commands wired to lifecycle events (e.g. `PreToolUse`, `PostToolUse`, `SessionStart`, `Stop`)
- **Subagents** - specialized agent definitions with their own prompt, tools, and model that Claude can delegate tasks to
- **MCP servers** - connections to external tools/data via the Model Context Protocol, so the plugin can ship integrations (GitHub, a database, an internal API)
- A plugin does not have to include all five - many ship just a skill or just a set of commands

---

## Marketplaces

- A marketplace is a catalog of plugins, defined by a `marketplace.json` that lists available plugins and where to fetch them
- Marketplaces are typically backed by a git repository, so a team can host its own private internal marketplace
- You add a marketplace once, then browse and install any plugin it offers
- Anthropic and the community publish marketplaces; organizations commonly run their own for internal-only plugins
- The marketplace is the discovery layer; the plugin is the actual installed payload

```bash
# add a marketplace (e.g. a team's internal repo)
/plugin marketplace add your-org/claude-plugins
```

---

## Installing and managing plugins

- The `/plugin` command is the entry point for browsing, installing, enabling, disabling, and removing plugins
- Install pulls the plugin from its marketplace; you can then enable or disable it without fully uninstalling
- Disabling is useful to silence a noisy plugin or resolve a command-name conflict without losing the install
- Plugins are versioned, so you can update to pick up new commands, skills, or fixes

```bash
/plugin                       # open the interactive plugin menu
/plugin marketplace add <repo>
/plugin install <name>@<marketplace>
```

---

## Anatomy of a plugin

- A plugin is a directory with a `plugin.json` manifest at its root describing metadata and contents
- Conventional subfolders hold each extension type, for example:

```
my-plugin/
  plugin.json
  commands/        # slash commands (.md)
  skills/          # skill folders, each with SKILL.md
  agents/          # subagent definitions
  hooks/hooks.json # hook event wiring
  .mcp.json        # MCP server definitions
```

- Claude Code reads the manifest, then exposes whatever folders exist - missing folders are simply skipped
- Paths inside the plugin can reference `${CLAUDE_PLUGIN_ROOT}` so scripts resolve correctly regardless of install location

---

## How plugins layer with the rest of config

- Claude Code merges configuration from several places: user-level (`~/.claude/`), project-level (`.claude/`), and installed plugins
- Plugin skills and commands live alongside your own - a project skill and a plugin skill can coexist
- Settings precedence still applies: enterprise managed settings, then user, then project `settings.json` / `settings.local.json`
- Plugin hooks run as part of the same lifecycle events as any hooks you define yourself in `settings.json`
- MCP servers from a plugin behave like MCP servers you'd add manually - they just arrive pre-packaged

---

## Plugins for a team

- Plugins turn "here's how we use Claude Code" into something installable and version-controlled instead of tribal knowledge
- A shared internal marketplace lets every engineer install the same review commands, deploy workflows, and house-style skills
- Bundling hooks lets a team enforce conventions automatically - e.g. run a formatter after edits or block writes to protected paths
- Onboarding shrinks to a couple of `/plugin` commands rather than copying snippets into each person's config
- Updating one plugin in the marketplace rolls improvements out to the whole team

```json
// hooks.json - auto-format edited files team-wide
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "prettier --write \"$CLAUDE_FILE_PATHS\"" }
        ]
      }
    ]
  }
}
```

---

## When to build a plugin (vs. plain config)

- Use a plain `.claude/` skill, command, or `CLAUDE.md` when it's specific to one repo and you don't need to share it
- Reach for a plugin when the same extensions should travel across many repos or many teammates
- Plugins are also right when you want versioning, a changelog, and a clean install/uninstall story
- If you're shipping an MCP integration plus the commands that drive it, bundling them in one plugin keeps them in sync
- Keep plugins focused - a tight bundle around one workflow is easier to adopt than a kitchen-sink plugin

---

## Key takeaways

- A plugin bundles skills, commands, hooks, subagents, and MCP servers into one installable, versioned package
- Marketplaces (often git-backed, including private internal ones) are how plugins are discovered and distributed
- Manage everything through `/plugin` - add a marketplace, install, enable/disable, update
- Plugin contents layer cleanly with your user- and project-level config and follow the same settings precedence
- For teams, plugins standardize workflows and enforce conventions, turning setup into a one-command onboarding step
