export const DATASET_SIZES = [180, 5_000, 10_000, 50_000, 100_000, 500_000, 1_000_000] as const;
export type DatasetSize = (typeof DATASET_SIZES)[number];

/** Realtime tick rates used by the Lab console. Higher rates stress updateTick path. */
export type RealtimeMode = 'off' | '1' | '10' | '60' | '120' | '200';
export type InteractionMode = 'pan' | 'inspect';
export type RangePreset = 'first' | 'middle' | 'last';
export type IndicatorKey = 'sma' | 'ema' | 'bollingerBands' | 'rsi' | 'macd' | 'bidAskOverlay';
export type IndicatorPreset = 'base' | 'trend' | 'momentum' | 'all';
export type IndicatorVisibility = Record<IndicatorKey, boolean>;

export const INDICATORS: { key: IndicatorKey; label: string }[] = [
  { key: 'sma', label: 'SMA' },
  { key: 'ema', label: 'EMA' },
  { key: 'bollingerBands', label: 'Bollinger' },
  { key: 'rsi', label: 'RSI' },
  { key: 'macd', label: 'MACD' },
  { key: 'bidAskOverlay', label: 'Bid/Ask' },
];

const enabled = (...keys: IndicatorKey[]): IndicatorVisibility => ({
  sma: keys.includes('sma'),
  ema: keys.includes('ema'),
  bollingerBands: keys.includes('bollingerBands'),
  rsi: keys.includes('rsi'),
  macd: keys.includes('macd'),
  bidAskOverlay: keys.includes('bidAskOverlay'),
});

export const INDICATOR_PRESETS: Record<IndicatorPreset, IndicatorVisibility> = {
  base: enabled(),
  trend: enabled('sma', 'ema', 'bollingerBands'),
  momentum: enabled('rsi', 'macd'),
  all: enabled('sma', 'ema', 'bollingerBands', 'rsi', 'macd', 'bidAskOverlay'),
};

export const formatDatasetSize = (size: number) =>
  size >= 1_000_000 ? `${size / 1_000_000}M` : size >= 1_000 ? `${size / 1_000}k` : String(size);

/** FPS badge tone for the live header indicator. */
export function fpsTone(fps: number): 'good' | 'ok' | 'low' {
  if (fps >= 50) return 'good';
  if (fps >= 30) return 'ok';
  return 'low';
}
