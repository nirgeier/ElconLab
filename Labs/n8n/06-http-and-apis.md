# 06 · HTTP Requests & APIs

> Use n8n's HTTP Request node to call any REST API, authenticate cleanly, handle pagination, and wire up services that have no dedicated node.

---

## Why the HTTP Request node matters

- It is the universal escape hatch - any service with a REST or HTTP API can be reached even when no dedicated n8n node exists.
- It supports all common verbs (GET, POST, PUT, PATCH, DELETE) plus custom headers, query params, and request bodies.
- Body can be sent as JSON, form-urlencoded, multipart form-data, raw, or binary, covering nearly every API contract.
- It returns the parsed response as JSON items by default, so downstream nodes can map fields directly.
- Pairing it with the Code or Set node lets you reshape responses before they flow on.

---

## Configuring a basic request

- Set the Method and URL first; the URL field accepts expressions like `{{ $json.id }}` to build dynamic endpoints.
- Add query parameters under "Send Query Parameters" rather than hand-concatenating the URL - n8n handles encoding for you.
- Use "Send Headers" for things like `Accept: application/json` or a custom API key header.
- For write operations, enable "Send Body" and pick the content type that the API expects.

```json
{
  "method": "POST",
  "url": "https://api.example.com/v1/orders",
  "headers": { "Accept": "application/json" },
  "body": { "sku": "ABC-123", "qty": 2 }
}
```

---

## Authentication options

- Prefer the "Predefined Credential Type" option when n8n already ships a credential for the service - it reuses the same OAuth2/API-key store as dedicated nodes.
- Use "Generic Credential Type" for anything else: Basic Auth, Header Auth, Query Auth, or full OAuth2.
- Header Auth is the most common pattern for bearer tokens and API keys; store the secret as a credential, never inline in the URL.
- Generic OAuth2 credentials handle the token exchange and refresh automatically once you supply the auth/token URLs and client details.
- Keeping secrets in credentials (not in node fields) means they are encrypted at rest and excluded from exported workflows.

```yaml
# Header Auth credential example
Name:  Authorization
Value: Bearer YOUR_TOKEN_HERE
```

---

## Pagination

- Open the node's "Options" and enable Pagination to fetch every page instead of just the first response.
- Choose the mode that matches the API: response contains next URL, response contains a cursor/token, or fixed page/offset increments.
- Set a "Complete Expression" so n8n knows when to stop - for example, stop when the next-page field is empty.
- Use "Limit Pages Fetched" during testing to avoid hammering an API while you tune the expressions.

```yaml
# Cursor-style pagination
Pagination Mode:     Response Contains Next URL
Next URL:            {{ $response.body.paging.next }}
Complete Expression: {{ $response.body.paging.next === undefined }}
```

---

## Integrating services without a dedicated node

- Read the API docs for the base URL, auth scheme, required headers, and rate limits before building.
- Test one call with the verb and a minimal body, confirm the shape of the response, then add auth and pagination.
- Use "Batching" in the options to throttle requests and respect rate limits on bulk operations.
- Enable "Retry On Fail" (with a delay) at the node level to ride out transient 429 or 5xx responses.
- Once stable, wrap repeated logic in a sub-workflow so multiple workflows can reuse the same API integration.

```bash
# Quick sanity check outside n8n before wiring the node
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://api.example.com/v1/items?limit=50" | jq '.data | length'
```

---

## Debugging requests

- Turn on "Full Response" in options to inspect status code and headers, not just the body, when a call misbehaves.
- A 401 usually means a bad or missing credential; a 403 means the token lacks scope; a 422 means a malformed body.
- Use the node's pinned input/output data to iterate on expressions without re-hitting the live API each time.
- Check "Never Error" carefully - leaving it off lets failed calls surface in execution logs where you can diagnose them.

---

## Key takeaways

- The HTTP Request node turns n8n into a client for any REST API, no dedicated node required.
- Store every secret as a credential and call it via Header Auth or generic OAuth2 - never hardcode tokens.
- Configure pagination explicitly with a clear completion expression so you collect all data, not just page one.
- Respect rate limits with batching and retry-on-fail, and validate one call before scaling up.
