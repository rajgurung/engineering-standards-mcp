# Pull Request Standards

## Branch to PR Flow

1. Create a branch from main with issue tracker ID prefix
2. Make your changes in focused, logical commits
3. Rebase onto latest main before opening the PR
4. Open the PR — title should be concise (under 70 characters)
5. PR title should NOT include the issue tracker ID (the branch name handles the link)

## PR Size

- Aim for PRs that can be reviewed in 15-30 minutes
- If a change is large, split it into stacked PRs:
  - Schema changes first
  - Backfill/data migration second
  - Application code third
- Each PR should be independently deployable and safe to merge
- If you can't split it, explain why in the description

## PR Description Template

```markdown
## Summary
- [1-3 bullet points explaining what and why]

## Test plan
- [ ] How this was verified
- [ ] Edge cases considered
```

## Flow Diagrams for Complex Projects

If the PR touches a project with multiple discrete stages or systems (an asynchronous event-driven pipeline, a state machine with many transitions, an admin control plane that feeds into a runtime, a multi-step ETL flow), include a "where this PR sits" diagram at the top of the description.

### Why this matters

Reviewers reading a 10-file diff in a 50-ticket project have to reconstruct from the code which stage the change touches. The cognitive load is real and grows with project complexity. A single diagram with a "you are here" marker removes that load. Triggered in practice by reviewer feedback ("this project is complex enough that I needed an assistant to help me read it") — that is the signal that the project has crossed the complexity threshold.

### When to include one

Yes:
- Event-driven pipelines with 5+ event types (case log events, state machines)
- Multi-tenant / multi-stage workflows where the same code path runs at different stages
- Admin control planes whose configuration changes the runtime behaviour of many cases
- Projects where one PR series will span 6+ months and 20+ tickets
- Anywhere reviewers have asked "where in the system are we looking at?"

No:
- Standalone features (one model, one controller, one view)
- Bug fixes in a known component
- Single-file refactors

### Two shapes, pick the right one

| The PR touches | Use this shape |
|---|---|
| Runtime per-record behaviour (event emission, payload, callback handling, downstream processing) | **Lifecycle diagram** — the sequence of states/events a single record passes through, with the touched stage highlighted. |
| Control plane (admin UI, configuration tables, kill switches, thresholds, routing rules) | **Admin flow diagram** — a two-zone diagram showing admin → config → data → runtime touchpoint. Highlight the configuration row or admin form that changes. |

Common mistake: pasting a lifecycle diagram on a control-plane PR and highlighting an event node. The PR doesn't change that event; it changes what feeds into it. The admin-flow shape is more accurate and reviewer-friendly for control-plane work.

### How to apply

1. Open the PR description with a `## Where this PR sits` heading.
2. Embed a Mermaid flowchart of the relevant flow (lifecycle or admin). GitHub renders ```mermaid``` code fences natively as SVG.
3. Mark the touched node with both:
   - A label suffix like `<br/><b>★ THIS PR ★</b>`
   - A gold style: `style <NodeId> fill:#ffd700,stroke:#b8860b,stroke-width:3px,color:#000`
4. For lifecycle shapes, style failure / exclusion branches in muted red (`fill:#f8d7da,stroke:#721c24,color:#000`) so the happy path stands out.
5. For admin shapes, use `subgraph` blocks to separate control-plane from runtime concerns.
6. One-line caption under the diagram explaining the relationship between the PR and the highlighted node.
7. Link to a canonical reference (knowledge-hub or design doc) for the full walkthrough — don't try to fit everything in the PR description.

### Canonical source pattern

For projects with their own lifecycle page, treat the source-of-truth diagram as living in that page (e.g. knowledge-hub `/projects/<name>/lifecycle.md`). The PR description re-embeds the diagram and overlays the "★ THIS PR ★" marker. One canonical reference, per-PR markers.

Admin-flow diagrams are typically per-PR for now. If a project accumulates many control-plane surfaces with similar shapes, consider adding an admin-flows companion page to the canonical reference.

### Example

The Hexarad Mecha AI integration uses this pattern.
- See `knowledge-hub/docs/projects/mecha-ai/lifecycle.md` for the canonical lifecycle diagram.
- PR #124 (formatter, runtime) → lifecycle diagram with the event node highlighted.
- PR #112 (routing config, control plane) → admin flow diagram with the config row highlighted.

## Before Opening

- [ ] Rebase onto latest main
- [ ] Run the test suite locally
- [ ] Run the linter
- [ ] Self-review the diff — read it as if someone else wrote it
- [ ] Remove any debugging code, TODO comments that aren't tracked
- [ ] Check for accidental file inclusions (.env, credentials, large binaries)

## Merging

- Prefer squash merge for single-purpose PRs
- Prefer rebase merge for stacked PRs where commit history matters
- Delete the branch after merging
- Never merge your own PR without at least one approval (unless hotfixing)

## Hotfix Protocol

- Hotfixes still need a PR — but can be self-merged with a post-merge review
- Tag the PR as a hotfix
- Notify the team in the appropriate channel
- Follow up with a proper review within 24 hours
