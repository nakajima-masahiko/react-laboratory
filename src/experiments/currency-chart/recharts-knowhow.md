# Currency Chart における Recharts 設定ノウハウ

このドキュメントは `src/experiments/currency-chart/index.tsx` で使っている Recharts のパラメータ・設定意図を、実装に沿って整理したものです。

## 1. データ設計のコツ

### 1-1. `BarChart` が扱いやすい形に整形する

Recharts の `BarChart` は、以下のような「1要素=1カテゴリ」の配列を想定しています。

```ts
[
  { month: '1月', USD: 120, EUR: 80, GBP: 50, JPY: 200, BTC: 30 },
  { month: '2月', USD: 135, EUR: 85, GBP: 48, JPY: 210, BTC: 35 },
  ...
]
```

実装では、`MONTHS`（X軸カテゴリ）と `RAW`（通貨別系列）から `data` を構築しています。

- `XAxis dataKey="month"` と対応するキーを持たせる。
- 各 `Bar dataKey={currency}` と対応する数値キーを同一オブジェクトに持たせる。

### 1-2. 系列キーの型を固定する

`CURRENCIES` を `as const` にして `Currency` 型を派生させることで、`COLORS` や `dataKey` のタイポを防げます。

- 通貨を増減するときに、型エラーで設定漏れを検出しやすい。
- `Record<Currency, string>` により色定義の抜け漏れ防止。

## 2. レイアウト構成 (`ResponsiveContainer` + `BarChart`)

### 2-1. `ResponsiveContainer`

```tsx
<ResponsiveContainer width="100%" height={420}>
```

- `width="100%"` で親幅に追従。
- `height={420}` で高さを固定し、縦方向の潰れを防止。
- 親要素 (`.cc-wrapper`) 側のサイズが実質的な描画基準になる点が重要。

### 2-2. `BarChart` の `margin`

```tsx
margin={{ top: 8, right: 24, left: 0, bottom: 0 }}
```

- 凡例やツールチップが重なりにくい余白を最小限で確保。
- `right` だけやや広めにして、末尾の棒と境界線の密着感を軽減。

## 3. 軸・グリッドの見やすさ調整

### 3-1. `CartesianGrid`

```tsx
<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
```

- 破線 (`strokeDasharray`) で主張を抑え、棒の視認性を優先。
- CSS 変数でテーマ連動しやすくしている。

### 3-2. `XAxis` / `YAxis` の `tick`

```tsx
<XAxis dataKey="month" tick={{ fill: 'var(--text)', fontSize: 13 }} />
<YAxis tick={{ fill: 'var(--text)', fontSize: 13 }} />
```

- `tick.fill` でダーク/ライトテーマ差分を吸収。
- `fontSize: 13` は詰まりすぎず主張しすぎない妥協点。

## 4. `Tooltip` / `Legend` の実践設定

### 4-1. `Tooltip` の `contentStyle`

```tsx
<Tooltip
  contentStyle={{
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    borderRadius: '6px',
  }}
/>
```

- 背景・境界・文字色を CSS 変数経由で統一。
- デフォルト見た目との差分を最小にしつつ、可読性を担保。

### 4-2. `Legend` の配置

```tsx
<Legend verticalAlign="top" wrapperStyle={{ paddingBottom: 16 }} />
```

- 上部配置で「どの色がどの通貨か」を先に理解させる。
- `paddingBottom` によって凡例と棒グラフ本体の干渉を回避。

## 5. `Bar` のシリーズ設定とアニメーション

### 5-1. `stackId="a"` の意味

```tsx
<Bar dataKey={currency} stackId="a" ... />
```

- 同じ `stackId` を与えた系列を積み上げ表示。
- 今回は通貨の合計量の推移も同時に把握できる構成。

### 5-2. アニメーション関連

```tsx
isAnimationActive
animationDuration={1000}
animationBegin={index * 120}
animationEasing="ease-out"
```

- `isAnimationActive`: 棒の描画をアニメーション化。
- `animationDuration={1000}`: 1秒で完了。
- `animationBegin={index * 120}`: 系列ごとに遅延し、段階的に表示。
- `ease-out`: 終了時の減速で視覚ノイズを低減。

## 6. 再描画（リフレッシュ）制御のノウハウ

### 6-1. `key` を使った明示的再マウント

```tsx
<BarChart key={chartKey} ...>
```

- `chartKey` をインクリメントして再マウントさせると、アニメーションやレイアウトを確実にリセットできる。

### 6-2. `resize` イベント + デバウンス

- `resize` のたびに即時再描画すると負荷が高い。
- 実装では `setTimeout(..., 200)` で簡易デバウンスしてから `refresh` を実行。
- `cleanup` で `removeEventListener` / `clearTimeout` を忘れない。

## 7. 拡張時の実践チェックリスト

1. 新しい通貨を追加する場合
   - `CURRENCIES` に追加
   - `RAW` の系列配列を12か月分用意
   - `COLORS` に色を追加
2. 積み上げをやめたい場合
   - `stackId` を削除（または系列ごとに別 ID）
3. ツールチップ内容を増やしたい場合
   - `Tooltip` の `formatter` / `labelFormatter` / `content` のカスタムを検討
4. レスポンシブ崩れが出る場合
   - 親要素の高さ・幅の計算条件を先に確認

## 8. この実装での設定値まとめ

- `ResponsiveContainer`: `width="100%"`, `height={420}`
- `BarChart`: `margin={{ top: 8, right: 24, left: 0, bottom: 0 }}`
- `CartesianGrid`: `strokeDasharray="3 3"`, `stroke="var(--border)"`
- `XAxis`: `dataKey="month"`, `tick={{ fill: 'var(--text)', fontSize: 13 }}`
- `YAxis`: `tick={{ fill: 'var(--text)', fontSize: 13 }}`
- `Tooltip`: `contentStyle` に背景・境界・文字色・角丸を指定
- `Legend`: `verticalAlign="top"`, `wrapperStyle={{ paddingBottom: 16 }}`
- `Bar`: `stackId="a"`, `fill`, `isAnimationActive`, `animationDuration={1000}`, `animationBegin={index * 120}`, `animationEasing="ease-out"`

---

必要なら次のステップとして、`Tooltip` カスタムコンポーネント化（増減率・前月差表示）や、`Bar` の `radius` 設定で上端丸めなどの UI 改善を追加できます。
