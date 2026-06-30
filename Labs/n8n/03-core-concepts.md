# 03 · Core Concepts: Workflows, Nodes & Connections

> n8n models automation as a directed graph where nodes do the work and connections carry data from a trigger through to action steps.

---

## What a workflow is

- A workflow is a single automation: a collection of nodes wired together that runs as one unit.
- Each workflow lives on its own canvas and can be activated independently or run on demand.
- Workflows are stored as JSON, so they can be exported, version-controlled, and imported into another instance.
- A workflow needs at least one trigger node before it can be activated to run automatically.
- Workflows can have a toggle state (active or inactive) shown in the editor header.

---

## Nodes: the building blocks

- A node is a single step that either starts the flow, fetches or sends data, or transforms the data passing through.
- Trigger nodes start a workflow. Examples include Manual Trigger, Schedule Trigger, Webhook, and app-specific triggers like Gmail Trigger.
- Action (regular) nodes do the work in the middle and end of a flow - HTTP Request, Set, IF, Code, and hundreds of app integration nodes.
- Trigger nodes have no input connector on their left side; they are always the entry point and sit at the start of the graph.
- Many nodes expose multiple operations (for example, the Gmail node can get, send, or label messages) selected via the node's parameters.
- Core utility nodes (Set/Edit Fields, IF, Switch, Merge, Code, HTTP Request) are app-agnostic and used in almost every workflow.

---

## Connections

- A connection is the wire linking one node's output to the next node's input, defining execution order and data flow.
- Data travels along connections as an array of items, where each item is a JSON object (often with an optional binary section).
- One output can fan out to several nodes, and multiple nodes can feed into one (the Merge node is built for combining branches).
- Branching nodes like IF and Switch have multiple labeled outputs (for example, true and false) so different items take different paths.
- Connections only run forward; a node runs once all of its required incoming connections have delivered data.

---

## The canvas and editor UI

- The canvas is the visual editor where you drag, drop, and wire nodes to build the workflow graph.
- The nodes panel (opened with the + button or Tab) lets you search and add nodes onto the canvas.
- Clicking a node opens the node detail view (NDV), split into input data, parameters, and output data panes.
- The header holds the workflow name, the active/inactive toggle, Save, and the Execute Workflow control.
- Other tabs around the editor expose Executions history, workflow settings, and sharing or credential options depending on your plan.

---

## Executing a workflow manually

- Use the Execute Workflow button to run the whole workflow once from the editor, without activating it.
- A Manual Trigger node is the typical entry point for test runs that you start by hand.
- You can also execute a single node to test just that step, using the data currently sitting at its input.
- After a run, each node shows item counts and a colored state, and you can open the NDV to inspect the exact input and output JSON.
- Manual execution is for building and debugging; production runs are driven by an active trigger such as Schedule or Webhook.

```bash
# Self-hosted: start n8n locally and open the editor at http://localhost:5678
npx n8n
```

---

## The execution model

- An execution is a single run of a workflow, recorded with its status (success, error, or running) in the Executions list.
- Execution starts at the trigger and flows downstream; each node processes the items handed to it and emits items to the next node.
- Most nodes run once per execution but loop internally over every incoming item, so one node call handles all items at once.
- Items carry the data; referencing earlier output is done with expressions such as `{{ $json.fieldName }}` or `{{ $node["Node Name"].json }}`.
- n8n offers two execution order modes (the recommended v1 ordering and a legacy v0), set in workflow settings, which affects how branches are sequenced.
- Failed executions can surface error details per node, and an Error Trigger workflow can be wired up to catch failures globally.

---

## Key takeaways

- A workflow is a directed graph: trigger nodes start it, action nodes do the work, and connections define order and data flow.
- Data moves as an array of items (JSON, optionally with binary), and most nodes process all items in a single call.
- The canvas plus the node detail view are where you build, wire, and inspect data at every step.
- Execute Workflow runs everything once for testing; activation hands control to a real trigger for production.
- Every run is an execution you can inspect and replay, making debugging and error handling first-class.
