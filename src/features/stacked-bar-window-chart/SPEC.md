# StackedBarWindowChart 実装再現仕様書（再現性優先）

本仕様は **このファイル単体** を別の生成 AI（Claude / Codex / Copilot など）へ渡した場合でも、`src/features/stacked-bar-window-chart` の現行実装を高い再現性で再構築することを目的とする。  
対象は **積み上げ棒グラフ + 表示窓スライダー + 凡例 ON/OFF + hover/pinned tooltip** である。

---

## 0. 適用範囲と非対象

- 適用範囲: `src/features/stacked-bar-window-chart/` 配下。
- 本仕様で扱う変更対象: **`SPEC.md` のみ**。
- 非対象:
  - `*.tsx`, `*.ts`, `*.css`, `package.json` の仕様外変更。
  - ドメイン固有語彙（売上、金額、通貨など）の feature 内ハードコード。

---

## 1. ファイル別責務（必須）

| ファイル | 役割（持つべき責務） | 持ってはいけない責務 |
|---|---|---|
| `components/StackedBarWindowChart.tsx` | **公開コンテナ**。凡例・チャート・スライダーを統合し、`window` 切り出し、空状態、props 受け渡しを管理。 | SVG 座標計算や tooltip 本体レイアウト詳細を直接持たない。 |
| `components/StackedBarChart.tsx` | **SVG 描画コア**。積み上げ棒描画、軸合成、hover/pinned 管理、tooltip anchor 計算、tooltip 位置 clamp 管理。 | 公開 API の集約責務や凡例 UI の責務を持たない。 |
| `components/ChartLegend.tsx` | 系列表示 ON/OFF UI。`aria-pressed` を備えたトグルボタン群。 | データ集計、チャート座標計算を持たない。 |
| `components/ChartTooltip.tsx` | **表示専用**。タイトル・合計行・系列行・pinned 表示を描画。 | **座標計算を持たない**（left/top/clamp/arrowX 計算禁止）。 |
| `components/WindowSlider.tsx` | 表示窓の開始位置操作（前後ボタン + スライダー）。`onStartIndexChange` 呼び出し。 | チャート描画・tooltip 状態保持を持たない。 |
| `chart/axes.tsx` | X/Y 軸とグリッド線の SVG 描画。フォーマッタ適用。 | ホバー処理や積み上げ計算を持たない。 |
| `chart/scales.ts` | `scaleBand` / `scaleLinear` の生成。0 データ時の安全 domain 処理。 | React state や DOM イベント処理を持たない。 |
| `chart/sanitize.ts` | `sanitizeStackedValue` を提供。`null / undefined / NaN / Infinity / -Infinity / 負値` を 0 化。 | 描画や UI ロジックを持たない。 |
| `styles.css` | コンポーネント全体の見た目定義。**CSS 変数前提**で色・遅延・矢印位置を表現。 | JS 側状態管理・座標計算責務を持たない。 |
| `types.ts` | **公開型定義**（props / data / theme / aria / formatter など）。 | 実装ロジックを持たない。 |
| `index.ts` | 公開エントリ。`StackedBarWindowChart` と公開型を再 export。 | 実装詳細やロジックを持たない。 |

---

## 2. 公開型定義（TypeScript 正式仕様）

