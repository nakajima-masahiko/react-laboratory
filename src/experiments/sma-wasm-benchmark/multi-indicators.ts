/**
 * Shared definitions for the multi-indicator benchmark.
 *
 * Both the JS reference implementation (`multi-indicators-js.ts`) and the JS
 * shim that calls into WASM (`multi-indicators-wasm.ts`) emit the same shape:
 * a `MultiIndicatorResult` whose 13 `Float64Array`s line up with the Rust-side
 * `NUM_SERIES` layout in `wasm/sma-benchmark/src/lib.rs`.
 */

export const INDICATOR_KEYS = [
  'sma5',
  'sma25',
  'sma75',
  'sma200',
  'ema5',
  'ema25',
  'ema75',
  'rsi14',
  'bbMid20',
  'bbUp20',
  'bbLow20',
  'min100',
  'max100',
] as const;

export type IndicatorKey = (typeof INDICATOR_KEYS)[number];

export const INDICATOR_LABELS: Record<IndicatorKey, string> = {
  sma5: 'SMA 5',
  sma25: 'SMA 25',
  sma75: 'SMA 75',
  sma200: 'SMA 200',
  ema5: 'EMA 5',
  ema25: 'EMA 25',
  ema75: 'EMA 75',
  rsi14: 'RSI 14',
  bbMid20: 'Bollinger 20 middle',
  bbUp20: 'Bollinger 20 upper (+2σ)',
  bbLow20: 'Bollinger 20 lower (-2σ)',
  min100: 'Rolling min 100',
  max100: 'Rolling max 100',
};

export type MultiIndicatorResult = Record<IndicatorKey, Float64Array>;

export const NUM_SERIES = INDICATOR_KEYS.length;
