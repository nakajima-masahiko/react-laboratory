import * as Slider from '@radix-ui/react-slider';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { useMemo, useState } from 'react';
import { BarChartSvg } from './chart/BarChartSvg';
import { ChartLegend } from './chart/legend';
import { buildData } from './data';
import {
  CURRENT_INDEX,
  CURRENCY_SERIES,
  RANGE_OPTIONS,
  type Currency,
  type RangeValue,
} from './types';
import './styles.css';

function CurrencyChartWindowLabScratch() {
  const data = useMemo(() => buildData(), []);
  const [selectedRange, setSelectedRange] = useState<RangeValue>('6');
  const [startIndex, setStartIndex] = useState<number>(CURRENT_INDEX);
  const [hiddenSeriesKeys, setHiddenSeriesKeys] = useState<Set<Currency>>(() => new Set());

  const visibleMonths =
    RANGE_OPTIONS.find((option) => option.value === selectedRange)?.months ?? 6;
  const maxStartIndex = Math.max(0, data.length - visibleMonths);
  const safeStartIndex = Math.min(startIndex, maxStartIndex);
  const endIndex = Math.min(safeStartIndex + visibleMonths - 1, data.length - 1);
  const chartData = data.slice(safeStartIndex, endIndex + 1);
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

  const animationKey = `${selectedRange}-${safeStartIndex}`;

  return (
    <div className="ccws-root">
      <div className="ccws-header">
        <div>
          <h2>通貨別つみたて棒グラフ（自前描画版）</h2>
          <p>汎用的な系列定義を使って SVG + d3-scale + Radix Slider で再構築した版です。</p>
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

      <div className="ccws-card">
        <ChartLegend
          series={CURRENCY_SERIES}
          hiddenSeriesKeys={hiddenSeriesKeys}
          onToggle={handleToggleSeries}
        />

        <BarChartSvg
          chartData={chartData}
          series={CURRENCY_SERIES}
          hiddenSeriesKeys={hiddenSeriesKeys}
          animationKey={animationKey}
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
