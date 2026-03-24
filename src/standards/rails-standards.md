# Rails Standards

> For implementation details, version-aware patterns, and code generation, delegate to the **rails-expert** agent:
> https://github.com/rajgurung/awesome-claude-code-subagents/blob/main/categories/02-language-specialists/rails-expert.md

## Version Awareness

Always check `Gemfile.lock` before recommending patterns. Rails 8.x and 7.x have significantly different defaults for background jobs, caching, auth, and deployment. The rails-expert agent handles version detection and adaptation automatically.

## Architecture

- **Skinny controllers, rich models** — controllers handle HTTP concerns only
- **Service objects** when logic exceeds ~10 lines or spans multiple models. Name as verbs: `OnboardUser`, `ProcessPayment`
- **Form objects** for multi-model forms or when validations differ from model validations
- **Query objects** for complex queries — keep scopes simple and composable
- **Concerns** for genuinely shared behaviour across models, not to hide complexity
- **RESTful everything** — if you need a non-CRUD action, extract a new resource

## Active Record

- Define associations at the top of the model, before validations and scopes
- Use `dependent:` on every `has_many` / `has_one` — no orphan records
- Use `strict_loading` to catch N+1 queries at development time
- Use database constraints (NOT NULL, unique indexes, foreign keys) as a safety net alongside model validations
- Use integer-backed enums, not strings
- Use `find_each` for batch processing — never `all.each`

## Security

- Strong parameters on every controller action — never pass `params` directly
- Never interpolate user input into SQL — use parameterised queries
- Don't bypass ERB auto-escaping with `raw` or `html_safe` on unsanitised content
- Store secrets in encrypted credentials (`rails credentials:edit`), not env vars or code
- Run `brakeman` and `bundle audit` in CI
- Use rate limiting on auth endpoints (native `rate_limit` on 8.x, `rack-attack` on 7.x)

## Performance

- Catch N+1 queries with `bullet` gem in dev/test
- Add indexes on all foreign keys and columns used in WHERE/ORDER BY
- Use counter caches to avoid repeated COUNT queries
- Use fragment caching and Russian doll caching for expensive views
- Move anything over 100ms to a background job
- Use `pluck` over `map`, `exists?` over `present?` for DB checks
- Target: web < 200ms p95, API < 100ms p95

## Testing

- RSpec as the default test framework
- Request specs for every endpoint, model specs for business logic
- System specs (Capybara) for critical user flows
- FactoryBot for test data — prefer `build_stubbed` when persistence isn't needed
- `bullet: :raise` in specs to catch N+1 at test time
- Freeze time with `travel_to` for time-dependent logic
- Parallel test execution for speed
- No flaky tests tolerated — fix root causes, don't retry
- Track coverage with SimpleCov but don't game the numbers

## Migrations

- Use `strong_migrations` gem to catch unsafe migrations
- Never rename or remove columns in a single deploy — use a multi-step process
- Add indexes concurrently in production (`algorithm: :concurrently`)
- Backfill data in a separate migration or background job, not in the schema migration
- Always set `null: false` and defaults where appropriate
- Test migrations both up and down

## Deployment

- **Rails 8.x:** Kamal 2 with Thruster (HTTP/2, auto-SSL)
- **Rails 7.x:** Capistrano, Docker, or PaaS (Heroku, Render, Fly.io)
- Zero-downtime deploys regardless of tooling
- Run `brakeman` and `bundle audit` as CI gates
- Monitor with APM (Datadog, New Relic, Scout) and error tracking (Sentry, Honeybadger)
- Use structured logging (Lograge) and feature flags (Flipper) in production

## Hotwire

- Turbo Drive for SPA-like navigation (enabled by default)
- Turbo Frames scoped to the smallest logical unit
- Turbo Streams for surgical real-time DOM updates — don't over-broadcast
- Stimulus controllers: small, focused, one responsibility
- Server-rendered HTML first, JavaScript second — progressive enhancement as default
