# Codex Request 003 — Integrate Experimental Full-Range LOD into CandleCore Lab

## Goal

Integrate CandleCore Request 027's **experimental exact full-range LOD** into the `react-laboratory` CandleCore Lab so it can be evaluated manually in a real browser and on GitHub Pages.

This is a downstream laboratory integration task. The purpose is not to redesign CandleCore or stabilize the API. The Lab should expose the already-merged experimental behavior in a controlled, clearly labeled way and make it easy to compare against the existing bounded-detail path.

CandleCore's current research result is:

- base-32 coarse OHLC pyramid;
- CSS pixel-column candle LOD at high density;
- activation when `visibleCount > 10 * plotCssWidth`;
- canonical candle identity retained for Crosshair / Inspect;
- experimental enablement through a non-stable laboratory-only constructor flag such as `__experimentalFullRangeLod: true`;
- no stable `ChartOptions`, `src/index.ts`, or public API exposure;
- default bounded-detail behavior unchanged;
- browser validation showed the architecture is viable enough for experimental integration.

The Lab must preserve that boundary: **this feature is experimental and must not be presented as a stable CandleCore API.**

## Required reading

Before editing, read and follow at least:

- `.codex/skills/performance-engineering/SKILL.md`
- repository AI/instruction files such as `docs/ai-rules.md`
- `requests/codex/001-expand-candle-core-lab.md`
- `requests/codex/002-integrate-inspect-and-navigator.md`
- `src/experiments/candle-core-lab/README.md`
- current CandleCore Lab implementation
- current vendor/sync mechanism for CandleCore

From the CandleCore source that is synchronized/vendorized into this repository, inspect the implementation and documentation corresponding to Requests 023–027, especially the experimental full-range integration.

Do not assume the private flag is part of the stable package contract merely because the Lab can access it.

## Core UX objective

The user should be able to open CandleCore Lab and perform an obvious side-by-side-in-time comparison:

```text
Bounded Detail (stable/default semantics)
        ↕ toggle / recreate experiment
Experimental Full Range LOD
```

Then load 100k or 1M candles and verify:

- whether the entire selected range is actually represented;
- Navigator selection behavior;
- Inspect/canonical candle behavior;
- pan/zoom/resize feel;
- volume/indicator impact;
- activation threshold / LOD status;
- overall responsiveness.

The Lab should make these differences understandable without requiring DevTools.

## A. Synchronize CandleCore correctly

Use the repository's established CandleCore synchronization/vendor workflow.

Do not manually patch generated/vendor files inconsistently.

Ensure the synchronized CandleCore revision includes Request 027's experimental integration and any browser-harness fixes merged afterward.

Record the synchronized CandleCore commit/revision if the existing Lab already exposes that metadata or if it can be added cheaply.

Do not modify CandleCore production algorithms from `react-laboratory`.

## B. Experimental mode control

Add a clearly labeled control such as:

- `Bounded Detail (stable/default)`
- `Experimental Full Range LOD`

or an equivalent switch/select.

The UI must visibly communicate that Full Range LOD is **experimental**.

Because the flag is constructor-only and intentionally non-stable, it is acceptable for changing this mode to recreate the CandleChart instance if that is required by CandleCore's architecture.

Do not pretend this can be toggled through `applyOptions()` if CandleCore does not support that.

When recreating the chart:

- preserve the current dataset when reasonable;
- preserve lightweight Lab settings where sensible;
- reapply Navigator / interaction / visible indicator settings;
- avoid duplicating the entire candle array in React state;
- destroy the prior chart cleanly;
- do not leak timers/subscriptions/canvas handlers.

If accessing the constructor flag requires a lab-local internal type cast or direct internal constructor import, isolate it in one small adapter and clearly document why it exists. **Do not alter CandleCore stable public typings merely to make the Lab compile.**

## C. Full-range verification controls

Add explicit operations that make the feature easy to verify.

At minimum provide:

- `Fit / show full history` for the experimental exact full-range path;
- existing first/middle/last range presets should continue to work;
- a way to restore normal/typical zoom;
- visible effective range start/end;
- source candle count;
- approximate visible canonical candle count if cheaply and reliably available;
- plot CSS width if useful;
- derived density such as candles per CSS pixel if available without expensive work.

Do not infer a requested range from React state when CandleCore can report an effective range. Keep `getVisibleRange()` as the source of truth for effective viewport reporting.

## D. Experimental LOD diagnostics in the Lab

