# Deployment Standards

> For Rails-specific deployment tooling (Kamal, Capistrano, strong_migrations), delegate to the **rails-expert** agent:
> https://github.com/rajgurung/awesome-claude-code-subagents/blob/main/categories/02-language-specialists/rails-expert.md

## Core Principle

**A deploy should be boring.** If it requires courage, coordination calls, or crossed fingers, something is wrong with the process. Every deploy must be reversible, observable, and independent of other deploys.

---

## Migrations Are Not Deploys

Migrations and code changes are **separate events**. Never ship them together.

### Why This Matters at Scale

When your database serves millions of rows and multiple application servers, a migration that locks a table will bring down every server simultaneously. A column rename that code depends on will 500 every request between the migration running and the last server restarting. The window between "migration ran" and "all servers running new code" is where incidents live.

### The Three-Phase Deploy

Every schema change follows three separate deploys, each merged and shipped independently:

**Phase 1 — Prepare (migration only, no code changes)**
- Add new columns, tables, or indexes
- New columns must be nullable or have defaults — never add a NOT NULL column without a default
- Add indexes concurrently (`algorithm: :concurrently`) to avoid table locks
- Do not remove, rename, or change the type of any existing column
- Deploy this. Verify it ran. Monitor for issues. Move on.

**Phase 2 — Migrate (code changes)**
- Deploy code that writes to both old and new columns/tables
- Backfill data in a background job, not in the migration
- Gradually shift reads to the new structure
- Use feature flags to control the cutover
- Deploy this. Verify data integrity. Monitor for issues. Move on.

**Phase 3 — Cleanup (migration only, no code changes)**
- Remove old columns, tables, or indexes
- Remove dual-write code and feature flags
- Only after confirming Phase 2 is stable in production (wait at least one full business cycle)

### What This Looks Like in Practice

Renaming `users.name` to `users.full_name`:

```
Deploy 1: Add column full_name (nullable)
Deploy 2: Code writes to both name and full_name, backfill job copies existing data
Deploy 3: Code reads from full_name, stops writing to name
Deploy 4: Remove column name
```

Four deploys. Four PRs. Each one is safe to roll back independently.

---

## strong_migrations

The `strong_migrations` gem is **mandatory** in all Rails projects. It catches unsafe migration operations before they reach production.

### What strong_migrations Catches

- Adding a column with a default (pre-Rails 5 behaviour — rewrites the entire table)
- Adding a NOT NULL constraint to an existing column (full table scan + lock)
- Removing a column that code still references
- Adding an index non-concurrently on a large table (locks writes)
- Changing a column type (full table rewrite)
- Renaming a column (breaks running code)
- Renaming a table (breaks running code)

### When strong_migrations Says No

Don't bypass it. The gem is right. Rethink the approach:

- **Want to rename a column?** Use the three-phase deploy above
- **Want to add NOT NULL?** Add the column nullable, backfill, then add the constraint with `validate: false` first, validate separately
- **Want to change a column type?** Add a new column, dual-write, backfill, cut over, drop old
- **Want to add an index on a large table?** Use `algorithm: :concurrently` and `disable_ddl_transaction!`

```ruby
class AddIndexToOrdersCreatedAt < ActiveRecord::Migration[7.1]
  disable_ddl_transaction!

  def change
    add_index :orders, :created_at, algorithm: :concurrently
  end
end
```

### Safe Constraint Addition

```ruby
# Step 1: Add constraint without validation (instant, no lock)
class AddNullConstraintToUsersEmail < ActiveRecord::Migration[7.1]
  def change
    add_check_constraint :users, "email IS NOT NULL", name: "users_email_null", validate: false
  end
end

# Step 2: Validate in a separate migration (scans table but doesn't lock)
class ValidateUsersEmailNotNull < ActiveRecord::Migration[7.1]
  def change
    validate_check_constraint :users, name: "users_email_null"
    change_column_null :users, :email, false
    remove_check_constraint :users, name: "users_email_null"
  end
end
```

---

## Zero-Downtime Deploys

### Requirements

