# Technical Debt

## What Counts as Tech Debt

Technical debt is the gap between the code you have and the code you need to move at a sustainable pace. It comes from:

- **Intentional shortcuts** — "we'll ship with this workaround and fix it next sprint" (and next sprint never came)
- **Outdated patterns** — code that was fine when written but the world moved on (old auth flows, deprecated libraries, abandoned abstractions)
- **Accumulated complexity** — years of features layered on a model that was never designed to hold them
- **Missing infrastructure** — no feature flags, no observability, no CI checks for things that keep breaking

### What is NOT Tech Debt

- Code you didn't write and don't like the style of
- Features that work but aren't built the way you would have built them
- Libraries you haven't heard of replacing libraries that work fine
- "This could be more elegant" — elegance is not a business requirement

The distinction matters. Tech debt has a measurable cost. Style preferences do not.

## The Tech Debt Quadrant

Not all debt is equal. Understanding how it was created tells you how to handle it.

|  | **Reckless** | **Prudent** |
|---|---|---|
| **Deliberate** | "We don't have time for tests" — you knew better and cut corners anyway | "Ship now, refactor next quarter" — a conscious trade-off with a plan to pay it back |
| **Accidental** | "What's a connection pool?" — you didn't know enough to do it right | "Now we know what the domain actually looks like" — hindsight after learning |

**Deliberate + Prudent** is the only acceptable form. The rest need different responses — training, better review gates, or honest retrospectives about why corners got cut.

## Severity Levels

### Critical

Actively causing incidents, blocking features, or creating security risk. Examples: unindexed queries on tables that grew 100x, auth bypass in a legacy path, a service that can't be restarted without data loss.

**Response:** Treat like a bug. Fix it now.

### High

Significantly slows development. Every feature that touches this area takes 2-3x longer than it should. Examples: a god object with 4,000 lines, no test coverage on a critical payment flow, a hand-rolled ORM that nobody understands.

**Response:** Dedicate focused time. Don't chip away — commit to a proper fix.

### Medium

Annoying but workable. Developers know the workaround and use it. Examples: inconsistent naming conventions in an API, a config file that requires manual steps to update, duplicated logic across two services.

**Response:** Fix it when you're already working in the area. Boy scout rule.

### Low

Cosmetic or nice-to-have. No measurable impact on velocity or reliability. Examples: old comments that reference removed features, a helper method that could be slightly cleaner, a test file that's longer than it needs to be.

**Response:** Fix it if it's trivial. Otherwise, leave it alone.

## How to Document It

Every piece of known tech debt gets an issue with a `tech-debt` label. No exceptions. Debt that lives only in someone's head is invisible debt — it won't get prioritised and it won't get fixed.

Each issue must include:

- **What** — describe the problem concretely. "The billing module is messy" is useless. "BillingCalculator handles both invoicing and subscription logic with 47 conditionals" is actionable.
- **Why it exists** — was it a deliberate trade-off? A requirement that changed? A gap in understanding? This prevents re-litigating the decision.
- **Impact** — what's the cost of leaving it? Slower feature development? Incident risk? Onboarding friction? Be specific.
- **Proposed fix** — what would the solution look like? Doesn't need to be a full design — enough to estimate effort.
- **Estimated effort** — T-shirt size at minimum (S/M/L/XL). Hours or story points if you can.

### In-Code Markers

Use `TODO(debt)` for small items that don't warrant a standalone issue but should be findable:

```
# TODO(debt): This retry logic should use the shared RetryPolicy.
# Duplicated here because RetryPolicy didn't exist when this was written.
# See: https://github.com/org/repo/issues/1234
```

Every `TODO(debt)` must link to an issue or have a date by which it should be resolved. Orphaned TODOs are just comments.

## When to Pay It Down

### The Boy Scout Rule

Leave code better than you found it. If you're already modifying a file and you see a small improvement, make it — in a separate commit. Don't mix debt paydown with feature work in the same commit.

### Dedicated Sprint Capacity

Reserve 15-20% of sprint capacity for debt work. This is not negotiable. Teams that spend 100% on features slow down every quarter. Teams that invest in their codebase maintain or increase velocity.

Track it. If you're not hitting the target, talk about why in retro.

### Before Building on Top of Debt

If the feature you're about to build sits on top of known debt, pay the debt first. Compounding debt is how codebases become unmaintainable. Building a new payment flow on top of a billing module you know is broken is not pragmatism — it's negligence.

