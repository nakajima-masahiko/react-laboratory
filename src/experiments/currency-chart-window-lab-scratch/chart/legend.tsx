import { COLORS, CURRENCIES, type Currency } from '../types';

interface ChartLegendProps {
  hiddenCurrencies: Set<Currency>;
  onToggle: (currency: Currency) => void;
}

export function ChartLegend({ hiddenCurrencies, onToggle }: ChartLegendProps) {
  return (
    <ul className="ccws-legend" role="list">
      {CURRENCIES.map((currency) => {
        const hidden = hiddenCurrencies.has(currency);
        return (
          <li key={currency}>
            <button
              type="button"
              className={`ccws-legend-item${hidden ? ' is-hidden' : ''}`}
              onClick={() => onToggle(currency)}
              aria-pressed={!hidden}
            >
              <span
                className="ccws-legend-swatch"
                style={{ background: COLORS[currency] }}
                aria-hidden="true"
              />
              <span className="ccws-legend-label">{currency}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
