import { max } from 'd3-array';
import { scaleBand, scaleLinear, type ScaleBand, type ScaleLinear } from 'd3-scale';
import { CURRENCIES, type ChartRow, type Currency } from '../types';

export interface ChartScales {
  xScale: ScaleBand<string>;
  yScale: ScaleLinear<number, number>;
}

export function buildScales(
  chartData: ChartRow[],
  hiddenCurrencies: Set<Currency>,
  innerWidth: number,
  innerHeight: number,
): ChartScales {
  const xScale = scaleBand<string>()
    .domain(chartData.map((row) => row.key))
    .range([0, innerWidth])
    .paddingInner(0.2)
    .paddingOuter(0.1);

  const stackedTotalMax =
    max(chartData, (row) =>
      CURRENCIES.filter((currency) => !hiddenCurrencies.has(currency)).reduce(
        (sum, currency) => sum + row[currency],
        0,
      ),
    ) ?? 0;

  const yScale = scaleLinear()
    .domain([0, stackedTotalMax === 0 ? 1 : stackedTotalMax])
    .nice(5)
    .range([innerHeight, 0]);

  return { xScale, yScale };
}
