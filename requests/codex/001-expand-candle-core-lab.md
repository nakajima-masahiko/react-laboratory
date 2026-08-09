# Codex Request 001 — Expand CandleCore Lab into a feature/performance verification console

## Goal

`src/experiments/candle-core-lab` を、単なる180本の描画サンプルから、CandleCore の **機能・大規模データ性能・realtime差分更新・hidden series skip・診断情報** をブラウザ上で確認できる実験コンソールへ拡張してください。

このリポジトリの `AGENTS.md` と `docs/ai-rules.md` を必ず先に読み、React architecture / theme / Playwright / chart rendering のルールに従ってください。

## Current state

現状の Lab は主に以下を確認できます。

- CandleChart mount / resize
- 180 candles の `setData()`
- SMA / EMA / Bollinger Bands / RSI / MACD / BidAsk の表示切替
- 1秒間隔の realtime tick
- FPS / spread / bar count

不足しているのは、最近の CandleCore Performance Architecture で改善した項目を実ブラウザ上で確認する機能です。

## Scope

変更対象の中心は `src/experiments/candle-core-lab/` としてください。必要なら小さな helper / hook / component を同experiment配下へ追加して構いません。

巨大な1コンポーネントにしないでください。以下の責務を必要に応じて分離してください。

- chart lifecycle
- synthetic data generation
- realtime tick driver
- load/performance measurement
- controls
- metrics panel

ただし過剰分割もしないでください。

## Required features

### 1. Dataset size selector

少なくとも以下を切り替えられるようにしてください。

- 180
- 10k
- 100k
- 500k
- 1M

データ生成は deterministic にできる seed を維持してください。

1M 選択時に React state へ巨大 Candle[] を複製し続けないでください。chart data は ref / local variable を中心に扱い、UI state には件数・時間などの小さい値だけを保持してください。

### 2. setData load measurement

`performance.now()` を使い、ユーザー操作による `setData()` の duration を測定して表示してください。

最低限表示:

- dataset size
- latest setData ms
- best / median 相当を無理にブラウザUIで集計する必要はないが、直近数回を扱うなら小さなrolling historyで可
- bars count

`setData()` 測定値と render complete を混同しないこと。UI上で `setData duration` と明示してください。

### 3. Realtime stress controls

現在の1 tick/secだけでなく、少なくとも次のモードを選べるようにしてください。

- Off
- 1 tick/sec
- 10 ticks/sec
- 60 ticks/sec
- Burst 1,000 ticks

ブラウザを固めないよう、60/secはintervalまたはrAFで安全に実行してください。Burstは同期1000回でUIを長時間blockしない設計を優先し、必要なら小さいchunkに分割してください。

UIには次を表示してください。

- ticks sent
- elapsed time for last burst
- effective ticks/sec
- FPS

### 4. Indicator visibility test

既存の各indicator toggleを維持してください。

加えて、以下のpresetを1クリックで切り替えられるようにしてください。

- Base only: all optional indicators / BidAsk hidden
- Trend: SMA + EMA + Bollinger
- Momentum: RSI + MACD
- All visible

目的は hidden series compute skip の効果をブラウザで比較しやすくすることです。

### 5. Feature operation panel

少なくとも以下をUIから操作できるようにしてください。

- Fit Content
- scroll left / right
- zoom in / out
- data reseed
- append one candle
- same-bucket tick update
- new-bucket tick update

CandleCore Public APIで利用可能な操作だけを使ってください。internal APIへ依存しないでください。

### 6. Diagnostics / RenderStats panel

Public APIで取得できる範囲で、以下を表示してください。

- FPS
- `getRenderStats()` の公開フィールド
- latest spread
- current candle count
- currently enabled indicators

internal-only `getPerformanceDiagnostics()` 等が公開されていない場合、無理に利用しないでください。ライブラリのPublic API安定性を尊重してください。

