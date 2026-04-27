import { format } from 'd3-format';
import type { ScaleBand, ScaleLinear } from 'd3-scale';
import type { ChartRow } from '../types';

const formatNumber = format(',');

interface YAxisProps {
  yScale: ScaleLinear<number, number>;
  innerWidth: number;
}

export function YAxis({ yScale, innerWidth }: YAxisProps) {
  const ticks = yScale.ticks(5);
  return (
    <g className="ccws-y-axis" aria-hidden="true">
      {ticks.map((tick) => {
        const y = yScale(tick);
        return (
          <g key={tick} transform={`translate(0, ${y})`}>
            <line
              x1={0}
              x2={innerWidth}
              y1={0}
              y2={0}
              stroke="var(--border)"
              strokeDasharray="3 3"
            />
            <text x={-8} y={0} dy="0.32em" textAnchor="end" fontSize={13} fill="var(--text)">
              {formatNumber(tick)}
            </text>
          </g>
        );
      })}
    </g>
  );
}

interface XAxisProps<Key extends string> {
  xScale: ScaleBand<string>;
  innerHeight: number;
  chartData: ChartRow<Key>[];
}

export function XAxis<Key extends string>({ xScale, innerHeight, chartData }: XAxisProps<Key>) {
  const bandwidth = xScale.bandwidth();
  const showAll = bandwidth >= 28;
  const fontSize = bandwidth >= 36 ? 13 : bandwidth >= 24 ? 12 : 11;
  const labelByKey = new Map(chartData.map((row) => [row.key, row.monthLabel]));

  return (
    <g className="ccws-x-axis" transform={`translate(0, ${innerHeight})`} aria-hidden="true">
      {xScale.domain().map((key, i) => {
        const x = (xScale(key) ?? 0) + bandwidth / 2;
        if (!showAll && i % 2 === 1) {
          return null;
        }
        return (
          <text key={key} x={x} y={20} textAnchor="middle" fontSize={fontSize} fill="var(--text)">
            {labelByKey.get(key)}
          </text>
        );
      })}
    </g>
  );
}
