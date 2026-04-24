import type { CandleData, ChartTheme, PlotRect } from '../types';
import type { XScale, YScale } from '../utils/createScales';

export type DrawLineParams = {
  ctx: CanvasRenderingContext2D;
  data: CandleData[];
  times: Date[];
  xScale: XScale;
  yScale: YScale;
  plot: PlotRect;
  theme: ChartTheme;
};

export function drawLine({
  ctx,
  data,
  times,
  xScale,
  yScale,
  plot,
  theme,
}: DrawLineParams): void {
  if (data.length === 0) return;

  ctx.save();
  ctx.beginPath();
  ctx.rect(plot.left, plot.top, plot.width, plot.height);
  ctx.clip();

  ctx.strokeStyle = theme.line;
  ctx.lineWidth = 1.5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.beginPath();
  for (let i = 0; i < data.length; i += 1) {
    const x = xScale(times[i]);
    const y = yScale(data[i].close);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.restore();
}
