---
name: add-experiment
description: Use when the user asks to add a new React experiment to this laboratory (e.g. "新しい実験を追加して", "Add an experiment for X", "Xを試す実験を作って"). Creates the experiment folder, default-export component, optional sibling styles, and registers the entry in src/experiments/registry.ts so it surfaces on the home page.
---

# Add a new React experiment

This repo is a React 19 + TypeScript laboratory where each experiment lives as a self-contained module under `src/experiments/`. The registry in `src/experiments/registry.ts` is the single source of truth — adding an entry there is what makes the experiment appear on the home page and become routable at `/#/experiments/<id>`.

## Steps

1. **Pick a kebab-case id** (e.g. `drag-and-drop-lab`). The id must be unique within the registry and is used as the folder name and the URL segment.
2. **Create `src/experiments/<id>/index.tsx`** with a default-exported function component.
3. **(Optional) Add `styles.css`** in the same folder when styling is non-trivial. Plain CSS only — CSS Modules are not used. Scope styles by class naming convention (e.g. `.drag-and-drop-lab__handle`).
4. **Register the experiment** in `src/experiments/registry.ts` by appending an entry to the `experiments` array:

   ```ts
   {
     id: '<id>',
     title: '<Human-readable title>',
     description: '<1-line summary, can be Japanese>',
     component: lazy(() => import('./<id>')),
   },
   ```

5. **Verify** with `npm run build` (runs `tsc -b` then Vite build) and `npm run lint`. If the user asks for visual confirmation, also start `npm run dev` and open `http://localhost:5173/react-laboratory/#/experiments/<id>`.

## Project conventions to honor

- **TypeScript strictness:** `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`, `verbatimModuleSyntax` are all enabled. Use `import type` for type-only imports. Avoid `any`.
- **Functional components and hooks only.** No class components.
- **Lazy loading is automatic** — never import an experiment statically anywhere; always go through the registry's `lazy()` call.
- **Experiments must not import from each other.** If two experiments need shared code, lift it to `src/components/`.
- **Theming:** prefer the global CSS variables `--text`, `--text-h`, `--bg`, `--border`, `--accent`, `--accent-light` (defined in `src/index.css`) over hard-coded colors so dark mode keeps working.
- **Side effects stay scoped** to the experiment component — clean up timers, listeners, and subscriptions in `useEffect` returns so they don't leak when the user navigates away.
- **Library investigations** must be recorded in `docs/library-notes.md` (or a sibling `recharts.md` / similar in the experiment folder) per the project's documentation rule.

## Minimal template

```tsx
// src/experiments/<id>/index.tsx
function MyExperiment() {
  return (
    <section>
      <h2>My Experiment</h2>
      <p>What this demonstrates.</p>
    </section>
  );
}

export default MyExperiment;
```

## Pitfalls

- Forgetting to add the registry entry → experiment exists but is invisible.
- Using `BrowserRouter`-style absolute paths in `<Link>` — routes are hash-based, always use react-router `<Link to="/experiments/<id>">`.
- Importing `react-router-dom` from `react-router` (or vice versa) — this project uses `react-router-dom` v7.
- Adding new dependencies without checking — prefer the libraries already in `package.json` (Radix UI, Recharts, d3-*) before introducing a new one.
