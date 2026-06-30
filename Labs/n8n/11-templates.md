# 11 · Workflow Templates: Create and Use Them

> Templates are pre-built workflows you can import, customize, and reuse - a fast way to start from a working example instead of a blank canvas.

---

## What a template is

- A template is a complete workflow saved as JSON that you can import into any n8n instance.
- Because every workflow is just JSON, "a template" and "a workflow" are the same format - the difference is intent: a template is meant to be reused.
- Templates capture the node layout, connections, parameters, and notes - everything except your private credentials.
- They range from tiny snippets (two or three nodes) to full multi-step automations with branching and AI nodes.
- The official n8n template library hosts thousands of community and vendor templates you can browse and import.

---

## Where templates come from

- The built-in template gallery: in the editor, start a new workflow and browse or search curated templates by app or use case.
- The online library at n8n.io/workflows - find a template, then copy its JSON or use the "Use workflow" button.
- Shared by teammates as exported `.json` files, or pasted JSON from chat or a repo.
- Your own library: any workflow you build can become a template by exporting it.
- AI-generated starting points, which you then import and refine like any other template.

---

## How to use a template (import)

- From the gallery: open a template, click to use it, and n8n drops the nodes onto a new canvas.
- From a JSON file or clipboard: open the workflow menu (top-right) and choose Import from File or Import from URL.
- You can also paste workflow JSON directly onto the canvas - n8n recognizes it and creates the nodes.

```text
Editor → ⋯ (workflow menu) → Import from File...   (select the .json)
Editor → ⋯ (workflow menu) → Import from URL...    (paste a raw JSON URL)
Canvas → paste copied workflow JSON directly (Cmd/Ctrl+V)
```

- After import, the nodes appear exactly as designed, but they are not connected to your accounts yet.

---

## After importing: make it yours

- Connect credentials: nodes that need auth (Gmail, Slack, an HTTP API) will show a credential warning - select or create your own credential for each.
- Review parameters: check IDs, URLs, channels, and field mappings that were specific to the template author's setup.
- Adjust the trigger: a template may ship with a Manual Trigger for testing; swap in a Schedule or Webhook trigger for real use.
- Run a test execution before activating, so you catch missing credentials or bad mappings early.
- Rename the workflow and add a short note so future-you knows what it does.

---

## How to create your own template (export)

- Build and test a workflow as normal, then export it to capture the reusable JSON.
- Use the workflow menu to download the file, or copy the selected nodes to share a fragment.

```text
Editor → ⋯ (workflow menu) → Download            (saves workflow.json)
Canvas → select nodes → copy (Cmd/Ctrl+C)        (copies just those nodes as JSON)
```

- Exported JSON does not include credential secrets - only a reference to which credential type is needed, so it is safe to share.
- Commit the `.json` into a Git repo to version your templates and track changes over time.
- To reuse a fragment across many workflows, copy the selected nodes and paste them into another canvas.

---

## Make templates reusable, not brittle

- Pull environment-specific values (API base URLs, IDs, tokens) out of node parameters and into expressions or environment variables.
- Add Sticky Notes on the canvas to document what each section does and what the user must change after import.
- Keep credential-bound nodes generic so the importer only has to pick their own credential, not rewrite the node.
- Use clear node names ("Fetch open invoices" beats "HTTP Request1") so the template reads like documentation.
- Avoid hardcoding personal data; use placeholders the importer can find and replace.

---

## Sharing templates with a team

- Store team templates as `.json` files in a shared repo or folder, grouped by purpose.
- Document required credentials and any environment variables at the top of each template (a Sticky Note works well).
- For an internal standard, keep a "starter" template that already wires your common nodes (logging, error handling) so every new workflow inherits them.
- Submitting to the public n8n library is also possible if a template is broadly useful and free of private details.

---

## Key takeaways

- A template is just a reusable workflow stored as JSON - import it to start from a working example.
- Import via the gallery, a file, a URL, or by pasting JSON onto the canvas; then connect your own credentials.
- Create a template by exporting (Download) a workflow, or copy selected nodes to share a fragment.
- Exports never contain credential secrets, so templates are safe to share and version in Git.
- Make templates robust with clear node names, Sticky Note docs, and externalized config values.
