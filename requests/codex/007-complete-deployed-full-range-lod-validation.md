# Codex Request 007 — Complete Deployed Full-Range LOD Validation

## Goal

Complete the real-browser / GitHub Pages validation of CandleCore's experimental Full Range LOD after Requests 005–006 repaired the TypeScript/package/lockfile boundary and the authenticated Pages build path became viable.

This request closes the validation loop started by Requests 003–004.

Do **not** redesign CandleCore, stabilize the experimental API, or optimize Volume/indicators in this task. The purpose is to prove or disprove that the already-integrated experimental mode is usable in the actual deployed React Laboratory environment.

## Background

The current sequence is:

- Request 003 integrated `__experimentalFullRangeLod` into CandleCore Lab through a Lab-only adapter.
- Request 004 attempted deployed validation but ended **BLOCKED** because the execution environment lacked authenticated CandleCore access / Pages access.
- Request 005 established a built-package boundary so React Laboratory no longer compiles CandleCore implementation TypeScript directly.
- Request 006 repaired the local `file:` dependency / lockfile boundary so CandleCore can build with its own toolchain and React Laboratory can consume a lightweight built package deterministically.
- The Pages workflow can now proceed through the package boundary and deployment path.

Therefore the remaining work is **validation**, not another integration implementation.

## Required reading

Read at least:

- `.codex/skills/performance-engineering/SKILL.md`
- repository AI/instruction files
- `requests/codex/003-integrate-experimental-full-range-lod.md`
- `requests/codex/004-validate-experimental-full-range-lod-on-pages.md`
- `requests/codex/005-fix-candle-core-lab-typescript-build-boundary.md`
- `requests/codex/006-fix-local-file-dependency-lock-boundary.md`
- `src/experiments/candle-core-lab/README.md`
- `src/experiments/candle-core-lab/experimentalFullRangeAdapter.ts`
- `scripts/sync-candle-core.mjs`
- `scripts/build-candle-core.mjs`
- `.github/workflows/deploy.yml`

On the synchronized CandleCore side, confirm the revision contains Request 027 experimental integration and the associated full-range LOD browser-harness fixes.

## Scope rule

This is a validation-first task.

Allowed code changes are limited to:

- fixing a concrete defect that prevents the already-designed Lab scenarios from running;
- adding small deterministic browser assertions or lightweight validation capture needed to prove a scenario;
- correcting stale validation documentation/provenance.

If validation exposes a larger CandleCore or series-policy problem, do not redesign it here. Record one concrete blocker and end with `REWORK`.

## A. Resolve exact deployed provenance

Use the actual GitHub Pages / Actions path.

Record:

- React Laboratory commit SHA;
- synchronized CandleCore commit SHA;
- workflow run ID / URL if available;
- deployment result;
- `candle-core-validation-build.json` contents or equivalent provenance proof.

Use `CANDLE_CORE_VALIDATION_REF` if the workflow supports pinning the reviewed CandleCore revision.

Do not validate against an unknown moving CandleCore revision.

## B. Confirm production package boundary

Before browser scenarios, confirm the Request 005–006 architecture still holds:

1. CandleCore is synchronized as a pinned private checkout.
2. CandleCore runs its own `npm ci` using its original manifest/lockfile.
3. CandleCore builds using its own compiler/toolchain.
4. A consumer-only built package surface is prepared afterward.
5. React Laboratory root `npm ci` succeeds against that consumer package.
6. React Laboratory consumes built JavaScript/declarations, not CandleCore implementation `.ts`.
7. CandleCore devDependencies do not leak into the React Laboratory lock boundary.
8. `__experimentalFullRangeLod` remains isolated to the Lab adapter and is absent from stable CandleCore public types.

If this boundary has regressed, stop browser conclusions and report `REWORK` with the exact regression.

## C. Deployed route smoke test

Validate the deployed route:

`/#/experiment/candle-core-lab`

Confirm:

