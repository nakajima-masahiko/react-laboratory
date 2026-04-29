/**
 * 1 系列の定義。`key` がデータと結合するための識別子、`label` が凡例 / ツールチップ表示用、
 * `color` が積み上げ棒の塗り色になる。
 */
export interface StackedSeries<Key extends string = string> {
  key: Key;
  label: string;
  color: string;
}

/**
 * 1 データ点（積み上げ棒 1 本分）。
 * `key` は X 軸内の一意キー、`axisLabel` は X 軸に表示する短いラベル、
 * `tooltipLabel` はツールチップ見出し用の詳細ラベル、`values` は系列キーごとの数値。
 */
export interface StackedDataPoint<Key extends string = string> {
  key: string;
  axisLabel: string;
  tooltipLabel: string;
  values: Record<Key, number | null | undefined>;
}

export type StackedBarAnimationMode = 'none' | 'initial' | 'data-change' | 'always';

/**
 * チャートが必要とする色トークン一式。consumer 側で複数テーマを定義し props 経由で差し替える。
 */
export interface StackedBarChartTheme {
  /** SVG チャートエリアの背景。'transparent' でカード背景を透過する */
  background: string;
  /** グリッド線の色（CSS color or var()） */
  gridColor: string;
  /** ツールチップ背景色 */
  tooltipBg: string;
  /** ツールチップ枠線色 */
  tooltipBorder: string;
}

/**
 * 数値フォーマッタ（軸目盛・ツールチップで共通利用）。
 * 既定では `d3-format(',')` 相当のカンマ区切り整数を用いる。
 */
export type ValueFormatter = (value: number) => string;

/**
 * a11y / i18n のためのラベル差し替え。未指定キーは既定値が使われる。
 */
export interface StackedBarWindowAriaLabels {
  chart?: string;
  legend?: string;
  slider?: string;
  prevButton?: string;
  nextButton?: string;
  windowControls?: string;
  pinnedBadge?: string;
}
