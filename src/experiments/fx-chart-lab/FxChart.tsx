import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { fxData, type OhlcBar } from './data';
import CandlestickBar from './CandlestickBar';
import type { ChartTheme } from './themes';
import type { ChartType } from './index';

interface ChartRow extends OhlcBar {
  openClose: [number, number];
  lowHigh: [number, number];
}

const chartData: ChartRow[] = fxData.map((d) => ({
  ...d,
  openClose: [d.open, d.close],
  lowHigh: [d.low, d.high],
}));

interface TooltipEntry {
  payload?: ChartRow;
}

interface TooltipInnerProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
  theme: ChartTheme;
  chartType: ChartType;
}

function CustomTooltip({ active, payload, label, theme, chartType }: TooltipInnerProps) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  return (
    <div
      style={{
        background: theme.tooltipBg,
        color: theme.tooltipText,
        border: `1px solid ${theme.axisColor}`,
        borderRadius: 6,
        padding: '8px 12px',
        fontSize: 12,
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{label}</div>
      {chartType === 'candlestick' ? (
        <>
          <div>O: {row.open.toFixed(3)}</div>
          <div>H: {row.high.toFixed(3)}</div>
          <div>L: {row.low.toFixed(3)}</div>
          <div>C: {row.close.toFixed(3)}</div>
        </>
      ) : (
        <div>Close: {row.close.toFixed(3)}</div>
      )}
    </div>
  );
}

interface Props {
  chartType: ChartType;
  theme: ChartTheme;
}

function FxChart({ chartType, theme }: Props) {
  const domainMin = Math.min(...fxData.map((d) => d.low)) - 0.5;
  const domainMax = Math.max(...fxData.map((d) => d.high)) + 0.5;

  return (
    <div
      className="fxc-chart-wrapper"
      style={{ background: theme.bg, borderColor: theme.axisColor }}
    >
      <ResponsiveContainer width="100%" height={380}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 16, bottom: 0, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.gridColor} />
          <XAxis
            dataKey="time"
            tick={{ fill: theme.tickColor, fontSize: 11 }}
            axisLine={{ stroke: theme.axisColor }}
            tickLine={{ stroke: theme.axisColor }}
            interval={4}
          />
          <YAxis
            domain={[domainMin, domainMax]}
            tick={{ fill: theme.tickColor, fontSize: 11 }}
            axisLine={{ stroke: theme.axisColor }}
            tickLine={{ stroke: theme.axisColor }}
            tickFormatter={(v: number) => v.toFixed(2)}
            width={62}
          />
          <Tooltip
            content={(props) => {
              const p = props as unknown as TooltipInnerProps;
              return (
                <CustomTooltip
                  active={p.active}
                  payload={p.payload}
                  label={p.label}
                  theme={theme}
                  chartType={chartType}
                />
              );
            }}
          />

          {chartType === 'candlestick' ? (
            <Bar
              dataKey="openClose"
              shape={(props: object) => (
                <CandlestickBar
                  {...(props as Parameters<typeof CandlestickBar>[0])}
                  bullColor={theme.bullColor}
                  bearColor={theme.bearColor}
                />
              )}
              isAnimationActive={false}
            />
          ) : (
            <Line
              type="monotone"
              dataKey="close"
              stroke={theme.lineColor}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export default FxChart;