- direct navigation / reload works;
- the chart initializes;
- Bounded Detail is the default;
- Experimental Full Range LOD can be selected;
- Navigator and Inspect controls are present;
- 100k and 1M dataset presets are available;
- no fatal console/runtime error occurs during initial use.

## D. Scenario H — 100k Bounded vs Experimental

Execute in the deployed browser:

1. Load 100,000 candles.
2. Confirm **Bounded Detail (stable/default)** is active.
3. Use **Fit / show full history**.
4. Record effective visible range and density metrics.
5. Switch to **Experimental Full Range LOD**.
6. Confirm chart recreation completes cleanly.
7. Use **Fit / show full history** again.
8. Confirm the first and last canonical timestamps remain represented rather than collapsing to bounded-detail semantics.
9. Pan and zoom.
10. Switch back to bounded mode and confirm stable semantics return.

Record PASS/FAIL plus any visible artifact.

## E. Scenario I — 1M Full Range LOD

1. Load 1,000,000 candles.
2. Enable Experimental Full Range LOD.
3. Show full history.
4. Confirm the application remains interactive.
5. Pan repeatedly left/right.
6. Zoom into lower density until direct rendering resumes where applicable.
7. Zoom back out into LOD density.
8. Resize the browser/chart.
9. Observe FPS / density / derived LOD-active state / effective range.
10. Repeat bounded → experimental → bounded once to exercise lifecycle cleanup.

Do not invent a hard FPS pass threshold in this request. This is observation-driven validation unless an existing documented threshold applies.

## F. Scenario J — Navigator synchronization

Using 100k and at least one 1M run:

1. Enable Navigator.
2. Enable Experimental Full Range LOD.
3. Show full history.
4. Expand/move/resize Navigator selection.
5. Confirm main-chart effective range and Navigator selection remain coherent.
6. Confirm a long selection does not collapse merely because of bounded-detail minimum bar width.
7. Resize the browser and repeat one Navigator move.
8. Return to bounded mode and confirm normal bounded behavior is restored.

Record any feedback loop, range jump, stale selection, or endpoint mismatch.

## G. Scenario K — Canonical Inspect

At high-density experimental full range:

1. Enable Inspect.
2. Press/click and drag across the plot.
3. Verify tooltip/crosshair continues to resolve canonical source candle timestamp/OHLCV.
4. Confirm no aggregate LOD bucket identity is surfaced as a candle.
5. Pin/release inspection if supported.
6. Zoom in until LOD becomes inactive and confirm Inspect remains coherent.
7. Return to Pan and verify interaction mode still works.

If exact aggregate-vs-canonical identity cannot be proven from the visible UI alone, use the narrowest existing browser assertion or diagnostics available. Do not add a new public CandleCore API.

## H. Scenario L — Series stress matrix

Run at 100k and, where usable, 1M:

- Base/candles only;
- Volume if separately controllable;
- Trend indicators;
- Momentum indicators;
- All built-in indicators;
- Bid/Ask or existing custom/advanced series scenario if already exposed.

For each relevant combination observe:

- chart responsiveness;
- pan/zoom behavior;
- Navigator behavior;
- price/volume fitting correctness;
- visible stalls;
- rendering artifacts;
- whether the mode remains usable.

Important: candle LOD being O(plot width) does **not** imply Volume/indicator/custom-series work is O(plot width). Do not report whole-chart width-bounded complexity unless evidence proves it.

Do not optimize these series in Request 007.

## I. Direct ↔ LOD transition and visual correctness

During Scenarios H–L explicitly check:

- visible jumps at activation/deactivation threshold;
- isolated high/low spike preservation;
- first-open / last-close direction consistency at full range;
- stale frame after rapid pan/zoom;
- time-axis/grid sanity;
- resize stability.

Where practical, capture browser screenshots or existing test artifacts for representative states, especially:

- 100k bounded full-history request;
- 100k experimental full range;
- 1M experimental full range;
- Navigator + experimental;
- Inspect + experimental.

Do not add a screenshot subsystem if the existing browser tooling can already capture them.

## J. Lifecycle / leak observation

Repeat mode switching and dataset changes sufficiently to catch obvious lifecycle regressions.

