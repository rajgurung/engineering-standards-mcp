# Architecture Decision Records

## Why ADRs Exist

An Architecture Decision Record is a short document that captures a significant technical decision — what was decided, why, and what the trade-offs are. That's it. Not a design doc. Not an RFC. A decision, written down, so that in six months nobody has to reverse-engineer intent from a git blame.

Teams that don't write ADRs end up having the same debates repeatedly. Someone asks "why did we pick Kafka over SQS?" and the answer is tribal knowledge held by one person who's on holiday. ADRs fix this.

## When to Write an ADR

- Adopting a new technology, framework, or library
- Changing an established pattern (switching from callbacks to service objects, moving from REST to GraphQL)
- Infrastructure decisions (database choice, caching strategy, queue backend)
- Significant architectural changes (extracting a service, introducing event sourcing)
- Security-sensitive choices (auth strategy, encryption approach, data retention)
- Anything you'd need to explain to a new team member or your future self

The bar is simple: **if the decision is worth debating, it's worth recording.**

## When NOT to Write an ADR

- Routine implementation choices ("I used a hash instead of an array")
- Bug fixes
- Obvious decisions that follow directly from an existing ADR or standard
- Choosing between equivalent options where the trade-offs are negligible
- Decisions already captured in another format (e.g., an RFC that was approved)

Don't create process for the sake of process. ADRs should reduce friction, not add it.

## The Template

Store this in your repo. Copy it verbatim when starting a new ADR.

```markdown
# ADR-NNNN: Title of Decision

## Status

Proposed | Accepted | Deprecated | Superseded by ADR-XXXX

## Date

YYYY-MM-DD

## Context

What is the situation? What forces are at play? What problem are we solving?

Be specific. Include numbers if you have them (request volume, latency targets,
team size constraints). Don't write a novel — two to four paragraphs is enough.

## Decision

What did we decide? State it clearly in one or two sentences.

Then explain how it will be implemented at a high level. Not a design doc —
just enough detail that someone understands the shape of the change.

## Consequences

### What we gain
- List the benefits

### What we lose
- List the trade-offs and costs

### Risks
- What could go wrong
- What assumptions might not hold

## Alternatives Considered

### Alternative A: [Name]

Brief description. Why we didn't pick it — be specific about the trade-off
that made this option worse for our situation.

### Alternative B: [Name]

Same format. Every serious option you discussed should appear here.
```

## Storage and Naming

Keep ADRs in the repo, close to the code they affect:

```
docs/adr/
  0001-use-solid-queue-for-background-jobs.md
  0002-adopt-service-object-pattern.md
  0003-switch-to-postgresql-from-mysql.md
```

Rules:
- Number sequentially — `0001`, `0002`, etc. Gaps are fine (don't renumber)
- Use lowercase kebab-case after the number
- The filename should be the decision, not the topic — `0004-use-redis-for-caching.md`, not `0004-caching.md`
- One decision per file. If a decision has sub-decisions, they get their own ADRs

Alternative paths: `doc/architecture/decisions/` is also fine. Pick one location and stick with it.

## Lifecycle

```
Proposed → Reviewed → Accepted
                         ↓
                    Superseded (by a new ADR)
                         ↓
                    Deprecated (no longer relevant)
```

- **Proposed** — someone writes the ADR and opens a PR
- **Reviewed** — the team discusses it, just like a code review
- **Accepted** — the team agrees, the ADR is merged
- **Superseded** — a new ADR replaces this one. Update the status to "Superseded by ADR-XXXX" and link to the new one
- **Deprecated** — the decision is no longer relevant (system removed, technology sunset)

Never delete an ADR. History matters. A superseded ADR tells you what you used to do and why you stopped. That context is invaluable.

## Review Process

ADRs should go through the same review process as code:

1. Author writes the ADR and opens a PR
2. Tag relevant reviewers — anyone affected by the decision, plus at least one senior engineer
3. Discussion happens in the PR, not in Slack (Slack conversations disappear; PR comments persist)
4. Reviewers check for: completeness of alternatives, honesty of trade-offs, clarity of context
5. Once approved, merge and update status to Accepted

For team-level decisions, team review is sufficient. For decisions that affect multiple teams or the platform, include architects or staff engineers.

Don't let ADR reviews become design-by-committee. The author owns the decision. Reviewers pressure-test it.

## Good ADRs vs Bad ADRs

### Good ADR

> **Context:** Our background job queue processes 50k jobs/hour. Sidekiq requires Redis, which adds operational overhead and a single point of failure. We've had three Redis-related outages in the past quarter. Rails 8 ships with Solid Queue, which uses the existing PostgreSQL database.
>
> **Decision:** Migrate from Sidekiq to Solid Queue for all background jobs.
>
> **Consequences:** We eliminate Redis as a dependency (-$400/mo, one fewer thing to monitor). We lose Sidekiq's Web UI — we'll build dashboards in Grafana instead. Job throughput may decrease under extreme load since we're adding write pressure to PostgreSQL. We'll benchmark before migrating critical queues.
>
> **Alternatives Considered:** GoodJob was considered but lacks built-in recurring job support. Keeping Sidekiq and improving Redis reliability was considered, but adds operational complexity without reducing our dependency surface.

Specific. Honest about trade-offs. Mentions numbers. Explains why each alternative lost.

### Bad ADR

> **Context:** We need a new job queue.
>
> **Decision:** Use Solid Queue.
>
> **Consequences:** It will be better.
>
> **Alternatives Considered:** We looked at some other options.

Vague. No context on why the change is needed. No trade-offs. No substance in alternatives. This ADR is worse than no ADR — it gives the illusion of documentation while documenting nothing.

## ADRs vs RFCs

These are different tools for different situations:

| | ADR | RFC |
|---|---|---|
| **Tense** | Past — "We decided to..." | Future — "We propose to..." |
| **Length** | 1-2 pages | 3-10+ pages |
| **Scope** | Team-level decisions | Cross-team or org-wide changes |
| **Detail** | Concise — the decision and its context | Detailed — design, rollout plan, migration strategy |
| **When** | Most technical decisions | Large architectural changes, new platform capabilities, breaking changes |

An RFC often produces one or more ADRs. The RFC is the discussion; the ADRs are the outcomes. If a decision doesn't need cross-team buy-in and fits in a page, skip the RFC and write an ADR.

## Staff Engineer Responsibility

Senior and staff engineers own ADR culture. This means:

- **Write ADRs yourself** — lead by example, don't just tell others to write them
- **Ask "is there an ADR for this?"** when reviewing PRs that introduce architectural changes
- **Review ADRs thoroughly** — challenge weak trade-off analysis, push for specificity, verify alternatives were genuinely considered
- **Reference ADRs in code reviews** — "This is consistent with ADR-0012" or "This deviates from ADR-0008, should we write a new one?"
- **Keep the bar right** — too many ADRs and people stop reading them, too few and decisions go undocumented. Nudge the team in whichever direction they need
- **Ensure ADRs are findable** — maintain an index or use consistent naming so people can actually discover past decisions

The goal is a team that naturally reaches for an ADR when making a meaningful decision, without being told to. That's a culture problem, not a process problem, and culture is a staff engineer's job.
