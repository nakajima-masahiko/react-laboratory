---
mode: agent
description: Add a new React experiment to this laboratory and register it in the experiments registry.
---

You are adding a new React experiment to this React Laboratory project. Follow the project's registry pattern exactly.

## Inputs

If the user has not already provided them, ask for:

1. **Experiment id** — kebab-case (e.g. `drag-and-drop-lab`). Used as folder name and URL segment.
2. **Title** — human-readable, can be Japanese.
3. **Description** — one-line summary of what the experiment demonstrates.
4. **What it should do** — the actual behavior or React/library pattern being explored.

## Steps

1. Create `src/experiments/<id>/index.tsx` with a function component, default-exported. Implement the requested behavior.
2. If styling is non-trivial, add `src/experiments/<id>/styles.css` (plain CSS, no CSS Modules) and import it from `index.tsx`. Use class names like `<id>__<element>` to avoid collisions, and reference the global theme variables `--text`, `--text-h`, `--bg`, `--border`, `--accent`, `--accent-light` instead of hard-coded colors.
3. Append an entry to the `experiments` array in `src/experiments/registry.ts`:
   ```ts
   {
     id: '<id>',
     title: '<title>',
     description: '<description>',
     component: lazy(() => import('./<id>')),
   },
   ```
4. Run `npm run build` and `npm run lint`. Fix any errors before reporting done.

## Constraints

- Strict TypeScript: no `any`, use `import type` for type-only imports, no unused locals/parameters, no `enum` or parameter properties.
- Functional components and hooks only.
- The new experiment must not import from any other experiment under `src/experiments/`. If you need shared code, put it in `src/components/`.
- Use libraries already in `package.json` (Radix UI, Recharts, d3-*) before adding a new dependency. If you do need a new package, mention it explicitly and wait for approval.
- Clean up timers, listeners, and subscriptions in `useEffect` returns.
- Routing is hash-based (`HashRouter`); `<Link>` paths are router-relative like `/experiments/<id>`.

## Done

Report:
- Files created or modified (with paths).
- The URL where the experiment will appear: `/#/experiments/<id>`.
- Confirmation that `npm run build` and `npm run lint` pass.
