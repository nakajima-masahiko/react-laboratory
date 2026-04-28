# StackedBarWindowChart 仕様書

任意キーと数値の組み合わせを **積み上げ棒グラフ + ウィンドウ移動スライダー** で可視化する汎用 React コンポーネントの仕様書。
通貨・金額・売上といったドメイン語彙を一切含まず、`Record<Key, number>` の時系列・カテゴリ列ならそのまま投入可能。
他リポジトリでもこの仕様書とソースをコピーすれば同等のチャートを再現できる。

---

## 1. 目的

- N 個のデータ点（`StackedDataPoint[]`）を **積み上げ棒** で描画する
- データ点が多くて全部表示しきれない場合に **下部スライダー** で表示窓（連続する windowSize 件）を左右にスクロールする
- 系列（series）の **凡例 ON/OFF**、棒上端への **ツールチップ吸着**、テーマ差し替え（色・背景・グリッド・ツールチップ）を提供する
- ドメイン色（通貨記号、金額単位、ヶ月など）を **一切持たない** — ラベルは consumer 側から文字列で注入する

非目的:

- 折れ線・グルーピング棒・円などの追加チャート種
- ズーム・パン・パン慣性
- データのソート・正規化（呼び出し側の責務）

---

## 2. 配置（features 層）

```
src/features/stacked-bar-window-chart/
├── components/
│   ├── StackedBarWindowChart.tsx  # 公開コンテナ（凡例 + チャート + スライダー）
│   ├── StackedBarChart.tsx        # SVG 描画コア
│   ├── ChartLegend.tsx            # 凡例
│   ├── ChartTooltip.tsx           # ツールチップ本体
│   └── WindowSlider.tsx           # スライダー + 前後ナビボタン
├── chart/
│   ├── axes.tsx                   # X / Y 軸（グリッド線含む）
│   └── scales.ts                  # d3-scale 生成
├── styles.css                     # 全スタイル（CSS カスタムプロパティ依存）
├── types.ts                       # 公開型（StackedSeries / StackedDataPoint / StackedBarChartTheme 等）
├── index.ts                       # 公開 API（StackedBarWindowChart, 型）
└── SPEC.md                        # この仕様書
```

---

## 3. 依存パッケージ

| パッケージ | バージョン目安 | 用途 |
|---|---|---|
| `react` / `react-dom` | `^19.x` | コンポーネント・hooks |
| `d3-array` | `^3.x` | `max` |
| `d3-format` | `^3.x` | 既定の数値フォーマッタ（`format(',')`） |
| `d3-scale` | `^4.x` | `scaleBand` / `scaleLinear` |
| `@radix-ui/react-slider` | `^1.x` | ウィンドウ移動スライダー |

`@types/d3-*` は別途追加。すべてのパッケージは型定義を内包または `@types/` 経由で取得できる。

---

## 4. 公開 API

```ts
import { StackedBarWindowChart } from 'features/stacked-bar-window-chart';
import type {
  StackedSeries,
  StackedDataPoint,
  StackedBarChartTheme,
  StackedBarWindowChartProps,
  ValueFormatter,
  StackedBarWindowAriaLabels,
} from 'features/stacked-bar-window-chart';
```

### 4.1 `StackedSeries<Key>`

```ts
interface StackedSeries<Key extends string = string> {
  key: Key;       // データと結合する識別子
  label: string;  // 凡例 / ツールチップ表示名
  color: string;  // 棒色（CSS color）
}
```

### 4.2 `StackedDataPoint<Key>`

```ts
interface StackedDataPoint<Key extends string = string> {
  key: string;          // X 軸内のユニークキー（React key にも利用）
  axisLabel: string;    // X 軸の短いラベル
  tooltipLabel: string; // ツールチップ見出し用の詳細ラベル
  values: Record<Key, number>; // 系列キーごとの値（負値は未対応 = 積み上げの前提）
}
```

`values[seriesKey]` が欠落するとランタイム NaN を生むため、consumer 側で **全系列の値を 0 で埋める** こと。

### 4.3 `StackedBarChartTheme`

