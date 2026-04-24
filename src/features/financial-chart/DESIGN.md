# FinancialChart 設計仕様書

## 目的

金融データ (OHLC) を可視化する Canvas ベースのチャートコンポーネントを提供する。ローソク足とラインの2種のチャートタイプを切り替えられ、テーマ (色) を外部から完全に注入でき、親要素のリサイズ・DPR 変更に追従する。SVG や React の仮想 DOM を介さないピクセル描画とすることで、大量データ (数百〜数千本のローソク) でも軽量に表示することを目的とする。

将来の拡張 (クロスヘア、Tooltip、ズーム、スクロール、指標追加) を容易にするため、「React = ref と再描画制御のみ」「描画ロジック = 純粋関数 (renderer)」「スケール計算 = utility」の3層に分離する。

## 前提構成

- React 19 + TypeScript (strict: `noUnusedLocals` / `noUnusedParameters` / `erasableSyntaxOnly`)
- ビルド: Vite、デプロイ先: Tomcat (SPA 配信)
- Canvas 2D コンテキスト (`CanvasRenderingContext2D`) で全描画
- d3 (`d3-scale` / `d3-time-format` / `d3-format`) は以下のみ使用
  - `scaleTime` / `scaleLinear`
  - `ticks()`
  - 時刻・数値フォーマッタ
- **d3 による DOM 描画は禁止**
- CSS Modules 不使用 (リポジトリ方針)

## コンポーネント概要

```tsx
<FinancialChart
  data={data}           // CandleData[]
  chartType="candlestick" // "candlestick" | "line"
  theme={theme}         // ChartTheme
  height={400}          // 任意。既定 400
  tooltip={{            // 任意。Tooltip 表示仕様
    labels: {
      date: '日付',
      open: '始値',
      high: '高値',
      low: '安値',
      close: '終値',
    },
    dateFormat: '%Y/%m/%d %H:%M',
  }}
/>
```

Props:

| 名前        | 型                 | 必須 | 既定値 | 説明                               |
| ----------- | ------------------ | ---- | ------ | ---------------------------------- |
| `data`      | `CandleData[]`     | Yes  | -      | 時系列 OHLC。空配列可              |
| `chartType` | `ChartType`        | Yes  | -      | `"candlestick"` / `"line"`         |
| `theme`     | `ChartTheme`       | Yes  | -      | 描画色一式                         |
| `height`    | `number`           | No   | `400`  | CSS px 単位の描画高さ              |
| `tooltip`   | `TooltipOptions`   | No   | 下記参照 | マウス位置に追従する OHLC Tooltip 設定 (縦点線ガイド付き) |

幅は常に親要素の `clientWidth` に追従する (props では受け取らない)。

`tooltip` は JSON オブジェクトで受け取る。未指定時は以下が既定値:

- `labels.date = "日付"`
- `labels.open = "始値"`
- `labels.high = "高値"`
- `labels.low = "安値"`
- `labels.close = "終値"`
- `dateFormat = "%Y/%m/%d %H:%M"`

## 責務分割

```
src/features/financial-chart/
├─ components/
│  └─ FinancialChart.tsx       # React コンポーネント (ref, size, useEffect による再描画)
├─ hooks/
│  └─ useResizeObserver.ts     # 親要素サイズ購読
├─ renderers/                  # 純関数 / Canvas 副作用
│  ├─ drawBackground.ts
│  ├─ drawGrid.ts
│  ├─ drawAxis.ts
│  ├─ drawCandlesticks.ts
│  ├─ drawLine.ts
│  ├─ drawLatestPriceLine.ts
│  └─ drawLatestPriceLabel.ts
├─ utils/
│  ├─ createScales.ts          # d3-scale / candleWidth 計算
│  ├─ getPriceRange.ts         # min/max + padding
│  └─ formatters.ts            # d3-format / d3-time-format
├─ types.ts                    # 外部公開型 + 内部型
└─ index.ts                    # 公開 API (FinancialChart, 型)
```

| 層          | 責務                                                                                        | 禁則                     |
| ----------- | ------------------------------------------------------------------------------------------- | ------------------------ |
| コンポーネント | canvas ref・親サイズ購読・DPR 適用・描画関数の呼び出し順制御                               | 描画ロジックを直接書かない |
| renderer    | `ctx`, `plot`, `scale`, `theme` を受け取って Canvas に描画するだけ                         | React API や `theme` の固定色を参照しない |
| utils       | スケール生成、価格レンジ算出、フォーマット                                                 | Canvas に触らない        |
| types       | 外部公開される型とレイアウト定数                                                           | ロジックを持たない       |

