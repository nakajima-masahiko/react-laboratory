import * as RadixTooltip from '@radix-ui/react-tooltip';
import { format } from 'd3-format';
import type { CSSProperties } from 'react';
import type { ChartRow, SeriesDefinition } from '../types';

const formatNumber = format(',');

interface ChartTooltipContentProps<Key extends string> {
  row: ChartRow<Key>;
  series: ReadonlyArray<SeriesDefinition<Key>>;
  hiddenSeriesKeys: Set<Key>;
  isPinned: boolean;
  tooltipBg: string;
  tooltipBorder: string;
}

export function ChartTooltipContent<Key extends string>({
  row,
  series,
  hiddenSeriesKeys,
  isPinned,
  tooltipBg,
  tooltipBorder,
}: ChartTooltipContentProps<Key>) {
  const style = {
    background: tooltipBg,
    borderColor: tooltipBorder,
    '--ccws-tooltip-fill': tooltipBg,
    '--ccws-tooltip-border': tooltipBorder,
  } as CSSProperties;

  return (
    <RadixTooltip.Content
      className="ccws-tooltip"
      side="top"
      sideOffset={0}
      align="center"
      style={style}
    >
      <div className="ccws-tooltip-title">
        {row.label}
        {isPinned && (
          <span className="ccws-tooltip-pin-badge" aria-label="固定中">固定</span>
        )}
      </div>
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
      {isPinned && (
        <p className="ccws-tooltip-pin-hint">クリックで解除</p>
      )}
      <RadixTooltip.Arrow
        className="ccws-tooltip-arrow"
        width={14}
        height={8}
      />
    </RadixTooltip.Content>
  );
}
