import { format } from 'd3-format';
import { useMemo, type ReactNode } from 'react';
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

const DEFAULT_LABELS: Required<StackedBarWindowAriaLabels> = {
  chart: 'Stacked bar chart',
  legend: 'Series legend',
  slider: 'Window start index',
  prevButton: 'Previous window',
  nextButton: 'Next window',
  windowControls: 'Window controls',
  pinnedBadge: 'Pinned',
};

const DEFAULT_PINNED_HINT = 'Click to release';

export interface StackedBarWindowChartProps<Key extends string = string> {
  /** 全データ点（系列キーごとの値を保持する row の配列） */
  data: StackedDataPoint<Key>[];
  /** 系列定義（凡例・色・ラベルの源泉） */
  series: ReadonlyArray<StackedSeries<Key>>;
  /** 非表示にする系列キーの集合 */
  hiddenSeriesKeys: Set<Key>;
  /** 凡例ボタン押下時に呼ばれる */
  onToggleSeries: (key: Key) => void;
  /** 同時に表示するデータ点数（ウィンドウ幅） */
  windowSize: number;
  /** ウィンドウの開始インデックス（0 〜 data.length - windowSize） */
  startIndex: number;
  /** スライダー操作・ナビボタンクリックで呼ばれる */
  onStartIndexChange: (next: number) => void;
  /** 色・背景・グリッドのテーマトークン */
  theme: StackedBarChartTheme;
  /** スライダー上に表示するレンジラベル（例: "Apr 〜 Sep"） */
  rangeLabel?: string;
  /** 値が変わると棒アニメーションが再起動する。未指定時は windowSize/startIndex から自動生成 */
  animationKey?: string;
  /** 軸目盛・ツールチップで使う数値フォーマッタ。既定は `format(',')` */
  formatValue?: ValueFormatter;
  /** チャート高さ（CSS px）。既定 460 */
  chartHeight?: number;
  /** クリックでツールチップを固定する機能を有効にする。既定 false */
  pinnableTooltip?: boolean;
  /** 凡例の右端に並べる任意 UI（例: 系列追加ボタン） */
  legendActions?: ReactNode;
  /** a11y / i18n 用ラベル（i18n 時に差し替え） */
  ariaLabels?: StackedBarWindowAriaLabels;
  /** ピン留めヒント文（pinnableTooltip=true 時に表示） */
  pinnedHintLabel?: string;
}

export function StackedBarWindowChart<Key extends string>({
  data,
  series,
  hiddenSeriesKeys,
  onToggleSeries,
  windowSize,
  startIndex,
  onStartIndexChange,
  theme,
  rangeLabel,
  animationKey,
  formatValue = DEFAULT_FORMATTER,
  chartHeight = DEFAULT_HEIGHT,
  pinnableTooltip = false,
  legendActions,
  ariaLabels,
  pinnedHintLabel = DEFAULT_PINNED_HINT,
}: StackedBarWindowChartProps<Key>) {
  const labels = { ...DEFAULT_LABELS, ...ariaLabels };

  const safeWindow = Math.max(1, Math.min(windowSize, data.length || 1));
  const maxStartIndex = Math.max(0, data.length - safeWindow);
  const safeStartIndex = Math.min(Math.max(0, startIndex), maxStartIndex);
  const endIndex = Math.min(safeStartIndex + safeWindow - 1, data.length - 1);

  const chartData = useMemo(
    () => data.slice(safeStartIndex, endIndex + 1),
    [data, safeStartIndex, endIndex],
  );

  const resolvedAnimationKey = animationKey ?? `${safeWindow}-${series.length}`;

  return (
    <div className="sbwc-root">
      <ChartLegend
        series={series}
        hiddenSeriesKeys={hiddenSeriesKeys}
        onToggle={onToggleSeries}
        actions={legendActions}
        ariaLabel={labels.legend}
      />

      <StackedBarChart
        chartData={chartData}
        series={series}
        hiddenSeriesKeys={hiddenSeriesKeys}
        animationKey={resolvedAnimationKey}
        theme={theme}
        formatValue={formatValue}
        height={chartHeight}
        pinnableTooltip={pinnableTooltip}
        ariaLabel={labels.chart}
        pinnedBadgeLabel={labels.pinnedBadge}
        pinnedHintLabel={pinnedHintLabel}
      />

      <WindowSlider
        startIndex={safeStartIndex}
        maxStartIndex={maxStartIndex}
        rangeLabel={rangeLabel}
        onStartIndexChange={onStartIndexChange}
        ariaLabels={{
          slider: labels.slider,
          prevButton: labels.prevButton,
          nextButton: labels.nextButton,
          windowControls: labels.windowControls,
        }}
      />
    </div>
  );
}
