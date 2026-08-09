# CandleCore Lab implementation notes

## Performance boundaries

- Synthetic generation and `CandleChart.setData()` are timed separately. `setData duration` is the synchronous API-call duration, not render completion.
- Candle arrays live in `useRef`, never React state. Only small counters and sampled diagnostics enter state.
- Realtime metrics are sampled every 300 ms, while ticks are sent directly to CandleCore.
- The 1,000-tick burst yields to the browser after each 50-tick chunk and is cancelled by an incrementing run id on unmount.

## Public API surface used

The console limits chart integration to `CandleChart` public methods: `setData`, `updateTick`, `applyOptions`, `fitContent`, `scrollBy`, `zoom`, `resize`, `getData`, `getFPS`, `getLatestSpread`, `getRenderStats`, and `destroy`.

`getRenderStats()` is represented through its inferred return type and rendered by enumerating the returned public object. The Lab intentionally does not name guessed diagnostic fields or call internal performance APIs.

## Local dependency constraint

`candle-core` is private and its source is injected into `vendor/candle-core/src` by CI or `npm run sync:candle-core`. In an environment without `CANDLE_CORE_READ_TOKEN`, a clean checkout cannot type-check or run this experiment because the vendored source is absent. Do not add a mock implementation to the repository; validate against the synchronized package types instead.
