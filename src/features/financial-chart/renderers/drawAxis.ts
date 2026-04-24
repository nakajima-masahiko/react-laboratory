import type { ChartTheme, PlotRect } from '../types';
import type { XScale, YScale } from '../utils/createScales';
import { formatPrice } from '../utils/formatters';

export type DrawAxisParams = {
  ctx: CanvasRenderingContext2D;
  plot: PlotRect;
  xScale: XScale;
  yScale: YScale;
  xTicks: Date[];
  yTicks: number[];
  timeframeMs: number;
  theme: ChartTheme;
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
  timeframeMs,
  theme,
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

function formatXAxisLabels(ticks: Date[], timeframeMs: number): string[] {
  if (ticks.length === 0) return [];

  const dayMs = 24 * 60 * 60 * 1000;
  const shouldShowMinuteSecond = timeframeMs < dayMs;
  let lastYear: number | null = null;
  let lastMonth: number | null = null;
  let lastDay: number | null = null;
  let lastHour: number | null = null;
  let lastMinute: number | null = null;
  let lastSecond: number | null = null;

  const formatHour = (hour: number) => `${hour}時`;
  const formatMinuteSecond = (minute: number, second: number) =>
    `${String(minute).padStart(2, '0')}分${String(second).padStart(2, '0')}秒`;
  const formatSecond = (second: number) => `${String(second).padStart(2, '0')}秒`;

  return ticks.map((tick) => {
    const year = tick.getFullYear();
    const month = tick.getMonth() + 1;
    const day = tick.getDate();
    const hour = tick.getHours();
    const minute = tick.getMinutes();
    const second = tick.getSeconds();

    let label: string;
    if (lastYear !== year) {
      label = `${year}年${month}月${day}日${formatHour(hour)}`;
      if (shouldShowMinuteSecond) {
        label += formatMinuteSecond(minute, second);
      }
    } else if (lastMonth !== month) {
      label = `${month}月${day}日${formatHour(hour)}`;
      if (shouldShowMinuteSecond) {
        label += formatMinuteSecond(minute, second);
      }
    } else if (lastDay !== day) {
      label = `${day}日${formatHour(hour)}`;
      if (shouldShowMinuteSecond) {
        label += formatMinuteSecond(minute, second);
      }
    } else if (lastHour !== hour) {
      label = formatHour(hour);
      if (shouldShowMinuteSecond) {
        label += formatMinuteSecond(minute, second);
      }
    } else if (shouldShowMinuteSecond && lastMinute !== minute) {
      label = formatMinuteSecond(minute, second);
    } else if (shouldShowMinuteSecond && lastSecond !== second) {
      label = formatSecond(second);
    } else {
      label = '';
    }

    lastYear = year;
    lastMonth = month;
    lastDay = day;
    lastHour = hour;
    lastMinute = minute;
    lastSecond = second;
    return label;
  });
}
