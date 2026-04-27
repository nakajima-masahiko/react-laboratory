import { CURRENT_INDEX, CURRENCY_SERIES, TOTAL_MONTHS, type ChartRow, type Currency } from './types';

function addMonths(base: Date, offset: number) {
  return new Date(base.getFullYear(), base.getMonth() + offset, 1);
}

function formatMonth(date: Date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

function createAmount(index: number, currency: Currency) {
  const phaseByCurrency: Record<Currency, number> = {
    USD: 0,
    EUR: 0.8,
    GBP: 1.2,
    JPY: 1.6,
    BTC: 2.1,
  };

  const baseByCurrency: Record<Currency, number> = {
    USD: 130,
    EUR: 95,
    GBP: 72,
    JPY: 190,
    BTC: 28,
  };

  const growthByCurrency: Record<Currency, number> = {
    USD: 1.8,
    EUR: 1.3,
    GBP: 0.9,
    JPY: 2.3,
    BTC: 1.7,
  };

  const seasonal = Math.sin(index / 3 + phaseByCurrency[currency]) * 10;
  const amount = baseByCurrency[currency] + growthByCurrency[currency] * index + seasonal;
  return Math.max(0, Math.round(amount));
}

export function buildData(now = new Date()): ChartRow[] {
  return Array.from({ length: TOTAL_MONTHS }, (_, index) => {
    const date = addMonths(now, index - CURRENT_INDEX);
    return {
      key: `${date.getFullYear()}-${date.getMonth() + 1}`,
      label: formatMonth(date),
      monthLabel: `${date.getMonth() + 1}月`,
      values: Object.fromEntries(
        CURRENCY_SERIES.map((series) => [series.key, createAmount(index, series.key)]),
      ) as Record<Currency, number>,
    };
  });
}
