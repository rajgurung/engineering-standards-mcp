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

### Canonical preserved, secondary subgraph when needed

Every PR opens with the **same canonical diagram** for the project — preserved verbatim for orientation. Reviewers recognise the shape instantly across PRs.

- **Runtime PR** (the change is at a specific lifecycle stage) — canonical only. Gold-highlight the touched stage with a `★ THIS PR ★` label.
- **Control-plane PR** (the change is configuration that lands at runtime later) — canonical preserved with no `★ THIS PR ★` marker, PLUS a side-by-side secondary subgraph showing what this PR actually changes. A dotted connector arrow links the secondary subgraph node to the lifecycle stage where the change manifests.

Both cases use a single `flowchart LR` block with subgraphs for layout. The control-plane case shows the canonical and the secondary side by side; the runtime case has only the canonical.

Why not a bespoke diagram for control-plane PRs? Tried it; fragments the mental model. Reviewers should see the canonical lifecycle on every PR and recognise it. Why not gold-highlight a lifecycle node for control-plane PRs? Tried it; misrepresents the change (the PR doesn't change that event, it changes what feeds into it). The canonical-plus-secondary pattern keeps both true.

### Template (control-plane PR)

```mermaid
flowchart LR
    subgraph lifecycle["The pipeline (canonical)"]
        direction TB
        ... canonical lifecycle nodes from the project's master diagram ...
    end

    subgraph control["What this PR changes"]
        direction TB
        ... the admin action / config row / control-plane change ...
    end

    SecondaryNode -. how the change connects .-> LifecycleNode

    style SecondaryNode fill:#ffd700,stroke:#b8860b,stroke-width:3px,color:#000
    style FailurePathA fill:#f8d7da,stroke:#721c24,color:#000
    style FailurePathB fill:#f8d7da,stroke:#721c24,color:#000
```

### How to apply

1. Open the PR description with `## Where this PR sits`.
2. Copy the canonical Mermaid diagram from the project's lifecycle page into a `flowchart LR` block, wrapped in a `subgraph` with `direction TB`.
3. Decide: runtime PR or control-plane PR.
4. **Runtime PR:** add gold to the touched event node with a `<br/><b>★ THIS PR ★</b>` label suffix. Stop.
5. **Control-plane PR:** add a second `subgraph control["What this PR changes"]` with `direction TB`. Model the actual change. Add gold to the row/action that ships, with a `<br/><b>★ THIS PR ★</b>` label suffix. Add a dotted connector arrow from the secondary node to the lifecycle stage where the change manifests, with a label describing the connection.
6. Keep failure-path styling on the canonical (e.g. pink on exclusion / failure nodes) for consistency.
7. Caption under the diagram: one or two lines explaining the connection between the PR and the lifecycle.
8. Link to the canonical lifecycle page for the full walkthrough.

### Canonical source pattern

Treat the source-of-truth diagram as living in a single project page (e.g. knowledge-hub `/projects/<name>/lifecycle.md`). It carries only the gold colour, no `★ THIS PR ★` label — kept clean as the canonical reference. The "★ THIS PR ★" label lives only in PR descriptions. The secondary subgraph is per-PR and not in the canonical page.

### Example

The Hexarad Mecha AI integration uses this pattern.
- Canonical: `knowledge-hub/docs/projects/mecha-ai/lifecycle.md`.
- PR #124 (formatter integration, runtime) → canonical only. Gold on `formatter_completed`.
- PR #112 (routing config, control plane) → canonical + secondary subgraph showing Adam → form → `case_policy_rule` with routing fields. Gold on the rule row. Dotted connector from the rule to `case_entered_pipeline` (where `CheckEligibility` reads the routing and the orchestrator stamps the outbox).

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
