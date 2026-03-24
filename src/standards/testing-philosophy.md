# Testing Philosophy

> For Rails-specific testing patterns, version-aware tooling, and implementation, delegate to the **rails-expert** agent:
> https://github.com/rajgurung/awesome-claude-code-subagents/blob/main/categories/02-language-specialists/rails-expert.md

## Core Principles

1. **Test behaviour, not implementation** — assert what the code does, not how it does it
2. **Prefer real objects over mocks** — build database-backed records with FactoryBot and call real service classes
3. **Only mock at system boundaries** — API wrappers, network calls, external services
4. **Tests are documentation** — a new team member should understand the feature by reading the specs

## What to Test

- Happy path — the main use case works
- Edge cases — nil values, empty collections, boundary conditions
- Error paths — what happens when things go wrong
- State transitions — if there's a state machine, test the transitions
- Access control — who can and can't do this

## What NOT to Test

- Framework behaviour (Rails validations, ActiveRecord associations, routing DSL)
- Private methods directly — test them through the public interface
- Exact error message strings (fragile, adds no value)
- Implementation order unless it matters to the user

## Test Types

### Model Specs

Test validations, scopes, associations, and business logic methods. Keep them fast — no HTTP, no full request cycle.

### Request Specs

Test API endpoints and non-UI controller behaviour — status codes, JSON responses, auth redirects. Every endpoint should have request specs.

### System Specs (Capybara)

Test critical user flows end-to-end through the browser. Reserve for flows where user interaction matters — form submissions, navigation, JavaScript behaviour. Don't over-use — they're slow.

### Service/Job Specs

Test service objects and background jobs directly. Verify side effects (emails sent, records created) and error handling.

## Test Structure

Follow the Arrange-Act-Assert pattern:

```ruby
describe "context" do
  it "does the expected thing" do
    # Arrange — set up the world
    user = create(:user, role: :admin)

    # Act — do the thing
    result = PromoteUser.new(user).call

    # Assert — verify the outcome
    expect(user.reload.role).to eq("superadmin")
  end
end
```

## Test Data

- Use **FactoryBot** for test data — define minimal factories, override only what the test cares about
- Prefer `build_stubbed` when persistence isn't needed (faster)
- Use `create` only when the test requires database state
- Avoid fixtures for complex data — factories are more readable and flexible
- Use `let` and `let!` intentionally — `let!` forces eager evaluation

```ruby
# Good — minimal factory, override what matters
let(:user) { create(:user) }
let(:admin) { create(:user, role: :admin) }

# Bad — overspecified factory that hides what the test cares about
let(:user) { create(:user, name: "John", email: "john@example.com", role: :member, plan: :free) }
```

## Flaky Tests

Flaky tests are bugs. Common causes:
- **Ordering assumptions** — DB doesn't guarantee order. Use `match_array` or `include` instead of `eq` for unordered collections
- **Time-dependent logic** — freeze time with `travel_to` or use relative assertions
- **Shared state** — ensure test isolation. Each test should set up its own world. Use `DatabaseCleaner` with a transaction strategy
- **Async operations** — use Capybara's built-in waiting/retry mechanisms, don't add `sleep`

When you find a flaky test, fix the root cause — don't just retry it.

## N+1 Query Detection

- Use `bullet: :raise` in describe blocks to catch N+1 queries at test time
- Fix N+1s with eager loading (`includes`, `preload`), not by ignoring Bullet warnings
- Use `prosopite` as an alternative for stricter detection

## Performance

- Run tests in parallel (`parallel_tests` gem) — CI should be fast
- Use `build_stubbed` over `create` where possible
- Keep system specs focused — don't duplicate what request specs already cover
- Use `before(:all)` sparingly and only for truly expensive shared setup

## Coverage

- Track coverage with **SimpleCov** — aim for meaningful coverage, not 100%
- Coverage is a tool for finding blind spots, not a target to game
- Uncovered code in a diff should be investigated, not ignored
- CI should report coverage but not fail on a threshold — use it as a signal

## CI Integration

- All specs must pass before merge — no exceptions
- Run `brakeman` and `bundle audit` alongside specs
- Use GitHub Actions or your CI of choice
- Cache `bundle install` and test database setup for speed
