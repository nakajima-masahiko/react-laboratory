# 積み上げ棒グラフ 自前描画版 — 完全仕様書

このドキュメントは `currency-chart-window-lab-scratch` 実験の実装仕様を、**任意のリポジトリで同じ棒グラフを再現できるレベル**で記述したものです。

---

## 1. 依存パッケージ

```json
{
  "d3-array": "^3.x",
  "d3-format": "^3.x",
  "d3-scale": "^4.x",
  "@radix-ui/react-slider": "^1.x",
  "@radix-ui/react-toggle-group": "^1.x"
}
```

型定義は各パッケージに内包されています。別途 `@types/*` は不要です。

---

## 2. ファイル構成

```
src/experiments/currency-chart-window-lab-scratch/
├── index.tsx            # コンテナ（状態管理・UI）
├── types.ts             # 型・定数・テーマ定義
├── data.ts              # ダミーデータ生成
├── styles.css           # 全スタイル（CSS カスタムプロパティ使用）
└── chart/
    ├── BarChartSvg.tsx  # SVG 描画コア
    ├── axes.tsx         # X / Y 軸
    ├── scales.ts        # d3-scale ラッパー
    ├── tooltip.tsx      # ツールチップ
    └── legend.tsx       # 凡例
```

---

## 3. 型定義（`types.ts`）

### 3.1 汎用型

```ts
interface SeriesDefinition<Key extends string> {
  key: Key;     // データキー（例: "USD"）
  label: string; // 表示ラベル
  color: string; // 棒の色（CSS カラー文字列）
}

interface ChartRow<Key extends string> {
  key: string;        // x 軸識別子（例: "2024-4"）
  label: string;      // ツールチップ用ラベル（例: "2024年4月"）
  monthLabel: string; // x 軸短縮ラベル（例: "4月"）
  values: Record<Key, number>;
}
```

### 3.2 テーマ型

```ts
type ThemeId = 'default' | 'warm' | 'cool' | 'light';

interface ChartTheme {
  id: ThemeId;
  label: string;
  colors: readonly string[];   // 系列数分の色パレット（10 色以上推奨）
  background: string;          // SVG チャートエリア背景色。'transparent' でカード背景を透過
  gridColor: string;           // X / Y グリッド線の色（CSS カラー or var(--xxx)）
  tooltipBg: string;           // ツールチップ背景色
  tooltipBorder: string;       // ツールチップ枠線色
}
```

### 3.3 テーマ一覧

| ID | ラベル | background | gridColor | tooltipBg | tooltipBorder |
|---|---|---|---|---|---|
| `default` | デフォルト | `'transparent'` | `'var(--border)'` | `'var(--bg)'` | `'var(--border)'` |
| `warm` | ウォーム | `'transparent'` | `'var(--border)'` | `'color-mix(in oklab, var(--bg) 88%, #e63946 12%)'` | `'#f4a261'` |
| `cool` | クール | `'transparent'` | `'var(--border)'` | `'color-mix(in oklab, var(--bg) 88%, #4361ee 12%)'` | `'#4361ee'` |
| `light` | ライト | `'#ffffff'` | `'rgba(0, 0, 0, 0.10)'` | `'#fffdf8'` | `'rgba(0, 0, 0, 0.18)'` |

`'transparent'` の background はカード背景 (`var(--accent-light)`) がそのまま見えます。  
`light` テーマは固定白背景に対して目立たない細いグリッド線を使います。

### 3.4 定数

```ts
const TOTAL_MONTHS = 36;   // データ総月数
const CURRENT_INDEX = 18;  // 現在月（先頭からのオフセット）
const INITIAL_CURRENCY_COUNT = 5;

const RANGE_OPTIONS = [
  { value: '1', label: '1ヶ月', months: 1 },
  { value: '3', label: '3ヶ月', months: 3 },
  { value: '6', label: '6ヶ月', months: 6 },
  { value: '12', label: '1年', months: 12 },
] as const;
```

---

## 4. ダミーデータ生成（`data.ts`）

`buildData(now = new Date())` は `ChartRow[]` を返します。

- 長さ: `TOTAL_MONTHS`
- `key`: `"YYYY-M"` 形式（例: `"2024-4"`）
- `label`: `"YYYY年M月"` 形式
- `monthLabel`: `"M月"` 形式
- `values`: 各通貨のつみたて額（整数）