Expose a small, clearly labeled **Experimental LOD diagnostics** area if the current internal integration provides enough information without widening CandleCore's stable API.

Useful values include, where available:

- experimental mode enabled/disabled;
- LOD currently active/inactive;
- canonical visible count;
- output/render bucket count;
- activation threshold or density;
- pyramid payload/build information if exposed internally;
- current plot width.

Do not add stable CandleCore API solely to surface these metrics.

If no safe internal accessor exists in the synchronized source, show only metrics the Lab can derive cheaply and document the limitation.

Do not poll high-cost diagnostics every animation frame. Reuse the Lab's existing throttled metrics cadence.

## E. Dataset scenarios

The Lab must make the following manual scenarios easy to run.

### Scenario H — 100k Full Range comparison

1. Load 100,000 candles.
2. Start in bounded/default mode.
3. Request/show full history and observe the effective range.
4. Switch to Experimental Full Range LOD.
5. Show the same full history.
6. Confirm the entire range is represented.
7. Compare pan/zoom responsiveness.
8. Confirm returning to bounded mode restores the stable behavior.

### Scenario I — 1M Full Range LOD

1. Load 1,000,000 candles.
2. Enable Experimental Full Range LOD.
3. Show full history.
4. Confirm the chart remains responsive.
5. Pan repeatedly in both directions.
6. Zoom in and back out to full-range density.
7. Resize the Lab/chart if the UI supports it.
8. Observe LOD active/inactive transition behavior.

### Scenario J — Navigator + Full Range

1. Load 100k or 1M candles.
2. Enable Navigator.
3. Enable Experimental Full Range LOD.
4. Expand Navigator selection to a very large/full range.
5. Confirm the main chart does not collapse back to the old bounded-detail effective range.
6. Drag the Navigator selection/window.
7. Confirm Navigator read-back and `getVisibleRange()` remain aligned.
8. Return to bounded mode and confirm the known bounded behavior remains intact.

### Scenario K — Inspect + Full Range

1. Enable Experimental Full Range LOD at a high-density range.
2. Switch interaction mode to Inspect.
3. Hover/press/drag across pixel-aggregated candles.
4. Confirm the tooltip/crosshair still resolves canonical source candles, not aggregate OHLC bucket identity.
5. Zoom in until direct rendering resumes and verify inspection remains consistent.

Do not implement a duplicate React crosshair/tooltip.

### Scenario L — Series stress matrix

Test at least these combinations on 100k and, where usable, 1M:

- candles only;
- candles + Volume;
- candles + one lightweight built-in indicator;
- candles + multiple built-in indicators already supported by the Lab;
- any existing bid/ask/custom-series scenario if the Lab already exposes it.

The purpose is to expose the known limitation from Request 027: candle rendering is width-bounded under LOD, but Volume/indicator/custom-series paths may remain more expensive.

Do not attempt to optimize those series in this request. Surface the behavior and record observations.

## F. Performance / React constraints

This remains a performance laboratory.

- Never store 100k/1M candle arrays in React state.
- Keep the existing candle dataset in refs/external storage.
- Do not materialize another 1M-element React representation for LOD.
- Do not rerender React on every pointer/crosshair event.
- Use the existing throttled metrics model.
- Keep dataset generation timing distinct from CandleCore `setData()` timing.
- If chart recreation is needed to switch experimental constructor mode, measure/report it separately from normal viewport operations.
- Do not accidentally include React UI rendering time in CandleCore benchmark metrics unless explicitly labeled.

## G. Bounded/default mode must remain a valid control

The Lab must preserve stable semantics as the baseline/control.

Do not silently enable experimental Full Range LOD by default unless there is a compelling laboratory-specific reason. Prefer defaulting to the stable bounded mode and making experimental enablement explicit.

When experimental mode is off:

- no experimental pyramid work should be initiated by the Lab itself;
- existing Navigator/Inspect/realtime/indicator scenarios must behave as before;
- existing GitHub Pages demo behavior must not regress.

## H. Human-evaluation UI

Add a concise manual-evaluation checklist in the Lab or its README.

The checklist should prompt the evaluator to look for:

- pan smoothness;
- zoom smoothness;
- visible jumps at direct ↔ LOD transition;
- isolated high/low spike preservation;
- readable overall trend at full history;
- Navigator synchronization;
- Inspect correctness;
- resize behavior;
- Volume/indicator impact;
- any obvious stale render or memory/leak behavior after repeated mode switching.

Do not overbuild a survey system. A documented checklist is sufficient.

## I. Optional lightweight observation logging

