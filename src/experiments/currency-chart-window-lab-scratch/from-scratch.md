# Recharts を使わない再実装仕様 (currency-chart-window-lab / scratch)

このドキュメントは、現在の通貨デモに閉じず、**任意の積み上げ系列データへ転用可能**な構成を前提にした仕様です。
`currency-chart-window-lab` の UI/UX（表示期間トグル、凡例 ON/OFF、スライダーによる表示ウィンドウ制御）に加え、**系列を段階的に追加する操作**も含めて、データモデルと描画コンポーネントをライブラリ化しやすい形に整理します。

---

## 1. 設計方針（汎用化）

1. **系列をハードコードしない**
   - `USD/EUR/...` の固定フィールドは使わず、`SeriesDefinition[]` と `row.values` を使う。
2. **描画層をデータソース非依存にする**
   - `BarChartSvg`, `ChartLegend`, `ChartTooltip`, `buildScales` は `Key extends string` のジェネリクスで実装する。
3. **アプリ固有ロジックを外側へ寄せる**
   - 期間切り替え・スライダー制御・表示系列数の管理・ダミーデータ生成はコンテナ（`index.tsx` / `data.ts`）に置く。

---

## 2. コア型

```ts
interface SeriesDefinition<Key extends string> {
  key: Key;
  label: string;
  color: string;
}

interface ChartRow<Key extends string> {
  key: string;        // x 軸識別子
  label: string;      // tooltip 用の詳細ラベル
  monthLabel: string; // x 軸短縮ラベル
  values: Record<Key, number>;
}
```

### 通貨デモでの適用例（現行実装）

- `CURRENCY_SERIES` は `SeriesDefinition[]` として定義。
- `buildData()` は `TOTAL_MONTHS=36` / `CURRENT_INDEX=18` を基準に、現在月の前後データを生成する。
- 各行は `{ key, label, monthLabel, values }` 形式で返す（`label` は `YYYY年M月`、`monthLabel` は `M月`）。

この形式に揃えることで、同じ描画コンポーネントを「部門別売上」「カテゴリ別消費」「リージョン別KPI」等へそのまま流用できます。

---

## 3. 汎用コンポーネント仕様

### 3.1 `BarChartSvg<Key>`

- 入力:
  - `chartData: ChartRow<Key>[]`
  - `series: SeriesDefinition<Key>[]`
  - `hiddenSeriesKeys: Set<Key>`
  - `animationKey: string`
- 処理:
  - 可視系列（`!hiddenSeriesKeys.has(key)`）のみで積み上げセグメント計算。
  - y 軸ドメインは「可視系列合計の最大値」に再フィット。
  - hover index に応じて該当列以外の opacity を下げる。
  - ResizeObserver で親幅を監視し、レスポンシブに再描画する。
  - `animationKey` をキーに棒アニメーションを再起動する（表示期間変更・系列追加時）。

### 3.2 `buildScales<Key>`

- `visibleSeriesKeys: Key[]` を受け取り、`row.values[key]` の合計で `stackedTotalMax` を算出。
- ドメイン 0 のみになる場合は `[0,1]` を使って描画崩れを回避。

### 3.3 `ChartLegend<Key>` / `ChartTooltip<Key>`

- `series` メタデータを唯一の表示ソースにする。
- ラベル・色の参照先を `series` に集約し、データキー直書きを禁止。
- Tooltip は `hiddenSeriesKeys` を参照し、非表示系列は表示しない。

---

## 4. コンテナ責務（デモ実装）

`index.tsx` は以下を担当:

- `selectedRange` / `startIndex` / `hiddenSeriesKeys` state 管理
- `currencyCount` state 管理（初期 5 件から `+ 通貨を追加` ボタンで段階追加）
- 表示ウィンドウ (`safeStartIndex ~ endIndex`) の算出
- `activeSeries = CURRENCY_SERIES.slice(0, currencyCount)` の算出
- `ChartLegend` と `BarChartSvg` に同一 `activeSeries` と `hiddenSeriesKeys` を渡す
- `animationKey = ${selectedRange}-${currencyCount}` の管理

この分離により、将来的に以下へ置き換え可能:

- データソース: ダミーデータ → API レスポンス
- x 軸ラベル: 月次 → 日次/四半期
- 系列定義: 通貨 → 任意カテゴリ

---

## 5. 実装メモ（現行で満たしている点）

1. `buildScales` は可視系列の合計最大値を計算し、合計が 0 の場合は `[0,1]` ドメインを使用する。
2. X 軸は帯域幅に応じてラベル間引き（`showAll` 判定）とフォントサイズ調整を行う。
3. Tooltip は右端でのはみ出しを避けるために左右反転配置を行う。

---

## 6. 将来拡張ポイント

1. `ChartRow` の `monthLabel` を `xTickLabel` 等へリネームし、時系列以外に適用。
2. `Tooltip` の表示フォーマッタを props 注入可能にする（通貨・比率・小数桁対応）。
3. 積み上げ以外（grouped/line）を同じデータモデルで描画できるよう、`renderer` 戦略を追加。
