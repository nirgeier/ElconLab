# 13 · Advanced Data Transformation with the Code Node

> Master JavaScript-based data transformations in n8n: work with complex objects, arrays, nested structures, and write reusable functions inside the Code node. Learn pagination, data enrichment, and real-world data wrangling patterns.

---

## What you will learn

- **When Set (Edit Fields) is not enough:** why and when to use the JavaScript Code node
- **Working with nested and complex data:** drilling into deeply nested objects, merging arrays, flattening structures
- **Array transformations:** filter, map, reduce, and groupBy operations with real examples
- **Pagination:** handling APIs that return data page-by-page, fetching all results
- **Data enrichment:** combining data from multiple sources and adding computed fields
- **Debugging Code node errors:** using `console.log()` to inspect variables

---

## The Code node vs. Set node: when to use each

### Use **Set (Edit Fields)** when:
- You are renaming or extracting simple fields
- You need simple string concatenation like `"Hello " + name`
- You do not need loops or complex conditional logic

### Use **Code node** when:
- You need to filter or transform an array (e.g., "keep only items where status is 'active'")
- You need to combine or aggregate multiple items (e.g., "group by user ID")
- You need to make calculations or call JavaScript functions
- You need to fetch additional pages of data in a loop
- You are working with nested objects and need to restructure them

---

## Anatomy of the Code node

Every Code node receives the input data automatically in a variable called `items`. This is an array of objects, one per row of input. You process them and return a new array (or a single object, or anything).

**Minimal Code node template:**

```javascript
// items is the input array (automatically injected)
// Each item is an object with your input fields

return items.map(item => {
  // Transform each item and return a new object
  return {
    id: item.id,
    name: item.name.toUpperCase(),
  };
});
```

---

## Example 1: Filter an array (keep only certain rows)

**Problem:** You fetch 100 posts from an API. You only want the ones with 5+ "likes".

**Solution in the Code node:**

```javascript
// Filter: keep only items where likes >= 5
return items.filter(item => item.likes >= 5);
```

**What happens:**
- Input: 100 items (mix of different like counts)
- Output: only items where `likes` is 5 or greater

**Key n8n patterns:**
- `items` is always an array
- Return an array from a Code node (or `[]` for empty)
- Use `.filter()` to keep matching rows

---

## Example 2: Transform and enrich data (map over items)

**Problem:** You have a list of users with `firstName` and `lastName`. You want to add a computed `fullName` and a `initials` field.

**Solution in the Code node:**

```javascript
return items.map(item => {
  const fullName = item.firstName + ' ' + item.lastName;
  const initials = item.firstName[0] + item.lastName[0];
  
  return {
    ...item,  // Keep all existing fields
    fullName,
    initials,
  };
});
```

**What happens:**
- Input: `{ firstName: "John", lastName: "Doe", email: "john@example.com" }`
- Output: `{ firstName: "John", lastName: "Doe", email: "john@example.com", fullName: "John Doe", initials: "JD" }`

**Key patterns:**
- `...item` spreads all existing fields into the new object (keep everything + add new fields)
- Use `.map()` to transform each item
- Computed fields can use string methods (`.toUpperCase()`, `.slice()`, etc.)

---

## Example 3: Group items by a field (aggregate)

**Problem:** You have a list of orders. Each has a `customerId` and an `amount`. You want to group by customer and get the total spent per customer.

**Solution in the Code node:**

```javascript
// Create a map: customerId => total amount
const grouped = {};

items.forEach(order => {
  if (!grouped[order.customerId]) {
    grouped[order.customerId] = 0;
  }
  grouped[order.customerId] += order.amount;
});

// Convert the map into an array of objects
return Object.entries(grouped).map(([customerId, total]) => {
  return {
    customerId,
    totalSpent: total,
  };
});
```

**What happens:**
- Input: `[{ customerId: 1, amount: 50 }, { customerId: 1, amount: 30 }, { customerId: 2, amount: 100 }]`
- Output: `[{ customerId: 1, totalSpent: 80 }, { customerId: 2, totalSpent: 100 }]`

**Key patterns:**
- Use a temporary object to collect/group data
- Use `Object.entries()` to convert back to an array
- This is the "reduce by key" pattern

---

## Example 4: Flatten nested structures

**Problem:** You receive data with nested objects. You want to flatten it into simple columns.

**Input structure:**

```json
[
  {
    "id": 1,
    "user": { "name": "Alice", "email": "alice@example.com" },
    "address": { "city": "New York", "zip": "10001" }
  }
]
```

**Solution in the Code node:**

```javascript
return items.map(item => {
  return {
    id: item.id,
    userName: item.user.name,
    userEmail: item.user.email,
    city: item.address.city,
    zip: item.address.zip,
  };
});
```

**Output:**

```json
[
  {
    "id": 1,
    "userName": "Alice",
    "userEmail": "alice@example.com",
    "city": "New York",
    "zip": "10001"
  }
]
```

---

## Example 5: Pagination - fetch all pages of data

**Problem:** An API returns 20 results per page. You want to fetch all pages automatically and combine them.

**Solution:** Use a **Loop** node with a **Code node** inside to fetch pages until there are no more results.

