# Recharts を使わない再実装仕様 (currency-chart-window-lab)

`currency-chart-window-lab` で実現している「36ヶ月の積み上げ棒グラフ＋表示範囲スライダー＋表示月数トグル」を、Recharts を使用せずに一から作成する場合の仕様をまとめる。スライダー部分は Recharts の `Brush` の代替として **Radix UI Slider (`@radix-ui/react-slider`)** を使用する前提とする。

## 1. 全体構成

```
<CurrencyChartWindowLab>
├─ <Header>                    ヘッダー（タイトル・説明・期間トグル）
│   └─ Radix ToggleGroup       1/3/6/12ヶ月の切替（既存と同じ）
└─ <ChartCard>
    ├─ <ChartLegend>           凡例（クリックで通貨表示の ON/OFF）
    ├─ <ResizeObserverHost>    幅を観測するラッパー
    │   └─ <BarChartSVG>       SVG で自前描画する棒グラフ
    │       ├─ <YAxis>         グリッド付き左軸
    │       ├─ <XAxis>         月ラベルの下軸
    │       ├─ <StackedBars>   通貨別の積み上げ棒（<g>×N列）
    │       └─ <HoverLayer>    マウス／タッチ位置検出用の透明な <rect>
    ├─ <ChartTooltip>          フローティングツールチップ（DOM、SVG外）
    └─ <RangeControls>
        ├─ <PrevButton>        前の月へ
        ├─ Radix Slider        表示開始月（startIndex）
        └─ <NextButton>        次の月へ
```

## 2. データモデル

既存実装（`index.tsx`）と同一の構造を維持する。

```ts
const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'BTC'] as const;
type Currency = (typeof CURRENCIES)[number];

interface ChartRow {
  key: string;        // 'YYYY-M' のユニークキー
  label: string;      // 'YYYY年M月'
  monthLabel: string; // 'M月'
  USD: number; EUR: number; GBP: number; JPY: number; BTC: number;
}
```

- 全期間 `TOTAL_MONTHS = 36`、現在月のインデックス `CURRENT_INDEX = 18`。
- `buildData()` でダミーデータを生成（既存実装と同一の `createAmount()` を流用）。

## 3. 状態管理

| state | 型 | 用途 |
| --- | --- | --- |
| `selectedRange` | `'1' \| '3' \| '6' \| '12'` | トグルで選択中の表示月数 |
| `startIndex` | `number` | 表示ウィンドウの先頭月インデックス（0〜`maxStartIndex`） |
| `hiddenCurrencies` | `Set<Currency>` | 凡例クリックで非表示にした通貨 |
| `hoverIndex` | `number \| null` | ツールチップ表示中の月インデックス |
| `chartWidth` | `number` | ResizeObserver で観測した SVG 幅 |

`visibleMonths`、`maxStartIndex`、`endIndex`、`chartData` は既存実装と同じ式で導出する派生値。

## 4. レイアウトとスケール

### 4.1 SVG のサイズ

- 高さは固定（既存と合わせて `460px`）。
- 幅は親要素のリサイズに追従させるため、`ResizeObserver` でラッパー要素の `clientWidth` を観測し `chartWidth` state に反映する（Recharts の `ResponsiveContainer` 相当）。
- `viewBox` は使わず、`width` / `height` 属性に実ピクセル値を直接設定する（テキストの自動拡大を防ぐ）。

### 4.2 描画領域（margin）

```ts
const margin = { top: 8, right: 24, bottom: 32, left: 56 };
const innerWidth  = chartWidth  - margin.left - margin.right;
const innerHeight = chartHeight - margin.top  - margin.bottom;
```

### 4.3 スケール

`d3-scale` を採用する（同パッケージは依存に追加済み）。

