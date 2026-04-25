---
name: review-react
description: Use when the user asks to review React/TSX code in this repo (e.g. "このコンポーネントをレビューして", "review my experiment", "このフックの問題ある？"). Checks against this project's conventions — strict TypeScript, hook rules, lazy-loaded registry pattern, theming via CSS variables, and Radix/Recharts usage.
---

# Review React code in this laboratory

When reviewing a React component or hook, walk the checklist below and report issues with file:line references. Be concrete — quote the offending snippet and propose the fix. Skip categories that don't apply rather than padding the report.

## Hooks correctness

- Rules of Hooks: only called at the top level, never inside conditions / loops / nested functions, and only from React functions or other hooks.
- `useEffect` / `useMemo` / `useCallback` / `useLayoutEffect` dependency arrays list every reactive value used inside, including props, state, and derived values.
- Cleanup: timers (`setTimeout`, `setInterval`), `addEventListener`, `ResizeObserver`, `IntersectionObserver`, `AbortController`, and subscriptions all return a cleanup from `useEffect`.
- No state updates after unmount (use `AbortController` for fetch, or a mounted ref for legacy async).
- Avoid stale closures — when a callback needs the latest value, `useRef` or a functional state update (`setX(prev => …)`) is preferred over reading from state directly.
- React 19: `use()` for promises/contexts inside Suspense boundaries is fine; classic `useContext` still works.

## TypeScript (strict mode is on)

- No `any`. Use `unknown` and narrow, or define a type. Generic constraints over assertions where possible.
- `import type` for type-only imports (`verbatimModuleSyntax` is enforced).
- No unused locals / parameters (`noUnusedLocals`, `noUnusedParameters` will fail the build). Prefix intentionally-unused params with `_` only when the signature is fixed by an external API.
- No TypeScript-only runtime constructs banned by `erasableSyntaxOnly` (no `enum`, no parameter properties in constructors, no namespaces with values).
- Prefer `as const` over wider literal widenings; avoid `as` casts that bypass real type errors.

## Project-specific patterns

- Each experiment has a default export and is registered in `src/experiments/registry.ts` via `lazy(() => import('./<id>'))`. Static imports of an experiment elsewhere defeat code splitting.
- Experiments don't import from sibling experiments. Shared code lives in `src/components/`.
- Routing uses `HashRouter` from `react-router-dom` v7. `<Link>` paths must be relative to the router root (e.g. `/experiments/<id>`), not absolute URLs.
- Styling uses plain CSS (no CSS Modules). Reference theme tokens (`--text`, `--text-h`, `--bg`, `--border`, `--accent`, `--accent-light`) instead of hard-coded hex codes so dark mode (`prefers-color-scheme`) keeps working.

## Component design

- Lift state only as far as it needs to go; co-locate when possible.
- Keys on lists are stable identifiers, not array indices, when the list reorders.
- Avoid creating new object/array/function identities inside render when they're passed to memoized children — wrap in `useMemo`/`useCallback` or move outside.
- Controlled vs. uncontrolled inputs: don't mix (e.g. don't toggle `value` between `undefined` and a string).
- Accessibility: interactive elements use real `<button>` / `<a>`, not `<div>` with onClick. Labels are associated with controls (`<label htmlFor>` or wrapping). Radix primitives (Dialog, Toast, ToggleGroup) ship a11y — don't override their roles.

## Library-specific gotchas (already documented in this repo)

- **Recharts `<Brush>` / `<XAxis>`:** see `docs/library-notes.md`. `tickFormatter`'s `index` is relative to the visible slice, not the full data array. Look up labels via `dataKey`-keyed map.
- **Recharts fixed-width `<Brush>`:** `getDerivedStateFromProps` only re-syncs on changed values, so you must compute a new `startIndex` on every change to keep the window width fixed.
- **Radix Dialog + Toast:** mount providers/portals at the experiment root, not at `App.tsx`, to keep experiments isolated.

## Output format

For each issue, produce:

```
<file>:<line> — <one-line problem>
  Why: <impact, e.g. "stale closure causes count to lag" or "fails strict TS build">
  Fix: <minimal change, code snippet if it clarifies>
```

End with a one-line verdict: ship-ready, minor changes needed, or needs rework.
