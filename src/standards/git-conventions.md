# Git Conventions

## Branch Naming

- Always prefix branch names with the issue tracker ID
- Format: `{ISSUE-ID}-short-description`
- Examples: `PROJ-225-fix-flaky-test`, `TEAM-123-add-user-notifications`
- Use kebab-case for the description portion
- Keep it concise — the branch name should hint at the change, not describe it fully

## Commit Messages

- Write in imperative mood: "Fix bug" not "Fixed bug" or "Fixes bug"
- First line is the subject — max 72 characters, no trailing period
- Leave a blank line between subject and body
- Body explains **why**, not **what** (the diff shows what)
- Reference the issue tracker ID in the branch, not the commit message (the branch link handles traceability)

### Good Examples

```
Fix nil date of birth crash on user profile page

The age_check and under_18? methods assumed date_of_birth was always
present. Some external data sources omit this field, causing a
NoMethodError on the profile page.
```

```
Add CI checks for conflict markers and orphaned migrations

Directly motivated by the broken merge incident where unresolved
conflict markers in structure.sql reached main and blocked all
test suites.
```

### Bad Examples

```
fix stuff          # Too vague
Updated the code   # Past tense, no context
WIP               # Don't commit WIP to shared branches
```

## Rebase, Never Merge

- Use `git rebase origin/main` to update feature branches
- Never create merge commits — they clutter history
- If you need to resolve conflicts, do it during rebase
- Force push to your own feature branch after rebase is fine
- Never force push to main/master

## Commit Hygiene

- Each commit should be a single logical change
- Don't mix refactoring with feature work in the same commit
- Don't commit commented-out code
- Don't commit debugging statements (puts, console.log, binding.pry)
- Squash fixup commits before merging when it makes the history cleaner

## Tags and Releases

- Use semantic versioning: MAJOR.MINOR.PATCH
- Tag releases on main only
- Annotated tags preferred: `git tag -a v1.2.0 -m "Release 1.2.0"`