利用可能な `getRenderStats()` shape は実際にインストール/同期された candle-core の型を確認して実装してください。推測でフィールド名を追加しないでください。

### 7. Scenario buttons

実験用途として少なくとも以下のシナリオをワンクリック実行できるようにしてください。

#### Scenario A — 1M initial load

- indicators: Base only
- generate/load 1M candles
- fit content
- setData durationを記録

#### Scenario B — 100k all indicators

- 100k candles
- All visible
- setData durationを記録

#### Scenario C — realtime incremental stress

- 10k candles
- Trend または Momentum indicator を明示的に表示
- burst 1,000 ticks
- elapsed / effective ticks/secを記録

#### Scenario D — hidden series comparison

同じdatasetに対して

1. Base only
2. All visible

をユーザーが順番に実行し比較しやすいUIにしてください。自動benchmarkとして厳密な数値比較を実装する必要はありません。

## UX requirements

この画面はデモというより「Lab / verification console」です。

推奨構成:

```text
CandleCore Lab

[Scenario presets]

[Dataset] [Realtime] [Operations]
[Indicator presets / toggles]

[Performance metrics cards]
setData | FPS | ticks/sec | bars | spread

[Chart]

[Render stats / notes]
```

既存theme rulesを守ってください。`docs/ai-rules.md` に従い、新しいhard-coded colorsを増やさずsemantic CSS variables / existing tokensを優先してください。

## Performance requirements for the Lab itself

このexperiment自身がCandleCore性能測定を汚さないようにしてください。

- tickごとにReact stateを大量更新しない
- chart dataをReact stateへ保持しない
- metrics UI updateは100〜500ms程度にthrottleしてよい
- 1M data generation時に不要な複製を避ける
- chart instanceを毎操作recreateしない
- indicator toggleでReact全体を過剰rerenderしない

## Correctness / safety

- existing experiment URL / registry entryを壊さない
- existing CandleCore sync mechanism (`vendor/candle-core`, `npm run sync:candle-core`) を維持
- Public APIのみ使用
- ResizeObserver cleanup / timers / burst task cleanupを確実に行う
- unmount後にchart操作しない

## Tests

既存テスト構造を確認し、可能ならcandle-core-lab用のfocused testを追加してください。

最低限確認すること:

- project build
- TypeScript
- existing tests
- experimentがmount可能

Playwright infrastructureが適切なら、以下のうち安定して実装できるものだけ追加してください。

- dataset selectorが存在する
- indicator preset切替
- scenario A/B/C buttonsが存在する
- metrics labelsが表示される

1M loadの絶対時間をE2E assertionにしないでください。環境依存でflakyになります。

## Non-goals

- CandleCore本体の変更
- internal diagnostics APIのPublic化
- Wasm / Workerの追加
- 正式なbrowser benchmark suiteの構築
- React profilerの独自実装
- fancy animation

## Acceptance criteria

1. 180 / 10k / 100k / 500k / 1M をUIからloadできる。
2. `setData()` durationをブラウザ上で確認できる。
3. Off / 1 / 10 / 60 ticks/sec と burst 1,000を試せる。
4. Base / Trend / Momentum / All indicator presetを試せる。
5. FPS、bars、spread、Public RenderStats、burst throughputを確認できる。
6. Fit / scroll / zoom / append / same-bucket / new-bucket updateをUIから試せる。
7. Scenario A/B/C/Dにより代表的な性能・機能検証を短時間で再現できる。
8. 1M利用時もLab自身のReact rerenderがhot pathにならない。
9. candle-core Public APIにない内部機能へ依存しない。
10. build / typecheck / relevant testsが通る。

## Expected report

実装後、以下を報告してください。

- changed files
- UIに追加したcontrols / metrics / scenarios
- 1M dataのmemory/rerender対策
- CandleCore public APIs actually used
- tests executed and results
- browser manual verificationが未実施ならその旨
- 見つけたCandleCore側の制約や不足API（あれば。勝手に本体を変更しない）