各通貨の金額は `base + growth * index + seasonal` で計算されます（サイン波でブレを付与）。  
この形式に合わせれば実データや他カテゴリ（部門別売上など）にそのまま差し替えられます。

---

## 5. スケール（`chart/scales.ts`）

```ts
function buildScales<Key extends string>(
  chartData: ChartRow<Key>[],
  visibleSeriesKeys: Key[],
  innerWidth: number,
  innerHeight: number,
): { xScale: ScaleBand<string>; yScale: ScaleLinear<number, number> }
```

- **xScale**: `scaleBand` — `paddingInner(0.2)` / `paddingOuter(0.1)`
- **yScale**: `scaleLinear` — ドメインは `[0, 可視系列合計の最大値]`。合計 0 の場合は `[0, 1]` でクラッシュを防止
- `.nice(5)` で y 軸ドメインを丸める

---

## 6. 軸コンポーネント（`chart/axes.tsx`）

### 6.1 `YAxis`

props: `{ yScale, innerWidth, gridColor }`

- `yScale.ticks(5)` でティック生成
- 各ティックに **水平グリッド線**（`stroke={gridColor}` / `strokeDasharray="3 3"`）を描画
- ラベルは `fill="var(--text)"` で CSS 変数に従う

### 6.2 `XAxis`

props: `{ xScale, innerHeight, chartData, gridColor }`

- `transform={`translate(0, ${innerHeight})`}` — チャート底辺に配置
- `bandwidth >= 28` の場合のみ全ラベル表示、それ未満は偶数インデックスのみ（間引き）
- フォントサイズは帯域幅 36px 以上 → 13px、24px 以上 → 12px、未満 → 11px
- 各ラベル位置（バンド中央）に **垂直グリッド線**（`stroke={gridColor}` / `strokeDasharray="3 3"`）を描画
- グリッド線はラベルと同じ間引き条件で表示

**グリッド線の描画順**: グリッド線 → テキストラベル の順で `<g>` 内に配置し、テキストがグリッド線の上に来るようにします。

---

## 7. 棒グラフコア（`chart/BarChartSvg.tsx`）

### 7.1 props

```ts
interface BarChartSvgProps<Key extends string> {
  chartData: ChartRow<Key>[];
  series: ReadonlyArray<SeriesDefinition<Key>>;
  hiddenSeriesKeys: Set<Key>;
  animationKey: string;        // 変化時に棒アニメーション再起動 & ツールチップ非表示
  chartBackground: string;     // テーマの background 値を渡す
  gridColor: string;           // テーマの gridColor 値を渡す
  tooltipBg: string;           // テーマの tooltipBg 値を渡す
  tooltipBorder: string;       // テーマの tooltipBorder 値を渡す
  pinnableTooltip?: boolean;   // クリックでツールチップを固定する機能（デフォルト: false）
}
```

### 7.2 レイアウト定数

```ts
const MARGIN = { top: 8, right: 24, bottom: 32, left: 56 };
const CHART_HEIGHT = 460;
const STAGGER_WINDOW_MS = 480; // 系列ごとのアニメーション開始ずらし合計時間
```

### 7.3 SVG 描画順（`translate(MARGIN.left, MARGIN.top)` 内）

1. **チャート背景 `<rect>`** — `fill={chartBackground}` / `rx={4}`（`'transparent'` でも常に描画）
2. **`<YAxis>`** — 水平グリッド線 + y ラベル
3. **`<XAxis>`** — 垂直グリッド線 + x ラベル
4. **ピン留め列ハイライト `<rect className="ccws-column-highlight is-pinned">`** — `pinnedIndex !== null && hoverIndex !== pinnedIndex` のときのみ描画
5. **ホバー列ハイライト `<rect className="ccws-column-highlight">`** — `hoverIndex !== null` のときのみ描画
6. **`<g key={animationKey} className="ccws-bars">` — 積み上げ棒セグメント群**
7. **ホバーレイヤー `<rect className="ccws-hover-layer">`** — `fill="transparent"` / `pointerEvents="all"`

ハイライト rect はいずれも `pointerEvents="none"` で入力イベントをブロックしません。

### 7.4 積み上げセグメント計算

```ts
const cumulative = new Array(chartData.length).fill(0);
visibleSeries.forEach((item, seriesIndex) => {
  chartData.forEach((row, rowIndex) => {
    const value = row.values[item.key];
    const yTop    = yScale(cumulative[rowIndex] + value);
    const yBottom = yScale(cumulative[rowIndex]);
    // セグメントを push
    cumulative[rowIndex] += value;
  });
});
```

