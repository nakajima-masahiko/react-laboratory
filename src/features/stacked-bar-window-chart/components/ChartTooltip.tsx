import type { CSSProperties } from 'react';
import { sanitizeStackedValue } from '../chart/sanitize';
import type { StackedDataPoint, StackedSeries, ValueFormatter } from '../types';

interface ChartTooltipProps<Key extends string> {
  row: StackedDataPoint<Key>;
  series: ReadonlyArray<StackedSeries<Key>>;
  hiddenSeriesKeys: Set<Key>;
  isPinned: boolean;
  pinnableTooltip: boolean;
  tooltipBg: string;
  tooltipBorder: string;
  formatValue: ValueFormatter;
  pinnedBadgeLabel: string;
  pinnedHintLabel: string;
}

export function ChartTooltip<Key extends string>({
  row,
  series,
  hiddenSeriesKeys,
  isPinned,
  pinnableTooltip,
  tooltipBg,
  tooltipBorder,
  formatValue,
  pinnedBadgeLabel,
  pinnedHintLabel,
}: ChartTooltipProps<Key>) {
  const style = {
    background: tooltipBg,
    borderColor: tooltipBorder,
    '--sbwc-tooltip-fill': tooltipBg,
    '--sbwc-tooltip-border': tooltipBorder,
  } as CSSProperties;

  return (
    <>
      <div className="sbwc-tooltip" style={style}>
        <div className="sbwc-tooltip-title">
          {row.tooltipLabel}
          {pinnableTooltip && isPinned && (
            <span className="sbwc-tooltip-pin-badge" aria-label={pinnedBadgeLabel}>
              {pinnedBadgeLabel}
            </span>
          )}
        </div>
        <ul className="sbwc-tooltip-list">
          {series.map((item) => {
            if (hiddenSeriesKeys.has(item.key)) return null;
            return (
              <li key={item.key} className="sbwc-tooltip-row">
                <span
                  className="sbwc-tooltip-swatch"
                  style={{ background: item.color }}
                  aria-hidden="true"
                />
                <span className="sbwc-tooltip-name">{item.label}</span>
                <span className="sbwc-tooltip-value">{formatValue(sanitizeStackedValue(row.values[item.key]))}</span>
              </li>
            );
          })}
        </ul>
        {pinnableTooltip && isPinned && (
          <p className="sbwc-tooltip-pin-hint">{pinnedHintLabel}</p>
        )}
      </div>
      <svg
        className="sbwc-tooltip-arrow"
        width={14}
        height={8}
        viewBox="0 0 30 10"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <polygon points="0,0 30,0 15,10" />
      </svg>
    </>
  );
}