```ts
interface StackedBarChartTheme {
  background: string;    // SVG チャートエリアの背景。'transparent' で親の背景を透過
  gridColor: string;     // グリッド線の色
  tooltipBg: string;     // ツールチップ背景色
  tooltipBorder: string; // ツールチップ枠線色
}
```

### 4.4 `StackedBarWindowChartProps<Key>`

| Prop | 型 | 必須 | 既定値 | 説明 |
|---|---|---|---|---|
| `data` | `StackedDataPoint<Key>[]` | Yes | - | 全データ点 |
| `series` | `ReadonlyArray<StackedSeries<Key>>` | Yes | - | 系列定義（積み上げ順は配列順） |
| `hiddenSeriesKeys` | `Set<Key>` | Yes | - | 非表示系列キー集合 |
| `onToggleSeries` | `(key: Key) => void` | Yes | - | 凡例ボタンクリック時のコールバック |
| `windowSize` | `number` | Yes | - | 同時表示するデータ点数 |
| `startIndex` | `number` | Yes | - | ウィンドウ開始インデックス（自動 clamp あり） |
| `onStartIndexChange` | `(next: number) => void` | Yes | - | スライダー / 前後ボタン操作時のコールバック |
| `theme` | `StackedBarChartTheme` | Yes | - | テーマトークン |
| `rangeLabel` | `string` | No | - | スライダー上に表示する文字列（例: "Apr 〜 Sep"） |
| `animationKey` | `string` | No | `${windowSize}-${series.length}` | 値変化で棒アニメーション再起動 + ツールチップクリア |
| `formatValue` | `ValueFormatter` | No | `d3-format(',')` | 軸目盛・ツールチップで使う数値フォーマッタ |
| `chartHeight` | `number` | No | `460` | チャート高さ（CSS px） |
| `pinnableTooltip` | `boolean` | No | `false` | クリックでツールチップを固定する機能 |
| `legendActions` | `ReactNode` | No | - | 凡例の右隣に並べる任意 UI |
| `ariaLabels` | `StackedBarWindowAriaLabels` | No | 英語既定値 | a11y / i18n 用ラベル |
| `pinnedHintLabel` | `string` | No | `"Click to release"` | ピン留め時の解除ヒント文 |

`startIndex` は内部で `[0, max(0, data.length - windowSize)]` に clamp される。`windowSize` も `[1, data.length]` に clamp。

### 4.5 ARIA ラベル既定値

```ts
{
  chart: 'Stacked bar chart',
  legend: 'Series legend',
  slider: 'Window start index',
  prevButton: 'Previous window',
  nextButton: 'Next window',
  windowControls: 'Window controls',
  pinnedBadge: 'Pinned',
}
```

---

## 5. 利用例

```tsx
import { useState } from 'react';
import { StackedBarWindowChart } from '@/features/stacked-bar-window-chart';

const series = [
  { key: 'a', label: 'Alpha', color: '#4e79a7' },
  { key: 'b', label: 'Beta',  color: '#f28e2b' },
] as const;

const data = [
  { key: '2024-01', axisLabel: 'Jan', tooltipLabel: 'Jan 2024', values: { a: 30, b: 12 } },
  { key: '2024-02', axisLabel: 'Feb', tooltipLabel: 'Feb 2024', values: { a: 28, b: 15 } },
  // ... N 件
];

const theme = {
  background: 'transparent',
  gridColor: 'var(--border)',
  tooltipBg: 'var(--bg)',
  tooltipBorder: 'var(--border)',
};

function Demo() {
  const [hidden, setHidden] = useState<Set<'a' | 'b'>>(new Set());
  const [start, setStart] = useState(0);
  return (
    <StackedBarWindowChart
      data={data}
      series={series}
      hiddenSeriesKeys={hidden}
      onToggleSeries={(key) => {
        const next = new Set(hidden);
        next.has(key) ? next.delete(key) : next.add(key);
        setHidden(next);
      }}
      windowSize={6}
      startIndex={start}
      onStartIndexChange={setStart}
      theme={theme}
    />
  );
}
```

---

## 6. レイアウト

