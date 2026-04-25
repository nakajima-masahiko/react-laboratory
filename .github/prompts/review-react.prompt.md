---
mode: ask
description: Review React/TSX code in this repository against the project's conventions.
---

Review the React / TypeScript code I point you at (or, if I don't specify, the diff on the current branch under `src/`). Walk the checklist below and produce concrete, actionable findings — quote the offending snippet, give the file:line, and propose the fix. Skip categories that don't apply rather than padding the report.

## Hooks

- Rules of Hooks respected (top-level only, no conditional/looped calls).
- Effect / memo / callback dependency arrays include every reactive value used inside.
- Cleanup returned from `useEffect` for timers, listeners, observers, `AbortController`s, subscriptions.
- No stale-closure bugs — uses functional `setState` or refs when reading the latest value matters.

## TypeScript strictness

- No `any`; uses `unknown` + narrowing or precise types.
- `import type` for type-only imports (`verbatimModuleSyntax`).
- No unused locals / parameters (`noUnusedLocals`, `noUnusedParameters`).
- No `enum`, parameter properties, or value-bearing namespaces (`erasableSyntaxOnly`).
- No `as` casts hiding real type errors.

## Project conventions

- Experiments are default-exported from `src/experiments/<id>/index.tsx` and registered in `src/experiments/registry.ts` via `lazy(() => import('./<id>'))`. Static imports of experiments break code splitting.
- No cross-experiment imports — shared code goes in `src/components/`.
- `<Link>` uses router-relative paths (`/experiments/<id>`); the app uses `HashRouter`.
- Theme colors come from CSS variables (`--text`, `--text-h`, `--bg`, `--border`, `--accent`, `--accent-light`) so dark mode works.

## Component design

- State is co-located when possible, lifted only when necessary.
- List `key`s are stable identifiers, not array indices when the list reorders.
- New object / array / function identities aren't recreated each render when passed to memoized children.
- Inputs are consistently controlled or uncontrolled, never both.
- Interactive elements are real `<button>` / `<a>`; form controls have associated labels.

## Library gotchas already documented

- Recharts `<XAxis tickFormatter>` `index` is relative to the visible slice, not absolute — see `docs/library-notes.md`.
- Recharts `<Brush>` width must be re-derived on every `onChange` to stay fixed — see `docs/library-notes.md`.

## Output format

For each issue:

```
<file>:<line> — <one-line problem>
  Why: <impact>
  Fix: <minimal change, snippet if it clarifies>
```

End with a single-line verdict: ship-ready / minor changes / needs rework.
