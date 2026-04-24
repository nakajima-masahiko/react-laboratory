import type { ChartTheme, PlotRect } from '../types';
import type { XScale, YScale } from '../utils/createScales';
import { formatPrice, formatTime } from '../utils/formatters';

export type DrawAxisParams = {
  ctx: CanvasRenderingContext2D;
  plot: PlotRect;
  xScale: XScale;
  yScale: YScale;
  xTicks: Date[];
  yTicks: number[];
  theme: ChartTheme;
  timeframeMs: number;
};

const AXIS_FONT = '11px system-ui, sans-serif';
const TICK_LENGTH = 4;
const LABEL_GAP = 6;

export function drawAxis({
  ctx,
  plot,
  xScale,
  yScale,
  xTicks,
  yTicks,
  theme,
  timeframeMs,
}: DrawAxisParams): void {
  const xLabels = formatXAxisLabels(xTicks, timeframeMs);

  ctx.save();
  ctx.strokeStyle = theme.axis;
  ctx.fillStyle = theme.text;
  ctx.lineWidth = 1;
  ctx.font = AXIS_FONT;

  // X軸: 下端
  ctx.beginPath();
  ctx.moveTo(plot.left, plot.bottom + 0.5);
  ctx.lineTo(plot.right, plot.bottom + 0.5);
  ctx.stroke();

  // Y軸: 右端
  ctx.beginPath();
  ctx.moveTo(plot.right + 0.5, plot.top);
  ctx.lineTo(plot.right + 0.5, plot.bottom);
  ctx.stroke();

  // X tick labels
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.beginPath();
  for (const tick of xTicks) {
    const x = Math.round(xScale(tick)) + 0.5;
    ctx.moveTo(x, plot.bottom);
    ctx.lineTo(x, plot.bottom + TICK_LENGTH);
  }
  ctx.stroke();
  for (const [index, tick] of xTicks.entries()) {
    const x = xScale(tick);
    const label = xLabels[index];
    if (label) {
      ctx.fillText(label, x, plot.bottom + TICK_LENGTH + LABEL_GAP);
    }
  }

  // Y tick labels (右軸)
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.beginPath();
  for (const tick of yTicks) {
    const y = Math.round(yScale(tick)) + 0.5;
    ctx.moveTo(plot.right, y);
    ctx.lineTo(plot.right + TICK_LENGTH, y);
  }
  ctx.stroke();
  for (const tick of yTicks) {
    const y = yScale(tick);
    ctx.fillText(formatPrice(tick), plot.right + TICK_LENGTH + LABEL_GAP, y);
  }

  ctx.restore();
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function formatXAxisLabels(ticks: Date[], timeframeMs: number): string[] {
  const isIntraday = timeframeMs < DAY_IN_MS;
  let previousDayKey = '';

  return ticks.map((tick) => {
    const dayKey = formatTime(tick, '%Y/%m/%d');
    const isSameDay = dayKey === previousDayKey;
    previousDayKey = dayKey;

    if (isIntraday) {
      const timeLabel = formatTime(tick, '%H:%M:%S');
      return isSameDay ? timeLabel : `${dayKey} ${timeLabel}`;
    }

    return isSameDay ? '' : dayKey;
  });
}
