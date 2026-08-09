# CandleCore Lab implementation notes

## Performance boundaries

- Synthetic generation and `CandleChart.setData()` are timed separately. `setData duration` is the synchronous API-call duration, not render completion.
- Candle arrays live in `useRef`, never React state. Only small counters and sampled diagnostics enter state.
- Realtime metrics are sampled every 300 ms, while ticks are sent directly to CandleCore.
- The effective visible range is read from `getVisibleRange()` in that same 300 ms sample. Pointer movement never causes a React update.
- The 1,000-tick burst yields to the browser after each 50-tick chunk and is cancelled by an incrementing run id on unmount.

## Public API surface used

The console limits chart integration to `CandleChart` public methods: `setData`, `updateTick`, `applyOptions`, `fitContent`, `scrollBy`, `zoom`, `resize`, `setVisibleRange`, `getVisibleRange`, `getData`, `getFPS`, `getLatestSpread`, `getRenderStats`, and `destroy`.

`getRenderStats()` is represented through its inferred return type and rendered by enumerating the returned public object. The Lab intentionally does not name guessed diagnostic fields or call internal performance APIs.

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

## Local dependency constraint

`candle-core` is private and its source is injected into `vendor/candle-core/src` by CI or `npm run sync:candle-core`. The synchronized snapshot must include Inspect drag mode, Navigator options, and visible-range APIs. In an environment without `CANDLE_CORE_READ_TOKEN`, a clean checkout cannot type-check or run this experiment because the vendored source is absent. Do not add a mock implementation to the repository; validate against the synchronized package types instead.
