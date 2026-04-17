import { useMemo, useState } from 'react';
import type { ChartTheme } from './themes';
import type { ChartType } from './index';

interface Props {
  chartType: ChartType;
  theme: ChartTheme;
}

function buildPrompt(chartType: ChartType, theme: ChartTheme): string {
  const typeLabel = chartType === 'candlestick' ? 'ローソク足 (OHLC)' : 'ライン (終値)';
  const seriesSpec =
    chartType === 'candlestick'
      ? `- 各バーは OHLC(始値/高値/安値/終値) を表す縦長のローソク足。
  - 陽線(close ≥ open)は ${theme.bullColor}、陰線(close < open)は ${theme.bearColor} で塗りつぶす。
  - ヒゲ(上下の細い線)は high〜low を表し、実体部分は open〜close。
  - バー幅は約 9px、アニメーションなし。`
      : `- 終値(close)を結ぶ折れ線グラフ。
  - 線の色は ${theme.lineColor}、太さ 2px、ドットなし、曲線補間 (monotone)。
  - アニメーションなし。`;

  return `USD/JPY のリアルタイム FX チャートを以下の仕様で生成してください。

【データ】
- 直近 60 本の 1 秒足ダミー OHLC データを保持する。
- 1 秒ごとに新しいバーを 1 本追加し、先頭の古いバーを 1 本破棄(ローリングウィンドウ)。
- 新規バーは直前の close を基点に ±0.09 程度のランダムウォークで生成し、小数第 3 位まで。
- 初期価格は 150.000 付近、ラベルは HH:MM:SS (24時間表記)。

【チャート種別】
- ${typeLabel}
${seriesSpec}

【レイアウト・軸】
- ライブラリ: Recharts の ComposedChart を想定 (または同等の描画)。
- 高さ: 380px、横幅は親要素に追従 (ResponsiveContainer)。
- X 軸: time ラベル、4 本おきに目盛り表示。
- Y 軸: 右側配置、ドメインは [min(low) - 0.08, max(high) + 0.08]、小数第 2 位表示、幅 62px。
- グリッド: 破線 (3 3)。
- 最新終値に水平の参照線(破線 4 4, 太さ 1px)を引き、右端に帯状のラベルで最新値を小数第 3 位まで表示。参照線とラベルの色は #ff9800、ラベル文字色は #ffffff。
- ツールチップは ${chartType === 'candlestick' ? 'O/H/L/C を 4 行' : 'Close を 1 行'} 表示、小数第 3 位。

【カラーテーマ: ${theme.label}】
- 背景: ${theme.bg}
- グリッド色: ${theme.gridColor}
- 軸色: ${theme.axisColor}
- 目盛文字色: ${theme.tickColor}
- ライン色: ${theme.lineColor}
- 陽線色: ${theme.bullColor}
- 陰線色: ${theme.bearColor}
- ツールチップ背景: ${theme.tooltipBg}
- ツールチップ文字色: ${theme.tooltipText}

【外観】
- チャート外側を border-radius 10px、パディング上下左右 12px 程度のカードで囲む。
- カード背景はテーマ背景色、枠線はテーマ軸色。`;
}

function PromptPanel({ chartType, theme }: Props) {
  const prompt = useMemo(() => buildPrompt(chartType, theme), [chartType, theme]);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="fxc-prompt">
      <div className="fxc-prompt-header">
        <span className="fxc-label">生成プロンプト</span>
        <button type="button" className="fxc-copy-btn" onClick={handleCopy}>
          {copied ? 'コピーしました' : 'コピー'}
        </button>
      </div>
      <pre className="fxc-prompt-body">{prompt}</pre>
    </div>
  );
}

export default PromptPanel;