```ts
import type { ReactNode } from 'react';

export type ValueFormatter = (value: number) => string;

export interface StackedSeries<Key extends string = string> {
  key: Key;
  label: string;
  color: string;
}

export interface StackedDataPoint<Key extends string = string> {
  key: string;
  axisLabel: string;
  tooltipLabel: string;
  values: Record<Key, number | null | undefined>;
}

export interface StackedBarChartTheme {
  background: string;
  gridColor: string;
  tooltipBg: string;
  tooltipBorder: string;
}

export interface StackedBarWindowAriaLabels {
  chart?: string;
  legend?: string;
  slider?: string;
  prevButton?: string;
  nextButton?: string;
  windowControls?: string;
  pinnedBadge?: string;
}

export type TooltipTotalMode = 'visible' | 'all';

export interface StackedBarWindowChartProps<Key extends string = string> {
  data: StackedDataPoint<Key>[];
  series: ReadonlyArray<StackedSeries<Key>>;
  hiddenSeriesKeys: Set<Key>;
  onToggleSeries: (key: Key) => void;
  windowSize: number;
  startIndex: number;
  onStartIndexChange: (next: number) => void;
  theme: StackedBarChartTheme;
  rangeLabel?: string;
  animationKey?: string;
  formatValue?: ValueFormatter;
  chartHeight?: number;
  pinnableTooltip?: boolean;
  showTooltipTotal?: boolean;
  tooltipTotalLabel?: string;
  tooltipTotalMode?: TooltipTotalMode;
  legendActions?: ReactNode;
  ariaLabels?: StackedBarWindowAriaLabels;
  pinnedHintLabel?: string;
  emptyMessage?: string;
}
```

---

## 3. 公開 Props 完全仕様

| Prop | 型 | 必須 | 既定値 | 役割 | 注意点 |
|---|---|---|---|---|---|
| `data` | `StackedDataPoint<Key>[]` | 必須 | - | 全データ点 | `data=[]` なら空状態表示。 |
| `series` | `ReadonlyArray<StackedSeries<Key>>` | 必須 | - | 系列定義と積み上げ順 | `series=[]` も空状態表示。 |
| `hiddenSeriesKeys` | `Set<Key>` | 必須 | - | 非表示系列管理 | `visible` 計算時に除外。 |
| `onToggleSeries` | `(key: Key) => void` | 必須 | - | 凡例トグル通知 | state は親管理。 |
| `windowSize` | `number` | 必須 | - | 同時表示件数 | 実装で 1〜`data.length` に clamp。 |
| `startIndex` | `number` | 必須 | - | 表示窓開始位置 | 実装で 0〜`maxStartIndex` に clamp。 |
| `onStartIndexChange` | `(next: number) => void` | 必須 | - | スライダー/ボタン操作通知 | controlled 前提。 |
| `theme` | `StackedBarChartTheme` | 必須 | - | 背景/グリッド/tooltip 色 | CSS 変数値を渡せる。 |
| `rangeLabel` | `string` | 任意 | `undefined` | 表示範囲ラベル | スライダー上表示に利用。 |
| `animationKey` | `string` | 任意 | ``${windowSize}-${series.length}-${data.length}`` | 棒アニメ再起動キー | 変更時は hover/pinned クリア。 |
| `formatValue` | `ValueFormatter` | 任意 | `d3-format(',')` | 数値整形 | 軸/tooltipで利用。 |
| `chartHeight` | `number` | 任意 | `460` | SVG 高さ | px 扱い。 |
| `pinnableTooltip` | `boolean` | 任意 | `false` | クリック固定可否 | true で pinned interaction 有効。 |
| `showTooltipTotal` | `boolean` | 任意 | `false` | 合計行表示可否 | **既定 true にしない**。 |
| `tooltipTotalLabel` | `string` | 任意 | `'合計'` | 合計行ラベル | 合計値の前に表示。 |
| `tooltipTotalMode` | `TooltipTotalMode` | 任意 | `'visible'` | 合計計算対象制御 | `visible`/`all` の挙動を厳守。 |
| `legendActions` | `ReactNode` | 任意 | `undefined` | 凡例右側拡張領域 | 任意操作 UI を差し込む。 |
| `ariaLabels` | `StackedBarWindowAriaLabels` | 任意 | 日本語既定値 | a11y 文言上書き | 未指定項目は既定値で補完。 |
| `pinnedHintLabel` | `string` | 任意 | `'クリックで固定を解除'` | pinned 時ヒント | tooltip 内表示。 |
| `emptyMessage` | `string` | 任意 | `'表示できるデータがありません'` | 空状態文言 | `role=status` 領域で表示。 |

---

## 4. sanitize 仕様（厳密）

`chart/sanitize.ts` に以下仕様を固定する。

