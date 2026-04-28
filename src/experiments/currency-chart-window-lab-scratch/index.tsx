import * as Slider from '@radix-ui/react-slider';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { useMemo, useState } from 'react';
import { BarChartSvg } from './chart/BarChartSvg';
import { ChartLegend } from './chart/legend';
import { buildData } from './data';
import {
  CHART_THEMES,
  CURRENT_INDEX,
  CURRENCY_SERIES,
  INITIAL_CURRENCY_COUNT,
  RANGE_OPTIONS,
  type Currency,
  type RangeValue,
  type ThemeId,
} from './types';
import './styles.css';

function CurrencyChartWindowLabScratch() {
  const data = useMemo(() => buildData(), []);
  const [selectedRange, setSelectedRange] = useState<RangeValue>('6');
  const [startIndex, setStartIndex] = useState<number>(CURRENT_INDEX);
  const [hiddenSeriesKeys, setHiddenSeriesKeys] = useState<Set<Currency>>(() => new Set());
  const [currencyCount, setCurrencyCount] = useState<number>(INITIAL_CURRENCY_COUNT);
  const [selectedThemeId, setSelectedThemeId] = useState<ThemeId>('default');

  const selectedTheme = CHART_THEMES.find((t) => t.id === selectedThemeId) ?? CHART_THEMES[0]!

  const activeSeries = useMemo(
    () =>
      CURRENCY_SERIES.slice(0, currencyCount).map((s, i) => ({
        ...s,
        color: selectedTheme.colors[i] ?? s.color,
      })),
    [currencyCount, selectedTheme],
  );
  const canAddCurrency = currencyCount < CURRENCY_SERIES.length;

  const visibleMonths =
    RANGE_OPTIONS.find((option) => option.value === selectedRange)?.months ?? 6;
  const maxStartIndex = Math.max(0, data.length - visibleMonths);
  const safeStartIndex = Math.min(startIndex, maxStartIndex);
  const endIndex = Math.min(safeStartIndex + visibleMonths - 1, data.length - 1);
  const chartData = useMemo(
    () => data.slice(safeStartIndex, endIndex + 1),
    [data, safeStartIndex, endIndex],
  );
  const startLabel = data[safeStartIndex]?.label ?? '';
  const endLabel = data[endIndex]?.label ?? '';
  const rangeLabel = visibleMonths === 1 ? startLabel : `${startLabel} 〜 ${endLabel}`;

  const handleRangeChange = (value: string) => {
    if (!value) {
      return;
    }
    const nextRange = value as RangeValue;
    setSelectedRange(nextRange);
    const nextVisibleMonths =
      RANGE_OPTIONS.find((option) => option.value === nextRange)?.months ?? 6;
    const nextMaxStart = Math.max(0, data.length - nextVisibleMonths);
    setStartIndex(Math.min(CURRENT_INDEX, nextMaxStart));
  };

  const handleToggleSeries = (seriesKey: Currency) => {
    setHiddenSeriesKeys((prev) => {
      const next = new Set(prev);
      if (next.has(seriesKey)) {
        next.delete(seriesKey);
      } else {
        next.add(seriesKey);
      }
      return next;
    });
  };

  const animationKey = `${selectedRange}-${currencyCount}`;

  const handleAddCurrency = () => {
    setCurrencyCount((prev) => Math.min(CURRENCY_SERIES.length, prev + 1));
  };

  return (
    <div className="ccws-root">
      <div className="ccws-header">
        <div>
          <h2>通貨別つみたて棒グラフ（自前描画版）</h2>
          <p>汎用的な系列定義を使って SVG + d3-scale + Radix Slider で再構築した版です。</p>
        </div>

        <div className="ccws-header-controls">
          <div className="ccws-theme-selector" role="group" aria-label="テーマカラー">
            {CHART_THEMES.map((theme) => (
              <button
                key={theme.id}
                type="button"
                className={`ccws-theme-button${selectedThemeId === theme.id ? ' is-active' : ''}`}
                onClick={() => setSelectedThemeId(theme.id)}
                aria-label={theme.label}
                aria-pressed={selectedThemeId === theme.id}
                title={theme.label}
              >
                <span className="ccws-theme-swatches" aria-hidden="true">
                  {theme.colors.slice(0, 3).map((color) => (
                    <span key={color} className="ccws-theme-swatch" style={{ background: color }} />
                  ))}
                </span>
              </button>
            ))}
          </div>

          <ToggleGroup.Root
            type="single"
            value={selectedRange}
            onValueChange={handleRangeChange}
            className="ccws-toggle-group"
            aria-label="表示月数"
          >
            {RANGE_OPTIONS.map((option) => (
              <ToggleGroup.Item
                key={option.value}
                value={option.value}
                className="ccws-toggle-item"
                aria-label={option.label}
              >
                {option.label}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup.Root>
        </div>
      </div>

      <div className="ccws-card">
        <div className="ccws-legend-row">
          <ChartLegend
            series={activeSeries}
            hiddenSeriesKeys={hiddenSeriesKeys}
            onToggle={handleToggleSeries}
          />
          <button
            type="button"
            className="ccws-add-currency"
            onClick={handleAddCurrency}
            disabled={!canAddCurrency}
            aria-label="通貨を追加"
          >
            + 通貨を追加（{currencyCount}/{CURRENCY_SERIES.length}）
          </button>
        </div>

        <BarChartSvg
          chartData={chartData}
          series={activeSeries}
          hiddenSeriesKeys={hiddenSeriesKeys}
          animationKey={animationKey}
          chartBackground={selectedTheme.background}
          gridColor={selectedTheme.gridColor}
          tooltipBg={selectedTheme.tooltipBg}
          tooltipBorder={selectedTheme.tooltipBorder}
        />

        <div className="ccws-controls" role="group" aria-label="表示月の移動">
          <button
            type="button"
            className="ccws-nav-button"
            onClick={() => setStartIndex((prev) => Math.max(0, prev - 1))}
            disabled={safeStartIndex <= 0}
            aria-label="前の月へ"
          >
            ‹
          </button>

          <div className="ccws-slider-wrap">
            <span className="ccws-slider-label">{rangeLabel}</span>
            <Slider.Root
              className="ccws-slider-root"
              value={[safeStartIndex]}
              min={0}
              max={maxStartIndex}
              step={1}
              onValueChange={(values) => {
                const next = values[0];
                if (typeof next === 'number') {
                  setStartIndex(next);
                }
              }}
              aria-label="表示する月"
              aria-valuetext={rangeLabel}
            >
              <Slider.Track className="ccws-slider-track">
                <Slider.Range className="ccws-slider-range" />
              </Slider.Track>
              <Slider.Thumb className="ccws-slider-thumb" />
            </Slider.Root>
          </div>

          <button
            type="button"
            className="ccws-nav-button"
            onClick={() => setStartIndex((prev) => Math.min(maxStartIndex, prev + 1))}
            disabled={safeStartIndex >= maxStartIndex}
            aria-label="次の月へ"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}

export default CurrencyChartWindowLabScratch;