- Rolling restarts — new servers come up before old ones go down
- Health checks — load balancer only routes to healthy instances
- Graceful shutdown — finish in-flight requests before stopping (SIGTERM handling)
- Connection draining — allow active connections to complete
- No boot-time side effects — the app starting should not trigger migrations, data changes, or external calls

### Database Connections at Scale

- Size connection pools for the number of servers and threads, not just one box
- Use PgBouncer or similar for connection pooling at scale
- Migrations should use a separate connection with advisory locks to prevent concurrent runs
- Monitor connection count — running out of connections is an outage

### Background Jobs During Deploys

- Jobs must be idempotent — they will be retried if a server goes down mid-execution
- Long-running jobs should checkpoint progress so they can resume
- Don't deploy job code changes that are incompatible with in-flight jobs — the old code is still running
- Consider pausing queues during high-risk deploys (schema changes on large tables)

---

## Rollback Strategy

### Every Deploy Must Be Reversible

Before deploying, answer: **"How do I undo this in under 5 minutes?"**

- Code deploys: redeploy the previous version
- Migrations that add: leave the new columns/tables (harmless), redeploy old code
- Migrations that remove: **this is why you wait before Phase 3** — you can't undo a column drop
- Data backfills: ensure they're idempotent and can be re-run or reversed

### Forward-Fix vs Rollback

| Situation | Action |
|-----------|--------|
| Bug in new code, old code works fine | **Rollback** — fastest path to recovery |
| Bug requires a one-line fix you can verify | **Forward-fix** — ship the fix, don't roll back |
| Data corruption or state mutation | **Neither** — stop the bleeding (feature flag off), investigate, plan recovery |
| Unclear what's broken | **Rollback first**, investigate second — reduce blast radius immediately |

### Feature Flags as Rollback

Feature flags (Flipper, custom) decouple deploy from release:

- Deploy the code with the flag off
- Enable for internal users, then a percentage, then everyone
- If something breaks, flip the flag — instant rollback without a deploy
- Remove the flag in cleanup once stable (flags are not permanent — stale flags are tech debt)

---

## Pre-Deploy Checklist

Think like a staff engineer — not "will this work?" but "what happens when this fails?"

- [ ] **Migrations separated from code changes** — never in the same PR
- [ ] **strong_migrations passes** — no unsafe operations
- [ ] **Rollback plan documented** — "if this breaks, I will..."
- [ ] **Backwards compatible** — can old code run with the new schema? Can new code run with the old schema?
- [ ] **Tested against production-scale data** — does this migration complete in seconds or hours?
- [ ] **Connection and lock impact assessed** — will this lock tables? For how long?
- [ ] **Background jobs compatible** — are in-flight jobs safe with the new code?
- [ ] **Feature flagged** (if applicable) — can you turn this off without a deploy?
- [ ] **Monitoring in place** — will you know within minutes if something is wrong?
- [ ] **Team notified** — does anyone else need to know this is going out?

## Post-Deploy Checklist

- [ ] **Verify in production** — don't just check CI, check the real thing
- [ ] **Watch error rates** for 15 minutes — new errors, increased latency, failed jobs
- [ ] **Check migration completed** — `rails db:migrate:status` on production
- [ ] **Monitor database metrics** — lock waits, connection count, query latency
- [ ] **Confirm background jobs processing** — queue depth, error rate, latency
- [ ] **Update the team** — "deployed X, looks good" or "deployed X, watching Y"

---

## Staff Engineer Thinking

When reviewing any deploy plan, ask:

1. **What's the blast radius?** — How many users/services are affected if this goes wrong?
2. **What's the rollback time?** — Seconds (feature flag), minutes (redeploy), hours (data recovery)?
3. **What's the data risk?** — Are we changing, deleting, or moving data? Is it recoverable?
4. **What's the coordination cost?** — Does this require other teams to deploy or change behaviour?
5. **What's the timing risk?** — Are we deploying before a weekend, holiday, or high-traffic event?
6. **Have we seen this pattern fail before?** — Check incident history for similar changes

**If the answers make you uncomfortable, break the change into smaller, safer steps.** The cost of an extra deploy is minutes. The cost of an incident is hours to days.
