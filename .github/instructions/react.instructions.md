---
applyTo: "src/**/*.{ts,tsx}"
---

# React + TypeScript guidelines for this repository

This is a React 19 + TypeScript 6 experimentation laboratory built with Vite, deployed to GitHub Pages. Follow these conventions when generating or editing TypeScript / TSX in `src/`.

## Components and hooks

- Functional components only. No class components.
- Default-export the entry component of each experiment from `src/experiments/<id>/index.tsx`.
- Obey the Rules of Hooks: only call hooks at the top level of a function component or another hook.
- Always include every reactive value used inside an effect / memo / callback in its dependency array. Don't suppress `react-hooks/exhaustive-deps`.
- Clean up timers, event listeners, observers, subscriptions, and `AbortController`s in the `useEffect` return.
- Prefer functional state updates (`setX(prev => …)`) when the next state depends on the previous one to avoid stale closures.

## TypeScript (strict mode)

`tsconfig.app.json` enables `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`, `verbatimModuleSyntax`, and `noFallthroughCasesInSwitch`. Generated code must:

- Use `import type { ... }` for type-only imports.
- Avoid `any` — use `unknown` and narrow, or define a precise type.
- Avoid `enum`, parameter properties, and namespaces with runtime values (banned by `erasableSyntaxOnly`).
- Not leave unused locals or parameters. Use `_` prefix only when an external API fixes the signature.
- Prefer literal types and `as const` over `as` widening casts.

## Project-specific patterns

- **Registry pattern:** Every experiment is registered in `src/experiments/registry.ts` via `lazy(() => import('./<id>'))`. Never import an experiment statically from outside its folder — it breaks code splitting.
- **Experiment isolation:** Files under `src/experiments/<a>/` must not import from `src/experiments/<b>/`. Shared utilities and components live in `src/components/`.
- **Routing:** This app uses `HashRouter` from `react-router-dom` v7 because GitHub Pages serves from `/react-laboratory/` without server-side routing. `<Link>` targets are router-relative (e.g. `/experiments/counter`), not absolute URLs.
- **Styling:** Plain CSS files (sibling `styles.css` per experiment). No CSS Modules. Use the global CSS variables from `src/index.css` — `--text`, `--text-h`, `--bg`, `--border`, `--accent`, `--accent-light` — instead of hard-coded colors so `prefers-color-scheme: dark` keeps working.
- **Libraries already in `package.json`:** Radix UI (Dialog, Toast, Progress, ToggleGroup, Checkbox), Recharts, d3-array / d3-format / d3-scale / d3-time / d3-time-format. Reach for these before adding a new dependency.

## Accessibility

- Interactive elements are real `<button>` / `<a>` — not `<div onClick>`.
- Form controls have associated `<label>`s (`htmlFor` or wrapping).
- Don't override roles on Radix primitives — they ship the correct a11y semantics.

## Commands the assistant can run

- `npm run dev` — Vite dev server at `http://localhost:5173/react-laboratory/`.
- `npm run build` — `tsc -b` then Vite production build (this is the type-check gate).
- `npm run lint` — ESLint over all `.ts` / `.tsx`.

There is no automated test suite; this repo relies on manual browser testing.

## Documentation rule

When you investigate a library because something didn't work as expected, record what you learned in `docs/library-notes.md` (or a sibling `recharts.md` / similar file in the experiment folder) so future sessions don't redo the investigation.
