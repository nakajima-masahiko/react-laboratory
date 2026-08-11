import { CandleChart } from 'candle-core';

/**
 * Laboratory-only constructor option from CandleCore Request 027.
 *
 * This deliberately does not augment CandleCore's public ChartOptions. Remove this
 * adapter when the research flag is removed or replaced by a stable API.
 */
type ExperimentalConstructorOptions = ConstructorParameters<typeof CandleChart>[1] & {
  __experimentalFullRangeLod?: boolean;
};

type CandleChartConstructor = new (
  host: ConstructorParameters<typeof CandleChart>[0],
  options: ExperimentalConstructorOptions,
) => CandleChart;

export function createLabCandleChart(
  host: ConstructorParameters<typeof CandleChart>[0],
  options: ConstructorParameters<typeof CandleChart>[1],
  experimentalFullRangeLod: boolean,
): CandleChart {
  const Constructor = CandleChart as CandleChartConstructor;
  return new Constructor(host, experimentalFullRangeLod
    ? { ...options, __experimentalFullRangeLod: true }
    : options);
}
