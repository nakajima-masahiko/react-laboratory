export type RangeValue = '1' | '3' | '6' | '12';

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
] as const satisfies ReadonlyArray<SeriesDefinition<string>>;

export type Currency = (typeof CURRENCY_SERIES)[number]['key'];

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