```ts
import { scaleBand, scaleLinear } from 'd3-scale';

const xScale = scaleBand<string>()
  .domain(chartData.map((d) => d.key))
  .range([0, innerWidth])
  .paddingInner(0.2)
  .paddingOuter(0.1);

const stackedTotalMax = max(chartData, (row) =>
  CURRENCIES
    .filter((c) => !hiddenCurrencies.has(c))
    .reduce((sum, c) => sum + row[c], 0),
) ?? 0;

const yScale = scaleLinear()
  .domain([0, stackedTotalMax])
  .nice(5)
  .range([innerHeight, 0]);
```

- `y` のドメインは「表示中の通貨だけを足した最大値」を `nice()` で丸める。これにより、凡例で通貨を非表示にすると軸が再フィットする。
- ティック値は `yScale.ticks(5)` を使用。

## 5. SVG コンポーネント仕様

### 5.1 `<YAxis>`

- `yScale.ticks(5)` ごとに横方向のグリッド線（`<line>`、`stroke-dasharray="3 3"`、色は `var(--border)`）を引く。
- 同じ位置に `<text>` で値ラベル（`d3-format` の `format(',')` で桁区切り）を表示。
- 文字色は `var(--text)`、フォントサイズ `13px`。

### 5.2 `<XAxis>`

