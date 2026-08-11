# CandleCore Lab implementation notes

## Performance boundaries

- Synthetic generation and `CandleChart.setData()` are timed separately. `setData duration` is the synchronous API-call duration, not render completion.
- Candle arrays live in `useRef`, never React state. Only small counters and sampled diagnostics enter state.
- Realtime metrics are sampled every 300 ms, while ticks are sent directly to CandleCore.
- FPS **min / avg** use a rolling window of 20 samples (~6 s at 300 ms interval). Dataset reloads reset the window.
- The effective visible range is read from `getVisibleRange()` in that same 300 ms sample. Pointer movement never causes a React update.
- The 1,000-tick burst yields to the browser after each 50-tick chunk and is cancelled by an incrementing run id on unmount.

## Dataset sizes and realtime rates

- Dataset sizes: **180 / 5k / 10k / 50k / 100k / 500k / 1M** (5k and 50k align with candle-core updateTick baseline scenarios).
- Continuous realtime rates: **1 / 10 / 60 / 120 / 200** ticks per second (plus Off).

## Public API surface used

The console limits chart integration to `CandleChart` public methods: `setData`, `updateTick`, `applyOptions`, `fitContent`, `scrollBy`, `zoom`, `resize`, `setVisibleRange`, `getVisibleRange`, `getData`, `getFPS`, `getLatestSpread`, `getRenderStats`, and `destroy`.

`getRenderStats()` is represented through its inferred return type and rendered by enumerating the returned public object. The Lab intentionally does not name guessed diagnostic fields or call internal performance APIs.

## Experimental Full Range LOD

**Experimental Full Range LOD is CandleCore research behavior, not a stable CandleCore API.** It uses the Request 027 base-32 coarse OHLC pyramid and CSS-pixel-column candle output when the canonical visible count exceeds `10 × plot CSS width`. The default **Bounded Detail (stable/default)** mode remains the control and does not opt into pyramid work.

The rendering-detail selector recreates `CandleChart`, because `__experimentalFullRangeLod` is a constructor-only research flag and cannot be changed with `applyOptions()`. The small `experimentalFullRangeAdapter.ts` cast is the only place that knows the private flag; it does not augment or edit CandleCore's stable public types. Recreation destroys the previous instance and its canvas handlers, then reapplies the same ref-held dataset, indicator visibility, interaction mode, and Navigator options. The UI reports recreation and `setData()` timings separately.

Use **Fit / show full history** to request the exact first-to-last timestamp range through `setVisibleRange()`. Use **Last 10% (typical zoom)** to return to normal density. Effective start/end are always sampled from `getVisibleRange()`. Approximate canonical count, plot CSS width, density, and LOD status are cheap Lab-derived diagnostics; bucket counts and pyramid payload/build details are not exposed because there is no safe stable accessor.

LOD OHLC render buckets are non-canonical. CandleCore Crosshair/Inspect is expected to retain source-candle identity, so the Lab deliberately does not create a React tooltip or expose aggregate identity.

## Inspect, Navigator, and visible ranges

- **Pan** preserves the normal drag-to-scroll behavior. **Inspect** applies `interaction.dragMode: 'inspect'` to the existing chart: press in the plot to pin the nearest candle, drag to inspect candle-by-candle, and release to retain the canvas crosshair and OHLCV tooltip. Press outside the plot to clear the pin. Switching modes never recreates the chart.
- The Lab enables CandleCore's Data View Navigator by default with a 72 px height and at most 1,600 overview points. The controls apply visibility, height, and overview-point changes to the existing chart. This Lab default deliberately differs from CandleCore's production default, where Navigator remains disabled.
- First, middle, and last 10% buttons resolve timestamps directly from the candle array held in `candlesRef` and call `setVisibleRange()`. The displayed start, end, and approximate bar count come from sampled `getVisibleRange()` results, not mirrored requested state.
- Navigator is CandleCore's own canvas UI. The Lab does not create a second overview, crosshair, or OHLC tooltip and does not materialize another full-size dataset for 1M-candle runs.

## Manual verification scenarios

This Lab is an integration and performance verification surface, not only a visual demo.

