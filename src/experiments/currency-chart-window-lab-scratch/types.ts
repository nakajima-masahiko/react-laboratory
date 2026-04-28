export type RangeValue = '1' | '3' | '6' | '12';

export type ThemeId = 'default' | 'warm' | 'cool' | 'light';

export type ChartMode = 'currency' | 'portfolio';

export interface ChartTheme {
  id: ThemeId;
  label: string;
  colors: readonly string[];
  /** SVG チャートエリアの背景色。'transparent' でカード背景を透過する */
  background: string;
  /** グリッド線の色 */
  gridColor: string;
  /** ツールチップ背景色 */
  tooltipBg: string;
  /** ツールチップ枠線色 */
  tooltipBorder: string;
}

export const CHART_THEMES: readonly ChartTheme[] = [
  {
    id: 'default',
    label: 'デフォルト',
    colors: ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#edc948', '#59a14f', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ac'],
    background: 'transparent',
    gridColor: 'var(--border)',
    tooltipBg: 'var(--bg)',
    tooltipBorder: 'var(--border)',
  },
  {
    id: 'warm',
    label: 'ウォーム',
    colors: ['#e63946', '#f4a261', '#e76f51', '#f9c74f', '#f3722c', '#d62828', '#fb8500', '#e9c46a', '#c77b46', '#a4432b'],
    background: 'transparent',
    gridColor: 'var(--border)',
    tooltipBg: 'color-mix(in oklab, var(--bg) 88%, #e63946 12%)',
    tooltipBorder: '#f4a261',
  },
  {
    id: 'cool',
    label: 'クール',
    colors: ['#4361ee', '#3a86ff', '#2a9d8f', '#43aa8b', '#4cc9f0', '#7209b7', '#480ca8', '#52b788', '#4895ef', '#48cae4'],
    background: 'transparent',
    gridColor: 'var(--border)',
    tooltipBg: 'color-mix(in oklab, var(--bg) 88%, #4361ee 12%)',
    tooltipBorder: '#4361ee',
  },
  {
    id: 'light',
    label: 'ライト',
    colors: ['#1a6faf', '#d14b00', '#2a9d3a', '#8b3fbf', '#c47800', '#006e8c', '#b53060', '#4d7c00', '#0047ab', '#7b5800'],
    background: '#ffffff',
    gridColor: 'rgba(0, 0, 0, 0.10)',
    tooltipBg: '#fffdf8',
    tooltipBorder: 'rgba(0, 0, 0, 0.18)',
  },
] as const;

export interface SeriesDefinition<Key extends string> {
  key: Key;
  label: string;
  color: string;
}

export const CURRENCY_SERIES = [
  { key: 'USD', label: 'USD', color: '#4e79a7' },
  { key: 'EUR', label: 'EUR', color: '#f28e2b' },
  { key: 'GBP', label: 'GBP', color: '#e15759' },
  { key: 'JPY', label: 'JPY', color: '#76b7b2' },
  { key: 'BTC', label: 'BTC', color: '#edc948' },
  { key: 'AUD', label: 'AUD', color: '#59a14f' },
  { key: 'CAD', label: 'CAD', color: '#af7aa1' },
  { key: 'CHF', label: 'CHF', color: '#ff9da7' },
  { key: 'CNY', label: 'CNY', color: '#9c755f' },
  { key: 'KRW', label: 'KRW', color: '#bab0ac' },
] as const satisfies ReadonlyArray<SeriesDefinition<string>>;

export const PORTFOLIO_SERIES = [
  { key: 'cash', label: '現金', color: '#4e79a7' },
  { key: 'equity', label: '株式', color: '#f28e2b' },
  { key: 'bond', label: '債券', color: '#e15759' },
  { key: 'reit', label: 'REIT', color: '#76b7b2' },
  { key: 'commodity', label: 'コモディティ', color: '#59a14f' },
  { key: 'crypto', label: '暗号資産', color: '#af7aa1' },
] as const satisfies ReadonlyArray<SeriesDefinition<string>>;

export type Currency = (typeof CURRENCY_SERIES)[number]['key'];
export type PortfolioKind = (typeof PORTFOLIO_SERIES)[number]['key'];

export const INITIAL_VISIBLE_SERIES_COUNT: Record<ChartMode, number> = {
  currency: 5,
  portfolio: 4,
};

export interface ChartRow<Key extends string = Currency> {
  key: string;
  label: string;
  monthLabel: string;
  values: Record<Key, number>;
}

export const RANGE_OPTIONS: ReadonlyArray<{
  value: RangeValue;
  label: string;
  months: number;
}> = [
  { value: '1', label: '1ヶ月', months: 1 },
  { value: '3', label: '3ヶ月', months: 3 },
  { value: '6', label: '6ヶ月', months: 6 },
  { value: '12', label: '1年', months: 12 },
];

export const TOTAL_MONTHS = 36;
export const CURRENT_INDEX = 18;
