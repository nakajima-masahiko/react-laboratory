import type { ChartTheme, PlotRect } from '../types';
import type { XScale, YScale } from '../utils/createScales';

export type DrawGridParams = {
  ctx: CanvasRenderingContext2D;
  plot: PlotRect;
  xScale: XScale;
  yScale: YScale;
  xTicks: Date[];
  yTicks: number[];
  theme: ChartTheme;
};

export function drawGrid({
  ctx,
  plot,
  xScale,
  yScale,
  xTicks,
  yTicks,
  theme,
}: DrawGridParams): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(plot.left, plot.top, plot.width, plot.height);
  ctx.clip();

  ctx.strokeStyle = theme.grid;
  ctx.lineWidth = 1;

  ctx.beginPath();
  for (const tick of xTicks) {
    const x = Math.round(xScale(tick)) + 0.5;
    ctx.moveTo(x, plot.top);
    ctx.lineTo(x, plot.bottom);
  }
  for (const tick of yTicks) {
    const y = Math.round(yScale(tick)) + 0.5;
    ctx.moveTo(plot.left, y);
    ctx.lineTo(plot.right, y);
  }
  ctx.stroke();

  ctx.restore();
}
