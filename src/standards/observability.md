# Observability Standards

> For Rails-specific observability setup (Lograge, error tracking gems, APM integration), delegate to the **rails-expert** agent:
> https://github.com/rajgurung/awesome-claude-code-subagents/blob/main/categories/02-language-specialists/rails-expert.md

## Core Principle

**If you can't see it, you can't fix it.** Observability isn't dashboards and alerts — it's the ability to ask arbitrary questions about your production system without deploying new code. Every service must be observable from day one, not bolted on after the first incident.

The three pillars — logs, metrics, traces — are not optional. They are not nice-to-haves. They are the difference between debugging for 5 minutes and debugging for 5 hours.

---

## Structured Logging

Unstructured logs are useless at scale. You can't query "something went wrong" across millions of lines. Every log entry must be a structured event — key-value pairs that machines can parse and humans can read.

### Use Lograge for Rails

Rails default logging is verbose garbage — multiple lines per request, no structure, impossible to parse. **Lograge is mandatory.** It collapses each request into a single structured log line.

```ruby
# config/initializers/lograge.rb
config.lograge.enabled = true
config.lograge.formatter = Lograge::Formatters::Json.new
config.lograge.custom_payload do |controller|
  {
    user_id: controller.current_user&.id,
    request_id: controller.request.request_id
  }
end
```

### What to Log

- **Request lifecycle** — method, path, status, duration, params (filtered)
- **Business events** — user signed up, order placed, payment processed
- **Decisions** — why code took a specific branch ("skipping notification: user opted out")
- **Failures** — what failed, what was the input, what was the context
- **External calls** — service name, endpoint, response time, status

### What NOT to Log

- **PII** — names, emails, addresses, phone numbers. Filter aggressively. If you log it, you own the compliance burden.
- **Secrets** — API keys, tokens, passwords, credit card numbers. Use Rails parameter filtering and verify it works.
- **Request/response bodies** — too verbose, often contains PII. Log a summary or hash instead.
- **Health check noise** — your load balancer hits `/health` every 5 seconds. Don't fill your logs with it.
- **Success for high-volume operations** — logging every cache hit is noise. Log the misses.

### Log Levels

Use them correctly. Most teams don't.

| Level | When to use | Example |
|-------|-------------|---------|
| `ERROR` | Something is broken and needs attention now | Payment processing failed, database connection lost |
| `WARN` | Something is wrong but the system recovered | Retry succeeded after timeout, rate limit approaching |
| `INFO` | Normal business events worth recording | User created, deploy completed, job finished |
| `DEBUG` | Development-only detail — never in production logs | SQL queries, variable dumps, step-by-step flow |

**Production runs at INFO.** If you need DEBUG in production to diagnose an issue, your INFO logging is insufficient.

---

## Metrics

Metrics tell you what is happening right now. Logs tell you why. Don't confuse them.

### What to Measure

At minimum, every service must emit:

- **Request latency** — p50, p95, p99 (not just averages — averages lie)
- **Error rate** — 4xx and 5xx, broken out by endpoint
- **Request rate** — throughput per endpoint
- **Queue depth** — Sidekiq/GoodJob queue sizes and latency
- **Database connection pool** — active, idle, waiting connections
- **Cache hit rate** — Redis/Memcached hit vs miss ratio
- **Background job duration** — per job class, with percentiles

### The RED Method (For Services)

Every request-handling service gets three metrics:

- **Rate** — requests per second
- **Errors** — failed requests per second
- **Duration** — distribution of response times

If these three are healthy, your service is healthy. If any degrades, you know where to look.

### The USE Method (For Infrastructure)

Every infrastructure resource gets three metrics:

- **Utilization** — percentage of resource in use (CPU, memory, disk, connections)
- **Saturation** — work that is queued or waiting (queue depth, connection wait time)
- **Errors** — error events on the resource (disk errors, connection failures, OOM kills)

RED for services, USE for infrastructure. Together they cover everything.

### Percentiles, Not Averages

An average response time of 200ms means nothing if p99 is 5 seconds. The 1% of users getting 5-second responses are your most important or most complex users.

- **p50** — the median, what most users experience
- **p95** — the threshold where things start hurting
- **p99** — the worst experience you should tolerate
- **Max** — usually an outlier, but watch for trends

---

## Alerting

### Alert on Symptoms, Not Causes

**Bad:** "CPU is above 80%"
**Good:** "Error rate exceeded 1% for 5 minutes"