`StackedBarWindowChart` は次の縦 3 段構成（`.sbwc-root` の grid）。

```
┌──────────────────────────────────────────────────────────┐
│ Legend (凡例 + legendActions)                             │
├──────────────────────────────────────────────────────────┤
│ SVG Chart (積み上げ棒 + 軸 + グリッド + ツールチップ)     │
├──────────────────────────────────────────────────────────┤
│ ◀  rangeLabel + Slider                              ▶    │
└──────────────────────────────────────────────────────────┘
```

各段の DOM 構造とクラス名:

| 段 | 要素 | クラス |
|---|---|---|
| Legend | `<div role="group">` > `<ul>` > `<li>` > `<button>` | `.sbwc-legend-row`, `.sbwc-legend`, `.sbwc-legend-item` |
| Chart | `<div>` > `<svg>` | `.sbwc-chart-host`, `.sbwc-svg` |
| Window | `<div role="group">` > `<button>` + `<Slider.Root>` + `<button>` | `.sbwc-controls`, `.sbwc-nav-button`, `.sbwc-slider-*` |

---

## 7. 描画仕様（StackedBarChart）

### 7.1 レイアウト定数

```ts
const MARGIN = { top: 8, right: 24, bottom: 32, left: 56 };
const STAGGER_WINDOW_MS = 480; // 系列ごとの登場ずらし合計時間
```

`chartHeight` は外部から受け取る（既定 460）。`innerWidth` は `ResizeObserver` で `.sbwc-chart-host` の幅を購読し、`chartWidth - MARGIN.left - MARGIN.right` で算出する。`chartWidth === 0` の間は SVG ではなく `.sbwc-svg-placeholder` を出してレイアウトシフトを防ぐ。

### 7.2 SVG 描画順（`translate(MARGIN.left, MARGIN.top)` 内）

1. チャート背景 `<rect fill={theme.background} rx={4}>`（`'transparent'` でも常に描画）
2. `<YAxis>`（水平グリッド + Y ラベル）
3. `<XAxis>`（垂直グリッド + X ラベル）
4. ピン留め列ハイライト `<rect class="sbwc-column-highlight is-pinned">`（`pinnedIndex !== null && hoverIndex !== pinnedIndex`）
5. ホバー列ハイライト `<rect class="sbwc-column-highlight">`（`hoverIndex !== null`）
6. 棒セグメント `<g key={animationKey} class="sbwc-bars">`
7. ホバーレイヤー `<rect class="sbwc-hover-layer">`（透明、`pointerEvents="all"`）

### 7.3 積み上げセグメント計算

```ts
const cumulative = new Array(chartData.length).fill(0);
visibleSeries.forEach((item, seriesIndex) => {
  chartData.forEach((row, rowIndex) => {
    const v = row.values[item.key];
    const yTop    = yScale(cumulative[rowIndex] + v);
    const yBottom = yScale(cumulative[rowIndex]);
    push({ x: xScale(row.key), y: yTop, height: yBottom - yTop, ... });
    cumulative[rowIndex] += v;
  });
});
```

### 7.4 棒登場アニメーション

- CSS クラス `.sbwc-bar` に `transform: scaleY(0) → scaleY(1)` のキーフレーム（700ms ease-out）
- `transformOrigin` は棒の底辺中央を inline style で指定（`${x + width/2}px ${innerHeight}px`）
- `--bar-delay` を inline style で注入してスタッガー（系列ごとに `STAGGER_WINDOW_MS / (visibleSeries.length - 1)` ms 遅延）
- `<g key={animationKey}>` により `animationKey` 変化時に DOM 再マウント → アニメ再実行

### 7.5 スケール（`chart/scales.ts`）

- **xScale**: `scaleBand<string>().paddingInner(0.2).paddingOuter(0.1)`
- **yScale**: `scaleLinear().domain([0, max(stack)]).nice(5)`。max が 0 のときは `[0, 1]` に置換

### 7.6 軸・グリッド（`chart/axes.tsx`）

