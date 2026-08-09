# Codex Request 002 — Integrate Inspect mode and Data View Navigator into CandleCore Lab

## Goal

Update the `react-laboratory` CandleCore Lab so the newly added CandleCore features can be verified interactively in a real browser / GitHub Pages deployment:

1. `interaction.dragMode: 'inspect'` pinned crosshair inspection.
2. `navigator.visible` Data View Navigator.
3. Stable visible-range API behavior (`setVisibleRange()` / `getVisibleRange()`) as it relates to Navigator and viewport operations.

This is a lab/integration change. Do not modify CandleCore itself in this repository unless the vendoring/sync mechanism requires updating the vendored source to the latest CandleCore main.

## Repository rules

Before editing, read and follow:

- `.codex/skills/performance-engineering/SKILL.md`
- `docs/ai-rules.md` and any more specific rules in the repository
- `src/experiments/candle-core-lab/README.md`
- `requests/codex/001-expand-candle-core-lab.md`

Preserve the lab's existing performance-testing role. The Lab UI must not become the bottleneck during large-dataset or high-frequency realtime scenarios.

## Current structure

Relevant files currently include:

- `src/experiments/candle-core-lab/index.tsx`
- `src/experiments/candle-core-lab/useCandleCoreLab.ts`
- `src/experiments/candle-core-lab/LabControls.tsx`
- `src/experiments/candle-core-lab/MetricsPanel.tsx`
- `src/experiments/candle-core-lab/config.ts`
- `src/experiments/candle-core-lab/styles.css`
- `src/experiments/candle-core-lab/README.md`

The Lab already supports datasets from small sizes through 1M candles, realtime stress, indicator visibility, pan/zoom/fit, and performance metrics.

## Required behavior

### A. Inspect mode controls

Add an explicit interaction-mode control to the Lab UI.

Minimum modes:

- `Pan` — existing default behavior (`interaction.dragMode: 'pan'`).
- `Inspect` — `interaction.dragMode: 'inspect'`.

Use CandleCore `applyOptions()` to switch the mode on the existing chart instance. Do not recreate the chart solely to switch interaction mode.

The UI should make the active mode obvious, using accessible state (`aria-pressed`, selected `<select>`, or equivalent).

Provide short inline guidance for Inspect mode, for example:

- press inside the plot area to pin the nearest candle;
- drag to move candle-by-candle;
- release to keep the inspection pinned;
- click/press outside the plot area to clear the pinned inspection.

Do not implement a second React tooltip. The CandleCore canvas tooltip/crosshair must remain the source of truth.

### B. Navigator controls

Add a Navigator control section with at least:

- visible on/off;
- height selection or numeric input with sensible bounds;
- optional `maxOverviewPoints` selection/input if it can be exposed without clutter.

Recommended defaults for the Lab:

```ts
navigator: {
  visible: true,
  height: 72,
  maxOverviewPoints: 1600,
}
```

However, preserve CandleCore's production default semantics: the library itself defaults Navigator to disabled. The Lab is allowed to enable it by default because it is a feature-verification environment.

Changing Navigator options must use `chart.applyOptions({ navigator: ... })` on the existing instance. Verify enable/disable lifecycle repeatedly without chart recreation.

### C. Visible range verification

Expose the chart's current effective visible range in the Lab so Navigator / pan / zoom / fit changes can be verified numerically.

Show at least:

- effective range start time;
- effective range end time;
- optionally duration or approximate visible candle count if cheaply available.

Use `chart.getVisibleRange()` rather than mirroring requested state in React.

Refresh this display at a throttled cadence or in response to relevant chart events. Do not call expensive APIs every animation frame.

Add one or more operations that use `chart.setVisibleRange()` directly. For example:

- `Show first 10%`;
- `Show middle 10%`;
- `Show last 10%`.

Use the existing candle data held outside React state (`candlesRef`) to resolve timestamps. Do not duplicate 100k–1M candle arrays into React state.

### D. Browser-verification scenarios

Add clear manual scenarios, either as buttons in the existing scenario area or documented steps, for at least the following:

#### Scenario E — 1M Navigator

1. Load 1,000,000 candles.
2. Base-only indicators are acceptable for clarity/performance.
3. Navigator visible.
4. Select a narrow window using Navigator handles.
5. Drag the selected window across history.
6. Confirm the main chart and displayed effective range track the Navigator.

#### Scenario F — Inspect

1. Load 10k or 100k candles.
2. Switch to Inspect mode.
3. Press/drag through candles.
4. Confirm the vertical line snaps candle-by-candle.
5. Confirm OHLCV tooltip and labels remain visible after mouseup.
6. Clear the pinned inspection via the documented action.
7. Switch back to Pan and verify drag scroll still works.

#### Scenario G — Range synchronization

