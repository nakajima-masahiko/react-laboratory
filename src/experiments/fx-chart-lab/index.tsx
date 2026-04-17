import { useState } from 'react';
import ChartControls from './ChartControls';
import FxChart from './FxChart';
import PromptPanel from './PromptPanel';
import { THEMES, type ThemeId } from './themes';
import './styles.css';

export type ChartType = 'candlestick' | 'line';

function FxChartLab() {
  const [chartType, setChartType] = useState<ChartType>('candlestick');
  const [themeId, setThemeId] = useState<ThemeId>('dark');

  const theme = THEMES[themeId];

  return (
    <div className="fxc-lab">
      <h2>FX Chart Lab</h2>
      <p>USD/JPY ダミーデータ — ローソク足 / ライン切り替えとカラーテーマ選択</p>

      <ChartControls
        chartType={chartType}
        onChartTypeChange={setChartType}
        theme={theme}
        onThemeChange={setThemeId}
      />

      <FxChart chartType={chartType} theme={theme} />

      <PromptPanel chartType={chartType} theme={theme} />
    </div>
  );
}

export default FxChartLab;