- number 以外 → `0`
- `NaN` → `0`
- `Infinity` → `0`
- `-Infinity` → `0`
- `null` → `0`
- `undefined` → `0`
- 負値 → `0`
- `0` 以上の有限数 → そのまま

```ts
export function sanitizeStackedValue(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  return value;
}
```

---

## 5. ツールチップ仕様（再現重点）

### 5.1 基本原則

- `ChartTooltip.tsx` は表示専用。
- 座標計算は `StackedBarChart.tsx` 側のみ。
- `activeIndex = hoverIndex ?? pinnedIndex`
- `isPinned = pinnedIndex !== null && hoverIndex === null`

### 5.2 anchor 算出

- `tooltipAnchor` は「対象カラム上端中央」を使う。
- `barCenterX` は `xScale(row.key)! + xScale.bandwidth() / 2`
- `barTopY` は対象カラムの積み上げ合計値を `yScale(total)` した座標。
- `tooltipAnchor = { x: barCenterX + MARGIN.left, y: barTopY + MARGIN.top }`（実装の座標系に合わせて margin オフセット）。

### 5.3 本体 left clamp と矢印位置

以下計算式を **そのまま** 用いる。

```ts
const halfWidth = tooltipSize.width / 2;
const minLeft = halfWidth + TOOLTIP_PADDING_X;
const maxLeft = Math.max(minLeft, chartWidth - halfWidth - TOOLTIP_PADDING_X);
const tooltipLeft = clamp(tooltipAnchor.x, minLeft, maxLeft);

const tooltipLeftEdge = tooltipLeft - halfWidth;
const rawArrowX = tooltipAnchor.x - tooltipLeftEdge;
const arrowX = clamp(rawArrowX, TOOLTIP_ARROW_INSET, tooltipSize.width - TOOLTIP_ARROW_INSET);
```

- `tooltipLeft` は tooltip 本体中心 X。
- `arrowX` は tooltip 左端基準の矢印 X。
- CSS 変数 `--sbwc-tooltip-arrow-x` に `arrowX` を px で流し込む。

```css
.sbwc-tooltip-arrow {
  margin-left: calc(var(--sbwc-tooltip-arrow-x, 90px) - 7px);
}
```

### 5.4 視覚要件

- 左端カラム: 矢印は tooltip の左下寄り。
- 中央カラム: 矢印は中央下。
- 右端カラム: 矢印は右下寄り。
- tooltip 本体は常にチャート左右にはみ出さない。

---

## 6. iPad / Safari 対応（必須実装 + 禁止事項）

hover 判定は以下方式を必須とする。

```ts
const rect = svg.getBoundingClientRect();
const localX = clientX - rect.left - MARGIN.left;
```

### 禁止事項

- `event.nativeEvent.offsetX` を使わない。
- SVG の `offsetX` に依存しない。
- pointer/touch 処理を `pointermove` だけに簡略化しない。
- touch 用 `onPointerDown` を削除しない。
- touch 時の `onPointerLeave` 特別処理を削除しない。
- 外部クリックで閉じる `document pointerdown` を削除しない。

---

## 7. インタラクション状態遷移

前提状態:

- `activeIndex = hoverIndex ?? pinnedIndex`
- `isPinned = pinnedIndex !== null && hoverIndex === null`

| 操作 | hoverIndex | pinnedIndex | 補足 |
|---|---|---|---|
| マウス移動 | 対象 column index に更新 | 変更なし | active は hover 優先。 |
| マウスでチャート外へ出る | `null` | 変更なし | pinned は維持。 |
| タッチ開始 | 対象 column index に更新 | 変更なし | `onPointerDown` 必須。 |
| タッチ終了 / `pointerleave` | `null` または実装規約値 | `pinnableTooltip=true` なら最終 hover を反映 | iPad/Safari 互換の特別処理を残す。 |
| クリック same column | 変更なし/`null` | 解除して `null` | `pinnableTooltip=true` 時。 |
| クリック another column | 対象 index | 対象 index へ更新 | `pinnableTooltip=true` 時。 |
| チャート外クリック | `null` | `null` | `document pointerdown` で解除。 |
| `animationKey` 変更 | `null` | `null` | 再アニメに合わせて状態初期化。 |
| 凡例 ON/OFF | 必要に応じ再計算 | 維持（対象が消える場合は安全に解除） | visible series が変わる。 |
| スライダー移動 | 視認対象外なら解除可 | 維持/解除は実装整合 | `startIndex` 変更だけで再アニメしない。 |

