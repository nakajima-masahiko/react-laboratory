import type { SeriesDefinition } from '../types';

interface ChartLegendProps<Key extends string> {
  series: ReadonlyArray<SeriesDefinition<Key>>;
  hiddenSeriesKeys: Set<Key>;
  onToggle: (key: Key) => void;
}

export function ChartLegend<Key extends string>({
  series,
  hiddenSeriesKeys,
  onToggle,
}: ChartLegendProps<Key>) {
  return (
    <ul className="ccws-legend" role="list">
      {series.map((item) => {
        const hidden = hiddenSeriesKeys.has(item.key);
        return (
          <li key={item.key}>
            <button
              type="button"
              className={`ccws-legend-item${hidden ? ' is-hidden' : ''}`}
              onClick={() => onToggle(item.key)}
              aria-pressed={!hidden}
            >
              <span
                className="ccws-legend-swatch"
                style={{ background: item.color }}
                aria-hidden="true"
              />
              <span className="ccws-legend-label">{item.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
