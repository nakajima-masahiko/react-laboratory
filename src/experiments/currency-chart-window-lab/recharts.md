# Recharts 設定メモ (currency-chart-window-lab)

この実験で使用している Recharts のコンポーネント構成と、各プロパティを選択した理由をまとめる。Recharts 固有の注意点や挙動の根拠については [`docs/library-notes.md`](../../../docs/library-notes.md) にも記録している。

## コンポーネント構成

```
ResponsiveContainer
└── BarChart
    ├── CartesianGrid
    ├── XAxis
    ├── YAxis
    ├── Tooltip
    ├── Legend
    ├── Bar × 5 (USD / EUR / GBP / JPY / BTC を同じ stackId でスタック)
    └── Brush
```

## 各コンポーネントの設定

### `ResponsiveContainer`

- `width="100%"` / `height={460}` でレスポンシブに幅を確保。
- `key={chartNonce}` を指定し、ウィンドウリサイズや表示月数変更時に強制的に再マウントする。Recharts はリサイズ検知が不安定な場合があるため、外部のイベントを契機に再マウントして再描画を保証している。

### `BarChart`

- `data` には 36 ヶ月分全てを渡し、`Brush` 側で `startIndex` / `endIndex` による表示範囲制御を行っている。
- `margin={{ top: 8, right: 24, left: 0, bottom: 24 }}` で `Brush` 下部に余白を確保。

### `XAxis`

- `dataKey="key"` を `YYYY-M` 形式のユニークキーに合わせる。
- `interval={0}` で全てのティックを表示。
- `tickFormatter={(value) => monthLabelByKey.get(value) ?? ''}` でユニークキーから月ラベルを引く。`(value, index)` の `index` は `Brush` でスライスされた**表示範囲内での相対位置**になるため、`index` で元データ配列を参照するとブラシ操作に追従しない（詳細は [`docs/library-notes.md`](../../../docs/library-notes.md#xaxis-の-tickformatter-と-brush-の組み合わせ) を参照）。

### `YAxis`

- 既定のスケールを使用し、ラベル色のみテーマ変数で上書き。

### `Tooltip`

- `labelFormatter={(_, payload) => payload?.[0]?.payload?.label ?? ''}` で `YYYY年M月` 形式の完全ラベルを表示。
- `contentStyle` でダーク／ライトテーマの CSS 変数に合わせて配色。

### `Legend`

- `verticalAlign="top"` でチャート上部に配置。
- `wrapperStyle={{ paddingBottom: 16 }}` でチャート本体との間隔を確保。

### `Bar`

- `stackId="holdings"` を全 `Bar` に共通指定し、通貨別に積み上げ表示。
- `isAnimationActive` + `animationBegin={index * 120}` で順番にアニメーションを開始。

### `Brush`

- `dataKey="key"` でユニークキーを基に表示範囲を制御。
- `startIndex` / `endIndex` はトグルグループで選択した月数 (`visibleMonths`) を反映する形で `state` から算出。
- `onChange` は「どの端が動いたか」を現在のインデックスと比較して判定し、常に幅が `visibleMonths` に保たれる `startIndex` を計算する。これは `Brush` の内部状態がハンドル操作で変化しても、**プロパティ値が前回と同じであれば再同期しない**ためで、`startIndex` もしくは `endIndex` のいずれかを必ず変化させることで視覚的なリサイズをキャンセルしている（詳細は [`docs/library-notes.md`](../../../docs/library-notes.md#brush-の幅を固定する) を参照）。
- `travellerWidth={0}` とし、左右ハンドルのドラッグによるリサイズを無効化。`height={34}` はブラシ本体のドラッグ操作しやすさを維持するために確保。

## 関連ドキュメント

- [`docs/library-notes.md`](../../../docs/library-notes.md): 複数実験で共有する Recharts 固有の調査メモ。
