import type { ReactNode } from 'react';
import type { StackedSeries } from '../types';

interface ChartLegendProps<Key extends string> {
  series: ReadonlyArray<StackedSeries<Key>>;
  hiddenSeriesKeys: Set<Key>;
  onToggle: (key: Key) => void;
  /** 凡例の右側に並べる任意 UI（例: 系列追加ボタン） */
  actions?: ReactNode;
  ariaLabel?: string;
}

export function ChartLegend<Key extends string>({
  series,
  hiddenSeriesKeys,
  onToggle,
  actions,
  ariaLabel,
}: ChartLegendProps<Key>) {
  return (
    <div className="sbwc-legend-row" role="group" aria-label={ariaLabel}>
      <ul className="sbwc-legend" role="list">
        {series.map((item) => {
          const hidden = hiddenSeriesKeys.has(item.key);
          return (
            <li key={item.key}>
              <button
                type="button"
                className={`sbwc-legend-item${hidden ? ' is-hidden' : ''}`}
                onClick={() => onToggle(item.key)}
                aria-pressed={!hidden}
              >
                <span
                  className="sbwc-legend-swatch"
                  style={{ background: item.color }}
                  aria-hidden="true"
                />
                <span className="sbwc-legend-label">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {actions}
    </div>
  );
}
