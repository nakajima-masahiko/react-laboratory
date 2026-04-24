import { format as d3Format } from 'd3-format';
import { timeFormat } from 'd3-time-format';

const numberFormatter = d3Format(',.2f');
const priceLabelFormatter = d3Format(',.2f');
const timeFormatterCache = new Map<string, (date: Date) => string>();

export function formatPrice(value: number): string {
  return numberFormatter(value);
}

export function formatLatestPrice(value: number): string {
  return priceLabelFormatter(value);
}

export function formatTime(value: Date, formatPattern: string = '%m/%d %H:%M'): string {
  const cached = timeFormatterCache.get(formatPattern);
  if (cached) {
    return cached(value);
  }

  const formatter = timeFormat(formatPattern);
  timeFormatterCache.set(formatPattern, formatter);
  return formatter(value);
}
