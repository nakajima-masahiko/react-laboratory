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

### TypeScript and package boundary

The Lab consumes CandleCore's **built package**, not `vendor/candle-core/src/index.ts`.
Synchronization places a complete pinned checkout in `vendor/candle-core`; then
`scripts/build-candle-core.mjs` runs CandleCore's own `npm ci` and `npm run build`
and verifies that its root package export resolves to JavaScript plus declarations.
Only after that build succeeds, the script replaces the development manifest with
a consumer-only manifest containing the package identity, module format, root
JavaScript/declaration exports, and no development dependencies. The source and
lockfile stay in place, while a marker makes repeated `prebuild` execution verify
the already-prepared package instead of trying to install with the consumer manifest.
Only after that does React Laboratory type-check and bundle against the normal
`candle-core` package export. CandleCore therefore owns implementation checking,
while React Laboratory retains `erasableSyntaxOnly` for its own application code.

This post-build manifest mutation is intentionally smaller than maintaining a
second staged copy of the package. Root `npm ci` sees the lightweight consumer
contract, so CandleCore's Vitest, Rollup, jsdom, coverage, and TypeScript tooling
does not enter React Laboratory's lock boundary. CandleCore currently has no
external runtime dependencies; the preparation step fails explicitly if that
changes so the root lockfile can be reviewed and regenerated intentionally.

The source-level TS1294 failures were caused by non-erasable TypeScript parameter
properties in `CandleRenderer.ts`, `ExperimentalFullRangeLod.ts`, and
`CoarseOhlcExtremaPyramidPrototype.ts`. Rewriting those library internals would be
a consumer-specific workaround rather than a prerequisite of CandleCore's normal
compiled contract. Future CandleCore implementation syntax consequently cannot
become part of the Lab compiler unit by accident.

The private constructor flag still crosses exactly one boundary: the Lab adapter
normalizes an omitted public options argument to `{}` only in experimental mode,
then adds `__experimentalFullRangeLod: true`. Bounded mode passes the original
options unchanged and never adds the property. No stable CandleCore declaration
is augmented.

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
2. Confirm `npm run build:candle-core` succeeds with CandleCore's own configuration, prepares the consumer-only manifest, and is followed by React Laboratory's `npm ci` and `npm run build` against the built package export.
3. Open `/#/experiment/candle-core-lab`, run Scenarios H–L, reload the hash route directly, and repeat a bounded → experimental → bounded switch.
4. Record the CandleCore checkout SHA from the Pages workflow log alongside observations. The Lab repository cannot manufacture this revision when the private source/token is unavailable locally.

The deploy workflow accepts the repository variable `CANDLE_CORE_VALIDATION_REF`
as a commit SHA, verifies that the synchronized source contains the private
constructor flag, and publishes `candle-core-validation-build.json` beside the
application. That file records both deployed revisions, so a browser-validation
report can be tied to the exact inputs rather than a moving branch.

This is a **BUILT PACKAGE BOUNDARY** decision. It is preferable to disabling
`erasableSyntaxOnly` because it preserves the Lab's application policy and makes
CandleCore's compiler—not an unrelated consumer—responsible for accepting and
emitting CandleCore implementation syntax.

## Request 004 validation outcome (2026-08-11)

- **React Laboratory candidate:** `426cea6536ff0c853d15d5137fb245ff85d411b7`
  (the source revision inspected before adding this outcome/provenance note).
- **CandleCore revision:** unavailable. `CANDLE_CORE_READ_TOKEN` is not present
  in this execution environment, GitHub CLI has no authenticated session, and
  the private source is not included in `vendor/candle-core/src`.
- **Pages status:** not validated. Both GitHub API/Pages access from this
  environment returned HTTP 403, so no workflow could be dispatched or
  inspected and the deployed application could not be opened.
- **Scenarios H–L:** not executed. They require the synchronized private source
  and a real deployed browser; no local-only or fabricated result is substituted.
- **Bounded regressions and lifecycle/leaks:** not evaluated for the same reason.
- **Decision: BLOCKED.** Re-run the Pages workflow with
  `CANDLE_CORE_VALIDATION_REF` set to the reviewed CandleCore commit containing
  Requests 023–027 and the later browser-harness fixes. Confirm the two SHAs in
  the published provenance file, then execute and record Scenarios H–L before
  changing this decision.

This is an environment/access block, not evidence of a CandleCore integration
defect. The next task remains deployed browser validation; a stable-API audit
must only be assigned after that validation passes.

## Request 007 validation outcome (2026-08-11)

- **React Laboratory candidate:** `d13475cbf27de8ba74a6bc8d878c2b243530d469`
  (the checked-out revision on which this validation attempt was made).
- **CandleCore revision:** unavailable. The synchronized source is still absent,
  `CANDLE_CORE_READ_TOKEN` is unset, and GitHub CLI has no authenticated session.
  Consequently Request 027 and its browser-harness fixes could not be tied to an
  exact CandleCore SHA.
- **Workflow/deployment provenance:** unavailable. Anonymous access to both the
  GitHub API and the Pages host was rejected by the execution environment with
  HTTP 403, so no workflow run ID/URL, deployment result, or deployed
  `candle-core-validation-build.json` could be retrieved.