1. Enable Navigator.
2. Set a visible range using a Lab preset button.
3. Pan/zoom/fit the main chart.
4. Confirm Navigator selection and effective-range metrics stay synchronized.
5. Toggle Navigator off/on and confirm it returns without corrupting viewport state.

### E. Performance / React constraints

This is essential.

- Do not store the full candle dataset in React state.
- Do not update React state on every mousemove/drag event.
- Do not subscribe to high-frequency crosshair events and render React components per pointer move unless strongly throttled; preferably avoid doing so entirely because CandleCore already renders the inspection UI.
- Metrics UI refresh should remain throttled (existing ~300 ms cadence is acceptable).
- Enabling Navigator on a 1M dataset must not cause the Lab to materialize an additional 1M-item representation.
- Do not recreate `CandleChart` on routine mode/option changes.
- Preserve existing dataset generation timing and `setData()` timing boundaries; do not mix Lab UI work into those metrics.

### F. Vendor / build compatibility

The repository has a CandleCore sync/vendor mechanism used during build. Ensure the vendored CandleCore source/types contain the newly merged APIs required by the Lab:

- `interaction.dragMode: 'pan' | 'inspect'`
- `navigator` options
- `setVisibleRange()`
- `getVisibleRange()`

If the vendored snapshot is stale, update it using the repository's intended sync workflow rather than manually editing generated/vendor files inconsistently.

The GitHub Pages production build must compile with the same path/module resolution used by CI.

## Suggested implementation shape

Prefer keeping chart orchestration in `useCandleCoreLab.ts` and presentation in `LabControls.tsx` / `MetricsPanel.tsx`.

Possible hook additions:

```ts
type InteractionMode = 'pan' | 'inspect';

setInteractionMode(mode)
setNavigatorVisible(visible)
setNavigatorHeight(height)
setNavigatorMaxOverviewPoints(value)
showRangePreset('first' | 'middle' | 'last')
```

The exact names may differ if a cleaner existing pattern is available.

Keep lightweight control state in React (`interactionMode`, navigator options). Keep large candle data in refs as today.

For effective visible range, it is acceptable to add it to the existing throttled `metrics` snapshot.

## Tests

Add/adjust tests where the repository currently has test infrastructure. At minimum verify:

1. Lab compiles against the current CandleCore public types.
2. Switching Pan → Inspect → Pan uses `applyOptions()` semantics without recreating the chart.
3. Navigator visible/hidden option changes are wired to CandleCore.
4. Effective range comes from `getVisibleRange()`.
5. Range preset operations call `setVisibleRange()` with timestamps from the current dataset and handle empty/short datasets safely.
6. Existing realtime, indicator, dataset and operation controls continue to work.

If browser/e2e infrastructure exists, add a focused smoke test for Navigator existence and mode switching. Do not introduce a large new test framework solely for this request.

## Documentation

Update `src/experiments/candle-core-lab/README.md` with:

- Inspect mode usage;
- Navigator usage;
- visible range controls/metrics;
- the new manual scenarios;
- explicit note that this Lab is intended as an integration/performance verification surface, not just a visual demo.

## Non-goals

Do not:

- modify CandleCore algorithms in this request;
- implement touch or keyboard interaction that CandleCore v1 does not provide;
- create a duplicate React Navigator;
- create a duplicate React OHLC tooltip;
- store 1M data points in React state;
- add Worker/Wasm/GPU code;
- redesign the entire Lab UI;
- change existing performance scenarios unless necessary to integrate these controls.

## Acceptance criteria

The request is complete when all of the following are true:

- GitHub Pages build succeeds.
- CandleCore Lab visibly shows a Data View Navigator when enabled.
- Navigator can be toggled off/on repeatedly.
- Navigator handles/window can change the main chart visible range.
- Pan/zoom/fit update Navigator selection.
- The Lab displays `getVisibleRange()` effective start/end values.
- The Lab can invoke at least first/middle/last range presets via `setVisibleRange()`.
- Inspect mode can be selected from the Lab UI.
- Inspect press/drag pins and moves the CandleCore crosshair/tooltip; mouseup retains it.
- Returning to Pan restores normal drag scrolling.
- A 1M dataset remains usable without a second full dataset copy in React state.
- Existing dataset/realtime/indicator/performance controls are not regressed.

## Required validation

Run at least:

```bash
npm ci
npm run build
```

Also run the repository's existing test/lint commands that are relevant and reasonably available. If there is a GitHub Pages-specific build/deploy validation command, run it or explain why it cannot be run locally.

Perform a diff check for unintended vendor/public API changes.

## Final report

Report:

1. files changed;
2. how Inspect mode is wired;
3. how Navigator options/lifecycle are wired;
4. how effective visible range is displayed;
5. new manual scenarios;
6. whether the vendored CandleCore snapshot needed synchronization;
7. build/test results;
8. any limitations observed in real-browser/GitHub Pages behavior;
9. commit SHA and PR metadata if available.