- Y 軸: `yScale.ticks(5)` を使い、各 tick に **水平グリッド線** + ラベルを描画。ラベルは `formatValue` で整形
- X 軸: `xScale.bandwidth() >= 28` のときのみ全ラベル表示、それ未満は偶数 index のみ。フォントサイズは bandwidth 36/24px 境界で 13/12/11px に切替。各ラベルに **垂直グリッド線**（同じ間引き条件）

### 7.7 ツールチップ

- 棒上端中央に吸着（`.sbwc-tooltip-positioner` を `transform: translateX(-50%) translateY(-100%)`）
- 状態: `hoverIndex` / `pinnedIndex`
- 派生: `activeIndex = hoverIndex ?? pinnedIndex`、`isPinned = pinnedIndex !== null && hoverIndex === null`
- インタラクション:

  | 操作 | 動作 |
  |---|---|
  | ポインタ移動 | `hoverIndex` を更新 |
  | マウスでチャート外へ | `hoverIndex = null`（`pinnedIndex` は保持） |
  | タッチで指離す | hover 維持。`pinnableTooltip=true` なら `pinnedIndex = hoverIndex` に転写 |
  | クリック（同列） | `pinnedIndex` をクリア（`pinnableTooltip=true` 時） |
  | クリック（別列） | `pinnedIndex` を移動（`pinnableTooltip=true` 時） |
  | `animationKey` 変化 | render 中に検知して両方クリア |
  | チャート外 `pointerdown` | `document` リスナーで両方クリア |

### 7.8 `animationKey` による状態リセット

React 19 推奨パターン: 専用 state `prevAnimationKey` を持ち、render 中に props と比較。

```tsx
const [prevAnimationKey, setPrevAnimationKey] = useState(animationKey);
if (prevAnimationKey !== animationKey) {
  setPrevAnimationKey(animationKey);
  setHoverIndex(null);
  setPinnedIndex(null);
}
```

`useEffect` 内 `setState` は新しい React lint で禁止されるため、この形を使う。

---

## 8. WindowSlider 仕様

- 3 列 grid（`36px 1fr 36px`）。左 `‹`、中央スライダー、右 `›`
- `startIndex === 0` で左ボタン disabled、`startIndex === maxStartIndex` で右ボタン disabled
- `rangeLabel` を渡すとスライダー上にラベル表示、`aria-valuetext` にも反映
- 内部で `clamp(startIndex, 0, maxStartIndex)` 済みの値を `Slider.Root` の `value` に渡す
- スライダー操作 / ボタン押下のいずれも `onStartIndexChange(next)` で外部に委譲

---

## 9. テーマ設計

- `theme` プロップは **4 トークン** のみ。系列色は `series[i].color` 側で持つ（テーマと系列の責務分離）
- consumer 側でテーマ配列を定義し、`theme.colors` を `series[i].color` に上書きするユーティリティを書くのが推奨パターン
- `theme.background = 'transparent'` でカード背景を透過、`'#ffffff'` などで白背景固定にもできる
- ダークモード対応は `gridColor: 'var(--border)'` のように **CSS 変数** を渡す。feature 自体は色をハードコードしない

---

## 10. CSS 依存

`styles.css` は次の **CSS カスタムプロパティ** を親プロジェクト側で定義することを前提とする。

```css
:root {
  --text: #333;
  --text-h: #111;
  --bg: #fff;
  --border: #e0e0e0;
  --accent: #646cff;
}
@media (prefers-color-scheme: dark) {
  :root { /* ダーク版を上書き */ }
}
```

未定義の場合、ボタン枠線・スライダー軌道・ツールチップ背景などが意図せず透明・無色になる。

### 主要 CSS クラス