---

## 8. 合計値表示オプション（tooltip）

- `showTooltipTotal=false` が既定。
- `showTooltipTotal=true` の場合だけ合計行を表示。
- `tooltipTotalLabel` 既定値は `合計`。
- `tooltipTotalMode` 既定値は `visible`。
- `visible`: `hiddenSeriesKeys` を除外して合計。
- `all`: `hiddenSeriesKeys` を無視して全系列合計。
- 合計値は `sanitizeStackedValue` 後の値で計算。
- 合計行は **タイトルの下、系列一覧の上** に表示。

```ts
const tooltipTotal = showTooltipTotal
  ? series.reduce((sum, item) => {
      if (tooltipTotalMode === 'visible' && hiddenSeriesKeys.has(item.key)) {
        return sum;
      }
      return sum + sanitizeStackedValue(row.values[item.key]);
    }, 0)
  : null;
```

---

## 9. CSS 仕様（クラス責務 + 変数）

### 9.1 クラス責務

- `.sbwc-root`: 全体コンテナ。
- `.sbwc-legend-row`: 凡例行レイアウト。
- `.sbwc-legend`: 凡例リスト。
- `.sbwc-legend-item`: 凡例ボタン単位。
- `.sbwc-chart-host`: SVG と tooltip の位置基準。
- `.sbwc-svg`: SVG 本体。
- `.sbwc-bars`: 棒グループ。
- `.sbwc-bar`: 個別セグメント + アニメ適用。
- `.sbwc-column-highlight`: hover/pinned 列ハイライト。
- `.sbwc-tooltip-positioner`: tooltip 絶対配置ラッパ。
- `.sbwc-tooltip`: tooltip 本体。
- `.sbwc-tooltip-arrow`: tooltip 矢印。
- `.sbwc-tooltip-total`: 合計行。
- `.sbwc-controls`: 下部操作行。
- `.sbwc-nav-button`: 前後ボタン。
- `.sbwc-slider-root`: slider ルート。
- `.sbwc-empty`: 空状態表示。

### 9.2 CSS 変数

- `--bar-delay`: 棒アニメ遅延。
- `--sbwc-tooltip-fill`: tooltip 矢印塗り。
- `--sbwc-tooltip-border`: tooltip 矢印枠線。
- `--sbwc-tooltip-arrow-x`: tooltip 矢印の X 位置。

矢印位置は以下を必須利用。

```css
.sbwc-tooltip-arrow {
  margin-left: calc(var(--sbwc-tooltip-arrow-x, 90px) - 7px);
}
```

---

## 10. アクセシビリティ仕様

- `svg` は `role="img"` を持ち、`aria-label` は `ariaLabels.chart` を使う。
- 凡例コンテナは `role="group"`。
- 凡例ボタンは `aria-pressed` を持つ。
- スライダー操作領域は `role="group"`。
- 空状態は `role="status"` + `aria-live="polite"`。
- pinnedBadge は `aria-label` を持つ。

既定ラベル:

```ts
{
  chart: '積み上げ棒グラフ',
  legend: '系列の表示切り替え',
  slider: '表示範囲の開始位置',
  prevButton: '前の表示範囲へ',
  nextButton: '次の表示範囲へ',
  windowControls: '表示範囲の操作',
  pinnedBadge: '固定中',
}
```

---

## 11. アニメーション仕様

