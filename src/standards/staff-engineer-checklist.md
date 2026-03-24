# Staff Engineer Thinking Checklist

Use this checklist at key decision points — before designing a feature, opening a PR, or responding to an incident. Staff engineers think beyond the immediate task.

## Before Writing Code

- [ ] **Do I understand the why?** Can I explain the business reason to a non-engineer?
- [ ] **Is this the right solution?** Have I considered at least one alternative approach?
- [ ] **What's the blast radius?** Who else is affected by this change?
- [ ] **Is this the simplest thing that works?** Am I over-engineering for hypothetical futures?
- [ ] **Who should I loop in?** Does this touch another team's domain?

## During Implementation

- [ ] **Am I building a guardrail?** If this broke before, can I prevent it from breaking again?
- [ ] **Is this observable?** Can we tell if it's working in production without someone reporting a bug?
- [ ] **Is this safe to deploy?** Feature flag? Staged rollout? Rollback plan?
- [ ] **Am I leaving the codebase better?** Boy scout rule — but don't mix cleanup with features

## Before Opening the PR

- [ ] **Can someone else maintain this?** Would a new team member understand this in 6 months?
- [ ] **Did I document the non-obvious?** Comments for "why", not "what"
- [ ] **Is the PR the right size?** Can it be reviewed in one sitting?
- [ ] **Did I consider the migration path?** Schema changes, data backfills, backwards compatibility

## After Merging

- [ ] **Did I verify in production?** Don't merge and move on — confirm it works
- [ ] **Is there follow-up work?** Track it — don't leave loose ends in your head
- [ ] **Can I share what I learned?** Knowledge Hub article, team Slack post, or RFC

## Incident Response

- [ ] **Fix the symptom first** — restore service
- [ ] **Then investigate the root cause** — don't just patch and move on
- [ ] **Build the guardrail** — CI check, monitoring alert, validation
- [ ] **Share the learning** — incident review, post-mortem, documentation

## Cross-Team Impact

- [ ] **Does this change an API contract?** Notify consumers
- [ ] **Does this affect shared infrastructure?** Database load, queue throughput, cache invalidation
- [ ] **Could this pattern be reused?** If you solved it well, propose it as a standard
- [ ] **Am I unblocking others?** Staff engineers create leverage — your work should multiply the team's output
