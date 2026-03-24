# API Design Standards

> For Rails API implementation, delegate to the **rails-expert** agent:
> https://github.com/rajgurung/awesome-claude-code-subagents/blob/main/categories/02-language-specialists/rails-expert.md
>
> For frontend API integration, delegate to the **frontend-developer** agent:
> https://github.com/rajgurung/awesome-claude-code-subagents/blob/main/categories/01-core-development/frontend-developer.md

## RESTful Conventions

- **Plural nouns for resources** — `/users`, `/orders`, `/line_items`
- **HTTP methods map to CRUD** — GET (read), POST (create), PUT/PATCH (update), DELETE (destroy)
- **No verbs in URLs** — `/users/:id/activate` is wrong, `PATCH /users/:id` with `{ status: "active" }` is right. If the verb feels necessary, extract a new resource: `POST /users/:id/activations`
- **Nested resources max 2 levels deep** — `/users/:user_id/orders` is fine, `/users/:user_id/orders/:order_id/line_items` is the limit. Anything deeper gets its own top-level route
- **Use snake_case** for URL segments and JSON keys — consistent with Ruby/Rails, readable everywhere

## URL Structure

```
/api/v1/resources
/api/v1/resources/:id
/api/v1/resources/:id/sub_resources
```

- Predictable and consistent — if you know one endpoint, you can guess the rest
- No trailing slashes
- No file extensions (`.json`) — use `Accept` headers
- Resource IDs in the path, filters in query params
- Keep URLs lowercase

## Versioning

- **URL prefix versioning** (`/api/v1/`) — simple, explicit, easy to route and test
- Header-based versioning is clever but harder to debug, harder to curl, harder to document. Avoid it unless you have a strong reason
- **When to bump versions:**
  - Removing a field or endpoint
  - Changing a field's type or meaning
  - Changing authentication flow
  - Restructuring response format
- **Don't bump for:** adding optional fields, adding new endpoints, adding new enum values
- Support at most 2 versions simultaneously. Deprecate aggressively — old versions are maintenance debt
- Set a sunset date in response headers: `Sunset: Sat, 01 Nov 2025 00:00:00 GMT`

## Request/Response Format

Use a consistent envelope for all responses:

```json
{
  "data": { "id": 42, "name": "Example" },
  "meta": { "request_id": "abc-123" }
}
```

Collection responses:

```json
{
  "data": [{ "id": 1 }, { "id": 2 }],
  "meta": {
    "pagination": {
      "cursor": "eyJpZCI6MTB9",
      "has_more": true
    }
  }
}
```

Error responses:

```json
{
  "errors": [
    {
      "code": "validation_error",
      "message": "Email is already taken",
      "field": "email"
    }
  ]
}
```

Rules:
- **Timestamps in ISO 8601** — `2025-01-15T09:30:00Z`. Always UTC. No Unix timestamps in responses
- **Consistent key casing** — `snake_case` everywhere. Don't mix conventions
- **Null vs absent** — include the key with `null` for known fields that have no value. Omit keys only for truly optional/sparse data
- **IDs as strings** in JSON if they might exceed JavaScript's safe integer limit. When in doubt, use strings
- **Include `request_id`** in every response meta for debugging and support

## Error Responses

Use appropriate HTTP status codes:

| Code | When |
|------|------|
| 400 | Bad request — malformed syntax, invalid params |
| 401 | Unauthenticated — no valid credentials |
| 403 | Forbidden — authenticated but not authorised |
| 404 | Not found — resource doesn't exist |
| 409 | Conflict — state conflict (duplicate, stale update) |
| 422 | Unprocessable entity — valid syntax but failed validation |
| 429 | Too many requests — rate limited |
| 500 | Internal server error — our fault, not theirs |

Rules:
- **Never leak internals** — no stack traces, no SQL errors, no internal class names in production responses
- **Machine-readable `code`** — clients switch on `code`, not `message`. Use stable string codes like `insufficient_funds`, `rate_limited`, `invalid_token`
- **Human-readable `message`** — useful for developers reading logs, not for end users
- **`details` array** for validation errors — one entry per field, each with `field`, `code`, and `message`
- Log the full error server-side with the `request_id` — that's how you correlate

