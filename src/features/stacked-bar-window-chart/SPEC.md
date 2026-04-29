# StackedBarWindowChart 仕様書（改訂）

## 主な改修点

- ツールチップは `anchorX/anchorY` と実測サイズ（`ResizeObserver`）で位置を解決し、左右は clamp、上に出せない場合は下配置にフォールバックする。
- 矢印は `--sbwc-arrow-x` で横位置を補正し、棒中心を指す。
- `data=[]` または `series=[]` の場合は空状態メッセージを表示する。既定文言は「表示できるデータがありません」。
- `null/undefined/NaN/Infinity/負値` は内部で 0 にサニタイズする。負値は開発時のみ warning を 1 回出す。
- アニメーション制御 `animationMode` を追加。
  - `none`: 常時無効
  - `initial`: 初回のみ
  - `data-change`: データ変更時のみ（既定）
  - `always`: 常時
- `prefers-reduced-motion: reduce` では棒アニメーションと主要 transition を無効化。
- 既定 ARIA / ヒント文言を日本語化。
- 狭幅（<480px）では compact レイアウトへ切り替え、左右マージン・高さを圧縮。
- X 軸ラベルは幅と件数から表示間隔を決定し、先頭と末尾を優先表示する。

## 追加 Props

- `emptyMessage?: string`
- `animationMode?: 'none' | 'initial' | 'data-change' | 'always'`

## 既定値変更

- ARIA 既定文言: 日本語
- `pinnedHintLabel` 既定値: 「クリックで固定を解除」
- `animationMode` 既定値: `data-change`

## レスポンシブ仕様

- `chartWidth < 480` のとき:
  - `margin = { top: 8, right: 12, bottom: 28, left: 42 }`
  - `chartHeight` は `min(props.chartHeight, 320)`

