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
