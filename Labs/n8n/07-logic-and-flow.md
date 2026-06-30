# 07 · Flow Logic: IF, Switch, Merge & Loops

> Control data flow in n8n by branching with IF, Switch, and Filter, then recombining and iterating over items with Merge and Loop Over Items.

---

## Why flow logic matters

- In n8n, data moves between nodes as an array of items, each shaped like `{ "json": { ... }, "binary": { ... } }`.
- Flow logic nodes decide which items continue, where they go, and how separate branches come back together.
- Most nodes process every incoming item once, so branching and looping are about routing items, not writing manual `for` loops.
- Keeping logic in dedicated nodes (instead of cramming it into Code nodes) makes a workflow easier to read and debug from the canvas.
- Each branch you create runs independently until you explicitly merge it back.

---

## IF node - two-way branching

- The IF node evaluates one or more conditions and sends each item out of either the `true` or the `false` output.
- It has exactly two outputs; every incoming item lands on exactly one of them.
- Conditions are typed (string, number, boolean, date and time, array, object), and the editor enforces matching operators for the chosen type.
- Combine multiple conditions with AND or OR using the combinator selector inside the node.
- Use IF when you have a single yes/no decision, for example "did the API return a status of paid?".

```json
{
  "conditions": {
    "combinator": "and",
    "conditions": [
      { "leftValue": "={{ $json.status }}", "operator": { "type": "string", "operation": "equals" }, "rightValue": "paid" },
      { "leftValue": "={{ $json.amount }}", "operator": { "type": "number", "operation": "largerEqual" }, "rightValue": 100 }
    ]
  }
}
```

---

## Switch node - multi-way routing

- The Switch node routes items to one of several outputs, which scales past the IF node's two branches.
- In Rules mode you define an ordered list of conditions, and each output corresponds to the first rule an item matches.
- In Expression mode you return a numeric output index from a single expression, useful when routing is data-driven.
- A fallback output catches items that match no rule, so nothing silently disappears.
- Enable "Send data to all matching outputs" if an item should fan out to every rule it satisfies rather than only the first.
- Reach for Switch when you have three or more distinct paths, for example routing tickets by `priority` into low, medium, high, and urgent lanes.

---

## Filter node - dropping items

- The Filter node keeps items that meet its conditions and discards the rest; it has a single output.
- Unlike IF, there is no second branch - non-matching items are simply removed from the stream.
- Use it to clean a dataset before downstream nodes, for example dropping records with a missing email.
- It is the right tool when you do not need the rejected items at all and only want the survivors to continue.
- Condition configuration mirrors the IF node, including typed operators and AND/OR combinators.

---

## Merge node - recombining branches

- The Merge node takes up to multiple inputs and combines them back into a single stream.
- Append mode stacks items from each input one after another into one output list.
- Combine mode pairs items together - by matching fields, by position (index), or by producing all combinations (SQL-style join behavior).
- SQL Query mode lets you join inputs with an SQL-like statement when you need finer control over the merge.
- Merge is also handy as a synchronization point: it can wait for two parallel branches to finish before continuing.
- A common pattern is IF -> process each branch differently -> Merge (Append) to reunite all items downstream.

---

## Loop Over Items - batching and iteration

- Most nodes already iterate over every input item automatically, so an explicit loop is only needed for special cases.
- The Loop Over Items node (formerly Split In Batches) hands downstream nodes a fixed-size chunk per iteration and loops until all items are processed.
- It has two outputs: the "loop" output runs the body once per batch, and the "done" output fires when iteration completes.
- Wire the end of the loop body back into the Loop Over Items node so it can release the next batch.
- Use batching to respect API rate limits, to process large datasets without exhausting memory, or to add a Wait between calls.

```yaml
# Typical loop body wiring
Loop Over Items:
  batchSize: 10
  loop_output: -> HTTP Request -> Wait (1s) -> back to Loop Over Items
  done_output: -> continue with aggregated results
```

---

## Choosing the right node

- One yes/no decision and you want both outcomes: use IF.
- Three or more mutually exclusive paths: use Switch.
- You only want the matching items and can throw the rest away: use Filter.
- You split earlier and now need one stream again: use Merge.
- You must process items in controlled chunks or pace external calls: use Loop Over Items.

---

## Key takeaways

- IF, Switch, and Filter are all about routing items; the difference is how many outputs you need and whether rejected items survive.
- Branches in n8n stay separate until a Merge node deliberately recombines them.
- Merge offers append, combine, and SQL modes - pick based on whether you are stacking, pairing, or joining data.
- Loop Over Items is for deliberate batching and pacing, not everyday iteration, since nodes loop over items on their own.
- Favor dedicated flow-logic nodes over hand-written loops in Code nodes to keep workflows visual and maintainable.
