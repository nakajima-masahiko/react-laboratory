import * as RadixTooltip from '@radix-ui/react-tooltip';
import { format } from 'd3-format';
import type { ChartRow, SeriesDefinition } from '../types';

const formatNumber = format(',');

interface ChartTooltipContentProps<Key extends string> {
  row: ChartRow<Key>;
  series: ReadonlyArray<SeriesDefinition<Key>>;
  hiddenSeriesKeys: Set<Key>;
}

export function ChartTooltipContent<Key extends string>({
  row,
  series,
  hiddenSeriesKeys,
}: ChartTooltipContentProps<Key>) {
  return (
    <RadixTooltip.Content
      className="ccws-tooltip"
      side="top"
      sideOffset={0}
      align="center"
    >
      <div className="ccws-tooltip-title">{row.label}</div>
      <ul className="ccws-tooltip-list">
        {series.map((item) => {
          if (hiddenSeriesKeys.has(item.key)) return null;
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
      <RadixTooltip.Arrow className="ccws-tooltip-arrow" width={14} height={8} />
    </RadixTooltip.Content>
  );
}