## データフロー

```
props(data, chartType, theme, height)
   │
   ▼
FinancialChart
   ├─ useResizeObserver() ──► width
   ├─ useMemo: plot(margin, width, height)
   └─ useEffect([data, chartType, theme, width, height, plot])
         │
         ├─ canvas.width  = width  * dpr     (内部ピクセル)
         ├─ canvas.height = height * dpr
         ├─ canvas.style  = width/height     (CSS サイズ)
         ├─ ctx.setTransform(dpr,0,0,dpr,0,0)
         │
         ├─ createScales(data, chartType, plot)
         │    ├─ scaleTime(x)
         │    └─ scaleLinear(y) ← getPriceRange() で min/max + 5% padding
         │
         ├─ xScale.ticks(6), yScale.ticks(6)
         │
         └─ 描画関数を順に呼ぶ (下記「描画フロー」)
```

すべて state を持たず、props と DOM サイズを直接 `useEffect` に流し込む純粋な片方向フロー。

## 描画フロー

`useEffect` 内で以下の順序で実行する。

1. `ctx.clearRect` — 前回描画をクリア
2. `drawBackground` — `theme.background` で全面塗り
3. `drawGrid` — 縦横グリッド (xTicks / yTicks で作った線) を `plot` にクリップして描画
4. チャート本体
   - `candlestick` → `drawCandlesticks` (ヒゲ → 実体)
   - `line`        → `drawLine`
5. `drawAxis` — X 軸 (下) / Y 軸 (右) とラベル
6. `drawLatestPriceLine` — 最新 close の水平点線 (`setLineDash([4,4])`)
7. `drawLatestPriceLabel` — Y 軸上に角丸ラベル。軸ラベルより後に描くことで前面表示

ラベルだけは `plot` の右側に描画するため clip せず、それ以外は `plot` にクリップしてはみ出しを防ぐ。

## スケール設計

### X 軸

- `d3.scaleTime()`
- domain: `[times[0], times[times.length - 1]]`
- range: `[plot.left, plot.right]`
- データ 0 件 / 1 件も例外にならないようフォールバック domain を用意
- ticks は `xScale.ticks(6)` で生成
- 目盛りラベルは左→右の順に「初出の年月日」を段階表示する
  - 年が初出: `2026年5月2日`
  - 同年で月が初出: `6月1日`
  - 同年同月: `3日`

### Y 軸

- `d3.scaleLinear()`
- domain: `getPriceRange(data, chartType)` が返す `[min, max]`
  - `candlestick` → `low`/`high` の全体
  - `line`        → `close` の全体
  - 上下 5% のパディング
  - 空データ時は `[0, 1]`
- range: `[plot.bottom, plot.top]` (Canvas は Y が下向きなので反転)
- ticks は `yScale.ticks(6)`、フォーマッタは `format(',.2f')`

### ローソク幅

`computeCandleWidth(times, xScale)` で隣接点の X ピクセル距離の最小値を求め、その 70% を候補とする。最小 1px 保証。これによりデータ間隔が非一定でも衝突しない幅を自動決定できる。

## テーマ設計

`ChartTheme` は 11 個の色トークンからなる。

| トークン                  | 用途                                     |
| ------------------------- | ---------------------------------------- |
| `background`              | Canvas 全面                              |
| `grid`                    | 縦横グリッド線                           |
| `axis`                    | X/Y 軸線と目盛                           |
| `text`                    | 軸ラベル                                 |
| `candleUp`                | `close >= open` のローソク (ヒゲ+実体)  |
| `candleDown`              | `close < open`  のローソク              |
| `line`                    | ラインチャート                           |
| `latestPriceLine`         | 最新価格の水平点線                       |
| `latestPriceLabelBg`      | 最新価格ラベル背景                       |
| `latestPriceLabelText`    | 最新価格ラベル文字                       |
| `tooltipGuideLine`        | Tooltip 位置を示す縦点線                 |

方針:

- **renderer 内に色を固定値で書かない**。必ず `theme.*` から取る。
- テーマは単なる data。切り替え時の特別処理は不要で、`useEffect` の依存に `theme` が含まれているため差し替え→再描画が自然に走る。
- ダーク / ライト / オーシャンなど複数テーマは呼び出し側 (例: `experiments/financial-chart/themes.ts`) で定義し、props として注入する。