- 棒は CSS keyframes で `scaleY(0) → scaleY(1)`。
- `animationKey` が変わると `<g key={animationKey}>` 再マウントで再アニメーション。
- `startIndex` のみ変更では `animationKey` は変えない設計とし、再アニメーションしない。
- `prefers-reduced-motion: reduce` ではアニメーションを抑制する。

---

## 12. 実装メモ（再現時の判断固定）

- `StackedBarWindowChart.tsx` で `data` と `series` の空判定を行い、空状態を返す。
- `visibleSeries = series.filter((s) => !hiddenSeriesKeys.has(s.key))` を基本とする。
- `maxStartIndex = Math.max(0, data.length - windowSize)`。
- `startIndex` は常に clamp 後の値を利用。
- 合計・積み上げ・y-domain 計算は sanitize 後数値で行う。

---

## 13. 受け入れ条件（実装者チェックリスト）

1. `npm run build` が成功する。
2. `offsetX` を使っていない。
3. iPad / Safari でタップして tooltip が出る。
4. 左端・右端で tooltip 本体がはみ出さない。
5. 左端・右端で矢印が棒方向を指す。
6. `showTooltipTotal` 未指定では合計が出ない。
7. `showTooltipTotal=true` で合計が出る。
8. `tooltipTotalMode=visible` で hidden 系列を除外する。
9. `tooltipTotalMode=all` で hidden 系列も含める。
10. `data=[]` または `series=[]` で空状態を表示する。
11. `null / undefined / NaN / Infinity / 負値` で描画が壊れない。
12. 凡例 ON/OFF が機能する。
13. スライダー移動で表示窓が変わる。
14. スライダー移動だけでは再アニメーションしない。
15. `prefers-reduced-motion` でアニメーションが抑制される。

---

## 14. 禁止事項

- SPEC.md の詳細仕様を削って短縮しない。
- `ChartTooltip` に座標計算を持たせない。
- `StackedBarChart` の hover/touch/pinned 処理を簡略化しない。
- `offsetX` を使わない。
- tooltip arrow の CSS 変数名を変更しない。
- `showTooltipTotal` を既定 true にしない。
- 合計値を常時表示にしない。
- ドメイン固有語彙（売上、金額、通貨など）を feature 内に入れない。


---

## 15. 利用例

```tsx
import { useState } from 'react';
import { StackedBarWindowChart } from '@/features/stacked-bar-window-chart';
import type { StackedDataPoint, StackedSeries } from '@/features/stacked-bar-window-chart';

type SeriesKey = 'alpha' | 'beta' | 'gamma';

const series: StackedSeries<SeriesKey>[] = [
  { key: 'alpha', label: 'Alpha', color: '#4e79a7' },
  { key: 'beta', label: 'Beta', color: '#f28e2b' },
  { key: 'gamma', label: 'Gamma', color: '#59a14f' },
];

const data: StackedDataPoint<SeriesKey>[] = [
  {
    key: '2026-01',
    axisLabel: '1月',
    tooltipLabel: '2026年1月',
    values: { alpha: 30, beta: 12, gamma: 8 },
  },
  {
    key: '2026-02',
    axisLabel: '2月',
    tooltipLabel: '2026年2月',
    values: { alpha: 28, beta: 15, gamma: 10 },
  },
];

const theme = {
  background: 'transparent',
  gridColor: 'var(--border)',
  tooltipBg: 'var(--bg)',
  tooltipBorder: 'var(--border)',
};

export function Demo() {
  const [hidden, setHidden] = useState<Set<SeriesKey>>(new Set());
  const [startIndex, setStartIndex] = useState(0);

  const handleToggleSeries = (key: SeriesKey) => {
    setHidden((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  return (
    <StackedBarWindowChart
      data={data}
      series={series}
      hiddenSeriesKeys={hidden}
      onToggleSeries={handleToggleSeries}
      windowSize={6}
      startIndex={startIndex}
      onStartIndexChange={setStartIndex}
      theme={theme}
      showTooltipTotal
      tooltipTotalMode="visible"
      tooltipTotalLabel="合計"
      pinnableTooltip
    />
  );
}
```

