import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import './styles.css';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'BTC'] as const;
type Currency = (typeof CURRENCIES)[number];

const COLORS: Record<Currency, string> = {
  USD: '#4e79a7',
  EUR: '#f28e2b',
  GBP: '#e15759',
  JPY: '#76b7b2',
  BTC: '#edc948',
};

const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

const RAW: Record<Currency, number[]> = {
  USD: [120, 135, 128, 142, 155, 148, 160, 172, 165, 180, 195, 210],
  EUR: [80,  85,  90,  88,  95, 100,  98, 105, 110, 115, 120, 130],
  GBP: [50,  48,  55,  60,  58,  65,  70,  68,  75,  72,  80,  85],
  JPY: [200, 210, 205, 215, 220, 230, 225, 240, 235, 250, 260, 270],
  BTC: [30,  35,  32,  40,  45,  42,  50,  55,  52,  60,  65,  70],
};

const data = MONTHS.map((month, i) => ({
  month,
  ...Object.fromEntries(CURRENCIES.map((c) => [c, RAW[c][i]])),
}));

function CurrencyChart() {
  return (
    <div className="cc-root">
      <h2>通貨別保有量チャート</h2>
      <p>各月における通貨ごとの保有量推移（ダミーデータ）</p>

      <div className="cc-wrapper">
        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fill: 'var(--text)', fontSize: 13 }} />
            <YAxis tick={{ fill: 'var(--text)', fontSize: 13 }} />
            <Tooltip
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
                stackId="a"
                fill={COLORS[currency]}
                isAnimationActive
                animationDuration={1000}
                animationBegin={index * 120}
                animationEasing="ease-out"
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default CurrencyChart;