CPU at 80% might be fine. Errors at 1% are never fine. Alert on what users experience — elevated errors, increased latency, failed transactions. Investigate root causes (CPU, memory, disk) after you're paged.

### Every Alert Must Be Actionable

If an alert fires and the on-call engineer can do nothing about it, delete the alert. Every alert needs:

1. **A runbook** — what to check, in what order
2. **A clear owner** — who is responsible for this service
3. **A defined action** — what to do when this fires (restart, scale, rollback, escalate)

If the action is "wait and see if it resolves," it's not an alert — it's a metric to watch.

### Severity Levels

Tie these directly to your incident-response process:

| Severity | Meaning | Response time | Example |
|----------|---------|---------------|---------|
| **P1 / Critical** | Service is down, users are impacted | Immediate — page the on-call | Payments failing, site unreachable |
| **P2 / High** | Significant degradation | Within 15 minutes | Latency 10x normal, error rate spiking |
| **P3 / Medium** | Something is wrong, not user-facing yet | Within 1 hour | Queue depth growing, disk filling |
| **P4 / Low** | Worth knowing, no urgency | Next business day | Certificate expiring in 14 days, dependency outdated |

P1 and P2 page. P3 sends to Slack. P4 creates a ticket. No exceptions.

### Avoid Alert Fatigue

Alert fatigue is a reliability risk. When everything alerts, nothing alerts. Engineers start ignoring pages, and the real incident gets lost in the noise.

- **Review alerts monthly** — if it fired and nobody acted, delete it or fix the threshold
- **No duplicate alerts** — one signal, one alert. Don't fire CPU, memory, and latency alerts for the same root cause
- **Tune thresholds with data** — set thresholds based on actual baselines, not guesses
- **Auto-resolve** — if the condition clears, the alert should too

---

## SLIs and SLOs

### Service Level Indicators (SLIs)

An SLI is a quantitative measure of a user-facing behaviour. Pick the ones that matter:

- **Availability** — percentage of successful requests (status != 5xx)
- **Latency** — percentage of requests below a threshold (e.g., p99 < 500ms)
- **Correctness** — percentage of requests returning the right answer
- **Freshness** — percentage of data updated within a time window

### Service Level Objectives (SLOs)

An SLO is a target for your SLI. Be realistic:

- **99.9% availability** = 8.7 hours of downtime per year, 43 minutes per month
- **99.95%** = 4.4 hours per year, 22 minutes per month
- **99.99%** = 52 minutes per year — if you think you need this, you're probably wrong

Set SLOs based on what users actually need, not what sounds impressive. A 99.99% SLO for an internal admin tool is vanity.

### Error Budgets

Your error budget is 100% minus your SLO. With a 99.9% SLO, you get 0.1% of requests to fail or be slow. This is your budget for:

- Deploying new features (which carry risk)
- Running experiments
- Performing maintenance

**When the error budget is exhausted**, stop shipping features and fix reliability. This is not negotiable. Error budgets turn reliability from an opinion into a measurable constraint.

---

## Dashboards

### Every Service Needs a Dashboard

No exceptions. If a service exists in production, it has a dashboard. The dashboard is the first thing you open during an incident.

### Standard Layout (Golden Signals)

Every service dashboard follows the same layout:

1. **Traffic** — request rate, broken down by endpoint or method
2. **Errors** — error rate and count, broken down by type (4xx, 5xx, exception class)
3. **Latency** — p50, p95, p99 response times
4. **Saturation** — queue depth, connection pool usage, memory, CPU

Same layout, every service. When an on-call engineer opens any dashboard at 3am, they know exactly where to look.

### Don't Dashboard Everything

A dashboard with 40 panels is not a dashboard — it's a wall of noise. Each panel must answer a specific question:

- "Is the service healthy?" — golden signals at the top
- "Where is the problem?" — breakdown by endpoint, job class, dependency
- "Is it getting worse?" — trends over time with clear baselines

If a panel hasn't been useful in an incident or a weekly review, remove it.

---

## Distributed Tracing

### Trace IDs Across Services

Every request entering the system gets a unique trace ID. That trace ID propagates to every downstream service, background job, and database query. When something goes wrong, one ID gives you the full picture.

- Generate trace IDs at the edge (load balancer or API gateway)
- Pass them via headers (`X-Request-Id`, `traceparent` for W3C standard)
- Include them in every log line, metric tag, and error report

### Correlation IDs in Logs

