# ライブラリ調査メモ

期待通りに動作しないなどの理由でライブラリを調査した際に、同様の再調査を避けるための記録を残す。

## Recharts

各実験固有の Recharts 設定の詳細は、その実験フォルダ内の `recharts.md` にまとめている。

- [currency-chart-window-lab](../src/experiments/currency-chart-window-lab/recharts.md)

### `XAxis` の `tickFormatter` と `Brush` の組み合わせ

`XAxis` の `tickFormatter` は `(value, index) => string` の形で呼び出されるが、`Brush` で表示範囲を変更した場合の `index` はデータ配列全体における絶対インデックスではなく、表示中のスライス内での相対位置になる。

そのため `tickFormatter={(_, index) => data[index]?.label}` のように `index` で元データ配列を参照すると、ブラシを左右にドラッグしても目盛りのラベルが常に先頭から数えた位置のものになってしまい、表示位置に連動しない。

**対策:** `dataKey` に指定したユニークキー（`value` 側）で元データを引く。

```tsx
const monthLabelByKey = useMemo(
  () => new Map(data.map((row) => [row.key, row.monthLabel])),
  [data],
);

<XAxis
  dataKey="key"
  tickFormatter={(value: string) => monthLabelByKey.get(value) ?? ''}
/>
```

参考: `src/experiments/currency-chart-window-lab/index.tsx`

### `Brush` の幅を固定する

`Brush` の左右のハンドル（traveller）は標準でドラッグによるリサイズが可能。外部から `startIndex` / `endIndex` を渡して制御していても、`getDerivedStateFromProps` が同値検知でしか再同期しないため、`onChange` でプロパティ値を変えなければブラシ内部状態のリサイズ結果が視覚的に残る。

**対策:** `onChange` で「どのハンドルが動いたか」を現在のインデックスと比較して判定し、常に幅（`visibleMonths`）が保たれる `startIndex` を計算して state を更新する。右ハンドルが動いたと判定したときは `nextStart = endIndex - visibleMonths + 1` とすることで、`startIndex` / `endIndex` プロパティがどちらも新しい値になり Brush が再同期する。

```tsx
onChange={(range) => {
  if (typeof range.startIndex !== 'number' || typeof range.endIndex !== 'number') {
    return;
  }
  const rightEdgeMoved =
    range.startIndex === safeStartIndex && range.endIndex !== endIndex;
  const nextStart = rightEdgeMoved
    ? range.endIndex - visibleMonths + 1
    : range.startIndex;
  setStartIndex(Math.max(0, Math.min(nextStart, maxStartIndex)));
}}
```

この方式では、両端のハンドルとボディのいずれをドラッグしてもウィンドウの幅は固定され、移動のみが反映される。

参考: `src/experiments/currency-chart-window-lab/index.tsx`