| クラス | 役割 |
|---|---|
| `.sbwc-root` | コンテナ grid（gap: 12px） |
| `.sbwc-legend-row` / `.sbwc-legend` / `.sbwc-legend-item` | 凡例 |
| `.sbwc-legend-item.is-hidden` | 非表示系列のフェード + 打消し線 |
| `.sbwc-chart-host` | SVG コンテナ（`position: relative`、ツールチップ位置基準） |
| `.sbwc-svg` | SVG 本体（`width: 100%`） |
| `.sbwc-svg-placeholder` | 幅計測前のプレースホルダー（高さのみ確保） |
| `.sbwc-bars .sbwc-bar` | 棒 + 登場アニメーション |
| `.sbwc-column-highlight` / `.is-pinned` | ホバー / ピン列ハイライト |
| `.sbwc-tooltip-positioner` | ツールチップ位置（`transform: translateX(-50%) translateY(-100%)`） |
| `.sbwc-tooltip` / `.sbwc-tooltip-arrow` | ツールチップ本体・矢印 |
| `.sbwc-tooltip-pin-badge` / `.sbwc-tooltip-pin-hint` | ピン留めバッジ・解除ヒント |
| `.sbwc-controls` | スライダー段の grid |
| `.sbwc-nav-button` | 36×36px 円形ナビボタン |
| `.sbwc-slider-*` | Radix Slider スタイル |

CSS 変数 `--bar-delay`（棒アニメ遅延）、`--sbwc-tooltip-fill` / `--sbwc-tooltip-border`（矢印色）は JS 側から inline style で注入する。

---

## 11. 状態管理ポリシー

- `hoverIndex` / `pinnedIndex` / `prevAnimationKey` / `chartWidth` は **feature 内部で完結**
- `hiddenSeriesKeys` / `startIndex` / `windowSize` は **consumer が制御**（controlled component）
- これにより consumer 側で URL クエリ同期・モード切替時の状態保持などが容易

---

## 12. パフォーマンス考慮

- `ResizeObserver` で幅を購読、`Math.floor` で整数化してから `setState`
- 積み上げセグメント・スケールは `useMemo` でメモ化（依存: `chartData`, `visibleSeries`, `innerWidth`, `innerHeight`）
- ホバー判定は `MouseEvent.clientX` から線形探索（O(N)、N=windowSize）。windowSize <= 100 想定で十分

---

## 13. 既知の制約

- 負値は積み上げの性質上未対応（`yScale` が `[0, max]` 固定）
- データ点数 0 のとき `<XAxis>` は何も描画しない
- `series.length === 0` のときツールチップは出ない（`tooltipAnchor === null`）
- `formatValue` は **同じ関数を毎回渡すこと**（インライン定義は再 render を増やす可能性）

---

## 14. 拡張ポイント

| 拡張 | 実装方針 |
|---|---|
| 折れ線併用 | `stackSegments` 計算後に `<path>` を追加描画する renderer 層を新設 |
| 値ラベル表示 | 各セグメントの中央に `<text>` を出すオプション prop（例: `showValueLabels`） |
| ウィンドウ範囲スライダー（両端ハンドル） | `WindowSlider` の `Slider.Root` を `value={[start, end]}` の 2 thumb に拡張 |
| 凡例配置の切替 | `StackedBarWindowChart` に `legendPosition?: 'top' \| 'bottom' \| 'none'` を追加 |
| 値の formatter を tooltip / axis で別指定 | `formatValue` を `{ axis, tooltip }` のオブジェクトに拡張 |
| サーバ側プロップ駆動アニメ | `animationKey` を URL クエリと同期するだけで OK（既に prop 化済） |

---

## 15. 他リポジトリへの移植手順

1. 上記 `src/features/stacked-bar-window-chart/` 一式をそのまま該当パスにコピー
2. `src/features/stacked-bar-window-chart/index.ts` を `import` できるパスを通す（Vite / Next / Webpack 設定）
3. § 10 の CSS カスタムプロパティを `:root` に定義（未定義でも動作はするがビジュアルが崩れる）
4. 依存 `npm install d3-array d3-format d3-scale @radix-ui/react-slider` および `@types/d3-*`
5. `import { StackedBarWindowChart } from '@/features/stacked-bar-window-chart'` で使用

ドメイン固有のラベルや色テーマは consumer 側で定義し、`series` / `theme` / `rangeLabel` / `ariaLabels` / `formatValue` を props で注入する。feature 自身は通貨・金額・月などの語を一切持たないため、売上・トラフィック・在庫など任意の積み上げデータに転用可能。