## Authentication

- **Token-based auth** for first-party clients — JWT or opaque tokens via `Authorization: Bearer <token>`
- **API keys** for server-to-server — passed in headers, never in URLs (URLs get logged)
- **OAuth2** for third-party integrations — authorization code flow, not implicit
- **Short-lived access tokens + refresh tokens** — access tokens expire in minutes/hours, refresh tokens in days/weeks
- **Rate limiting per client** — return `429` with `Retry-After` header. Include rate limit info in response headers:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 997
X-RateLimit-Reset: 1620000000
```

- Never put secrets in query strings — they appear in server logs, browser history, and referer headers
- Rotate compromised keys immediately — build the tooling for this before you need it

## Pagination

- **Cursor-based pagination by default** — stable under inserts/deletes, performs well at scale
- **Offset-based only for admin/internal UIs** where "jump to page 50" matters and dataset is bounded
- Parameters: `?after=<cursor>&limit=25`
- Default limit: 25. Max limit: 100. Reject anything above with a 400
- **Include `total_count` only when cheap** — if it requires a full table scan on millions of rows, skip it or make it opt-in (`?include=total_count`)
- Return pagination info in the `meta` object. Optionally also in `Link` headers for HTTP purists

## Filtering, Sorting, Searching

Filtering:
```
GET /orders?status=pending&created_after=2025-01-01
```

- Simple equality: `?field=value`
- Operators when needed: `?created_after=`, `?amount_gte=100`
- Multiple values: `?status=pending,shipped` (comma-separated)
- Don't invent a query language. If filtering gets complex, consider a dedicated search endpoint with a POST body

Sorting:
```
GET /users?sort=created_at&direction=desc
```

- Single sort field with direction. Multi-sort only if there's a real use case: `?sort=status,-created_at` (prefix `-` for descending)
- Default sort should be deterministic — usually `-created_at` or `-id`

Searching:
```
GET /users?q=john
```

- `q` parameter for full-text search. Keep it simple — if you need facets and complex queries, use a search service (Elasticsearch, Meilisearch) behind a dedicated endpoint

## Idempotency

- **GET, PUT, DELETE are naturally idempotent** — calling them multiple times produces the same result
- **POST and PATCH are not** — require an `Idempotency-Key` header for safe retries
- Store the idempotency key and response for at least 24 hours. On duplicate request, return the stored response with the same status code
- Return `409 Conflict` if the same key is used with different request bodies
- Generate idempotency keys client-side — UUIDs work. Document this requirement clearly

```
POST /api/v1/payments
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
```

- Critical for payment endpoints, webhook deliveries, and any operation with real-world side effects
- Build idempotency into the framework layer — don't leave it to individual controllers

## Documentation

- **OpenAPI 3.x spec** as the source of truth — machine-readable, generates client SDKs and docs
- **Keep the spec in sync with code** — use `rswag` in Rails to generate specs from request tests. If the test passes, the docs are accurate
- Document every endpoint with: description, parameters, request body schema, response schemas (success + errors), auth requirements
- Include example requests and responses — developers copy-paste first, read docs second
- Version the docs alongside the API
- Publish interactive docs (Swagger UI, Redoc) — developers should be able to try endpoints without writing code

## Breaking vs Non-Breaking Changes

**Non-breaking (safe to ship):**
- Adding a new optional field to a response
- Adding a new endpoint
- Adding a new optional query parameter
- Adding a new enum value (if clients handle unknown values gracefully)
- Adding a new HTTP method to an existing resource

**Breaking (requires version bump):**
- Removing or renaming a field
- Changing a field's type (string to integer, object to array)
- Changing the meaning of existing values
- Making a previously optional field required
- Changing URL structure
- Changing auth mechanism
- Changing error codes that clients depend on

**Deprecation policy:**
- Mark deprecated fields with a `deprecated` flag in the OpenAPI spec
- Log usage of deprecated fields — know who's affected before removing
- Announce deprecations at least 2 release cycles before removal
- Provide migration guides when deprecating endpoints
- Never break a published contract without a version bump and a migration path