Observe for:

- duplicate canvases;
- duplicate pointer handlers;
- duplicate timers;
- stale Navigator state;
- repeated ResizeObservers/listeners;
- progressive UI slowdown;
- obvious memory growth if the existing environment exposes it cheaply.

Do not build a new memory profiler in this request.

## K. Existing regression checks

Confirm the current Lab still supports:

- dataset switching;
- realtime update/stress controls;
- indicator presets;
- Bid/Ask controls where available;
- Pan / Inspect switching;
- Navigator enable/disable;
- first/middle/last range presets;
- Fit/show-full-history;
- sampled diagnostics/FPS display;
- chart destroy/recreate lifecycle.

Bounded/default mode remains the control and must not silently opt into experimental pyramid work.

## L. Automated/browser validation

Use existing infrastructure where possible.

Run at minimum:

```bash
npm ci
npm run build
```

Also run the repository's relevant test/lint/typecheck commands.

If Playwright or another existing browser harness can exercise the deployed or production-built Lab, add/run only focused assertions needed to make H–L repeatable.

Do not introduce a new large browser framework.

## M. Documentation update

Update `src/experiments/candle-core-lab/README.md` so the previous Request 004 `BLOCKED` outcome no longer remains the latest state if validation succeeds.

Record:

- exact React Laboratory SHA;
- exact CandleCore SHA;
- workflow/deployment provenance;
- Scenario H result;
- Scenario I result;
- Scenario J result;
- Scenario K result;
- Scenario L result;
- known limitations;
- lifecycle/regression observations;
- final decision.

Keep historical context if useful, but clearly distinguish the old blocked attempt from the new completed validation.

## Stable API boundary

Do not in this request:

- add `__experimentalFullRangeLod` to CandleCore stable `ChartOptions`;
- change CandleCore stable exports/types;
- make experimental mode the default;
- redesign the base-32 pyramid;
- change the activation threshold merely for performance preference;
- implement Volume/indicator/custom-series LOD;
- add Worker/Wasm/GPU/OffscreenCanvas;
- treat successful Lab validation as automatic stable-API approval.

## Decision

End with exactly one primary decision:

- **LAB VALIDATION PASSED** — deployed H–L validation passed sufficiently to move to a separate stable-API / series-support policy audit;
- **REWORK** — a concrete product/integration defect prevents acceptance; identify the dominant blocker;
- **BLOCKED** — external authentication/deployment access still prevents actual validation.

`LAB VALIDATION PASSED` means only that the private experimental integration is validated for further design review. It does not authorize stable API promotion.

## Acceptance criteria

Request 007 is complete when:

1. exact React Laboratory and CandleCore revisions are recorded;
2. production/Pages build succeeds through the built-package boundary;
3. deployed CandleCore Lab route is exercised in a real browser;
4. Scenario H is executed and recorded;
5. Scenario I is executed and recorded;
6. Scenario J is executed and recorded;
7. Scenario K is executed and recorded;
8. Scenario L is executed and recorded;
9. bounded/default behavior is regression-checked;
10. repeated lifecycle switching is observed for obvious leaks/stale state;
11. no stable CandleCore API/type widening is introduced;
12. README validation status is updated from the previous BLOCKED state;
13. the final decision is evidence-based.

## Final report

Return:

1. Summary
2. React Laboratory SHA
3. CandleCore SHA
4. workflow / deployed provenance
5. built-package-boundary verification
6. production build result
7. deployed route smoke result
8. Scenario H result
9. Scenario I result
10. Scenario J result
11. Scenario K result
12. Scenario L result
13. direct↔LOD / visual findings
14. lifecycle/leak observations
15. bounded-mode regression findings
16. known limitations
17. decision (`LAB VALIDATION PASSED` / `REWORK` / `BLOCKED`)
18. proposed next task
19. tests / workflow runs
20. commit SHA / PR metadata if available

If validation passes, the next task should be a **design/audit request for stable API and high-density series policy**, not immediate stabilization or further optimization.