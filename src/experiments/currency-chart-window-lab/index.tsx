import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  Brush,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import './styles.css';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'BTC'] as const;
type Currency = (typeof CURRENCIES)[number];

type RangeValue = '1' | '3' | '6' | '12';

interface ChartRow {
  key: string;
  label: string;
  monthLabel: string;
  USD: number;
  EUR: number;
  GBP: number;
  JPY: number;
  BTC: number;
}

const RANGE_OPTIONS: ReadonlyArray<{ value: RangeValue; label: string; months: number }> = [
  { value: '1', label: '1ヶ月', months: 1 },
  { value: '3', label: '3ヶ月', months: 3 },
  { value: '6', label: '6ヶ月', months: 6 },
  { value: '12', label: '1年', months: 12 },
];

const TOTAL_MONTHS = 36;
const CURRENT_INDEX = 18;

const COLORS: Record<Currency, string> = {
  USD: '#4e79a7',
  EUR: '#f28e2b',
  GBP: '#e15759',
  JPY: '#76b7b2',
  BTC: '#edc948',
};

function addMonths(base: Date, offset: number) {
  return new Date(base.getFullYear(), base.getMonth() + offset, 1);
}

function formatMonth(date: Date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

function createAmount(index: number, currency: Currency) {
  const phaseByCurrency: Record<Currency, number> = {
    USD: 0,
    EUR: 0.8,
    GBP: 1.2,
    JPY: 1.6,
    BTC: 2.1,
  };

  const baseByCurrency: Record<Currency, number> = {
    USD: 130,
    EUR: 95,
    GBP: 72,
    JPY: 190,
    BTC: 28,
  };

  const growthByCurrency: Record<Currency, number> = {
    USD: 1.8,
    EUR: 1.3,
    GBP: 0.9,
    JPY: 2.3,
    BTC: 1.7,
  };

  const seasonal = Math.sin(index / 3 + phaseByCurrency[currency]) * 10;
  const amount = baseByCurrency[currency] + growthByCurrency[currency] * index + seasonal;
  return Math.max(0, Math.round(amount));
}

function buildData(now = new Date()): ChartRow[] {
  return Array.from({ length: TOTAL_MONTHS }, (_, index) => {
    const date = addMonths(now, index - CURRENT_INDEX);
    return {
      key: `${date.getFullYear()}-${date.getMonth() + 1}`,
      label: formatMonth(date),
      monthLabel: `${date.getMonth() + 1}月`,
      ...Object.fromEntries(CURRENCIES.map((currency) => [currency, createAmount(index, currency)])),
    } as ChartRow;
  });
}

function CurrencyChartWindowLab() {
  const data = useMemo(() => buildData(), []);
  const [selectedRange, setSelectedRange] = useState<RangeValue>('6');
  const [startIndex, setStartIndex] = useState<number>(CURRENT_INDEX);

  const visibleMonths = RANGE_OPTIONS.find((option) => option.value === selectedRange)?.months ?? 6;
  const maxStartIndex = Math.max(0, data.length - visibleMonths);
  const safeStartIndex = Math.min(startIndex, maxStartIndex);
  const endIndex = Math.min(safeStartIndex + visibleMonths - 1, data.length - 1);

  const handleRangeChange = (value: string) => {
    if (!value) {
      return;
    }

    const nextRange = value as RangeValue;
    setSelectedRange(nextRange);
    const nextVisibleMonths = RANGE_OPTIONS.find((option) => option.value === nextRange)?.months ?? 6;
    const nextMaxStart = Math.max(0, data.length - nextVisibleMonths);
    setStartIndex(Math.min(CURRENT_INDEX, nextMaxStart));
  };

  return (
    <div className="ccw-root">
      <div className="ccw-header">
        <div>
          <h2>通貨別つみたて棒グラフ（36ヶ月データ）</h2>
          <p>表示期間を切り替えながら、ブラシの左右ドラッグで表示位置を移動できます。</p>
        </div>

        <ToggleGroup.Root
          type="single"
          value={selectedRange}
          onValueChange={handleRangeChange}
          className="ccw-toggle-group"
          aria-label="表示月数"
        >
          {RANGE_OPTIONS.map((option) => (
            <ToggleGroup.Item
              key={option.value}
              value={option.value}
              className="ccw-toggle-item"
              aria-label={option.label}
            >
              {option.label}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup.Root>
      </div>

      <div className="ccw-wrapper">
        <ResponsiveContainer width="100%" height={460}>
          <BarChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="key"
              interval={0}
              tick={{ fill: 'var(--text)', fontSize: 13 }}
              tickFormatter={(_, index) => data[index]?.monthLabel ?? ''}
            />
            <YAxis tick={{ fill: 'var(--text)', fontSize: 13 }} />
            <Tooltip
              labelFormatter={(_, payload) => payload?.[0]?.payload?.label ?? ''}
              contentStyle={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                borderRadius: '6px',
              }}
            />
            <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: 16 }} />
            {CURRENCIES.map((currency, index) => (
              <Bar
                key={currency}
                dataKey={currency}
                stackId="holdings"
                fill={COLORS[currency]}
                isAnimationActive
                animationDuration={900}
                animationBegin={index * 120}
                animationEasing="ease-out"
              />
            ))}
            <Brush
              dataKey="key"
              startIndex={safeStartIndex}
              endIndex={endIndex}
              height={34}
              stroke="var(--accent)"
              travellerWidth={10}
              onChange={(range) => {
                if (typeof range.startIndex !== 'number') {
                  return;
                }
                setStartIndex(Math.max(0, Math.min(range.startIndex, maxStartIndex)));
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default CurrencyChartWindowLab;
