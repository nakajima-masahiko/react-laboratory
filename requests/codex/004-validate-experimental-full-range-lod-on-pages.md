# Codex Request 004 — Validate Experimental Full-Range LOD on GitHub Pages

## Goal

Complete the integration validation that Request 003 could not finish because the Codex environment had no authenticated access to the private `candle-core` repository.

Request 003 already added the React Lab controls and lifecycle integration for CandleCore's laboratory-only `__experimentalFullRangeLod` constructor flag, but ended with **REWORK** pending synchronization to the exact CandleCore revision and real-browser/GitHub Pages verification.

This task is therefore primarily a **synchronization + production-build + deployed-browser validation task**. Do not redesign the feature unless validation exposes a concrete defect.

## Required reading

Read at least:

- `.codex/skills/performance-engineering/SKILL.md`
- repository AI rules / instructions
- `requests/codex/001-expand-candle-core-lab.md`
- `requests/codex/002-integrate-inspect-and-navigator.md`
- `requests/codex/003-integrate-experimental-full-range-lod.md`
- `src/experiments/candle-core-lab/README.md`
- current CandleCore sync/vendor scripts
- current GitHub Pages workflow/build configuration

On the CandleCore side, confirm the synchronized revision contains the work corresponding to Requests 023–027 and the later browser-harness correctness fixes (including Request 026-equivalent fixes).

## Workstream A — Synchronize exact CandleCore revision

Use the repository's intended authenticated synchronization mechanism.

Prefer the existing `CANDLE_CORE_READ_TOKEN`/CI mechanism or equivalent repository convention rather than manually copying individual files.

Record the exact CandleCore commit SHA used by the Lab validation.

The synchronized revision must contain, at minimum:

- base-32 coarse OHLC pyramid candidate;
- real-browser validated full-range LOD candidate;
- experimental CandleCore integration from Request 027;
- deterministic browser-harness fixes after Request 025/026.

Do not modify CandleCore production source from this repository.

If authentication is still unavailable in the Codex execution environment, do not fabricate a validation result. Instead ensure GitHub Actions / Pages can perform the authenticated sync using repository secrets and make that path reproducible.

## Workstream B — Production build compatibility

Run the same synchronization and build path used by GitHub Pages.

At minimum verify:

```bash
npm ci
npm run build
```

Confirm:

- TypeScript sees the experimental adapter without polluting stable CandleCore types;
- the private constructor flag remains isolated in the Lab-only adapter;
- bounded/default mode compiles without relying on the experimental flag;
- the vendor/sync result is deterministic;
- GitHub Pages base-path/module resolution works.

If the build fails due to stale vendored CandleCore state, fix the synchronization path rather than manually editing generated files inconsistently.

## Workstream C — Deploy / GitHub Pages verification

Validate the deployed CandleCore Lab on GitHub Pages, preferably using the existing Pages workflow.

Record the deployed React Laboratory commit SHA and synchronized CandleCore SHA.

Verify that the Lab route loads successfully and the existing non-LOD controls still function.

Do not declare success based only on a local dev server if Pages is the deployment target.

## Workstream D — Human/Browser scenarios H–L

Execute and document the Request 003 scenarios in a real browser.

### Scenario H — 100k Bounded vs Experimental

1. Load 100k candles.
2. Confirm default is **Bounded Detail (stable/default)**.
3. Record effective range / visible count / candles-per-CSS-pixel metrics.
4. Switch to **Experimental Full Range LOD**.
5. Confirm the chart is recreated cleanly.
6. Use **Fit / show full history**.
7. Confirm the full canonical history remains represented rather than collapsing to the bounded-detail viewport.
8. Switch back to bounded mode and confirm stable behavior returns.

### Scenario I — 1M Full Range LOD

1. Load 1,000,000 candles.
2. Enable Experimental Full Range LOD.
3. Show full history.
4. Pan, zoom in, zoom out, resize the browser.
5. Confirm the Lab remains responsive.
6. Confirm sampled metrics indicate high density / LOD activation as expected.
7. Confirm switching back to bounded mode remains functional.

### Scenario J — Navigator synchronization

1. Use 100k or 1M data.
2. Enable Navigator.
3. Enable Experimental Full Range LOD.
4. Show full history.
5. Move/resize Navigator selection.
6. Confirm Navigator and main-chart effective range stay synchronized.
7. Resize the browser and confirm canonical endpoints remain coherent.

