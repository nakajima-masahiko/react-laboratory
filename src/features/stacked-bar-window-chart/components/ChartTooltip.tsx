import type { CSSProperties, Ref } from 'react';
import { sanitizeStackedValue } from '../chart/sanitize';
import type { StackedDataPoint, StackedSeries, TooltipTotalMode, ValueFormatter } from '../types';

interface ChartTooltipProps<Key extends string> {
  row: StackedDataPoint<Key>;
  series: ReadonlyArray<StackedSeries<Key>>;
  hiddenSeriesKeys: Set<Key>;
  isPinned: boolean;
  pinnableTooltip: boolean;
  tooltipBg: string;
  tooltipBorder: string;
  formatValue: ValueFormatter;
  showTooltipTotal: boolean;
  tooltipTotalLabel: string;
  tooltipTotalMode: TooltipTotalMode;
  pinnedBadgeLabel: string;
  pinnedHintLabel: string;
  tooltipRef?: Ref<HTMLDivElement>;
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
  showTooltipTotal,
  tooltipTotalLabel,
  tooltipTotalMode,
  pinnedBadgeLabel,
  pinnedHintLabel,
  tooltipRef,
}: ChartTooltipProps<Key>) {

  const tooltipTotal = showTooltipTotal
    ? series.reduce((sum, item) => {
        if (tooltipTotalMode === 'visible' && hiddenSeriesKeys.has(item.key)) {
          return sum;
        }
        return sum + sanitizeStackedValue(row.values[item.key]);
      }, 0)
    : null;

  const style = {
    background: tooltipBg,
    borderColor: tooltipBorder,
    '--sbwc-tooltip-fill': tooltipBg,
    '--sbwc-tooltip-border': tooltipBorder,
  } as CSSProperties;

  return (
    <>
      <div ref={tooltipRef} className="sbwc-tooltip" style={style}>
        <div className="sbwc-tooltip-title">
          {row.tooltipLabel}
          {pinnableTooltip && isPinned && (
            <span className="sbwc-tooltip-pin-badge" aria-label={pinnedBadgeLabel}>
              {pinnedBadgeLabel}
            </span>
          )}
        </div>
        {showTooltipTotal && tooltipTotal !== null && (
          <div className="sbwc-tooltip-total">
            <span className="sbwc-tooltip-total-label">{tooltipTotalLabel}</span>
            <span className="sbwc-tooltip-total-value">{formatValue(tooltipTotal)}</span>
          </div>
        )}
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
