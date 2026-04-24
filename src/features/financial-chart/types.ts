export type ChartType = 'candlestick' | 'line';

export type CandleData = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type ChartTheme = {
  background: string;
  grid: string;
  axis: string;
  text: string;
  candleUp: string;
  candleDown: string;
  line: string;
  latestPriceLine: string;
  latestPriceLabelBg: string;
  latestPriceLabelText: string;
  tooltipGuideLine: string;
};

export type FinancialChartProps = {
  data: CandleData[];
  chartType: ChartType;
  theme: ChartTheme;
  height?: number;
  tooltip?: TooltipOptions;
};

export type TooltipLabels = {
  date: string;
  open: string;
  high: string;
  low: string;
  close: string;
};

export type TooltipOptions = {
  labels?: Partial<TooltipLabels>;
  dateFormat?: string;
};

export const DEFAULT_TOOLTIP_LABELS: TooltipLabels = {
  date: '日付',
  open: '始値',
  high: '高値',
  low: '安値',
  close: '終値',
};

export const DEFAULT_TOOLTIP_DATE_FORMAT = '%Y/%m/%d %H:%M';

export type PlotRect = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
};

export type ChartMargin = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export const DEFAULT_MARGIN: ChartMargin = {
  top: 16,
  right: 64,
  bottom: 32,
  left: 16,
};
