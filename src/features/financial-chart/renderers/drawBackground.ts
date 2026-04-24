import type { ChartTheme } from '../types';

export type DrawBackgroundParams = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  theme: ChartTheme;
};

export function drawBackground({ ctx, width, height, theme }: DrawBackgroundParams): void {
  ctx.save();
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}
