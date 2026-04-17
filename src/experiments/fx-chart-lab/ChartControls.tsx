import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { THEMES, type ChartTheme, type ThemeId } from './themes';
import { type ChartType } from './index';

interface Props {
  chartType: ChartType;
  onChartTypeChange: (v: ChartType) => void;
  theme: ChartTheme;
  onThemeChange: (id: ThemeId) => void;
}

function ChartControls({ chartType, onChartTypeChange, theme, onThemeChange }: Props) {
  return (
    <div className="fxc-controls">
      <div className="fxc-control-group">
        <span className="fxc-label">チャートタイプ</span>
        <ToggleGroup.Root
          type="single"
          value={chartType}
          onValueChange={(v) => { if (v) onChartTypeChange(v as ChartType); }}
          className="fxc-toggle-group"
          aria-label="チャートタイプ選択"
        >
          <ToggleGroup.Item value="candlestick" className="fxc-toggle-item" aria-label="ローソク足">
            ローソク足
          </ToggleGroup.Item>
          <ToggleGroup.Item value="line" className="fxc-toggle-item" aria-label="ライン">
            ライン
          </ToggleGroup.Item>
        </ToggleGroup.Root>
      </div>

      <div className="fxc-control-group">
        <span className="fxc-label">カラーテーマ</span>
        <ToggleGroup.Root
          type="single"
          value={theme.id}
          onValueChange={(v) => { if (v) onThemeChange(v as ThemeId); }}
          className="fxc-toggle-group"
          aria-label="カラーテーマ選択"
        >
          {(Object.keys(THEMES) as ThemeId[]).map((id) => (
            <ToggleGroup.Item
              key={id}
              value={id}
              className="fxc-toggle-item fxc-theme-item"
              aria-label={THEMES[id].label}
              style={{ '--theme-bg': THEMES[id].bg, '--theme-accent': THEMES[id].lineColor } as React.CSSProperties}
            >
              <span className="fxc-theme-swatch" />
              {THEMES[id].label}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup.Root>
      </div>
    </div>
  );
}

export default ChartControls;