**Workflow structure:**
```
Schedule Trigger → Loop node → HTTP Request → Code node (check if next page) → Aggregate
```

**Code node inside the loop (check for next page):**

```javascript
// Get the current page data from the HTTP response
const currentPage = items[0];
const data = currentPage.body.data;  // Array of items on this page
const hasMore = currentPage.body.hasNextPage || false;

if (hasMore) {
  // Signal the loop to continue (next iteration will increment page number)
  return [{
    data: data,
    nextPage: currentPage.body.nextPageCursor,
    shouldContinue: true,
  }];
} else {
  // Last page reached
  return [{
    data: data,
    nextPage: null,
    shouldContinue: false,
  }];
}
```

**Before the loop:** Store the API response in pinned data so you can adjust without re-fetching.

---

## Example 6: Merge data from two sources

**Problem:** You have two HTTP nodes: one fetches a list of users, another fetches a list of orders. You want to combine them by matching `userId`.

**Solution in the Code node:**

```javascript
// Assume input has two properties: $json.users and $json.orders (from a previous Merge node)
const users = $json.users;      // Array of { id, name, email }
const orders = $json.orders;    // Array of { userId, orderId, total }

return orders.map(order => {
  const user = users.find(u => u.id === order.userId);
  
  return {
    orderId: order.orderId,
    total: order.total,
    userId: order.userId,
    userName: user ? user.name : "Unknown",
    userEmail: user ? user.email : "Unknown",
  };
});
```

**What happens:**
- For each order, find the matching user by `userId`
- Add the user's name and email to the order record
- If no user is found, use "Unknown" as default

---

## Debugging Code node errors

### Use `console.log()` to inspect values

```javascript
console.log("Items count:", items.length);
console.log("First item:", JSON.stringify(items[0]));
console.log("Keys:", Object.keys(items[0]));

return items;
```

**Then:**
1. Execute the Code node
2. Open the **Execution** details panel
3. Scroll to the Code node and look for the console output

### Common errors and fixes

| Error | Likely Cause | Fix |
|-------|-------------|-----|
| `Cannot read property 'field' of undefined` | Trying to access a field that doesn't exist | Use optional chaining: `item?.field` or check if it exists first |
| `items is not iterable` | Trying to call `.map()` or `.filter()` on a non-array | Wrap in an array: `const items = Array.isArray(input) ? input : [input]` |
| `Return value is not an array` | Code node returned a single object instead of array | Wrap in array: `return [item]` or use `.map()` |
| `Maximum call stack exceeded` | Infinite loop or deep recursion | Check loop conditions and base cases |

---

## Example 7: Scrub and validate data

**Problem:** You receive user data from a form, but some fields are empty or malformed. You want to clean it up.

**Solution in the Code node:**

```javascript
return items.map(item => {
  return {
    name: (item.name || "").trim() || "Unknown",
    email: (item.email || "").toLowerCase().trim(),
    age: item.age ? parseInt(item.age) : null,
    active: item.active === true || item.active === "true" || item.active === 1,
  };
});
```

**What this does:**
- `name`: trims whitespace, defaults to "Unknown" if empty
- `email`: lowercases and trims
- `age`: converts to integer, null if missing
- `active`: normalizes boolean from multiple formats

---

## Practice workflow: Data cleanup pipeline

**What you will build:** A workflow that takes messy CSV data, cleans it, and sends only valid records to a webhook.

### Step 1: Mock data with Set node

Add a **Set** node that creates sample messy data:

```
Field: data
Value: [
  { "name": "  Alice  ", "email": "ALICE@EXAMPLE.COM", "age": "25" },
  { "name": "", "email": "bob@example.com", "age": "not-a-number" },
  { "name": "Charlie", "email": "charlie@example.com", "age": "35" }
]
```

### Step 2: Clean data in Code node

Add a **Code node** with this solution:

```javascript
const data = items[0].data;  // Get the array from Set node

return data.map(item => {
  const cleaned = {
    name: (item.name || "").trim() || "Unknown",
    email: (item.email || "").toLowerCase().trim(),
    age: item.age ? parseInt(item.age) : null,
    isValid: (item.email || "").includes("@"),
  };
  
  return cleaned;
});
```

### Step 3: Filter valid records

Add an **IF node** that checks `$json.isValid === true`. If true, send to a webhook (Step 4). If false, skip.

### Step 4: Send to webhook

Add an **HTTP Request** node that POSTs each valid record.

**Execute and verify:**
- Only the 2 valid records (Alice and Charlie) are sent
- Bob's record is filtered out (no valid email)

---

## Key takeaways

- The **Code node** is for complex transformations; **Set node** is for simple field mapping
- Always return an **array** from a Code node (even if you have one item)
- Use `.map()`, `.filter()`, and `.reduce()` for array transformations
- Use `console.log()` to debug; check the Execution panel for output
- Group operations with `.forEach()` loops and temporary objects when you need aggregation
- Combine data from multiple sources by matching keys (joins)
- Validate and clean data to avoid downstream errors

---

## Next steps

- Build a workflow that fetches user data from an API, transforms it with the Code node, and sends it to Slack
- Practice pagination by fetching all results from a paginated API endpoint
- Combine this lesson with lesson 14 (databases) to transform data before saving to PostgreSQL
