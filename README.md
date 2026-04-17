# Elcon – AI-Powered Business Systems Training

Hands-on labs for Elcon employees to learn how to build, maintain, and extend internal business systems using AI tools (Claude, n8n, Cursor, Supabase, and more).

## Quick Start

```bash
# Initialize submodules
git submodule update --init --recursive

# Run the init script (sets up venv, builds mkdocs config, serves locally)
./.mkdocs-shared/init_site.sh
```

## Structure

```
Labs/                  # All lab content (mkdocs docs_dir)
mkdocs/                # Project-specific mkdocs overrides
.mkdocs-shared/        # Shared mkdocs submodule
.mkdocs-build/         # Generated at build time (gitignored)
mkdocs-site/           # Generated static site (gitignored)
vercel.json            # Vercel deployment config
```

## Labs

| #   | Lab                       | Topic                                     |
| --- | ------------------------- | ----------------------------------------- |
| 001 | AI Landscape & Setup      | LLMs, tools overview, account setup       |
| 002 | Prompt Engineering        | Effective prompts for business systems    |
| 003 | Building Apps with Claude | From idea to working prototype            |
| 004 | Database Fundamentals     | Supabase, PostgreSQL, connecting apps     |
| 005 | Hosting & Deployment      | Vercel, self-hosted, going live           |
| 006 | ERP Integration           | Hashavshevet connection, read-only access |
| 007 | n8n Basics                | Visual workflow automation                |
| 008 | n8n Advanced Workflows    | Real Elcon automations                    |
| 009 | n8n + AI                  | AI nodes, document processing             |
| 010 | Cursor & Windsurf         | AI code editors for maintenance           |
| 011 | System Architecture       | Designing Elcon's target stack            |
| 012 | Security & Best Practices | Auth, backups, safe patterns              |
| 013 | Building Your Roadmap     | Prioritization, ownership, next steps     |

## Deployment

The site is deployed via Vercel. Push to `main` to trigger a build.
