import { max } from 'd3-array';
import { scaleBand, scaleLinear, type ScaleBand, type ScaleLinear } from 'd3-scale';
import type { ChartRow } from '../types';

export interface ChartScales {
  xScale: ScaleBand<string>;
  yScale: ScaleLinear<number, number>;
}

export function buildScales<Key extends string>(
  chartData: ChartRow<Key>[],
  visibleSeriesKeys: Key[],
  innerWidth: number,
  innerHeight: number,
): ChartScales {
  const xScale = scaleBand<string>()
    .domain(chartData.map((row) => row.key))
    .range([0, innerWidth])
    .paddingInner(0.2)
    .paddingOuter(0.1);

  const stackedTotalMax =
    max(chartData, (row) => visibleSeriesKeys.reduce((sum, key) => sum + row.values[key], 0)) ?? 0;

  const yScale = scaleLinear()
    .domain([0, stackedTotalMax === 0 ? 1 : stackedTotalMax])
    .nice(5)
    .range([innerHeight, 0]);

  return { xScale, yScale };
}
