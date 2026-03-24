# Database Design Standards

> For Rails-specific database patterns (Active Record, migrations, strong_migrations), delegate to the **rails-expert** agent:
> https://github.com/rajgurung/awesome-claude-code-subagents/blob/main/categories/02-language-specialists/rails-expert.md

## Core Principle

**The database outlives every application that talks to it.** ORMs change, services get rewritten, languages come and go. The schema, constraints, and data survive all of it. Design the database as if Active Record doesn't exist — then use Active Record to talk to it.

---

## Naming Conventions

- **Tables:** snake_case, plural — `users`, `order_items`, `payment_transactions`
- **Columns:** snake_case, descriptive — `created_at`, `email_address`, `total_amount_cents`
- **No abbreviations** — `quantity` not `qty`, `description` not `desc`, `transaction` not `txn`. You type it once, you read it a thousand times
- **Boolean columns:** prefix with `is_` or use adjective form — `active`, `verified`, `is_published`. Never ambiguous names like `status` for a boolean
- **Timestamps:** always include `created_at` and `updated_at` (Rails does this by default — don't remove them)
- **Foreign keys:** `<singular_table>_id` — `user_id`, `order_id`. No exceptions
- **Join tables:** alphabetical — `categories_products`, not `products_categories`. Or use a meaningful domain name if one exists (`enrollments` over `courses_users`)
- **Indexes:** let Rails name them. If naming manually: `index_<table>_on_<columns>`

---

## Primary Keys

Use `bigint` auto-incrementing IDs. This is the Rails 5.1+ default and the right choice for most tables.

**Use UUIDs when:**
- IDs are exposed in public URLs or APIs (sequential IDs leak information — total count, creation order, enumeration attacks)
- You're in a distributed system where multiple writers generate IDs independently
- You need to generate IDs client-side before inserting

**UUID implementation:**
```ruby
# In the migration
enable_extension 'pgcrypto' unless extension_enabled?('pgcrypto')
create_table :api_tokens, id: :uuid do |t|
  # ...
end
```

**Don't use UUIDs everywhere by default.** They're 4x larger than bigint, worse for index locality, and harder to debug. Use them where the trade-off is justified.

---

## Foreign Keys

**Always add database-level foreign key constraints.** No exceptions.

```ruby
add_reference :orders, :user, null: false, foreign_key: true, index: true
```

- Every `belongs_to` in a model must have a corresponding foreign key in the database
- Always index foreign key columns (Rails `add_reference` does this by default — verify it)
- Always declare `dependent:` on the parent association — choose `destroy`, `delete_all`, `nullify`, or `restrict_with_exception` based on the domain. No orphan records

**Foreign keys are not optional.** Model validations are bypassed by bulk operations, raw SQL, console sessions, and bugs. The database is the last line of defence.

---

## Indexing Strategy

### Always Index

- **Foreign keys** — every `_id` column gets an index
- **Columns in WHERE clauses** — if you query by it, index it
- **Columns in ORDER BY** — especially on paginated queries
- **Columns in GROUP BY** — aggregation queries need index support
- **Polymorphic associations** — composite index on `(type, id)`

### Composite Indexes

Column order matters. A composite index on `(user_id, created_at)` supports:
- `WHERE user_id = ?`
- `WHERE user_id = ? AND created_at > ?`
- `WHERE user_id = ? ORDER BY created_at`

It does **not** efficiently support:
- `WHERE created_at > ?` (leading column not used)

Put the equality column first, the range/sort column second.

### Partial Indexes

Index only the rows that matter. Smaller index, faster queries, less storage.

```ruby
add_index :orders, :created_at, where: "status = 'pending'", name: "index_orders_pending_on_created_at"
```

Use partial indexes for queries that always filter on a specific condition — active records, unprocessed items, recent entries.

### Unique Indexes

**Use unique indexes as database-level constraints.** Model `uniqueness` validations are race-condition-prone without a backing unique index.

```ruby
add_index :users, :email, unique: true
add_index :memberships, [:user_id, :organisation_id], unique: true
```

If it should be unique, enforce it in the schema.

### Don't Over-Index

Every index slows down writes and consumes storage. Remove indexes that:
- Duplicate the leading columns of another composite index
- Support queries that never run (check `pg_stat_user_indexes` for usage)
- Are on tiny tables where a sequential scan is faster anyway

Run `EXPLAIN ANALYZE` before adding an index. Confirm the planner actually uses it.

---

## Normalisation

**Normalise by default.** Store each fact once. If you find yourself updating the same data in multiple places, something is denormalised without intent.

### When to Denormalise

Denormalise with intent and document why. Every denormalisation is a trade-off: faster reads at the cost of write complexity, data consistency risk, and maintenance burden.

Acceptable denormalisation:
- **Counter caches** — `orders_count` on `users` to avoid `COUNT(*)` on every page load. Use `counter_cache: true` on the association
- **Materialised views** — for complex reporting queries that don't need real-time data
- **Snapshot data** — storing the product price at time of order (this isn't really denormalisation — it's a different fact)
- **Search indexes** — denormalised data in Elasticsearch/Meilisearch for full-text search

**Always add a code comment or migration comment explaining why the denormalisation exists and what keeps it consistent.**

---

## Data Types

Use the most specific type. PostgreSQL has excellent type support — use it.

| Instead of | Use |
|-----------|-----|
| `string` for dates | `date`, `datetime`, `timestamp` |
| `string` for status/category | `integer` enum (Rails enum backed by int column) |
| `string` for IP addresses | `inet` |
| `string` for amounts | `decimal(precision, scale)` or integer cents |
| `float` for money | **Never.** Use `decimal` or store cents as `integer` |
| `text` for structured data | `jsonb` (but read the next point) |

### jsonb — Use Sparingly

`jsonb` is powerful but it's a schema escape hatch. Use it for:
- Third-party webhook payloads you don't control
- User preferences or settings that vary per user
- Metadata that doesn't need querying or constraints

Don't use it for:
- Core domain data that should be in columns with types and constraints
- Data you frequently query, filter, or join on
- Anything that needs referential integrity

If you find yourself adding GIN indexes on jsonb paths, consider whether those fields should be columns.

---

## Constraints

### NOT NULL by Default

Every column should be `NOT NULL` unless there's a genuine domain reason for nullability. `NULL` means "unknown" — if you mean "empty," use a default value.

```ruby
add_column :users, :display_name, :string, null: false, default: ""
```

Nullable should be the exception, not the default. When a column is nullable, document why in a comment.

### Check Constraints

Enforce business rules at the database level. Model validations are your first line of defence. Check constraints are the last.

```ruby
add_check_constraint :orders, "total_cents >= 0", name: "orders_total_non_negative"
add_check_constraint :accounts, "balance_cents >= 0", name: "accounts_non_negative_balance"
add_check_constraint :events, "ends_at > starts_at", name: "events_end_after_start"
```

### Unique Constraints

Enforce uniqueness at the database level — model validations alone are insufficient under concurrent writes. See the Indexing section above.

### Exclusion Constraints

PostgreSQL-specific, but powerful for preventing overlapping ranges (time slots, date ranges):

```sql
ALTER TABLE reservations ADD CONSTRAINT no_overlapping_reservations
  EXCLUDE USING gist (room_id WITH =, tsrange(starts_at, ends_at) WITH &&);
```

---

## Migrations

For safe migration patterns, three-phase deploys, and strong_migrations usage, see **[Deployment Standards](deployment-standards.md)**.

Key rules repeated here because they matter:
- **Never mix schema changes and code changes in one deploy**
- **Add indexes concurrently** on any table with data — `algorithm: :concurrently` with `disable_ddl_transaction!`
- **Add NOT NULL constraints safely** — add as check constraint with `validate: false`, validate in a separate migration, then convert
- **Never rename or remove columns in a single step** — three-phase deploy
- **Test migrations against production-scale data** — a migration that takes 2ms on dev might take 20 minutes on production

---

## Partitioning

### When to Partition

Consider partitioning when:
- A table exceeds **tens of millions of rows** and queries consistently filter on a predictable key
- You need to efficiently drop old data (dropping a partition is instant; deleting millions of rows is not)
- Query performance degrades despite proper indexing

### Partitioning Strategies

**Time-based (range) partitioning** — best for logs, events, audit trails, analytics:
```sql
CREATE TABLE events (
  id bigserial,
  event_type text NOT NULL,
  payload jsonb,
  created_at timestamptz NOT NULL
) PARTITION BY RANGE (created_at);

CREATE TABLE events_2025_q1 PARTITION OF events
  FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');
```

**List partitioning** — best for multi-tenant tables or status-based partitioning:
```sql
CREATE TABLE orders (...) PARTITION BY LIST (region);
```

### Partitioning Rules

- **Automate partition creation** — don't rely on humans to create next month's partition. Use `pg_partman` or a scheduled job
- **Include the partition key in queries** — if the planner can't prune partitions, you get no benefit
- **Partition key must be in the primary key** — PostgreSQL requires it for unique constraints across partitions
- **Don't partition small tables** — the overhead isn't worth it under a few million rows

---

## Connection Management

### Pool Sizing

Formula: `pool_size = (threads_per_server * server_count) + headroom_for_jobs`

- Rails default pool is 5 — this is almost never right for production
- Set `pool` in `database.yml` to match your Puma thread count
- Total connections across all processes must not exceed PostgreSQL's `max_connections`

### PgBouncer

Use PgBouncer in transaction mode when:
- You have more application processes than PostgreSQL can handle in direct connections
- Connection establishment time is a bottleneck (PgBouncer keeps connections warm)
- You're running on a managed database with connection limits (RDS, Cloud SQL)

Caveats in transaction mode:
- No prepared statements (set `prepared_statements: false` in `database.yml`)
- No session-level advisory locks
- No `SET` commands that depend on session state
- No `LISTEN`/`NOTIFY`

### Advisory Locks for Migrations

Prevent concurrent migration runs across multiple deploy targets:

```ruby
# Rails does this automatically with schema_migration,
# but for custom migration jobs:
ActiveRecord::Base.connection.execute("SELECT pg_advisory_lock(12345)")
```

Monitor your connection count. Running out of connections is an outage, not a slow-down.

---

## Query Patterns

### Avoid SELECT *

Load only the columns you need. `SELECT *` wastes memory, bandwidth, and prevents covering index optimisations.

```ruby
# Bad
User.all
User.where(active: true)

# Good — when you only need specific fields
User.where(active: true).select(:id, :email, :name)
User.where(active: true).pluck(:id, :email)
```

Use `select` when building responses. Use `pluck` when you need raw values without model instantiation.

### Use EXPLAIN ANALYZE

Before optimising, measure. Before shipping a new query, verify the plan.

```sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 42 ORDER BY created_at DESC LIMIT 10;
```

Watch for:
- **Seq Scan on large tables** — usually means a missing index
- **Nested Loop with high row estimates** — might need a different join strategy
- **Sort operations** — can often be eliminated with a proper index
- **High actual vs estimated rows** — stale statistics, run `ANALYZE`

### Batch Processing

Never load millions of rows into memory:

```ruby
# Bad — loads everything
Order.where(status: :pending).each { |o| process(o) }

# Good — loads in batches of 1000
Order.where(status: :pending).find_each(batch_size: 1000) { |o| process(o) }
```

### N+1 Queries

Use `includes` or `preload` to eager-load associations. Use `strict_loading` in development to catch them early. Use `bullet` gem to detect them automatically. There is no excuse for N+1 queries reaching production.

---

## Backups and Recovery

### The Rule

**Backups that haven't been restored are not backups. They're hopes.**

### Backup Strategy

- **Continuous WAL archiving** for point-in-time recovery (PITR) — restore to any second, not just the last snapshot
- **Daily base backups** (physical) for fast full restores
- **Logical backups** (`pg_dump`) for portability, partial restores, and cross-version migration
- **Offsite replication** — backups in the same region as your database don't survive a regional outage

### Physical vs Logical Backups

| | Physical (`pg_basebackup`) | Logical (`pg_dump`) |
|---|---|---|
| Speed of restore | Fast (copy files) | Slow (replay SQL) |
| Point-in-time recovery | Yes (with WAL) | No (snapshot only) |
| Cross-version compatible | No | Yes |
| Partial restore | No (all or nothing) | Yes (per table) |
| Size | Larger (includes indexes) | Smaller (data only option) |

**Use both.** Physical for disaster recovery. Logical for operational flexibility.

### Recovery Testing

- **Test restores monthly** — automate it in CI or a scheduled job
- **Measure restore time** — know your RTO (Recovery Time Objective) before you need it
- **Test PITR** — restore to a specific timestamp, verify data integrity
- **Document the restore procedure** — when the database is down at 3 AM is not the time to figure out how `pg_restore` works

### Managed Databases

If you're on RDS, Cloud SQL, or similar:
- Enable automated backups and PITR
- Know the retention period and extend it if needed
- Test the restore process using the provider's tools — don't assume it works
- Keep logical backups as well — you don't want vendor lock-in on your most critical asset

---

## Staff Engineer Thinking

When reviewing database changes, ask:

1. **Will this lock the table?** — Any DDL on a table with millions of rows needs scrutiny. What's the lock type? How long will it hold?
2. **What happens at 10x scale?** — This query is fine with 100K rows. What about 10M? 100M?
3. **Is the database enforcing the invariant, or just the application?** — If only the model validates it, it will eventually be violated
4. **Can I query this efficiently?** — Every new feature implies new query patterns. Are the indexes in place?
5. **What's the migration path?** — Not just "how do I add this" but "how do I change or remove this in a year?"
6. **Am I storing data I'll need to delete?** — GDPR, retention policies, right to be forgotten. Design for deletion from day one
