import type { CandleData, ChartTheme, PlotRect } from '../types';
import type { XScale, YScale } from '../utils/createScales';

export type DrawCandlesticksParams = {
  ctx: CanvasRenderingContext2D;
  data: CandleData[];
  times: Date[];
  xScale: XScale;
  yScale: YScale;
  candleWidth: number;
  plot: PlotRect;
  theme: ChartTheme;
};

export function drawCandlesticks({
  ctx,
  data,
  times,
  xScale,
  yScale,
  candleWidth,
  plot,
  theme,
}: DrawCandlesticksParams): void {
  if (data.length === 0) return;

  ctx.save();
  ctx.beginPath();
  ctx.rect(plot.left, plot.top, plot.width, plot.height);
  ctx.clip();

  const halfWidth = candleWidth / 2;

  for (let i = 0; i < data.length; i += 1) {
    const d = data[i];
    const cx = xScale(times[i]);
    const highY = yScale(d.high);
    const lowY = yScale(d.low);
    const openY = yScale(d.open);
    const closeY = yScale(d.close);

    const isUp = d.close >= d.open;
    const color = isUp ? theme.candleUp : theme.candleDown;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1;

    // ヒゲ
    const wickX = Math.round(cx) + 0.5;
    ctx.beginPath();
    ctx.moveTo(wickX, highY);
    ctx.lineTo(wickX, lowY);
    ctx.stroke();

    // 実体
    const bodyTop = Math.min(openY, closeY);
    const bodyBottom = Math.max(openY, closeY);
    const bodyHeight = Math.max(1, bodyBottom - bodyTop);
    const bodyX = Math.round(cx - halfWidth);
    const bodyW = Math.max(1, Math.round(candleWidth));
    ctx.fillRect(bodyX, Math.round(bodyTop), bodyW, Math.round(bodyHeight));
  }

  ctx.restore();
}