### 7.5 棒アニメーション

CSS クラス `.ccws-bar` で `scaleY(0) → scaleY(1)` のキーフレームアニメーション。  
CSS カスタムプロパティ `--bar-delay` でスタッガー遅延を注入します。

```ts
const perSeriesDelay = visibleSeries.length > 1
  ? STAGGER_WINDOW_MS / (visibleSeries.length - 1) : 0;
style['--bar-delay'] = `${seriesIndex * perSeriesDelay}ms`;
style.transformOrigin = `${x + width / 2}px ${innerHeight}px`; // 底辺起点
```

`animationKey` が変わるたびに `<g key={animationKey}>` が再マウントされ、アニメーションが再実行されます。

### 7.6 ツールチップ表示ロジック

**状態変数**

| state | 型 | 役割 |
|---|---|---|
| `hoverIndex` | `number \| null` | ポインター移動中の列インデックス |
| `pinnedIndex` | `number \| null` | クリックでピン留めした列インデックス |

**導出値**

```ts
const activeIndex = hoverIndex ?? pinnedIndex;      // ホバー優先、離脱後はピン留め
const isPinned = pinnedIndex !== null && hoverIndex === null; // 純粋なピン状態
```

**インタラクション**

| 操作 | 動作 |
|---|---|
| ポインター移動 | `hoverIndex` を更新 |
| ポインター離脱（マウス） | `hoverIndex` をクリア（`pinnedIndex` は保持） |
| ポインター離脱（タッチ） | ツールチップを維持。`pinnableTooltip=true` の場合のみ `pinnedIndex` に反映し、`false` の場合は `hoverIndex` 表示を維持 |
| クリック（`pinnableTooltip=true` かつ同列） | `pinnedIndex` をクリア（トグル OFF） |
| クリック（`pinnableTooltip=true` かつ別列） | `pinnedIndex` を新しい列に移動 |
| `animationKey` 変化 | `pinnedIndex` と `hoverIndex` を両方クリア（`useEffect`） |
| チャート外クリック | `pinnedIndex` と `hoverIndex` を両方クリア（`document.addEventListener('pointerdown', ...)`） |

**`pinnableTooltip` prop**:  
デフォルトは `false`。`true` にするとクリックでのピン留め機能が有効になり、ツールチップに「固定」バッジと「クリックで解除」ヒントが表示されます。`false` の場合はホバー時のみ表示され、タッチ離脱時も `pinnedIndex` へは反映されません（`hoverIndex` ベースで表示継続）。

**列ハイライトの描画**:  
- ホバー列: `.ccws-column-highlight`（アクセントカラー 14% 混合の半透明背景）
- ピン留め列: `.ccws-column-highlight.is-pinned`（22% 混合 + アクセントカラーの stroke）
- ホバー中はホバー列のみ、ホバー終了後はピン留め列のみ表示

### 7.7 ツールチップ位置算出

ツールチップは棒グラフの**上端中央**を基準に配置します。

```ts
// 棒中央の X（SVG 座標系 → コンテナ座標系に変換）
const barCenterX = (xScale(row.key) ?? 0) + xScale.bandwidth() / 2 + MARGIN.left;

// 当該列の全セグメントのうち最も上（y が最小）のセグメントを棒上端とする
const rowSegments = stackSegments.filter((s) => s.rowIndex === activeIndex);
const barTopY = Math.min(...rowSegments.map((s) => s.y)) + MARGIN.top;

// → tooltipAnchor = { row, x: barCenterX, y: barTopY }
```

`tooltipAnchor` を `.ccws-tooltip-positioner` の `left` / `top` に渡し、CSS で `transform: translateX(-50%) translateY(-100%)` を適用することでツールチップを棒上端中央に吸着させます。右端はみ出し防止のロジックは不要（CSS のみで制御）。

### 7.8 レスポンシブ幅

`ResizeObserver` で `.ccws-chart-host` の幅を監視し、`chartWidth` state を更新します。  
`innerWidth = chartWidth - MARGIN.left - MARGIN.right`

---

## 8. ツールチップ（`chart/tooltip.tsx`）

コンポーネント: `ChartTooltipContent`

props:

```ts
interface ChartTooltipContentProps<Key extends string> {
  row: ChartRow<Key>;
  series: ReadonlyArray<SeriesDefinition<Key>>;
  hiddenSeriesKeys: Set<Key>;
  isPinned: boolean;
  pinnableTooltip: boolean;
  tooltipBg: string;
  tooltipBorder: string;
}
```

