import {
  CURRENT_INDEX,
  CURRENCY_SERIES,
  PORTFOLIO_SERIES,
  TOTAL_MONTHS,
  type ChartRow,
  type Currency,
  type PortfolioKind,
  type SeriesDefinition,
} from './types';

interface SeriesProfile<Key extends string> {
  key: Key;
  base: number;
  growth: number;
  seasonalAmplitude: number;
  phase: number;
}

function addMonths(base: Date, offset: number) {
  return new Date(base.getFullYear(), base.getMonth() + offset, 1);
}

function formatMonth(date: Date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

function createAmount(index: number, profile: SeriesProfile<string>) {
  const seasonal = Math.sin(index / 3 + profile.phase) * profile.seasonalAmplitude;
  const amount = profile.base + profile.growth * index + seasonal;
  return Math.max(0, Math.round(amount));
}

function buildSeriesData<Key extends string>(
  index: number,
  series: readonly SeriesDefinition<Key>[],
  profiles: Record<Key, SeriesProfile<Key>>,
) {
  return Object.fromEntries(
    series.map((item) => [item.key, createAmount(index, profiles[item.key])]),
  ) as Record<Key, number>;
}

function buildMonthlyData<Key extends string>(
  series: readonly SeriesDefinition<Key>[],
  profiles: Record<Key, SeriesProfile<Key>>,
  now = new Date(),
): ChartRow<Key>[] {
  return Array.from({ length: TOTAL_MONTHS }, (_, index) => {
    const date = addMonths(now, index - CURRENT_INDEX);
    return {
      key: `${date.getFullYear()}-${date.getMonth() + 1}`,
      tooltipLabel: formatMonth(date),
      axisLabel: `${date.getMonth() + 1}月`,
      values: buildSeriesData(index, series, profiles),
    };
  });
}

const currencyProfiles: Record<Currency, SeriesProfile<Currency>> = {
  USD: { key: 'USD', base: 130, growth: 1.8, seasonalAmplitude: 10, phase: 0 },
  EUR: { key: 'EUR', base: 95, growth: 1.3, seasonalAmplitude: 10, phase: 0.8 },
  GBP: { key: 'GBP', base: 72, growth: 0.9, seasonalAmplitude: 10, phase: 1.2 },
  JPY: { key: 'JPY', base: 190, growth: 2.3, seasonalAmplitude: 11, phase: 1.6 },
  BTC: { key: 'BTC', base: 28, growth: 1.7, seasonalAmplitude: 12, phase: 2.1 },
  AUD: { key: 'AUD', base: 60, growth: 1.1, seasonalAmplitude: 9, phase: 0.4 },
  CAD: { key: 'CAD', base: 80, growth: 1.5, seasonalAmplitude: 10, phase: 1.0 },
  CHF: { key: 'CHF', base: 50, growth: 0.7, seasonalAmplitude: 8, phase: 1.8 },
  CNY: { key: 'CNY', base: 110, growth: 2.0, seasonalAmplitude: 11, phase: 2.4 },
  KRW: { key: 'KRW', base: 140, growth: 1.4, seasonalAmplitude: 10, phase: 2.8 },
};

const portfolioProfiles: Record<PortfolioKind, SeriesProfile<PortfolioKind>> = {
  cash: { key: 'cash', base: 90, growth: 0.4, seasonalAmplitude: 3, phase: 0.4 },
  equity: { key: 'equity', base: 170, growth: 2.5, seasonalAmplitude: 13, phase: 1.1 },
  bond: { key: 'bond', base: 120, growth: 1.2, seasonalAmplitude: 7, phase: 2.0 },
  reit: { key: 'reit', base: 70, growth: 1.0, seasonalAmplitude: 8, phase: 0.7 },
  commodity: { key: 'commodity', base: 45, growth: 0.8, seasonalAmplitude: 6, phase: 2.5 },
  crypto: { key: 'crypto', base: 35, growth: 1.6, seasonalAmplitude: 14, phase: 3.0 },
};

export function buildCurrencyData(now = new Date()): ChartRow<Currency>[] {
  return buildMonthlyData(CURRENCY_SERIES, currencyProfiles, now);
}

export function buildPortfolioData(now = new Date()): ChartRow<PortfolioKind>[] {
  return buildMonthlyData(PORTFOLIO_SERIES, portfolioProfiles, now);
}
