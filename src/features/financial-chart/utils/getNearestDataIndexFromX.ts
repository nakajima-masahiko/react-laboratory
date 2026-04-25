import { type PlotRect } from '../types';

export function getNearestDataIndexFromX(
  pointerX: number,
  plot: PlotRect,
  dataLength: number,
): number {
  if (dataLength <= 1) return 0;

  const ratio = (pointerX - plot.left) / plot.width;
  const index = Math.round(ratio * (dataLength - 1));

  return Math.max(0, Math.min(index, dataLength - 1));
}