- 位置制御は親の `.ccws-tooltip-positioner` に委任（このコンポーネント自身は `position: absolute` を持たない）
- `hiddenSeriesKeys` に含まれる系列は非表示
- `d3-format` の `format(',')` で数値をカンマ区切りフォーマット
- `tooltipBg` / `tooltipBorder` を inline style と CSS カスタムプロパティ `--ccws-tooltip-fill` / `--ccws-tooltip-border` の両方にセット
- ツールチップ下端に `<svg class="ccws-tooltip-arrow">` を描画（`polygon points="0,0 30,0 15,10"`）。矢印は `fill: var(--ccws-tooltip-fill)` で塗り、`filter: drop-shadow` で枠線色を与える
- `pinnableTooltip && isPinned` のとき: タイトル横に「固定」バッジ（`.ccws-tooltip-pin-badge`）、下部に「クリックで解除」ヒント（`.ccws-tooltip-pin-hint`）を表示

**呼び出し側（`BarChartSvg.tsx`）の構造**:

```tsx
<div
  className="ccws-tooltip-positioner"
  style={{ left: tooltipAnchor.x, top: tooltipAnchor.y }}
>
  <ChartTooltipContent ... />
</div>
```

`tooltipAnchor` が `null` の場合（ホバーなし・ピン留めなし）はレンダリングしない。

---

## 9. 凡例（`chart/legend.tsx`）

props: `{ series, hiddenSeriesKeys, onToggle }`

- `<ul>` + `<button>` 構成（`role="list"` + `aria-pressed`）
- 非表示系列は `is-hidden` クラスでスウォッチをフェード・ラベルに打消し線

---

## 10. コンテナ（`index.tsx`）

### 10.1 state

| state | 型 | 説明 |
|---|---|---|
| `selectedRange` | `RangeValue` | 選択中の表示月数 |
| `startIndex` | `number` | スライダー位置（データ配列の先頭インデックス） |
| `hiddenSeriesKeys` | `Set<Currency>` | 凡例 OFF の系列キー集合 |
| `currencyCount` | `number` | 表示中の系列数（初期 5） |
| `selectedThemeId` | `ThemeId` | 選択中テーマ ID |

### 10.2 導出値

```ts
const selectedTheme = CHART_THEMES.find(t => t.id === selectedThemeId) ?? CHART_THEMES[0];

// テーマ色を activeSeries の各 color に上書き
const activeSeries = useMemo(
  () => CURRENCY_SERIES.slice(0, currencyCount).map((s, i) => ({
    ...s,
    color: selectedTheme.colors[i] ?? s.color,
  })),
  [currencyCount, selectedTheme],
);

const visibleMonths = RANGE_OPTIONS.find(o => o.value === selectedRange)?.months ?? 6;
const maxStartIndex = Math.max(0, data.length - visibleMonths);
const safeStartIndex = Math.min(startIndex, maxStartIndex);
const endIndex = Math.min(safeStartIndex + visibleMonths - 1, data.length - 1);
const chartData = data.slice(safeStartIndex, endIndex + 1);

// 表示期間変更・系列追加でアニメーション再起動
const animationKey = `${selectedRange}-${currencyCount}`;
```

### 10.3 BarChartSvg への props 受け渡し

```tsx
<BarChartSvg
  chartData={chartData}
  series={activeSeries}
  hiddenSeriesKeys={hiddenSeriesKeys}
  animationKey={animationKey}
  chartBackground={selectedTheme.background}
  gridColor={selectedTheme.gridColor}
  tooltipBg={selectedTheme.tooltipBg}
  tooltipBorder={selectedTheme.tooltipBorder}
  {/* pinnableTooltip は省略 → デフォルト false */}
/>
```

### 10.4 テーマ選択 UI

`.ccws-theme-selector` に各テーマのボタンを配置。ボタンにはテーマ先頭 3 色のカラースウォッチを表示します。  
選択中は `is-active` クラスで枠線ハイライト。テーマ変更は色の即時反映のみ（`animationKey` は不変 = アニメーション再起動なし）。

---

## 11. CSS（`styles.css`）

CSS カスタムプロパティに依存します。親プロジェクトで以下を定義してください。

