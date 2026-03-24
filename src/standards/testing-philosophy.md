# Testing Philosophy

## Core Principles

1. **Test behaviour, not implementation** — assert what the code does, not how it does it
2. **Prefer real objects over mocks** — build comprehensive database-backed records and call real service classes
3. **Only mock at system boundaries** — API wrappers, network calls, external services
4. **Tests are documentation** — a new team member should understand the feature by reading the specs

## What to Test

- Happy path — the main use case works
- Edge cases — nil values, empty collections, boundary conditions
- Error paths — what happens when things go wrong
- State transitions — if there's a state machine, test the transitions
- Access control — who can and can't do this

## What NOT to Test

- Framework behaviour (Rails validations, ActiveRecord associations)
- Private methods directly — test them through the public interface
- Exact error message strings (fragile, adds no value)
- Implementation order unless it matters to the user

## Test Structure

```
describe "context" do
  it "does the expected thing" do
    # Arrange — set up the world
    # Act — do the thing
    # Assert — verify the outcome
  end
end
```

## Flaky Tests

Flaky tests are bugs. Common causes:
- **Ordering assumptions** — DB doesn't guarantee order. Use `match_array` or `include` instead of `eq` for unordered collections
- **Time-dependent logic** — freeze time with `travel_to` or use relative assertions
- **Shared state** — ensure test isolation. Each test should set up its own world
- **Async operations** — use Capybara's built-in waiting/retry mechanisms, don't add `sleep`

When you find a flaky test, fix the root cause — don't just retry it.

## Feature Specs vs Request Specs

- **Feature specs** (Capybara) for anything UI-related — page content, user interactions, links
- **Request specs** for API endpoints and non-UI concerns (auth redirects, JSON responses)
- Don't use request specs to test page content — that's a feature spec

## N+1 Queries

- Use `bullet: :raise` in specs to catch N+1 queries at test time
- Add it to describe blocks for pages with preloaded queries
- Fix N+1s with eager loading (`includes`, `preload`), not by ignoring Bullet warnings
