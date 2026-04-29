import { format } from 'd3-format';
import { useMemo, type ReactNode } from 'react';
import { sanitizeChartData } from '../chart/sanitize';
import type {
  StackedBarChartTheme,
  StackedBarWindowAriaLabels,
  StackedDataPoint,
  StackedSeries,
  ValueFormatter,
} from '../types';
import { ChartLegend } from './ChartLegend';
import { StackedBarChart } from './StackedBarChart';
import { WindowSlider } from './WindowSlider';

const DEFAULT_FORMATTER: ValueFormatter = format(',');
const DEFAULT_HEIGHT = 460;
const DEFAULT_EMPTY_MESSAGE = '表示できるデータがありません';
const DEFAULT_LABELS: Required<StackedBarWindowAriaLabels> = { chart: '積み上げ棒グラフ', legend: '系列の表示切り替え', slider: '表示範囲の開始位置', prevButton: '前の表示範囲へ', nextButton: '次の表示範囲へ', windowControls: '表示範囲の操作', pinnedBadge: '固定中', };
const DEFAULT_PINNED_HINT = 'クリックで固定を解除';

export interface StackedBarWindowChartProps<Key extends string = string> { data: StackedDataPoint<Key>[]; series: ReadonlyArray<StackedSeries<Key>>; hiddenSeriesKeys: Set<Key>; onToggleSeries: (key: Key) => void; windowSize: number; startIndex: number; onStartIndexChange: (next: number) => void; theme: StackedBarChartTheme; rangeLabel?: string; animationKey?: string; formatValue?: ValueFormatter; chartHeight?: number; pinnableTooltip?: boolean; legendActions?: ReactNode; ariaLabels?: StackedBarWindowAriaLabels; pinnedHintLabel?: string; emptyMessage?: string; }

export function StackedBarWindowChart<Key extends string>({ data, series, hiddenSeriesKeys, onToggleSeries, windowSize, startIndex, onStartIndexChange, theme, rangeLabel, animationKey, formatValue = DEFAULT_FORMATTER, chartHeight = DEFAULT_HEIGHT, pinnableTooltip = false, legendActions, ariaLabels, pinnedHintLabel = DEFAULT_PINNED_HINT, emptyMessage=DEFAULT_EMPTY_MESSAGE, }: StackedBarWindowChartProps<Key>) {
  const labels = { ...DEFAULT_LABELS, ...ariaLabels };
  const sanitizedData = useMemo(()=>sanitizeChartData(data, series), [data, series]);
  const safeWindow = Math.max(1, Math.min(windowSize, sanitizedData.length || 1));
  const maxStartIndex = Math.max(0, sanitizedData.length - safeWindow);
  const safeStartIndex = Math.min(Math.max(0, startIndex), maxStartIndex);
  const endIndex = Math.min(safeStartIndex + safeWindow - 1, sanitizedData.length - 1);
  const chartData = useMemo(() => sanitizedData.slice(safeStartIndex, endIndex + 1), [sanitizedData, safeStartIndex, endIndex]);
  const resolvedAnimationKey = animationKey ?? `${safeWindow}-${series.length}-${sanitizedData.length}`;
  const isEmpty = sanitizedData.length === 0 || series.length === 0;

  return (<div className="sbwc-root"><ChartLegend series={series} hiddenSeriesKeys={hiddenSeriesKeys} onToggle={onToggleSeries} actions={legendActions} ariaLabel={labels.legend} />
  {isEmpty ? <div className="sbwc-empty" role="status" aria-live="polite">{emptyMessage}</div> : <StackedBarChart chartData={chartData} series={series} hiddenSeriesKeys={hiddenSeriesKeys} animationKey={resolvedAnimationKey} theme={theme} formatValue={formatValue} height={chartHeight} pinnableTooltip={pinnableTooltip} ariaLabel={labels.chart} pinnedBadgeLabel={labels.pinnedBadge} pinnedHintLabel={pinnedHintLabel} />}
  <WindowSlider startIndex={safeStartIndex} maxStartIndex={maxStartIndex} rangeLabel={rangeLabel} onStartIndexChange={onStartIndexChange} ariaLabels={{ slider: labels.slider, prevButton: labels.prevButton, nextButton: labels.nextButton, windowControls: labels.windowControls }} />
  </div>);
}
