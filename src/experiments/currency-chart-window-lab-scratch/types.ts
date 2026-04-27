export const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'BTC'] as const;
export type Currency = (typeof CURRENCIES)[number];

export type RangeValue = '1' | '3' | '6' | '12';

export interface ChartRow {
  key: string;
  label: string;
  monthLabel: string;
  USD: number;
  EUR: number;
  GBP: number;
  JPY: number;
  BTC: number;
}

export const COLORS: Record<Currency, string> = {
  USD: '#4e79a7',
  EUR: '#f28e2b',
  GBP: '#e15759',
  JPY: '#76b7b2',
  BTC: '#edc948',
};

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
