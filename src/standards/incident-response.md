# Incident Response

> For Rails-specific incident tooling (error tracking, monitoring setup), delegate to the **rails-expert** agent:
> https://github.com/rajgurung/awesome-claude-code-subagents/blob/main/categories/02-language-specialists/rails-expert.md

## Core Principle

**Mitigation first, root cause second.** When the house is on fire, you grab the extinguisher — you don't investigate the wiring. Every second spent debating the cause while users are down is a second wasted. Stop the bleeding, stabilize, then learn.

---

## Severity Levels

| Level | Definition | Response Time | Example |
|-------|-----------|---------------|---------|
| **SEV1** | Total service outage or data loss affecting all users | **15 minutes** — all hands, wake people up | Database down, payment processing broken, data breach |
| **SEV2** | Major feature degraded, significant user impact | **30 minutes** — on-call responds, pulls in help as needed | Search broken, login failing for a subset of users, background jobs backed up for 30+ minutes |
| **SEV3** | Minor feature broken, workaround exists | **4 hours** — on-call acknowledges, fixes within business hours | CSV export timing out, admin panel slow, non-critical integration failing |
| **SEV4** | Cosmetic or low-impact issue noticed in production | **Next business day** — track it, fix it in normal flow | UI alignment broken on one page, incorrect copy, minor logging error |

**When in doubt, round up.** It's cheaper to over-respond and downgrade than to under-respond and escalate later.

---

## Incident Commander

Every SEV1 and SEV2 incident has exactly one **Incident Commander (IC)**. Not two. Not a committee. One person.

### Who Becomes IC

The first senior engineer or engineering manager who responds claims the role. Say the words: **"I'm IC."** If no one claims it within 5 minutes, the on-call engineer is IC by default.

### IC Responsibilities

- **Own the incident** — you are the single point of coordination, not the single point of fixing
- **Delegate clearly** — assign specific people to specific tasks ("Alex, investigate the database. Sam, check the deploy log.")
- **Control communication** — you decide what goes to stakeholders and when
- **Track the timeline** — or designate someone to do it
- **Call for help early** — pulling in too many people is fixable, not having enough is not
- **Decide when it's over** — declare the incident resolved and trigger the postmortem process

### What the IC Does NOT Do

