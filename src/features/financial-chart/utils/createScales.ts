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

  const hasUnsortedTime = times.some(
    (time, index) => index > 0 && time.getTime() < times[index - 1].getTime(),
  );

  if (hasUnsortedTime && import.meta.env.DEV) {
    console.warn(
      '[FinancialChart] data は time 昇順で渡してください。昇順でないデータを検出したため、X 軸 domain は min/max で補正します。',
    );
  }

  const xDomain: [Date, Date] = ((): [Date, Date] => {
    if (times.length === 0) return [new Date(0), new Date(1)];
    if (times.length === 1) return [times[0], new Date(times[0].getTime() + 1)];
    if (!hasUnsortedTime) return [times[0], times[times.length - 1]];

    let minTime = Number.POSITIVE_INFINITY;
    let maxTime = Number.NEGATIVE_INFINITY;
    for (const time of times) {
      const value = time.getTime();
      if (value < minTime) minTime = value;
      if (value > maxTime) maxTime = value;
    }
    return [new Date(minTime), new Date(maxTime)];
  })();

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
