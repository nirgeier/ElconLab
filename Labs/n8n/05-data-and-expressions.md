# 05 · Working with Data & Expressions

> How n8n moves data between nodes as items, and how expressions let you reference and transform that data on the fly.

---

## The n8n data structure

- Data flows between nodes as an **array of items**, where each item represents one "thing" being processed (a row, a record, a webhook payload).
- Every item is an object with up to two keys: `json` (the structured data) and `binary` (attached files like images, PDFs, or spreadsheets).
- The canonical shape is a list, so even a single result is wrapped in an array of one item.
- Most nodes run **once per item**: if 50 items arrive, the node executes its logic 50 times, producing one or more output items each.
- This item-based model is why a node that returns nothing outputs an empty array `[]`, which stops downstream branches from running.

```json
[
  {
    "json": { "name": "Ada", "email": "ada@example.com" },
    "binary": {}
  },
  {
    "json": { "name": "Linus", "email": "linus@example.com" },
    "binary": {}
  }
]
```

---

## JSON vs binary data

- The `json` key holds plain structured data and is what most nodes read from and write to.
- The `binary` key holds file data referenced by a property name (e.g. `data`), with metadata like `fileName`, `mimeType`, and `fileExtension`.
- Binary data is kept separate from JSON so large files do not bloat the data you map and filter on.
- Nodes like Read/Write Files, HTTP Request (with file responses), and Google Drive populate the `binary` key.
- To move a file forward you reference its binary property by name; converting between the two is done with nodes such as Extract from File and Convert to File.

```json
{
  "json": { "invoiceId": 1042 },
  "binary": {
    "data": {
      "fileName": "invoice-1042.pdf",
      "mimeType": "application/pdf",
      "fileExtension": "pdf"
    }
  }
}
```

---

## Mapping data between nodes

- Mapping means telling a downstream node which fields from an upstream node to use.
- In the editor you can **drag a field** from the input panel (left) into a parameter to generate the correct expression automatically.
- Fixed mode treats a value as a literal string; switching a field to **expression mode** lets it pull live data instead.
- Data is only available from nodes that have already run, so execute upstream nodes (or the whole workflow) to see real values to map.
- The Schema view of the input panel is the quickest way to browse available fields and drag them where you need them.

---

## Expressions and the {{ }} syntax

- An expression is JavaScript wrapped in double curly braces: anything inside `{{ }}` is evaluated and its result substituted in.
- Expressions are single-line and return a value; they are not for multi-statement logic (use the Code node for that).
- You can call standard JavaScript and n8n's built-in helpers, plus the Luxon library for dates via `$now` and `$today`.
- A red/error tooltip in the field usually means the referenced node has not run yet or a property path is wrong.

```javascript
{{ $json.firstName + " " + $json.lastName }}
{{ $json.price * 1.17 }}
{{ $now.toFormat("yyyy-MM-dd") }}
```

---

## Built-in variables: $json, $node, $input

- `$json` refers to the JSON of the **current item** in the node currently being configured - the most common reference.
- `$input` accesses the node's incoming data, e.g. `$input.item.json` for the current item or `$input.all()` for every item.
- `$()` (formerly `$node["Name"]`) reaches back to a **specific named node's** output, e.g. `$('Webhook').item.json.body`.
- `$itemIndex` and `$runIndex` expose the current item's position and the execution run number for loops.
- `$vars` and `$env` expose workflow/instance variables and environment values where configured.

```javascript
{{ $json.email }}
{{ $('HTTP Request').item.json.id }}
{{ $input.all().length }}
{{ $('Set').item.json.total }}
```

---

## The Edit Fields (Set) node

- The Edit Fields node (still widely called **Set**) is the standard way to create, rename, or reshape fields on items.
- **Manual Mapping** mode lets you define output fields one by one, typing literals or switching each to an expression.
- **JSON** mode lets you paste a full JSON object/template to build the output item directly.
- The **Keep Only Set** / "Include Other Input Fields" toggle controls whether upstream fields pass through or are dropped.
- Each defined field has a type (String, Number, Boolean, Array, Object) so values are coerced correctly downstream.
- It is the go-to node for cleaning API responses, renaming keys, adding constants, or trimming payloads before the next step.

```json
{
  "fullName": "{{ $json.firstName }} {{ $json.lastName }}",
  "isActive": true,
  "source": "n8n-workflow"
}
```

---

## Key takeaways

- All n8n data travels as an array of items, each with a `json` object and an optional `binary` object.
- Expressions live inside `{{ }}` and run single-line JavaScript with helpers like `$now` and Luxon.
- Use `$json` for the current item, `$input` for incoming data, and `$('Node Name')` to reach a specific upstream node.
- Map fields by dragging from the input panel and flipping parameters into expression mode.
- The Edit Fields (Set) node is the primary tool for shaping, renaming, and adding fields between steps.
