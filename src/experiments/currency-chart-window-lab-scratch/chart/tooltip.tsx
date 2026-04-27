import { format } from 'd3-format';
import type { ChartRow, SeriesDefinition } from '../types';

const formatNumber = format(',');

interface ChartTooltipProps<Key extends string> {
  row: ChartRow<Key>;
  series: ReadonlyArray<SeriesDefinition<Key>>;
  hiddenSeriesKeys: Set<Key>;
  x: number;
  y: number;
  containerWidth: number;
}

const TOOLTIP_WIDTH = 180;

export function ChartTooltip<Key extends string>({
  row,
  series,
  hiddenSeriesKeys,
  x,
  y,
  containerWidth,
}: ChartTooltipProps<Key>) {
  const flipLeft = x + TOOLTIP_WIDTH + 16 > containerWidth;
  const left = flipLeft ? Math.max(8, x - TOOLTIP_WIDTH - 12) : x + 12;
  const top = Math.max(8, y - 8);

  return (
    <div className="ccws-tooltip" role="tooltip" style={{ left, top, width: TOOLTIP_WIDTH }}>
      <div className="ccws-tooltip-title">{row.label}</div>
      <ul className="ccws-tooltip-list">
        {series.map((item) => {
          if (hiddenSeriesKeys.has(item.key)) {
            return null;
          }
          return (
            <li key={item.key} className="ccws-tooltip-row">
              <span
                className="ccws-tooltip-swatch"
                style={{ background: item.color }}
                aria-hidden="true"
              />
              <span className="ccws-tooltip-name">{item.label}</span>
              <span className="ccws-tooltip-value">{formatNumber(row.values[item.key])}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
