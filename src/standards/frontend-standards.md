# Frontend Standards

> For framework-specific implementation, component architecture, and code generation, delegate to the **frontend-developer** agent:
> https://github.com/rajgurung/awesome-claude-code-subagents/blob/main/categories/01-core-development/frontend-developer.md

## TypeScript

- Strict mode enabled — no `any`, no implicit nulls
- Define interfaces for all component props and API responses
- Use path aliases for imports (`@/components`, `@/lib`)
- Prefer `unknown` over `any` when the type is genuinely unknown

## Component Design

- One component per file — name the file after the component
- Keep components small and focused on one responsibility
- Extract shared logic into custom hooks (React) or composables (Vue)
- Co-locate tests, styles, and stories with the component
- Props down, events up — avoid prop drilling with composition or context

## Accessibility

- Semantic HTML first — don't `div` everything
- All interactive elements must be keyboard-accessible
- Images need meaningful `alt` text (or `alt=""` for decorative)
- Form inputs need associated labels
- Use ARIA attributes only when semantic HTML isn't enough
- Test with a screen reader on critical flows

## State Management

- Start with local component state — lift only when needed
- Use the framework's built-in state (React context, Vue provide/inject) before reaching for libraries
- Keep server state and UI state separate
- Avoid duplicating server data in client state — use query caching (TanStack Query, SWR)

## Styling

- Pick one approach per project and stick with it (CSS Modules, Tailwind, styled-components)
- Use design tokens for colours, spacing, and typography — no magic numbers
- Mobile-first responsive design
- Avoid inline styles except for truly dynamic values

## Performance

- Lazy load routes and heavy components
- Optimise images (WebP/AVIF, proper sizing, lazy loading)
- Avoid unnecessary re-renders — memoize expensive computations
- Use virtualisation for long lists
- Monitor bundle size — set budgets and alert on regressions
- Target Core Web Vitals: LCP < 2.5s, INP < 200ms, CLS < 0.1

## Testing

- Unit tests for utility functions and hooks/composables
- Component tests for rendering and interaction behaviour
- Integration tests for critical user flows
- Test accessibility with automated tools (axe-core) and manual checks
- Aim for > 85% coverage on business logic, don't game the number
- Use Testing Library — test what users see, not implementation details

## API Integration

- Centralise API calls — don't scatter `fetch` across components
- Handle loading, error, and empty states for every data fetch
- Use optimistic updates for better perceived performance
- Type all API responses — never trust the shape blindly

## Build and CI

- Lint (ESLint) and format (Prettier) on every commit
- Type-check in CI — `tsc --noEmit`
- Run tests in CI before merge
- Track bundle size in CI — fail on unexpected growth
- Use environment variables for config — never hardcode URLs or keys

## Security

- Sanitise any user-generated content before rendering
- Never use `dangerouslySetInnerHTML` (React) or `v-html` (Vue) with unsanitised input
- Use Content Security Policy headers
- Store tokens in httpOnly cookies, not localStorage
- Validate and escape all user input at system boundaries
