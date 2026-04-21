# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server
npm run build      # Type-check (tsc -b) then bundle
npm run lint       # ESLint across all TS/TSX files
npm run preview    # Preview the production build locally
```

There is no test suite — this repo uses manual browser testing.

## Architecture

This is a React experimentation laboratory deployed to GitHub Pages. Each "experiment" is an isolated, self-contained demo of a React pattern.

**Routing:** `HashRouter` (not `BrowserRouter`) is used because GitHub Pages serves from a subdirectory (`/react-laboratory/`) without server-side routing support.

**Lazy loading:** Every experiment component is loaded via `React.lazy()` and rendered inside `<Suspense>` in `ExperimentPage`. This keeps the initial bundle small as experiments accumulate.

**Registry pattern:** `src/experiments/registry.ts` is the single source of truth for all experiments. Adding an entry here automatically surfaces it on the home page — no routing or navigation changes needed.

## Adding a New Experiment

1. Create `src/experiments/<kebab-case-name>/index.tsx` with a default export component.
2. Add a CSS file alongside it if needed (plain CSS, not CSS Modules).
3. Register it in `src/experiments/registry.ts`:

```ts
{
  id: 'my-experiment',
  title: 'My Experiment',
  description: 'What this demonstrates',
  component: lazy(() => import('./my-experiment')),
}
```

Experiments must not import from other experiments. Shared utilities belong in `src/components/`.

## Conventions

- **TypeScript strictness:** `noUnusedLocals`, `noUnusedParameters`, and `erasableSyntaxOnly` are all enabled. Avoid `any`.
- **Styling:** Global CSS custom properties (`--text`, `--bg`, `--border`, `--accent`) are defined in `src/index.css` with dark mode via `prefers-color-scheme`. Experiment-local styles go in a sibling `styles.css`.
- **No CSS Modules** — plain CSS files scoped by class naming convention.
- **Functional components and hooks only** — no class components.

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) builds and deploys to GitHub Pages on every push to `main`. The Vite `base` is set to `/react-laboratory/`.

## ドキュメント化ルール

- 期待通りに動作しないなどの理由でライブラリ調査を行った場合は、同様の調査を後で繰り返して時間を浪費しないよう、調査内容を適切なドキュメントファイルに必ず記録してください。