Every log line includes the trace ID. Period. This is how you go from "there was an error" to "here is every log line for the request that errored."

```ruby
# With Lograge custom payload
config.lograge.custom_payload do |controller|
  {
    request_id: controller.request.request_id,
    trace_id: controller.request.headers["X-Trace-Id"]
  }
end
```

### Background Job Tracing

Trace IDs don't stop at the request boundary. When a request enqueues a job, the job carries the trace ID. When the job calls another service, the trace ID goes with it.

```ruby
class ProcessOrderJob < ApplicationJob
  def perform(order_id, trace_id:)
    Rails.logger.tagged(trace_id: trace_id) do
      # job logic here
    end
  end
end
```

---

## Health Checks

### Liveness vs Readiness

They are different. Confusing them causes outages.

- **Liveness** — "Is this process alive?" Returns 200 if the application server is running. Failing this means the process is dead and should be restarted. **Do not check dependencies in liveness probes.** A database outage should not cause your orchestrator to restart every application server — that makes things worse.

- **Readiness** — "Can this process serve traffic?" Returns 200 if the application can handle requests. Check critical dependencies here — database connection, Redis connection, required external services. Failing readiness removes the instance from the load balancer without restarting it.

### What to Check in Readiness

- Database connection pool — can we get a connection?
- Redis/cache connection — is it reachable?
- Required external services — only if the service literally cannot function without them
- Migrations — has the schema been updated? (useful during rolling deploys)

### What NOT to Check

- Optional dependencies — if the recommendation engine is down, you can still serve the page without recommendations
- Disk space — use a separate metric and alert for this
- Background job system — the web process doesn't need Sidekiq to serve requests

---

## Production Debugging

### Safe Debugging Practices

Production is not your development environment. Every query you run, every console you open, every log you enable has the potential to make things worse.

- **Never run write operations in production console** unless you have a reviewed, tested script and an explicit rollback plan
- **Never debug on the primary database** — connect to a read replica. Always. Even for SELECT queries. One bad query on primary takes down every user.
- **Never enable DEBUG logging in production** — it will fill your disks and degrade performance. Add targeted INFO-level logging if you need more detail, deploy it, get your data, remove it.
- **Time-bound your debugging** — if you're in a production console for more than 10 minutes, you're probably doing it wrong. Write a script, test it, run it.

### Read Replicas for Queries

When investigating production issues:

```ruby
# Use ActiveRecord's built-in replica routing
ActiveRecord::Base.connected_to(role: :reading) do
  # Your investigation queries here
end
```

If your app doesn't have read replica routing configured, fix that before you need it. You don't want to be configuring database connections during an incident.

### Audit Everything

Every production console session, every manual query, every data fix — log it. Who did it, when, what they ran, what changed. This isn't bureaucracy, it's incident response.

---

## Tooling

### Rails Applications

| Purpose | Tool | Why |
|---------|------|-----|
| **Structured logging** | Lograge | Single-line JSON logs, filterable, parseable |
| **Error tracking** | Sentry or Honeybadger | Grouped errors, context, source maps, alerts |
| **APM** | Datadog or New Relic | Request tracing, slow query detection, dependency mapping |
| **Performance profiling** | rack-mini-profiler | In-browser query counts, render times, memory usage — development and staging only |
| **N+1 detection** | Bullet / Prosopite | Catch N+1 queries before they reach production |
| **Uptime monitoring** | Pingdom, Checkly, or UptimeRobot | External synthetic checks — did the page load? |

### Don't Roll Your Own

Use hosted solutions for observability. Building your own log aggregation, metrics pipeline, or alerting system is a full-time job for a team. You're building a product, not an observability platform.

---

## Staff Engineer Thinking

When reviewing any service for observability, ask:

1. **Can I diagnose an incident without SSHing into a server?** — if not, you're missing logs, metrics, or traces
2. **Can a new on-call engineer understand this service's health in 30 seconds?** — if not, the dashboard is wrong
3. **Will I know about a problem before users tell me?** — if not, alerting is insufficient
4. **Can I trace a single request across every service it touches?** — if not, distributed tracing is broken
5. **Do I know what "normal" looks like?** — if not, you can't spot abnormal. Establish baselines before you need them

**Observability is not a feature you ship once. It degrades as the system evolves.** New endpoints go unmonitored, new services lack dashboards, alert thresholds drift as traffic grows. Treat observability like code — review it, maintain it, improve it continuously.
