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
};

export type FinancialChartProps = {
  data: CandleData[];
  chartType: ChartType;
  theme: ChartTheme;
  height?: number;
};

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