```css
:root {
  --text: #1a1a1a;          /* テキスト色 */
  --text-h: #000000;        /* 強調テキスト */
  --bg: #ffffff;            /* 背景色 */
  --border: rgba(0,0,0,0.15); /* ボーダー・グリッド線 */
  --accent: #4361ee;        /* アクセントカラー */
  --accent-foreground: #fff;
  --accent-light: rgba(67,97,238,0.05); /* カード背景 */
}

@media (prefers-color-scheme: dark) {
  :root {
    --text: #e5e5e5;
    --text-h: #ffffff;
    --bg: #1a1a1a;
    --border: rgba(255,255,255,0.15);
    --accent: #4cc9f0;
    --accent-foreground: #000;
    --accent-light: rgba(76,201,240,0.06);
  }
}
```

### 主要クラス

| クラス | 役割 |
|---|---|
| `.ccws-root` | ルート grid コンテナ（gap: 18px） |
| `.ccws-header` | タイトル + コントロール横並び（flex, space-between） |
| `.ccws-header-controls` | テーマセレクター + 表示期間トグル（flex, gap: 12px） |
| `.ccws-theme-selector` | テーマボタン群（flex, gap: 6px） |
| `.ccws-theme-button` | 各テーマボタン（`is-active` で accent 色枠 + glow） |
| `.ccws-theme-swatches` / `.ccws-theme-swatch` | 3 色スウォッチ（各 10×10px, border-radius: 2px） |
| `.ccws-toggle-group` / `.ccws-toggle-item` | Radix ToggleGroup スタイル（`[data-state='on']` で accent 背景） |
| `.ccws-card` | チャートカード（背景 `var(--accent-light)`, padding: 16px 8px 8px） |
| `.ccws-legend-row` | 凡例 + 追加ボタン横並び（flex, justify-content: center） |
| `.ccws-legend` / `.ccws-legend-item` | 凡例リスト（`is-hidden` でスウォッチをフェード・ラベルに打消し線） |
| `.ccws-add-currency` | 通貨追加ボタン（破線ピル型, disabled で opacity: 0.45） |
| `.ccws-chart-host` | `position: relative; width: 100%` — ツールチップ positioner の基準 |
| `.ccws-svg` | SVG 本体（`display: block; width: 100%; touch-action: pan-y`） |
| `.ccws-svg-placeholder` | 幅計測前のプレースホルダー（高さのみ確保） |
| `.ccws-column-highlight` | ホバー列ハイライト（accent 14% 混合の半透明 fill） |
| `.ccws-column-highlight.is-pinned` | ピン留め列ハイライト（22% 混合 fill + accent stroke） |
| `.ccws-bars .ccws-bar` | 棒（`scaleY(0)→scaleY(1)` アニメーション） |
| `.ccws-tooltip-positioner` | ツールチップ位置制御（`position: absolute; transform: translateX(-50%) translateY(-100%); pointer-events: none`） |
| `.ccws-tooltip` | ツールチップ本体（width: 180px, border-radius: 6px） |
| `.ccws-tooltip-arrow` | ツールチップ下端の矢印 SVG（fill: `--ccws-tooltip-fill`） |
| `.ccws-tooltip-title` | タイトル行（font-weight: 600, flex で「固定」バッジと横並び） |
| `.ccws-tooltip-pin-badge` | 「固定」バッジ（ピル型, opacity: 0.65） |
| `.ccws-tooltip-pin-hint` | 「クリックで解除」ヒント（font-size: 0.78em, opacity: 0.55） |
| `.ccws-tooltip-list` | 系列リスト（grid, gap: 4px） |
| `.ccws-tooltip-row` | 1系列行（grid-template-columns: 12px 1fr auto） |
| `.ccws-controls` | スライダー + ナビボタン 3カラム grid（36px 1fr 36px） |
| `.ccws-nav-button` | 前/次ボタン（36×36px 円形, disabled で opacity: 0.45） |
| `.ccws-slider-wrap` | スライダーラベル + スライダー縦並び grid |
| `.ccws-slider-label` | 表示期間ラベル（text-overflow: ellipsis） |
| `.ccws-slider-root/track/range/thumb` | Radix Slider スタイル（thumb: 18×18px 円形, accent border） |

### 棒アニメーション CSS

```css
.ccws-bars .ccws-bar {
  transform: scaleY(0);
  animation: ccws-bar-grow 700ms ease-out var(--bar-delay, 0ms) forwards;
}

@keyframes ccws-bar-grow {
  from { transform: scaleY(0); }
  to   { transform: scaleY(1); }
}
```

`--bar-delay` は JavaScript から `style` prop 経由で注入します。

