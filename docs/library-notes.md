# ライブラリ調査メモ

期待通りに動作しないなどの理由でライブラリを調査した際に、同様の再調査を避けるための記録を残す。

## Recharts

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
