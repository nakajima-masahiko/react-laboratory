import { format as d3Format } from 'd3-format';
import { timeFormat } from 'd3-time-format';

const numberFormatter = d3Format(',.2f');
const timeFormatter = timeFormat('%m/%d %H:%M');
const priceLabelFormatter = d3Format(',.2f');

export function formatPrice(value: number): string {
  return numberFormatter(value);
}

export function formatLatestPrice(value: number): string {
  return priceLabelFormatter(value);
}

export function formatTime(value: Date): string {
  return timeFormatter(value);
}