---

## 12. 実装上の注意点

1. **ResizeObserver でレスポンシブ幅を取得**: `useState(0)` 初期値で SSR セーフ。`entry.contentRect.width` を `Math.floor()` してから state に保存。`chartWidth === 0` のときは SVG を描画せず `.ccws-svg-placeholder` を表示し、高さのみ確保してレイアウトシフトを防ぐ。

2. **`animationKey` による再アニメーション**: `<g key={animationKey} className="ccws-bars">` とすることで React が DOM を再マウント → CSS アニメーションが再実行される。`animationKey` は `${selectedRange}-${currencyCount}` で構成されるためテーマ変更では変わらず、棒アニメーションが無駄に再実行されない。

3. **`animationKey` 変化でツールチップ非表示**: `useEffect(() => { setPinnedIndex(null); setHoverIndex(null); }, [animationKey])` で期間変更・系列追加時にツールチップをクリアする。

4. **タッチ操作のツールチップ維持**: `handlePointerLeave` で `event.pointerType === 'touch'` を検出したら `hoverIndex` をクリアしない。これにより指を離した後も表示を維持できる。さらに `pinnableTooltip=true` の場合のみ `setPinnedIndex(hoverIndex)` でピン留め状態へ反映する。

5. **チャート外クリックでツールチップ閉じ**: `document.addEventListener('pointerdown', handleOutsideClick)` を `useEffect` で登録し、`.ccws-chart-host` の外側クリックで `hoverIndex` / `pinnedIndex` 両方をクリアする。

6. **ツールチップ位置**: `tooltipAnchor.x`（棒中央 X）と `tooltipAnchor.y`（棒上端 Y）を `.ccws-tooltip-positioner` の `left` / `top` に渡し、CSS `transform: translateX(-50%) translateY(-100%)` で棒上端中央に吸着させる。右端反転ロジックは不要。

7. **X 軸グリッド線の間引き**: X 軸ラベルと同じ条件（`!showAll && i % 2 === 1` でスキップ）で垂直グリッド線も間引く。12 ヶ月表示で幅が狭い場合でも過密にならない。

8. **テーマ色の上書きは `activeSeries` の `useMemo` 内**: `BarChartSvg` / `ChartTooltipContent` / `ChartLegend` は `series[i].color` を参照するだけ。テーマ切り替え時に再計算されるが `animationKey` は変わらないので棒アニメーションは再起動しない。

9. **`light` テーマの白背景**: SVG 内の `<rect fill={chartBackground}>` で描画される。カード背景 (`var(--accent-light)`) とは独立しているため、ダークモードでもチャートエリアだけ白背景になる。

---

## 13. 将来拡張ポイント

1. `ChartRow.monthLabel` を `xTickLabel` にリネームして時系列以外のカテゴリに対応
2. `ChartTooltip` にフォーマッタ関数を props で注入（通貨・比率・小数桁対応）
3. 積み上げ以外（grouped / line）を同一データモデルで描画する `renderer` 戦略を追加
4. `pinnedIndex` をコンテナに引き上げて URL クエリパラメータと同期（共有リンク対応）

---

## 追記: データ抽象化 + タブ切替（2026-04）

本実装は「通貨」専用ではなく、**データ種類（series）+ 金額（values）** のセットであれば積み上げ可能です。

### 追加された型とデータセット

- `types.ts`
  - `ChartMode = 'currency' | 'portfolio'`
  - `PORTFOLIO_SERIES`（現金 / 株式 / 債券 / REIT / コモディティ / 暗号資産）
  - `INITIAL_VISIBLE_SERIES_COUNT`（タブごとの初期表示系列数）
- `data.ts`
  - `buildMonthlyData(...)` を共通生成関数として追加
  - `buildCurrencyData()` と `buildPortfolioData()` を公開

これにより、系列定義と系列プロファイル（base, growth, seasonalAmplitude, phase）を差し替えるだけで、同じ描画基盤へ新しい積み上げデータを投入できます。

### UI 追加仕様

`index.tsx` のヘッダーにトグルグループを追加し、以下の 2 タブを切り替えます。

1. `通貨別`
   - 従来の通貨積み上げチャート
2. `資金内訳`
   - ポートフォリオ内訳の積み上げ棒グラフ

- 月レンジトグル / スライダー / テーマ切替は両タブで共通利用。
- 凡例の ON/OFF（系列非表示）状態と「系列を追加」カウントはタブごとに独立して保持。

