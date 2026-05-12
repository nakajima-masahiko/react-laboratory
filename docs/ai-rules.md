# React Repository AI Operating Rules

This repository uses the following AI skills:

- react-architecture
- playwright-review
- theme-system

All code generation, refactoring, review, and testing must follow these rules.

---

# Core Principles

- Prefer long-term maintainability over short-term speed.
- Prefer consistency over cleverness.
- Avoid unnecessary abstraction.
- Preserve repository-wide architectural stability.
- Minimize rendering cost and unnecessary rerenders.
- Preserve Playwright test stability.
- Preserve theme consistency across all screens.

---

# React Architecture Rules

Always:

- Use feature-based folder structure.
- Keep components small and composable.
- Separate UI components from business logic.
- Prefer custom hooks for reusable stateful logic.
- Use memoization only when render cost is meaningful.
- Isolate expensive chart rendering.
- Preserve rendering boundaries.
- Prefer semantic naming.

Avoid:

- Massive screen components.
- Deep prop drilling.
- Global state without justification.
- Unnecessary useEffect usage.
- Duplicated API state logic.
- Premature abstraction.
- Over-fragmentation of hooks/components.

---

# Theme System Rules

This repository uses semantic theme tokens.

Always:

- Use CSS variables or theme tokens.
- Use semantic colors.
- Keep all themes behaviorally equivalent.
- Preserve dark/light/theme compatibility.
- Use theme-aware chart colors.
- Maintain visual consistency with Figma definitions.

Never:

- Hardcode colors.
- Hardcode spacing values repeatedly.
- Create theme-specific components.
- Introduce one-off visual styles.

Preferred examples:

Good:
```css
color: var(--color-primary);
```

Bad:
```css
color: #1976d2;
```

---

# Playwright Review Rules

Always:

- Prefer getByRole/getByTestId selectors.
- Preserve stable selectors.
- Write retry-safe assertions.
- Test responsive layouts.
- Test all supported themes.
- Keep E2E tests deterministic.
- Prefer explicit UI assertions.

Never:

- Use waitForTimeout unless unavoidable.
- Use fragile nth-child selectors.
- Depend on animation timing.
- Introduce flaky screenshot behavior.

Preferred examples:

Good:
```ts
await expect(page.getByRole('button')).toBeVisible();
```

Bad:
```ts
await page.waitForTimeout(3000);
```

---

# Chart Rendering Rules

This repository contains performance-sensitive chart rendering.

Always:

- Isolate chart rerendering.
- Prefer refs for transient mouse state.
- Avoid rerendering all panes simultaneously.
- Keep rendering logic deterministic.
- Preserve theme-aware chart coloring.

Avoid:

- Global mouse state updates.
- Frequent state-triggered rerenders.
- Recreating rendering objects unnecessarily.

---

# AI Review Priorities

When reviewing code, prioritize:

1. Architecture consistency
2. Theme consistency
3. Playwright stability
4. Rendering performance
5. Readability
6. Abstraction quality

Do not optimize prematurely.

---

# Repository Philosophy

This repository values:

- Structural clarity
- Information compression
- Quiet consistency
- Long-term maintainability
- Stable UI behavior
- Minimal accidental complexity

Changes should feel natural and integrated, not disruptive.