- ドメイン固有語彙は呼び出し側で持つ。
- feature 内には売上、金額、通貨などの語を入れない。
- 表示値の単位やフォーマットは `formatValue` で注入する。

---

## 16. 依存パッケージ

| パッケージ | バージョン目安 | 用途 |
|---|---|---|
| `react` / `react-dom` | `^19.x` | コンポーネント・hooks |
| `d3-array` | `^3.x` | max / 集計補助 |
| `d3-format` | `^3.x` | 既定の数値フォーマッタ |
| `d3-scale` | `^4.x` | scaleBand / scaleLinear |
| `@radix-ui/react-slider` | `^1.x` | ウィンドウ移動スライダー |

- `@types/d3-*` が必要になる場合がある。
- この機能は Recharts に依存しない。
- SVG + d3-scale + Radix Slider の構成である。

---

## 17. レイアウト図

```text
┌──────────────────────────────────────────────────────────┐
│ Legend: 系列の表示切り替え + legendActions                │
├──────────────────────────────────────────────────────────┤
│ SVG Chart: 積み上げ棒 + X/Y軸 + グリッド + Tooltip         │
├──────────────────────────────────────────────────────────┤
│ Window Controls: ◀ rangeLabel + Slider ▶                 │
└──────────────────────────────────────────────────────────┘
```

- Legend は `ChartLegend`。
- SVG Chart は `StackedBarChart`。
- Window Controls は `WindowSlider`。
- `StackedBarWindowChart` がこれらを縦に合成する。

---

## 18. テーマ設計

- `theme` は背景、グリッド、tooltip 背景、tooltip 枠線のみを持つ。
- 系列色は `theme` ではなく `series[i].color` が持つ。
- 色テーマと系列定義の責務を分ける。
- CSS 変数を使うことでライト/ダークテーマに対応しやすい。
- `theme.background='transparent'` で親カード背景を透過できる。

```ts
const lightTheme = {
  background: 'transparent',
  gridColor: 'var(--border)',
  tooltipBg: 'var(--bg)',
  tooltipBorder: 'var(--border)',
};

const darkTheme = {
  background: 'transparent',
  gridColor: 'var(--border)',
  tooltipBg: 'var(--bg)',
  tooltipBorder: 'var(--border)',
};
```

`series.color` は consumer 側でテーマに応じて差し替えてよい。  
ただし feature 内では色パレットを固定しない。

---

## 19. 他リポジトリへの移植手順

1. `src/features/stacked-bar-window-chart/` 一式をコピーする。
2. `index.ts` を import できるようにパス設定を確認する。
3. CSS カスタムプロパティを親プロジェクトで定義する。
4. 必要な依存パッケージをインストールする。
5. 呼び出し側で `series / data / theme / callbacks` を用意する。
6. build する。
7. iPad / Safari と左右端 tooltip を確認する。

```css
:root {
  --text: #333;
  --text-h: #111;
  --bg: #fff;
  --border: #e0e0e0;
  --accent: #646cff;
}
```

---

## 20. 将来拡張ポイント

| 拡張 | 実装方針 |
|---|---|
| 値ラベル表示 | 各セグメント中央、または棒上端に `<text>` を追加する。 |
| 構成比表示 | tooltip 行に percentage を追加する。既定OFFにする。 |
| formatter分離 | `formatValue` を axis / tooltip / total 別に分ける。 |
| 折れ線併用 | `stackSegments` 計算後に `<path>` renderer を追加する。 |
| legendPosition | `top` / `bottom` / `none` を選べるようにする。 |
| 範囲スライダー | Radix Slider を2 thumb化して start/end を扱う。 |
| 上下方向 tooltip placement | 上に出せない場合だけ下に出す。 |
| compact layout | chartWidth に応じて margin / height / label密度を切り替える。 |

- 拡張は既定OFFを基本とする。
- 汎用性を壊すドメイン固有機能は入れない。
- 既存の iPad / Safari 対応、tooltip clamp、arrowX 補正を壊さない。