### Scenario E — 1M Navigator

1. Run **E · 1M Navigator** (Base-only indicators, one million candles, Navigator visible).
2. Select a narrow window with the Navigator handles and drag the window across history.
3. Confirm the main viewport and effective range metrics follow the Navigator.

### Scenario F — Inspect

1. Run **F · Inspect** to load 10k candles and select Inspect mode.
2. Press and drag through the plot; confirm the vertical line snaps candle-by-candle.
3. Release and confirm the OHLCV tooltip and labels remain pinned, then press outside the plot to clear them.
4. Select **Pan** and confirm drag scrolling works again.

### Scenario G — Range synchronization

1. Run **G · Range sync** to enable Navigator and apply the middle 10% range through `setVisibleRange()`.
2. Pan, zoom, and fit the main chart; confirm the Navigator selection and effective range metrics remain synchronized.
3. Toggle Navigator off and on repeatedly and confirm the viewport remains intact.

### Scenario H — 100k Full Range comparison

1. Run **H · 100k comparison** in bounded mode and select **Fit / show full history**; record the effective range.
2. Select **Experimental Full Range LOD**, show full history again, and confirm the first/last timestamps are represented.
3. Compare pan/zoom behavior and return to bounded mode to confirm stable semantics are restored.

### Scenario I — 1M Full Range LOD

1. Run **I · 1M Full Range LOD**, then **Fit / show full history**.
2. Pan in both directions, zoom into direct rendering, zoom back to full density, and resize the browser.
3. Observe FPS, density, derived LOD status, effective range, and any transition jump.

### Scenario J — Navigator + Full Range

1. Run **J · Navigator + Full Range**, show full history, and expand the Navigator selection.
2. Drag the selection and compare Navigator selection with effective `getVisibleRange()` read-back.
3. Toggle Navigator and return to bounded mode; verify each lifecycle remains intact.

### Scenario K — Inspect + Full Range

1. Run **K · Inspect + Full Range**, show full history, then press/drag across pixel-aggregated candles.
2. Confirm the canvas tooltip/crosshair resolves canonical candle timestamps and OHLCV rather than aggregate buckets.
3. Zoom in until derived LOD status becomes inactive and confirm inspection remains consistent.

### Scenario L — Series stress matrix

1. Run **L · Series matrix** at 100k; repeat at 1M where usable.
2. At full range compare **Base only**, **Trend**, **Momentum**, **All visible**, and the individual Bid/Ask toggle.
3. Record FPS and interaction feel. Candle LOD is width-bounded, but Volume/indicators/custom series may remain more expensive; this Lab does not claim or implement width-bounding for those paths.

## Human evaluation checklist

- Pan and zoom smoothness; direct ↔ LOD transition jumps.
- Preservation of isolated high/low spikes and readability of the full-history trend.
- Navigator selection/read-back synchronization and Inspect canonical-candle correctness.
- Resize behavior and Volume/indicator/Bid-Ask impact.
- Stale canvases, duplicate handlers, memory growth, or other leak symptoms after repeated mode switching.

## GitHub Pages verification

1. Confirm the Pages workflow checks out CandleCore containing Requests 023–027 (including Request 027 and later browser-harness fixes) into `vendor/candle-core`.
2. Confirm `npm run build` succeeds against that synchronized source with no stable CandleCore type edits.
3. Open `/#/experiment/candle-core-lab`, run Scenarios H–L, reload the hash route directly, and repeat a bounded → experimental → bounded switch.
4. Record the CandleCore checkout SHA from the Pages workflow log alongside observations. The Lab repository cannot manufacture this revision when the private source/token is unavailable locally.

## Local dependency constraint

`candle-core` is private and its source is injected into `vendor/candle-core/src` by CI or `npm run sync:candle-core`. The synchronized snapshot must include Inspect, Navigator, visible-range APIs, and Request 027's experimental constructor integration. In an environment without `CANDLE_CORE_READ_TOKEN`, a clean checkout cannot type-check or run this experiment because the vendored source is absent. Do not add a mock implementation to the repository; validate against the synchronized package types instead.