## リサイズ設計

### サイズ購読

`useResizeObserver` カスタムフックで親コンテナの `contentRect` を購読する。初期値は `getBoundingClientRect()` から取得することで初回描画の1フレーム遅延を最小化。

### Canvas バッファ vs CSS サイズ

| 項目             | 値                                   |
| ---------------- | ------------------------------------ |
| `canvas.width`   | `Math.round(width  * devicePixelRatio)` |
| `canvas.height`  | `Math.round(height * devicePixelRatio)` |
| `canvas.style.width`  | `${width}px`                   |
| `canvas.style.height` | `${height}px`                  |
| 描画座標系       | `ctx.setTransform(dpr,0,0,dpr,0,0)` |

これにより「論理座標 (CSS px) でコードを書き、表示は常に高 DPI」という構造を維持する。DPR の変動 (ウィンドウを別ディスプレイへ移動した場合など) も `useEffect` の再実行で追従できる設計。

### `height` prop

CSS px でそのまま使う。内部で dpr 倍してバッファを確保する。

## 最新価格表示仕様

### ライン

- Y 座標 = `yScale(data[last].close)`
- X 範囲 = `[plot.left, plot.right]`
- `ctx.setLineDash([4, 4])` で点線化 (描画後に `setLineDash([])` で必ず戻す)
- 色 = `theme.latestPriceLine`
- 最新価格が `plot` の外に出た場合は描画スキップ

### ラベル

- 右 Y 軸の外側 (`plot.right + 1`) に背景矩形 + テキスト
- 角丸 (3px) のラウンドレクトを `quadraticCurveTo` で自前描画
- 文字は中央揃え (`textAlign: 'center'`, `textBaseline: 'middle'`)
- 軸より**あと**に描画するため最前面
- ラベル矩形が `plot.top` / `plot.bottom` をはみ出す場合はクランプしてチャート領域内に収める

## Tooltip 縦ガイド仕様

- Tooltip 表示中はマウス位置 (`tooltipState.x`) に縦点線ガイドを表示する
- 点線は `plot.top` 〜 `plot.bottom` の範囲だけ描画する
- 色は `theme.tooltipGuideLine` を使用する
- ガイドは `pointer-events: none` とし、操作を阻害しない

## パフォーマンス考慮

- **Canvas 1 枚で全描画** — SVG 比で DOM ノード数を抑え、数千ローソクでも崩れない
- **再描画は `useEffect` 1箇所に集約** — 描画の多重発火を避ける
- **canvas.width の変更はクリアを伴う** ため、サイズが変わらない時は代入を省略する
- **ピクセル整数化 + `+ 0.5`** — 線の半ピクセル ぼやけを防ぐ (グリッド・軸・ヒゲ・最新価格線)
- **`clip()` でクリッピング** — チャート領域外へのはみ出しを Canvas 側で保証し、ループ内に境界判定を入れない
- **ticks は毎回生成** — d3-scale の ticks は軽量。メモ化しても効果は小さい
- **データ 0 件時** — scale / renderer の早期 return で例外を出さない

想定データ量: 数百 〜 数千点までは 60fps 再描画が可能。それ以上はダウンサンプリング (utils 層で追加) を検討する。

## 拡張ポイント

将来の機能追加を想定した拡張点:

| 拡張                  | 実装方針                                                                 |
| --------------------- | ------------------------------------------------------------------------ |
| クロスヘア            | `<canvas>` にマウスイベントを貼り、上乗せ用 overlay canvas を追加。描画は `renderers/drawCrosshair.ts` を新設 |
| Tooltip               | overlay は `position: absolute` な DOM 要素として上に重ねる (Canvas 内に書かない) |
| ズーム / パン         | `xScale.domain` を state 化して再描画。`wheel` / `pointerdown` を canvas にバインド |
| 水平方向スクロール    | 表示範囲 (start, end index) を state 化。`xScale.range` はそのまま       |
| インジケータ (MA など) | `utils/calcMovingAverage.ts` で計算 → `renderers/drawIndicator.ts` で描画 |
| テーマ拡張            | `ChartTheme` にトークンを追加するだけ。renderer はテーマの不足をそのまま反映 |
| データのストリーミング | `data` props を差し替えるだけで再描画される。内部で state は保持しない   |

renderer は受け取る引数のみで動作する純粋副作用なので、単体でテストやストーリーに切り出すことも容易。
