import { useEffect, useState } from 'react';
import { FinancialChart, type ChartType } from '../../features/financial-chart';
import { generateCandleData, generateNextCandle } from './data';
import { THEME_LABELS, THEMES, type ThemeId } from './themes';
import './styles.css';

function FinancialChartLab() {
  const [chartType, setChartType] = useState<ChartType>('candlestick');
  const [themeId, setThemeId] = useState<ThemeId>('dark');
  const [count, setCount] = useState<number>(60);
  const [height, setHeight] = useState<number>(400);
  const [data, setData] = useState(() => generateCandleData(count));

  const theme = THEMES[themeId];

  useEffect(() => {
    setData(generateCandleData(count));
  }, [count]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setData((prev) => {
        if (prev.length === 0) {
          return generateCandleData(count);
        }
        const next = generateNextCandle(prev[prev.length - 1]);
        return [...prev, next].slice(-count);
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [count]);

  return (
    <div className="fc-lab">
      <h2>Financial Chart</h2>
      <p>
        Canvasベースのローソク足 / ライン切り替えチャート。
        d3はスケール・ticks・フォーマットのみに使用し、描画は自前で実装。
      </p>

      <div className="fc-lab__controls">
        <div className="fc-lab__control-group">
          <label htmlFor="fc-type">種別</label>
          <select
            id="fc-type"
            value={chartType}
            onChange={(e) => setChartType(e.target.value as ChartType)}
          >
            <option value="candlestick">ローソク足</option>
            <option value="line">ライン</option>
          </select>
        </div>

        <div className="fc-lab__control-group">
          <label htmlFor="fc-theme">テーマ</label>
          <select
            id="fc-theme"
            value={themeId}
            onChange={(e) => setThemeId(e.target.value as ThemeId)}
          >
            {(Object.keys(THEMES) as ThemeId[]).map((id) => (
              <option key={id} value={id}>
                {THEME_LABELS[id]}
              </option>
            ))}
          </select>
        </div>

        <div className="fc-lab__control-group">
          <label htmlFor="fc-count">件数</label>
          <input
            id="fc-count"
            type="number"
            min={0}
            max={500}
            step={10}
            value={count}
            onChange={(e) => setCount(Math.max(0, Number(e.target.value) || 0))}
          />
        </div>

        <div className="fc-lab__control-group">
          <label htmlFor="fc-height">高さ</label>
          <input
            id="fc-height"
            type="range"
            min={200}
            max={1000}
            step={100}
            value={height}
            onChange={(e) => setHeight(Number(e.target.value) || 200)}
          />
          <span>{height}px</span>
        </div>
      </div>

      <div className="fc-lab__chart">
        <FinancialChart
          data={data}
          chartType={chartType}
          theme={theme}
          height={height}
          tooltip={{
            labels: {
              date: '日時',
              open: '始値',
              high: '高値',
              low: '安値',
              close: '終値',
            },
            dateFormat: '%Y/%m/%d %H:%M',
          }}
        />
      </div>
    </div>
  );
}

export default FinancialChartLab;
