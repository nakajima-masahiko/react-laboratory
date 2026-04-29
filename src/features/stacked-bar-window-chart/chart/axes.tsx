import type { ScaleBand, ScaleLinear } from 'd3-scale';
import type { StackedDataPoint, ValueFormatter } from '../types';

interface YAxisProps {
  yScale: ScaleLinear<number, number>;
  innerWidth: number;
  gridColor: string;
  formatValue: ValueFormatter;
}

export function YAxis({ yScale, innerWidth, gridColor, formatValue }: YAxisProps) {
  const ticks = yScale.ticks(5);
  return (
    <g className="sbwc-y-axis" aria-hidden="true">
      {ticks.map((tick) => {
        const y = yScale(tick);
        return (
          <g key={tick} transform={`translate(0, ${y})`}>
            <line x1={0} x2={innerWidth} y1={0} y2={0} stroke={gridColor} strokeDasharray="3 3" />
            <text x={-8} y={0} dy="0.32em" textAnchor="end" fontSize={13} fill="var(--text)">{formatValue(tick)}</text>
          </g>
        );
      })}
    </g>
  );
}

interface XAxisProps<Key extends string> {
  xScale: ScaleBand<string>;
  innerHeight: number;
  chartData: StackedDataPoint<Key>[];
  gridColor: string;
  innerWidth: number;
}

export function XAxis<Key extends string>({ xScale, innerHeight, chartData, gridColor, innerWidth }: XAxisProps<Key>) {
  const bandwidth = xScale.bandwidth();
  const fontSize = bandwidth >= 36 ? 13 : bandwidth >= 24 ? 12 : 11;
  const labelByKey = new Map(chartData.map((row) => [row.key, row.axisLabel]));
  const maxLabelCount = Math.max(2, Math.floor(innerWidth / 52));
  const labelStep = Math.max(1, Math.ceil(chartData.length / maxLabelCount));

  return (
    <g className="sbwc-x-axis" transform={`translate(0, ${innerHeight})`} aria-hidden="true">
      {xScale.domain().map((key, i) => {
        const shouldShow = i === 0 || i === chartData.length - 1 || i % labelStep === 0;
        if (!shouldShow) return null;
        const x = (xScale(key) ?? 0) + bandwidth / 2;
        return (
          <g key={key}>
            <line x1={x} x2={x} y1={-innerHeight} y2={0} stroke={gridColor} strokeDasharray="3 3" />
            <text x={x} y={20} textAnchor="middle" fontSize={fontSize} fill="var(--text)">{labelByKey.get(key)}</text>
          </g>
        );
      })}
    </g>
  );
}