- Debug the code (you're coordinating, not coding)
- Make excuses to stakeholders (state facts, give ETAs, update regularly)
- Disappear for 20 minutes to "check something"

---

## Communication Protocol

### Internal — Slack

1. **Create a dedicated incident channel**: `#incident-YYYY-MM-DD-short-description`
2. Post the initial alert with severity, symptoms, and who's responding
3. All investigation discussion happens in this channel — not in DMs, not in threads on other channels
4. **Update every 15 minutes** for SEV1, every 30 minutes for SEV2 — even if the update is "still investigating, no change"
5. Pin key findings and decisions

### Stakeholders

| Severity | Who to Notify | When | How |
|----------|--------------|------|-----|
| SEV1 | Engineering leadership, product, support, affected teams | Immediately | Slack + phone/SMS for leadership |
| SEV2 | Engineering leadership, product, support | Within 30 minutes | Slack |
| SEV3 | Team lead | Within 4 hours | Slack |
| SEV4 | No one — track in issue tracker | N/A | N/A |

### External — Status Page

- **SEV1**: Update status page within 20 minutes of detection. Use plain language: what's broken, what we're doing, when we'll update next.
- **SEV2**: Update status page if customer-facing impact lasts more than 30 minutes.
- **SEV3/SEV4**: No status page update unless customer-visible for an extended period.

### What Good Communication Looks Like

```
[SEV1] Payment processing is failing for all users.
Impact: No orders can be completed.
Cause: Investigating — appears related to the 14:30 deploy.
Current action: Rolling back to previous version.
Next update: 15 minutes.
IC: @alex
```

What it does NOT look like: "We're looking into some issues."

---

## Incident Timeline Template

Start documenting from the moment the incident is detected. This is not optional — the timeline is the single most valuable artifact for the postmortem.

```
## Incident: [Short description]
## Severity: SEV[1-4]
## IC: [Name]

### Timeline (all times in UTC)

| Time | Event |
|------|-------|
| 14:32 | Alert fired: error rate > 5% on /api/payments |
| 14:35 | On-call acknowledged, began investigation |
| 14:38 | IC claimed by @alex, incident channel created |
| 14:42 | Identified: deploy at 14:30 introduced regression in PaymentService |
| 14:45 | Decision: rollback to previous version |
| 14:48 | Rollback deployed |
| 14:52 | Error rate returning to normal |
| 15:05 | Confirmed: all systems nominal, incident resolved |

### Impact
- Duration: 33 minutes
- Users affected: ~2,400 failed payment attempts
- Revenue impact: estimated $X

### What We Did
1. Rolled back the 14:30 deploy
2. Confirmed error rates normalized
3. Verified no data corruption in payment records

### Immediate Follow-ups
- [ ] Fix the regression in PaymentService before re-deploying
- [ ] Add integration test covering this payment path
```

Document facts, not feelings. Timestamps, not narratives.

---

## Mitigation Playbook

### Stop the Bleeding — In Order of Speed

1. **Feature flag off** — instant, no deploy needed (seconds)
2. **Rollback the deploy** — revert to last known good version (minutes)
3. **Scale up / restart** — if it's a resource issue, throw hardware at it (minutes)
4. **Block bad traffic** — rate limit, block IPs, disable an endpoint (minutes)
5. **Database intervention** — kill long-running queries, failover to replica (minutes, but risky)
6. **Forward-fix** — ship a patch (only if the fix is small, obvious, and well-understood)

### Decision Framework

Ask yourself: **"Can I explain this fix in one sentence and be confident it won't make things worse?"**

- Yes → do it
- No → rollback and investigate safely

Never try a speculative fix on a SEV1 in production. Rollback first. Get to a stable state. Then think clearly.

---

## Postmortem

Every SEV1 and SEV2 gets a written postmortem. No exceptions.

### The Rules

1. **Blameless.** We do not ask "who caused this?" We ask "what about our systems allowed this to happen?" If a human made an error, the system should have caught it.
2. **Written.** Not a verbal debrief that everyone forgets by Friday. A document that lives in the repo or wiki.
3. **Shared.** Posted where the whole engineering team can read it. Incidents are learning opportunities, not secrets.
4. **Action-oriented.** Every postmortem produces concrete action items with owners and deadlines.

### Postmortem Template

```
## Postmortem: [Incident title]
## Date: YYYY-MM-DD
## Severity: SEV[X]
## Author: [Name]
## Reviewed by: [Names]

### Summary
One paragraph. What happened, how long it lasted, what the impact was.

### Timeline
[Copy from incident timeline, cleaned up]

### Root Cause
What was the underlying cause? Go beyond the immediate trigger.
Use the "5 Whys" if it helps — but stop when you reach a systemic issue, not a person.

### Contributing Factors
What else made this worse or slower to resolve?
- Missing monitoring?
- Unclear runbook?
- Deploy during low-staffing hours?

### What Went Well
What worked? Fast detection? Good communication? Quick rollback?
Acknowledge what the team did right.

### What Went Wrong
What failed? Slow detection? Missing tests? Unclear ownership?
Be specific. "We need better monitoring" is not useful. "We had no alert on payment error rates exceeding 2%" is.

### Action Items
| Action | Owner | Deadline | Priority |
|--------|-------|----------|----------|
| Add alert for payment error rate > 2% | @alex | 2026-04-01 | P1 |
| Add integration test for payment edge case | @sam | 2026-04-03 | P1 |
| Update deploy checklist to include payment smoke test | @alex | 2026-04-07 | P2 |

### Lessons Learned
What should the broader team take away from this?
```

---

## Follow-up SLAs

| Item | SEV1 | SEV2 |
|------|------|------|
| Postmortem draft written | **48 hours** | **5 business days** |
| Postmortem reviewed by team | **1 week** | **2 weeks** |
| P1 action items completed | **1 week** | **2 weeks** |
| P2 action items completed | **1 month** | **1 month** |
| Postmortem shared with broader org | **1 week** | **2 weeks** |

**Track action items in your issue tracker, not in a doc that rots.** If a P1 action item slips past its deadline, escalate to engineering leadership. The whole point of a postmortem is the follow-through — without it, you'll have the same incident again.

---

## On-Call Expectations

### What On-Call Means

- You are reachable within **15 minutes** during on-call hours
- Your laptop is nearby and you can access production systems
- You are not the person who fixes everything — you are the first responder who triages and escalates
- If you can't fulfill on-call (sick, travel, emergency), you swap with someone **before** your shift starts

### On-Call Rotation

- Rotate weekly. One primary, one secondary.
- Primary responds first. Secondary is backup if primary doesn't acknowledge within 15 minutes.
- On-call load should be distributed fairly. Track it. If one person is always on-call, fix the rotation.
- Compensate on-call time — whether with comp time, pay differential, or schedule flexibility. Free labour breeds resentment and burnout.

### Escalation Path

```
Alert fires
  → Primary on-call acknowledges (15 min SLA)
    → If no ack → Secondary on-call paged
      → If no ack → Engineering manager paged
        → If no ack → VP of Engineering paged
```

For SEV1, skip the ladder — page primary, secondary, and engineering manager simultaneously.

### Runbooks

Every alertable condition should have a runbook linked from the alert. The runbook should answer:

- What does this alert mean?
- What's the likely cause?
- What should I check first?
- What's the mitigation? (link to the exact command or dashboard)
- When should I escalate?

If an alert fires and there's no runbook, **writing one is the first follow-up action item.**

---

## Practice Drills / Game Days

You don't get good at incident response by reading a doc. You get good by practicing.

### Monthly Drills

- Run a simulated incident once a month. Pick a realistic scenario (database failover, deploy gone wrong, third-party API outage).
- Assign a real IC. Use real communication channels. Follow the real process.
- Time the response. Identify gaps.

### What to Practice

- **Detection** — Can the team identify the problem from alerts and dashboards alone?
- **Communication** — Does the IC keep stakeholders informed? Is the incident channel useful or chaotic?
- **Mitigation** — Can the team execute the rollback/failover/flag-flip quickly?
- **Escalation** — Does the escalation path work? Are the right people reachable?
- **Handoff** — Can the IC hand off to someone else cleanly if the incident spans shifts?

### Chaos Engineering (When You're Ready)

Once your team handles drills well, introduce controlled failures in production:

- Kill a service instance and verify auto-recovery
- Inject latency into a dependency and verify graceful degradation
- Failover the database and measure recovery time

Start in staging. Graduate to production only when you trust your monitoring, alerting, and rollback systems. Chaos engineering without observability is just chaos.

---

## Staff Engineer Thinking

When reviewing incident readiness, ask:

1. **Can we detect this failure?** — If the monitoring doesn't alert on it, we won't know until a user tells us.
2. **Can we mitigate in under 5 minutes?** — If the answer is no, the architecture needs a circuit breaker, feature flag, or faster rollback path.
3. **Will we learn from this?** — If postmortems aren't happening or action items aren't being completed, the process is theatre.
4. **Is the on-call sustainable?** — If people dread on-call, the system is too fragile or the rotation is unfair. Fix both.
5. **Have we practiced this?** — The worst time to learn your incident process is during an actual incident.

**The goal is not zero incidents. The goal is fast detection, fast mitigation, and never having the same incident twice.**
