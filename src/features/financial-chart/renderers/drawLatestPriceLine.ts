import type { ChartTheme, PlotRect } from '../types';
import type { YScale } from '../utils/createScales';

export type DrawLatestPriceLineParams = {
  ctx: CanvasRenderingContext2D;
  price: number;
  yScale: YScale;
  plot: PlotRect;
  theme: ChartTheme;
};

export function drawLatestPriceLine({
  ctx,
  price,
  yScale,
  plot,
  theme,
}: DrawLatestPriceLineParams): void {
  const y = Math.round(yScale(price)) + 0.5;
  if (y < plot.top || y > plot.bottom) return;

  ctx.save();
  ctx.strokeStyle = theme.latestPriceLine;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(plot.left, y);
  ctx.lineTo(plot.right, y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}
