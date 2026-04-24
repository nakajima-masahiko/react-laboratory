import type { CandleData, ChartType } from '../types';

export type PriceRange = {
  min: number;
  max: number;
};

const DEFAULT_RANGE: PriceRange = { min: 0, max: 1 };
const PADDING_RATIO = 0.05;

export function getPriceRange(
  data: CandleData[],
  chartType: ChartType,
): PriceRange {
  if (data.length === 0) return DEFAULT_RANGE;

  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  if (chartType === 'candlestick') {
    for (const d of data) {
      if (d.low < min) min = d.low;
      if (d.high > max) max = d.high;
    }
  } else {
    for (const d of data) {
      if (d.close < min) min = d.close;
      if (d.close > max) max = d.close;
    }
  }

  if (!Number.isFinite(min) || !Number.isFinite(max)) return DEFAULT_RANGE;

  if (min === max) {
    const delta = Math.abs(min) > 0 ? Math.abs(min) * PADDING_RATIO : 1;
    return { min: min - delta, max: max + delta };
  }

  const padding = (max - min) * PADDING_RATIO;
  return { min: min - padding, max: max + padding };
}