If the Lab already has a lightweight event/metrics log, it is acceptable to record mode transitions and basic timings such as:

- chart recreation duration;
- dataset reapply/setData duration;
- full-range operation duration;
- current density/LOD status.

Do not add analytics, persistence, or a large logging subsystem.

## J. GitHub Pages compatibility

This task must work in the actual GitHub Pages deployment path.

Validate:

- production Vite build;
- vendored CandleCore source resolution;
- constructor/internal adapter resolution after bundling;
- no dependence on Node-only modules in browser code;
- no private filesystem/runtime assumptions;
- hash-router path still loads CandleCore Lab.

If GitHub Pages cannot be exercised from the Codex environment, ensure the production build is clean and provide explicit manual verification steps for the user.

## K. Tests

Add focused tests using the repository's existing test infrastructure.

At minimum verify:

1. stable/bounded mode remains the default;
2. experimental mode passes the private constructor flag only when selected;
3. switching mode destroys/recreates the chart safely if recreation is required;
4. large candle data is not copied into React state;
5. Navigator/Inspect options are reapplied after experimental-mode recreation;
6. visible-range metrics still come from CandleCore effective state;
7. existing controls remain functional;
8. experimental adapter does not alter CandleCore stable public types;
9. build succeeds with the synchronized CandleCore source.

If browser/e2e infrastructure already exists, add a focused smoke test for:

- 100k experimental mode enablement;
- full-range operation;
- Navigator presence;
- Inspect mode switching.

Do not introduce a large new browser framework solely for this request.

## L. Documentation

Update `src/experiments/candle-core-lab/README.md` with:

- what Experimental Full Range LOD is;
- clear warning that it is not stable CandleCore API;
- how to enable it;
- bounded vs experimental semantics;
- Scenario H–L manual checks;
- known limitations for Volume/indicators/custom series;
- the fact that render aggregates remain non-canonical and Inspect should still resolve source candles;
- GitHub Pages manual verification instructions.

If useful, record which CandleCore research requests led to this state, but keep the Lab README focused on usage rather than reproducing all CandleCore performance-history documents.

## Non-goals

Do not in this request:

- stabilize or rename CandleCore's experimental option;
- modify CandleCore stable public API;
- redesign the base-32 pyramid;
- change the `10 * plotCssWidth` activation rule unless integration reveals a correctness bug;
- optimize Volume/indicator/custom series;
- add Worker/Wasm/GPU/OffscreenCanvas;
- add a duplicate React Navigator or tooltip;
- move canonical interaction identity to aggregate buckets;
- redesign the whole Lab UI;
- turn laboratory observations into a hard performance gate.

## Acceptance criteria

The task is complete when:

- the current CandleCore experimental Full Range LOD implementation is synchronized into `react-laboratory` using the intended vendor mechanism;
- CandleCore Lab clearly exposes stable bounded mode and experimental Full Range LOD mode;
- experimental mode is visibly labeled experimental;
- 100k and 1M datasets can be loaded without a React-side full-data copy;
- full-history display can be requested and observed in experimental mode;
- Navigator works with large/full experimental ranges;
- Inspect continues to resolve canonical candle information;
- direct ↔ LOD transition can be exercised manually;
- Volume/indicator combinations can be evaluated without pretending they are width-bounded;
- returning to bounded mode preserves stable/default semantics;
- repeated mode switching does not leak chart instances/listeners/timers;
- production build succeeds;
- GitHub Pages manual validation steps are documented.

## Required validation

Run at least:

```bash
npm ci
npm run build
```

Run the repository's relevant tests/lint/typecheck commands as available.

If an e2e/browser test already exists and can run in the environment, execute the focused CandleCore Lab smoke test.

Perform checks to confirm that no stable CandleCore public API/type files were modified simply to expose the experimental constructor flag.

## Final report

Report:

1. Summary
2. CandleCore revision synchronized
3. Experimental adapter / constructor wiring
4. Chart recreation/lifecycle behavior
5. New Lab controls and diagnostics
6. 100k/1M scenarios implemented
7. Navigator findings
8. Inspect/canonical interaction findings
9. Volume/indicator/custom-series observations
10. Default bounded-mode regression findings
11. Build/test/GitHub Pages validation
12. Known limitations
13. Human verification checklist
14. Decision: `LAB READY` / `REWORK`
15. Proposed next task
16. Commit SHA / PR metadata if available

If the Lab integration is successful, the next step should be human GitHub Pages evaluation followed by a **stable-API and series-support policy audit**, not immediate stabilization.