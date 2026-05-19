# Standup Format

A standup should scan in under 20 seconds. If a teammate has to re-read it, it's too long.

## Structure

Three sections only:

1. **Yesterday** — what was done
2. **Today** — what's planned
3. **Blockers / asks** — what's in the way, what you need

No "in progress" or "miscellaneous" sections. If something is genuinely both yesterday and today, put it under Today.

## Style Rules

### Reference work by name, not by identifier

- ✅ "Addressed feedback on the inference callback receiver."
- ❌ "Addressed feedback on PR #78 / RR-417."

PR numbers and ticket IDs are noise in a standup. Use the Linear ticket title in plain English. The team knows the ticket; they don't memorise the number.

Exception: keep the ID when the work is genuinely waiting on someone else and naming the ticket helps them find it.

### Highlights only

One line per item under Yesterday. If something needs more explanation, it belongs in a PR description or a Linear comment, not standup.

Bad:
> Yesterday I worked on the callback receiver. I started by reviewing Jack's feedback, then I looked at the filter_parameters configuration, then I added failure_reason to the list, then I went back to the orchestrator to confirm the outbox state transition was handled job-side, then I replied to all three of Jack's threads, then I pushed the commit...

Good:
> Addressed feedback on the inference callback receiver — filtered the VLM's free-text failure reason from request logs; confirmed outbox state transition already happens job-side.

### Layman terms, no internal jargon

Avoid acronyms and code-symbol references where a plain phrase works.

- ✅ "Mirror every case log event into a New Relic custom event"
- ❌ "Add `Orchestrator.log_event` → `NewRelic::Agent.record_custom_event` with `NR_PAYLOAD_ALLOWLIST`"

If a non-engineer in the room can't follow it, it's too jargon-heavy.

### Why-shaped, not what-shaped

A standup item should hint at the *purpose*, not list mechanics.

- ✅ "Posted product questions to Jay on AI peer-review case queueing — unblocks the next ticket."
- ❌ "Sent a message in Slack."

### External dependencies live under "outside our court"

Anything blocked by people outside your team goes under Blockers / asks, framed as "outside our court". Keeps the standup honest about what's on the critical path vs. what's queued behind someone else.

- ✅ "Outside our court: VLM contract sign-off with Mecha, and Tim's input on Colin's S3 layout."

### Flag when work is unblocked because of stubs

When external collaborators are slow, call out explicitly that the thin shell / stub work means we're not actually blocked. Otherwise readers assume the project is stuck.

- ✅ "None blocking — the thin shell is fully stub-driven. External work is queued behind it, not on the critical path."

### Tomorrow only if it adds information

Don't pad with a "Tomorrow" section unless the plan genuinely differs from "continue today's work". A two-day standup is fine when one is announcing intent for a coming day off, sprint demo, etc. — otherwise stick to today.

## Template

```markdown
**Standup — <day> <date>**

**Yesterday**
- <one line per highlight, by name not number>

**Today**
- <today's actionable items>

**Blockers / asks**
- <internal: reviews, decisions you need>
- <external: outside our court, named>
```

## Anti-patterns

- **PR-number soup**: "Yesterday: #67, #78, #89, #90, #100." Means nothing to anyone who isn't already paged into your work.
- **Status-report mode**: long paragraphs explaining what changed in code. The diff exists; standup is for context the diff can't convey.
- **Phantom blockers**: listing dependencies that aren't actually blocking. If you're not waiting on them today, they're not blockers.
- **Trailing summary**: "...and that's what I did yesterday." The reader can see the section header; don't restate it.
- **Process narration**: "I started by reading the spec, then I checked the code, then I asked Tim..." Skip the prelude, lead with the result.
