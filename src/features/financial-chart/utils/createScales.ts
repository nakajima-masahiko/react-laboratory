import { scaleLinear, scaleTime, type ScaleLinear, type ScaleTime } from 'd3-scale';
import type { CandleData, ChartType, PlotRect } from '../types';
import { getPriceRange } from './getPriceRange';

export type XScale = ScaleTime<number, number>;
export type YScale = ScaleLinear<number, number>;

export type ChartScales = {
  xScale: XScale;
  yScale: YScale;
  times: Date[];
};

export function createScales(
  data: CandleData[],
  chartType: ChartType,
  plot: PlotRect,
): ChartScales {
  const times = data.map((d) => new Date(d.time));

  const xDomain: [Date, Date] =
    times.length === 0
      ? [new Date(0), new Date(1)]
      : times.length === 1
        ? [times[0], new Date(times[0].getTime() + 1)]
        : [times[0], times[times.length - 1]];

  const xScale = scaleTime().domain(xDomain).range([plot.left, plot.right]);

  const { min, max } = getPriceRange(data, chartType);
  const yScale = scaleLinear().domain([min, max]).range([plot.bottom, plot.top]);

  return { xScale, yScale, times };
}

export function computeCandleWidth(times: Date[], xScale: XScale): number {
  if (times.length < 2) return 8;
  let minStep = Number.POSITIVE_INFINITY;
  for (let i = 1; i < times.length; i += 1) {
    const step = xScale(times[i]) - xScale(times[i - 1]);
    if (step > 0 && step < minStep) minStep = step;
  }
  if (!Number.isFinite(minStep)) return 8;
  return Math.max(1, Math.floor(minStep * 0.7));
}
