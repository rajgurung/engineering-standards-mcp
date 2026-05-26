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

### One canonical diagram, every PR

Use the **same diagram on every PR for the project**. One canonical source, one mental model for every reviewer. They learn the shape once, then on every PR just look for the gold marker.

This applies to both runtime per-record PRs (which change behaviour at a specific stage) and control-plane PRs (which configure something that lands at runtime later). For control-plane PRs, identify the lifecycle stage where the change first manifests and gold-highlight that node — then explain the connection in the caption.

Why not a bespoke diagram per change-type (lifecycle vs admin-flow)? Because reviewers should recognise the diagram instantly across the project. Different shapes per PR fragments the mental model. Source-of-truth single diagram beats accurate-but-bespoke diagrams.

### How to apply

1. Open the PR description with a `## Where this PR sits in the pipeline` heading.
2. Copy the canonical Mermaid diagram verbatim from the project's lifecycle page.
3. Identify where the PR's effect first manifests on the lifecycle:
   - Runtime PR (event emission, payload, callback handling) → the event node directly.
   - Control-plane PR (admin UI, config tables, kill switch, thresholds, routing) → the lifecycle stage where the configuration is read or stamped.
4. On that node, add `<br/><b>★ THIS PR ★</b>` to the label and a gold style: `style <NodeId> fill:#ffd700,stroke:#b8860b,stroke-width:3px,color:#000`.
5. Keep the rest of the diagram styling unchanged (e.g. failure paths in pink for consistency with the canonical).
6. Write a one-or-two line caption under the diagram. For runtime PRs this is direct ("this PR ships the X that emits this event"). For control-plane PRs name the control-plane change and the runtime stage where it manifests ("Adam configures Y in the admin UI; the effect lands at Z").
7. Link to the canonical lifecycle page for the full walkthrough.

### Canonical source pattern

Treat the source-of-truth diagram as living in a single project page (e.g. knowledge-hub `/projects/<name>/lifecycle.md`). It carries only the gold colour, no `★ THIS PR ★` label — kept clean as the canonical reference. The "★ THIS PR ★" label lives only in PR descriptions.

When a new PR opens, update the gold-highlight node in the canonical page to track the latest in-flight work. One line change.

### Example

The Hexarad Mecha AI integration uses this pattern.
- Canonical: `knowledge-hub/docs/projects/mecha-ai/lifecycle.md`.
- PR #124 (formatter integration, runtime) → gold on `formatter_completed`.
- PR #112 (routing config, control plane) → gold on `case_entered_pipeline`. Caption explains that Adam configures routing on a `case_policy_rule`, and the effect lands at `case_entered_pipeline` where the matched routing is stamped onto the outbox.

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