- `xScale.domain()` の各キーに対し `<text>` を `xScale(key) + xScale.bandwidth() / 2` の位置に中央揃えで配置。
- ラベルは `chartData[i].monthLabel`（例: `5月`）。
- 表示月数が多い（例: 12ヶ月）場合に文字が重なるなら、`text-anchor="end"` で `transform="rotate(-30 x y)"` を付ける案をオプションとして用意する。
- Recharts の `tickFormatter` ハマりポイント（[`docs/library-notes.md`](../../../docs/library-notes.md#xaxis-の-tickformatter-と-brush-の組み合わせ)）は、自前描画なら index がそのまま `chartData` の絶対位置として扱えるため発生しない。

### 5.3 `<StackedBars>`

通貨ごとに `<g>` を作り、各月の棒を `<rect>` で描く。

```ts
let cumulative = new Array(chartData.length).fill(0);
for (const currency of CURRENCIES) {
  if (hiddenCurrencies.has(currency)) continue;
  chartData.forEach((row, i) => {
    const yTop    = yScale(cumulative[i] + row[currency]);
    const yBottom = yScale(cumulative[i]);
    // <rect x={xScale(row.key)} y={yTop} width={xScale.bandwidth()} height={yBottom - yTop} fill={COLORS[currency]} />
    cumulative[i] += row[currency];
  });
}
```

- 色は既存の `COLORS` を流用。
- ホバー中の月の棒は `opacity` を強調（例: 他の月は `0.5`、当月は `1.0`）。

### 5.4 アニメーション

Recharts の `animationBegin={index * 120}` 相当を CSS Transition で再現する。

- 各 `<rect>` に CSS 変数 `--bar-delay: ${currencyIndex * 120}ms` を渡す。
- 初期マウント時は `transform: scaleY(0); transform-origin: bottom;` から `scaleY(1)` へ `transition: transform 700ms var(--bar-delay) ease-out` で立ち上げる。
- `selectedRange` 変更時にも再アニメーションさせるため、SVG 全体に `key={selectedRange}` を付けて再マウントする（Recharts 版の `chartNonce` と同等の役割）。

### 5.5 `<HoverLayer>`

- `<rect width={innerWidth} height={innerHeight} fill="transparent" pointer-events="all" />` を最前面に置き、`onPointerMove` でマウス X 座標から月インデックスを逆算する。

```ts
function indexFromX(clientX: number, svgRect: DOMRect) {
  const localX = clientX - svgRect.left - margin.left;
  const step = xScale.step(); // bandwidth + padding
  return Math.max(0, Math.min(chartData.length - 1, Math.floor(localX / step)));
}
```

- `onPointerLeave` で `hoverIndex` を `null` に戻す。
- タッチデバイスでも動くよう `touch-action: pan-y` を CSS で指定。

## 6. ツールチップ

- DOM 要素（`<div role="tooltip">`）として SVG の外に置き、`position: absolute` で配置する。
- `hoverIndex` から `chartData[hoverIndex]` を引き、月ラベル（`label`）と各通貨の値を縦並びで表示。
- 配置は SVG 上のホバー位置を基準に、右にはみ出すなら左側に反転する。
- 背景・枠線・文字色は CSS 変数（`var(--bg)` / `var(--border)` / `var(--text)`）を使い、ダークモードに追従。

## 7. 凡例

- `<ul>` ＋ `<button>` で実装。各ボタンに通貨色のスウォッチ（`<span>` の背景色）とラベル。
- クリックで `hiddenCurrencies` のトグル。非表示中はスウォッチに `opacity: 0.35` と取消線を付ける。
- `aria-pressed` で状態を伝える。

## 8. Radix UI Slider による表示範囲制御

Recharts の `Brush` を `@radix-ui/react-slider` の単一サムスライダーに置き換える。

### 8.1 依存追加

```bash
npm install @radix-ui/react-slider
```

### 8.2 スライダーの値設計

- スライダーは「表示ウィンドウの**先頭月インデックス**」を表す **単一サム**。`Brush` の幅固定運用と同じ意味になる。
- 範囲: `min=0` / `max=maxStartIndex` / `step=1`。
- `value={[safeStartIndex]}`、`onValueChange={([v]) => setStartIndex(v)}`。

### 8.3 マークアップ

```tsx
<Slider.Root
  className="ccw-slider-root"
  value={[safeStartIndex]}
  min={0}
  max={maxStartIndex}
  step={1}
  onValueChange={([v]) => setStartIndex(v)}
  aria-label="表示する月"
>
  <Slider.Track className="ccw-slider-track">
    <Slider.Range className="ccw-slider-range" />
  </Slider.Track>
  <Slider.Thumb className="ccw-slider-thumb" />
</Slider.Root>
```

### 8.4 スタイル

- `Slider.Track` … 高さ `4px`、`var(--border)` 背景、左右 `border-radius: 9999px`。
- `Slider.Range` … `var(--accent)` で塗りつぶし。
- `Slider.Thumb` … 18px の円、`var(--accent)` 縁取り、フォーカス時に `box-shadow: 0 0 0 4px color-mix(in oklab, var(--accent) 30%, transparent)`。
- 上部に「現在の表示範囲（`startLabel 〜 endLabel`）」を `<span>` で表示。
- レイアウトは既存の `.ccw-controls`（`grid-template-columns: 36px minmax(0,1fr) 36px`）を流用。

### 8.5 期間トグルとの連動

`selectedRange` 変更時の挙動は既存実装を踏襲する。

```ts
const handleRangeChange = (value: RangeValue) => {
  setSelectedRange(value);
  const nextVisibleMonths = RANGE_OPTIONS.find((o) => o.value === value)!.months;
  const nextMaxStart = Math.max(0, data.length - nextVisibleMonths);
  setStartIndex(Math.min(CURRENT_INDEX, nextMaxStart));
};
```

- `nextMaxStart` を超える `startIndex` は `Math.min` で丸める。
- スライダーは制御コンポーネントなので、`max` の縮小に伴い `value` が範囲外になることはこの丸めで防ぐ。

### 8.6 ナビゲーションボタン

- 既存と同じ `‹` / `›` ボタンを左右に配置し、それぞれ `setStartIndex(prev => prev ∓ 1)` を行う。
- `safeStartIndex <= 0` / `>= maxStartIndex` で `disabled` 化。
- キーボード操作は Radix Slider が `←` `→` `Home` `End` `PageUp` `PageDown` を提供するので、ボタン側は補助的な役割になる。

## 9. アクセシビリティ要件

- スライダー: `aria-label="表示する月"` と `aria-valuetext={rangeLabel}` を追加し、スクリーンリーダーで「2024年5月 〜 2024年10月」のように読み上げさせる。
- 期間トグル: 既存の Radix `ToggleGroup` 構成を踏襲。
- 棒グラフ本体: `<svg role="img" aria-label="通貨別つみたて棒グラフ">` とし、表は別途 `<table>` を `visually-hidden` で提供する案を残す（あれば理想、必須ではない）。
- 凡例ボタンは `aria-pressed` で表示状態を伝える。
- ホバーレイヤーは `aria-hidden="true"`（情報はツールチップで補えないため、フォーカス可能な軸ラベルやテーブル代替に頼る）。

## 10. レスポンシブ対応

- ラッパー要素を `ResizeObserver` で観測し、`chartWidth` を更新（throttle 不要。React 19 のバッチで十分）。
- `chartWidth` が `0`（初期マウント直後）のときは描画をスキップし、最初の Observer コールバックで初描画する。
- `window.resize` / `orientationchange` の手動ハンドラは不要（ResizeObserver で十分）。
- 表示月数が多いときの X 軸ラベル衝突対策として、`xScale.bandwidth()` が一定値（例: 28px）未満になったら `font-size` を下げ、さらに小さければ `M月` を奇数番目だけ表示するなどのフォールバックを検討。

## 11. テーマ対応

- 既存の CSS 変数（`--text` / `--bg` / `--border` / `--accent` / `--accent-light`）を全要素で使用。
- 通貨色（`COLORS`）は固定だが、軸・グリッド・ツールチップ枠はテーマ変数を参照する。
- ハードコードした色を SVG 内に書かない（dark/light モードで破綻するため）。

## 12. ファイル構成（推奨）

```
src/experiments/currency-chart-window-lab-scratch/
├─ index.tsx                    エントリ＋状態管理
├─ chart/
│  ├─ BarChartSvg.tsx           SVG 描画本体
│  ├─ axes.tsx                  XAxis / YAxis サブコンポーネント
│  ├─ legend.tsx                凡例
│  ├─ tooltip.tsx               ツールチップ
│  └─ scales.ts                 スケール生成のヘルパー
├─ data.ts                      buildData / createAmount
├─ types.ts                     共有型
└─ styles.css                   既存 styles.css をベースに拡張
```

- 既存の `currency-chart-window-lab` とは別実験として登録し、`registry.ts` に追加する。
- 上位コンポーネントは ~150行を目標に、SVG 描画は `BarChartSvg.tsx` に閉じ込める。

## 13. 既存実装と比べた利点 / トレードオフ

| 観点 | Recharts 版 | 自前実装版 |
| --- | --- | --- |
| バンドルサイズ | Recharts ≒ 100KB+（gzip） | d3-scale / d3-array / d3-format で ~15KB 程度に削減可 |
| アニメーション制御 | ライブラリ任せ | CSS Transition で完全制御。`Brush` 由来の再マウント workaround が不要 |
| `Brush` の幅固定問題 | `onChange` で補正が必要 | Radix Slider の単一サムにより本質的に発生しない |
| `tickFormatter` の index ズレ | 注意が必要 | 自前描画で発生しない |
| 開発コスト | 低 | 中（軸・ツールチップ・凡例を全て自前で書く） |
| 型安全性 | Recharts の型に依存 | プロジェクト内で完結。`any` 不要 |

## 14. 実装着手前のチェックリスト

- [ ] `@radix-ui/react-slider` を `package.json` に追加
- [ ] `d3-scale` / `d3-array` / `d3-format` の使用箇所を整理（既に依存済み）
- [ ] `registry.ts` に新実験エントリを追加（タイトル例: `通貨別つみたて棒グラフ（自前描画版）`）
- [ ] 既存 `currency-chart-window-lab` から `data.ts` 相当を分離するか、コピーするかを決定（実験は相互に import しない方針のためコピー推奨）
- [ ] `noUnusedLocals` / `noUnusedParameters` 環境で `d3-*` の型を `import type` で取り込む
