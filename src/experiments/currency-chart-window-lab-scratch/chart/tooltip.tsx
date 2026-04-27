import { format } from 'd3-format';
import { COLORS, CURRENCIES, type ChartRow, type Currency } from '../types';

const formatNumber = format(',');

interface ChartTooltipProps {
  row: ChartRow;
  hiddenCurrencies: Set<Currency>;
  x: number;
  y: number;
  containerWidth: number;
}

const TOOLTIP_WIDTH = 180;

export function ChartTooltip({
  row,
  hiddenCurrencies,
  x,
  y,
  containerWidth,
}: ChartTooltipProps) {
  const flipLeft = x + TOOLTIP_WIDTH + 16 > containerWidth;
  const left = flipLeft ? Math.max(8, x - TOOLTIP_WIDTH - 12) : x + 12;
  const top = Math.max(8, y - 8);

  return (
    <div
      className="ccws-tooltip"
      role="tooltip"
      style={{ left, top, width: TOOLTIP_WIDTH }}
    >
      <div className="ccws-tooltip-title">{row.label}</div>
      <ul className="ccws-tooltip-list">
        {CURRENCIES.map((currency) => {
          if (hiddenCurrencies.has(currency)) {
            return null;
          }
          return (
            <li key={currency} className="ccws-tooltip-row">
              <span
                className="ccws-tooltip-swatch"
                style={{ background: COLORS[currency] }}
                aria-hidden="true"
              />
              <span className="ccws-tooltip-name">{currency}</span>
              <span className="ccws-tooltip-value">{formatNumber(row[currency])}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
