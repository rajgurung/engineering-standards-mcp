# Code Review Standards

## Philosophy

Code review is a conversation, not an inspection. The goal is shared understanding and better code — not catching people out. Be humble, be curious, be specific.

## Giving Reviews

### Tone

- Frame suggestions as questions or options, not commands
- "Would it be worth..." / "Could we..." / "Might be missing something, but..."
- If you're unsure, say so — "Happy to be corrected if this is already handled"
- Never patronise — no "Nice work, but..." sandwich feedback
- Be direct without being blunt

### Structure

- Post inline comments on specific lines, never as a single top-level comment
- Batch comments into a pending review — don't spam individual notifications
- Lead with your overall assessment (LGTM, couple of thoughts, needs changes)
- Prioritise: separate blocking issues from suggestions from nits
- If approving with comments, make it clear which are blocking vs nice-to-have

### What to Look For

1. **Correctness** — Does it do what it claims? Edge cases?
2. **Clarity** — Can you understand it without the PR description?
3. **Safety** — SQL injection, XSS, race conditions, data loss risks
4. **Testing** — Are the important paths covered? Are tests testing behaviour, not implementation?
5. **Architecture** — Does it fit the existing patterns? If not, is the deviation justified?

### What NOT to Bikeshed

- Style issues that a linter should catch
- Naming preferences that are purely subjective
- Patterns that are already established in the codebase (even if you'd do it differently)

## Receiving Reviews

- Don't take feedback personally — the review is about the code
- If you disagree, explain your reasoning — "I went this way because..."
- If a comment is unclear, ask for clarification rather than guessing
- Address every comment — either fix it, discuss it, or acknowledge it
- Don't resolve conversations unilaterally if there's a disagreement

## PR Description

- Summary: 1-3 bullet points of what changed and why
- Context: link to the issue, any relevant background
- Test plan: how was this verified?
- Screenshots/recordings for UI changes
- Don't pad the description — concise > comprehensive
