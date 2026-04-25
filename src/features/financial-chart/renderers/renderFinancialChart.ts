import { type CandleData, type ChartTheme, type ChartType, type PlotRect } from '../types';
import { computeCandleWidth, createScales } from '../utils/createScales';
import { drawAxis } from './drawAxis';
import { drawBackground } from './drawBackground';
import { drawCandlesticks } from './drawCandlesticks';
import { drawGrid } from './drawGrid';
import { drawLatestPriceLabel } from './drawLatestPriceLabel';
import { drawLatestPriceLine } from './drawLatestPriceLine';
import { drawLine } from './drawLine';

const X_TICK_COUNT = 6;
const Y_TICK_COUNT = 6;

export type RenderFinancialChartParams = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  data: CandleData[];
  chartType: ChartType;
  theme: ChartTheme;
  timeframeMs: number;
  plot: PlotRect;
};

export function renderFinancialChart({
  ctx,
  width,
  height,
  data,
  chartType,
  theme,
  timeframeMs,
  plot,
}: RenderFinancialChartParams): void {
  ctx.clearRect(0, 0, width, height);
  drawBackground({ ctx, width, height, theme });

  if (plot.width <= 0 || plot.height <= 0) return;

  const { xScale, yScale, times } = createScales(data, chartType, plot);
  const xTicks = data.length === 0 ? [] : (xScale.ticks(X_TICK_COUNT) as Date[]);
  const yTicks = data.length === 0 ? [] : yScale.ticks(Y_TICK_COUNT);

  drawGrid({ ctx, plot, xScale, yScale, xTicks, yTicks, theme });

  if (data.length > 0) {
    if (chartType === 'candlestick') {
      const candleWidth = computeCandleWidth(times, xScale);
      drawCandlesticks({
        ctx,
        data,
        times,
        xScale,
        yScale,
        candleWidth,
        plot,
        theme,
      });
    } else {
      drawLine({ ctx, data, times, xScale, yScale, plot, theme });
    }
  }

  drawAxis({
    ctx,
    plot,
    xScale,
    yScale,
    xTicks,
    yTicks,
    theme,
    timeframeMs,
  });

  if (data.length > 0) {
    const latest = data[data.length - 1].close;
    drawLatestPriceLine({ ctx, price: latest, yScale, plot, theme });
    drawLatestPriceLabel({ ctx, price: latest, yScale, plot, theme });
  }
}