### When It's Blocking a Feature

If debt is the reason a feature estimate tripled, that's your signal. The debt is no longer theoretical — it's a concrete cost. Propose paying it down as part of the feature work.

## When NOT to Pay It Down

### Premature Abstraction

"This is used in two places, let me build a framework." No. Wait until you have three concrete use cases and can see the real pattern. Wrong abstractions are worse than duplication.

### Rewriting for Style Preferences

"I'd have done this differently" is not a reason to rewrite working code. If it works, it's tested, and it's not slowing anyone down, leave it alone.

### Gold-Plating

"While I'm refactoring this, let me also add comprehensive logging, a metrics dashboard, and support for three edge cases we've never hit." No. Fix the debt. Ship it. Move on.

### "While I'm in Here" Scope Creep

Debt paydown PRs should be surgical. One problem, one fix. If you discover adjacent debt while fixing something, file an issue for it. Don't let a 2-day task become a 2-week rewrite.

### Code That's Being Replaced

If a service is scheduled for decommission next quarter, don't refactor it. Manage the risk (monitoring, feature flags, circuit breakers) and let it die on schedule.

## How to Propose Tech Debt Work

Nobody outside engineering cares that the code is ugly. Make the business case.

**Effective framing:**
- "This area has caused 3 incidents in the last quarter. Fixing the underlying issue costs 2 sprints. Not fixing it means we keep losing X hours per incident."
- "Every feature that touches billing takes 3x longer than equivalent work elsewhere. We've measured it. Paying down this debt would recover Y developer-days per quarter."
- "New hires take 2 extra weeks to become productive because of this. At our hiring rate, that's Z hours of lost productivity per year."

**Ineffective framing:**
- "This code is bad and we should rewrite it."
- "Nobody wants to work on this module."
- "It's not how we do things anymore."

Quantify the cost. Compare it to the cost of the fix. Let the numbers make the argument.

## Prevention

### Code Review as a Gate

Reviewers should flag new debt being introduced — not to block the PR, but to ensure it's tracked. "This is a reasonable shortcut for now. Can you file a follow-up issue?" is a perfectly good review comment.

### No Untracked Temporary Code

If a PR includes a workaround, shortcut, or "temporary" solution, the follow-up issue must exist before the PR merges. No issue, no merge. "Temporary" code without a ticket is permanent code.

### Time-Bound TODOs

TODOs without dates or issue links are ignored. Use tooling to enforce this — CI checks that flag undated TODOs, linters that require issue references.

### Design Reviews for Significant Changes

Any change that introduces a new pattern, a new dependency, or touches more than 3 services gets a design review. The cheapest time to prevent debt is before the code exists.

### Retrospectives

Ask regularly: "What slowed us down this sprint that shouldn't have?" The answers are your debt backlog. Track them.

## Metrics

You can't manage what you can't see. Track these:

- **Debt ratio** — percentage of sprint capacity spent on debt vs features vs bugs. Healthy teams are around 15-20% debt, 70-75% features, 10% bugs.
- **Cycle time by area** — if features in one module consistently take longer, that's a signal. Measure it.
- **Incident frequency by component** — if the same module keeps breaking, the debt there is underpriced in your backlog.
- **Developer friction surveys** — quarterly, ask the team: "What's the most frustrating part of the codebase to work in?" Track it over time.
- **TODO/debt issue age** — how long do debt issues sit in the backlog? If the average age is over 6 months, you're not paying it down.

## The Staff Engineer's Role

Tech debt is a leadership problem disguised as a technical problem. As a staff engineer:

- **Make debt visible.** If it's not tracked, it doesn't exist to anyone outside the team. File the issues. Maintain the debt backlog. Put it on the roadmap.
- **Prioritise it alongside features.** Debt competes for the same engineering time as features. Treat it with the same rigour — estimated, prioritised, scheduled.
- **Champion sustainable velocity.** Short-term speed that creates long-term drag is not speed. Your job is to optimise for the team's output over quarters and years, not sprints.
- **Set the example.** Pay down debt in your own work. Write the follow-up tickets. Do the boring refactors. The team follows what you do, not what you say.
- **Know when to stop.** Perfect is the enemy of shipped. Some debt is acceptable. Some debt is even strategic. The goal is not zero debt — it's manageable debt with a conscious plan.