- **Built-package boundary:** static inspection still shows the intended workflow
  ordering (private checkout, CandleCore-owned `npm ci` and build, consumer
  manifest preparation, then root `npm ci` and build). A root `npm ci` completed
  from the lightweight lock boundary without pulling CandleCore devDependencies.
  End-to-end confirmation stopped at `prebuild`, where synchronization correctly
  refused to continue without the private token. The built JavaScript/declaration
  surface and the absence of the experimental flag from the synchronized public
  declarations therefore could not be reverified.
- **Deployed route and Scenarios H–L:** not executed. The actual Pages application
  was unreachable and no complete local CandleCore package was available. This
  includes the 100k comparison, 1M LOD run, Navigator synchronization, canonical
  Inspect check, series stress matrix, direct↔LOD visual checks, and screenshots.
- **Bounded regressions and lifecycle/leaks:** not evaluated. In particular, no
  claims are made about default semantics, mode-switch cleanup, duplicate
  handlers/canvases/timers, stale state, or memory behavior without a runnable
  real-browser build.
- **Local checks:** root `npm ci` passed; `npm run build` was blocked by the
  intentionally mandatory private synchronization step; repository lint also has
  pre-existing errors, including React ref-access diagnostics in the CandleCore
  Lab hook. Neither failure supplies browser evidence for or against Full Range
  LOD.
- **Decision: BLOCKED.** External private-repository authentication and Pages/API
  network access still prevent the required deployed validation. No product
  defect was found and no optimization or stable API change was made.

To unblock the next attempt, provide a readable CandleCore checkout/token and
authenticated GitHub/Pages access, pin `CANDLE_CORE_VALIDATION_REF` to the reviewed
CandleCore commit, dispatch and inspect the Pages workflow, verify both SHAs in
the deployed provenance JSON, and then execute H–L in that deployment. The next
task remains completion of deployed validation, not stable-API or high-density
series-policy design, until this block is removed.

## GitHub Actions browser validation (Request 008)

The earlier Request 004/007 `BLOCKED` entries above describe attempts from the
Codex host; they are retained as history, but private-repository and browser
validation is now designed to run inside GitHub Actions instead. Dispatch
**Full Range LOD browser validation** with either the exact 40-character
CandleCore SHA in `candle_core_ref`, or the repository variable
`CANDLE_CORE_VALIDATION_REF` set to that SHA. A branch name is rejected so a
moving revision cannot be reported as pinned evidence. The checkout continues
to use `CANDLE_CORE_READ_TOKEN`.

The workflow preserves the **BUILT PACKAGE BOUNDARY**: CandleCore is checked out
and runs its own locked install/build first; only then is its consumer manifest
prepared, React Laboratory runs `npm ci`, and the production application is
built. The workflow also fails if the built package exposes implementation
TypeScript, if the experimental constructor flag is missing from JavaScript, or
if that flag appears in public declarations. No stable CandleCore API is changed.

The focused Chromium suite automates deterministic parts of Scenarios H–L:

- H compares the bounded full-history request with exact experimental history,
  returns to bounded mode, and repeats recreation to expose stale canvas or
  console/lifecycle errors.
- I loads one million candles, exercises full history, scroll, zoom, derived
  direct/LOD density, and viewport resize without imposing an invented FPS gate.
- J exercises the existing canvas Navigator and verifies effective-range
  read-back remains available after drag and resize.
- K exercises Inspect at high and lower density and its return to Pan. Because
  the tooltip is rendered into CandleCore's canvas and no stable diagnostic API
  exposes its selected source identity, aggregate-vs-canonical identity remains
  an explicit human visual check rather than a fabricated DOM assertion.
- L switches through base, Trend, Momentum, all built-ins, and Bid/Ask while
  retaining interaction smoke checks. Volume has no independent Lab toggle, so
  the suite does not claim a separate Volume-only configuration or width-bounded
  complexity for any non-candle series.

Every run uploads one artifact containing representative screenshots, retained
Playwright traces/screenshots for failures, the HTML report, per-scenario JSON,
combined `results.json`, and `candle-core-validation-build.json`. The combined
result records both repository SHAs, workflow run provenance, dataset/mode,
effective range, approximate canonical count, plot width, density/derived LOD,
and available timing/FPS samples.

The deterministic result must be paired with a short human review of the saved
screenshots/traces (or the same pinned Pages build): pan/zoom smoothness,
direct↔LOD visual continuity, canonical Inspect tooltip identity, isolated spike
and endpoint-direction preservation, and series rendering artifacts. Passing
automation validates the experimental Lab integration only; it does not approve
stable API promotion. Until an authenticated run supplies its two SHAs and
artifacts, the infrastructure is implemented but no new Scenario H–L outcome is
claimed in this document.

## Local dependency constraint

`candle-core` is private and its complete package checkout is injected into
`vendor/candle-core` by CI or `npm run sync:candle-core`. The synchronized snapshot
must include Inspect, Navigator, visible-range APIs, and Request 027's experimental
constructor integration. In an environment without `CANDLE_CORE_READ_TOKEN`, a
clean checkout cannot build or run this experiment because the vendored source is
absent. Do not add a mock implementation to the repository; build and validate
against the synchronized package's own JavaScript and declaration output instead.