### Scenario K — Canonical Inspect

1. Enable Experimental Full Range LOD at high density.
2. Switch interaction mode to Inspect.
3. Click/drag through the chart.
4. Confirm tooltip/crosshair refers to canonical source candle values, not an aggregate pixel bucket identity.
5. Confirm pinned inspection remains usable.
6. Switch back to Pan.

### Scenario L — Series stress matrix

Test at least:

- Base only;
- Trend indicators;
- Momentum indicators;
- All built-in indicators;
- Bid/Ask where supported.

For each, compare bounded vs experimental mode on a large dataset.

Do not claim that Volume/indicators/custom series are O(width) if CandleCore has not implemented that guarantee.

Record whether any series combination causes visible stalls, broken fitting, incorrect ranges, or rendering artifacts.

## Workstream E — Metrics / visual checks

Use the Lab's sampled metrics to capture at least:

- dataset size;
- mode;
- effective range;
- approximate canonical visible count;
- plot CSS width;
- candles per CSS pixel;
- derived LOD-active state;
- chart recreation time.

Where practical, capture screenshots for:

- bounded 100k full-range request;
- experimental 100k full-range;
- experimental 1M full-range;
- Navigator + experimental mode;
- Inspect + experimental mode.

Do not add a new React rendering loop solely for metrics or screenshots.

## Workstream F — Regression checks

Confirm Request 003 did not regress the existing Lab.

At minimum validate:

- dataset switching;
- realtime update/stress controls;
- indicator presets;
- Bid/Ask mode;
- Pan/Inspect switching;
- Navigator enable/disable;
- first/middle/last range presets;
- Fit/show-full-history operation;
- performance metrics refresh;
- chart destroy/recreate lifecycle.

Pay special attention to leaks or duplicate timers/ResizeObservers after repeated bounded↔experimental switching.

## Workstream G — Decision

End with one of:

- **LAB VALIDATION PASSED** — experimental full-range LOD is usable in React Laboratory / GitHub Pages and can proceed to stable-API/series-policy audit;
- **REWORK** — one or more concrete integration defects must be fixed before audit;
- **BLOCKED** — authenticated synchronization/deployment still cannot be performed.

Do not interpret `LAB VALIDATION PASSED` as permission to expose the feature through CandleCore stable API.

## Stable API boundary

Do not modify CandleCore stable public API in this request.

Do not add the experimental flag to normal `ChartOptions` typings in React Laboratory.

The Lab-only adapter should remain the only place aware of the constructor-only private flag.

## If validation passes

The next task should be assigned to an **audit/review role (Grok is suitable)** rather than immediately to implementation.

That audit should review:

- stable API naming and semantics;
- opt-in/default policy;
- lifecycle/build cost;
- Volume/indicator/custom-series support/fallback policy;
- Navigator/Inspect guarantees;
- documentation and migration risk;
- whether the feature is ready for experimental public API, stable API, or needs another integration phase.

Do not perform that stabilization in this request.

## Required documentation

Update the CandleCore Lab README with the actual validation outcome, including:

- React Laboratory commit SHA;
- synchronized CandleCore SHA;
- Pages validation status;
- scenarios H–L result summary;
- known limitations;
- decision.

If useful, add a compact validation note under `docs/` or the experiment directory, but avoid redundant documentation.

## Testing

Run and report at minimum:

```bash
npm ci
npm run build
```

Also run relevant existing tests/lint commands.

If GitHub Pages or CI performs the authenticated sync/build that local Codex cannot perform, report the workflow run URL/ID and result.

## Final report format

Return:

1. Summary
2. React Laboratory commit SHA
3. synchronized CandleCore SHA
4. synchronization/authentication result
5. production/Pages build result
6. Scenario H result
7. Scenario I result
8. Scenario J result
9. Scenario K result
10. Scenario L result
11. bounded-mode regressions
12. lifecycle/leak observations
13. known limitations
14. decision (`LAB VALIDATION PASSED` / `REWORK` / `BLOCKED`)
15. proposed next task
16. tests/workflow runs
17. commit SHA / PR metadata if available

The goal is to prove that the experimentally integrated full-range LOD works as a real React application on the actual deployment path before any stable API decision is made.