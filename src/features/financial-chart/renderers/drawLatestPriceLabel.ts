import type { ChartTheme, PlotRect } from '../types';
import type { YScale } from '../utils/createScales';
import { formatLatestPrice } from '../utils/formatters';

export type DrawLatestPriceLabelParams = {
  ctx: CanvasRenderingContext2D;
  price: number;
  yScale: YScale;
  plot: PlotRect;
  theme: ChartTheme;
};

const LABEL_FONT = '11px system-ui, sans-serif';
const LABEL_PADDING_X = 8;
const LABEL_PADDING_Y = 3;
const LABEL_RADIUS = 3;

export function drawLatestPriceLabel({
  ctx,
  price,
  yScale,
  plot,
  theme,
}: DrawLatestPriceLabelParams): void {
  const text = formatLatestPrice(price);
  const y = yScale(price);

  ctx.save();
  ctx.font = LABEL_FONT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const textHeight =
    metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent || 11;

  const rectW = Math.ceil(textWidth + LABEL_PADDING_X * 2);
  const rectH = Math.ceil(textHeight + LABEL_PADDING_Y * 2);
  const rectX = plot.right + 1;
  const clampedY = Math.max(plot.top + rectH / 2, Math.min(plot.bottom - rectH / 2, y));
  const rectY = clampedY - rectH / 2;

  ctx.fillStyle = theme.latestPriceLabelBg;
  drawRoundedRect(ctx, rectX, rectY, rectW, rectH, LABEL_RADIUS);
  ctx.fill();

  ctx.fillStyle = theme.latestPriceLabelText;
  ctx.fillText(text, rectX + rectW / 2, clampedY);

  ctx.restore();
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
