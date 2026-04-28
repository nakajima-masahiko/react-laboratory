import * as Slider from '@radix-ui/react-slider';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { useMemo, useState } from 'react';
import { BarChartSvg } from './chart/BarChartSvg';
import { ChartLegend } from './chart/legend';
import { buildCurrencyData, buildPortfolioData } from './data';
import {
  CHART_THEMES,
  CURRENT_INDEX,
  CURRENCY_SERIES,
  INITIAL_VISIBLE_SERIES_COUNT,
  PORTFOLIO_SERIES,
  RANGE_OPTIONS,
  type ChartMode,
  type Currency,
  type PortfolioKind,
  type RangeValue,
  type SeriesDefinition,
  type ThemeId,
} from './types';
import './styles.css';

const CHART_MODE_OPTIONS: ReadonlyArray<{ value: ChartMode; label: string }> = [
  { value: 'currency', label: '通貨別' },
  { value: 'portfolio', label: '資金内訳' },
];

function buildColoredSeries<Key extends string>(
  series: readonly SeriesDefinition<Key>[],
  maxCount: number,
  colors: readonly string[],
) {
  return series.slice(0, maxCount).map((item, index) => ({
    ...item,
    color: colors[index] ?? item.color,
  }));
}

function CurrencyChartWindowLabScratch() {
  const currencyData = useMemo(() => buildCurrencyData(), []);
  const portfolioData = useMemo(() => buildPortfolioData(), []);

  const [selectedMode, setSelectedMode] = useState<ChartMode>('currency');
  const [selectedRange, setSelectedRange] = useState<RangeValue>('6');
  const [startIndex, setStartIndex] = useState<number>(CURRENT_INDEX);
  const [hiddenCurrencyKeys, setHiddenCurrencyKeys] = useState<Set<Currency>>(() => new Set());
  const [hiddenPortfolioKeys, setHiddenPortfolioKeys] = useState<Set<PortfolioKind>>(() => new Set());
  const [currencyCount, setCurrencyCount] = useState<number>(INITIAL_VISIBLE_SERIES_COUNT.currency);
  const [portfolioCount, setPortfolioCount] = useState<number>(INITIAL_VISIBLE_SERIES_COUNT.portfolio);
  const [selectedThemeId, setSelectedThemeId] = useState<ThemeId>('default');

  const selectedTheme = CHART_THEMES.find((theme) => theme.id === selectedThemeId) ?? CHART_THEMES[0]!;
  const isCurrencyMode = selectedMode === 'currency';

  const currencySeries = useMemo(
    () => buildColoredSeries(CURRENCY_SERIES, currencyCount, selectedTheme.colors),
    [currencyCount, selectedTheme.colors],
  );
  const portfolioSeries = useMemo(
    () => buildColoredSeries(PORTFOLIO_SERIES, portfolioCount, selectedTheme.colors),
    [portfolioCount, selectedTheme.colors],
  );

  const data = isCurrencyMode ? currencyData : portfolioData;
  const visibleMonths = RANGE_OPTIONS.find((option) => option.value === selectedRange)?.months ?? 6;
  const maxStartIndex = Math.max(0, data.length - visibleMonths);
  const safeStartIndex = Math.min(startIndex, maxStartIndex);
  const endIndex = Math.min(safeStartIndex + visibleMonths - 1, data.length - 1);
  const currencyChartData = useMemo(
    () => currencyData.slice(safeStartIndex, endIndex + 1),
    [currencyData, safeStartIndex, endIndex],
  );
  const portfolioChartData = useMemo(
    () => portfolioData.slice(safeStartIndex, endIndex + 1),
    [portfolioData, safeStartIndex, endIndex],
  );

  const startLabel = data[safeStartIndex]?.label ?? '';
  const endLabel = data[endIndex]?.label ?? '';
  const rangeLabel = visibleMonths === 1 ? startLabel : `${startLabel} 〜 ${endLabel}`;

  const handleRangeChange = (value: string) => {
    if (!value) return;
    const nextRange = value as RangeValue;
    setSelectedRange(nextRange);

    const nextVisibleMonths = RANGE_OPTIONS.find((option) => option.value === nextRange)?.months ?? 6;
    const nextMaxStart = Math.max(0, data.length - nextVisibleMonths);
    setStartIndex(Math.min(CURRENT_INDEX, nextMaxStart));
  };

  const handleModeChange = (value: string) => {
    if (!value) return;
    setSelectedMode(value as ChartMode);
  };

  const handleToggleCurrency = (seriesKey: Currency) => {
    setHiddenCurrencyKeys((prev) => {
      const next = new Set(prev);
      if (next.has(seriesKey)) {
        next.delete(seriesKey);
      } else {
        next.add(seriesKey);
      }
      return next;
    });
  };

  const handleTogglePortfolio = (seriesKey: PortfolioKind) => {
    setHiddenPortfolioKeys((prev) => {
      const next = new Set(prev);
      if (next.has(seriesKey)) {
        next.delete(seriesKey);
      } else {
        next.add(seriesKey);
      }
      return next;
    });
  };

  const handleAddSeries = () => {
    if (isCurrencyMode) {
      setCurrencyCount((prev) => Math.min(CURRENCY_SERIES.length, prev + 1));
      return;
    }
    setPortfolioCount((prev) => Math.min(PORTFOLIO_SERIES.length, prev + 1));
  };

  const visibleSeriesCount = isCurrencyMode ? currencyCount : portfolioCount;
  const totalSeriesCount = isCurrencyMode ? CURRENCY_SERIES.length : PORTFOLIO_SERIES.length;
  const canAddSeries = visibleSeriesCount < totalSeriesCount;
  const animationKey = `${selectedMode}-${selectedRange}-${visibleSeriesCount}`;
  const title = isCurrencyMode ? '通貨別つみたて棒グラフ（自前描画版）' : '資金内訳ポートフォリオ（積み上げ棒グラフ）';

  return (
    <div className="ccws-root">
      <div className="ccws-header">
        <div>
          <h2>{title}</h2>
          <p>データ種類 + 金額の組み合わせを積み上げ可能な構成に抽象化し、通貨別 / 資金内訳を切り替え可能にしています。</p>
        </div>

        <div className="ccws-header-controls">
          <ToggleGroup.Root
            type="single"
            value={selectedMode}
            onValueChange={handleModeChange}
            className="ccws-toggle-group"
            aria-label="チャート種類"
          >
            {CHART_MODE_OPTIONS.map((option) => (
              <ToggleGroup.Item key={option.value} value={option.value} className="ccws-toggle-item" aria-label={option.label}>
                {option.label}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup.Root>

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
          {isCurrencyMode ? (
            <ChartLegend series={currencySeries} hiddenSeriesKeys={hiddenCurrencyKeys} onToggle={handleToggleCurrency} />
          ) : (
            <ChartLegend series={portfolioSeries} hiddenSeriesKeys={hiddenPortfolioKeys} onToggle={handleTogglePortfolio} />
          )}
          <button
            type="button"
            className="ccws-add-currency"
            onClick={handleAddSeries}
            disabled={!canAddSeries}
            aria-label="系列を追加"
          >
            + 系列を追加（{visibleSeriesCount}/{totalSeriesCount}）
          </button>
        </div>

        {isCurrencyMode ? (
          <BarChartSvg
            chartData={currencyChartData}
            series={currencySeries}
            hiddenSeriesKeys={hiddenCurrencyKeys}
            animationKey={animationKey}
            chartBackground={selectedTheme.background}
            gridColor={selectedTheme.gridColor}
            tooltipBg={selectedTheme.tooltipBg}
            tooltipBorder={selectedTheme.tooltipBorder}
          />
        ) : (
          <BarChartSvg
            chartData={portfolioChartData}
            series={portfolioSeries}
            hiddenSeriesKeys={hiddenPortfolioKeys}
            animationKey={animationKey}
            chartBackground={selectedTheme.background}
            gridColor={selectedTheme.gridColor}
            tooltipBg={selectedTheme.tooltipBg}
            tooltipBorder={selectedTheme.tooltipBorder}
          />
        )}

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
