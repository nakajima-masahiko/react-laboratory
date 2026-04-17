import { useState } from 'react';
import { THEMES, type ChartTheme } from './themes';

const PROMPT = buildPrompt();

function buildPrompt(): string {
  const themeLines = (Object.values(THEMES) as ChartTheme[])
    .map(
      (t) => `  - ${t.label} (id: ${t.id})
    - 背景: ${t.bg}
    - グリッド色: ${t.gridColor}
    - 軸色: ${t.axisColor}
    - 目盛文字色: ${t.tickColor}
    - ライン色: ${t.lineColor}
    - 陽線色: ${t.bullColor}
    - 陰線色: ${t.bearColor}
    - ツールチップ背景: ${t.tooltipBg}
    - ツールチップ文字色: ${t.tooltipText}`,
    )
    .join('\n');

  return `USD/JPY のリアルタイム FX チャートを、以下の仕様をすべて満たす「ひとつのコンポーネント」として生成してください。

【全体像】
- 1 画面に以下の 3 要素を縦に配置する。
  1. チャートタイプ (ローソク足 / ライン) とカラーテーマ (ダーク / ライト / オーシャン) を切り替える操作パネル。
  2. 選択中の設定に応じて再描画される USD/JPY チャート本体。
  3. このコンポーネントを他システムで再生成するための日本語プロンプト文と、クリップボードにコピーするためのコピーボタン。

【データ】
- 直近 60 本の 1 秒足ダミー OHLC データを保持する。
- 1 秒ごとに新しいバーを 1 本追加し、先頭の古いバーを 1 本破棄 (ローリングウィンドウ)。
- 新規バーは直前の close を基点に ±0.09 程度のランダムウォークで生成し、小数第 3 位まで。
- 初期価格は 150.000 付近、時刻ラベルは HH:MM:SS (24 時間表記)。

【操作パネル】
- トグルグループ 2 つを横並びで配置する。
  - 「チャートタイプ」: ローソク足 / ライン の二択トグル。
  - 「カラーテーマ」: ダーク / ライト / オーシャン の三択トグル。各ボタンにはテーマを表す小さな色サンプル (スウォッチ) を添える。
- 選択中のボタンはアクセントカラーで強調し、状態変更は即座にチャート本体へ反映する。

【チャート本体】
- ライブラリ: Recharts の ComposedChart を想定 (または同等の描画)。
- 高さ 380px、横幅は親要素に追従 (ResponsiveContainer)。
- X 軸: time ラベル、4 本おきに目盛り表示。
- Y 軸: 右側配置、ドメインは [min(low) - 0.08, max(high) + 0.08]、小数第 2 位表示、幅 62px。
- グリッド: 破線 (3 3)。
- 最新終値に水平の参照線 (破線 4 4, 太さ 1px) を引き、右端に帯状ラベルで最新値を小数第 3 位まで表示。参照線とラベル背景は #ff9800、ラベル文字色は #ffffff。
- ツールチップ: ローソク足選択時は O / H / L / C を 4 行で、ライン選択時は Close を 1 行で、いずれも小数第 3 位まで表示。
- 外側は border-radius 10px、上下左右 12px 程度のパディングを持つカードで囲む。カード背景はテーマ背景色、枠線はテーマ軸色。

【チャートタイプ別の描画仕様】
- ローソク足 (candlestick)
  - 各バーは OHLC (始値/高値/安値/終値) を表す縦長のローソク足。
  - 陽線 (close ≥ open) はテーマの陽線色、陰線 (close < open) はテーマの陰線色で塗りつぶす。
  - ヒゲ (上下の細い線) は high〜low、実体部分は open〜close。
  - バー幅は約 9px、アニメーションなし。
- ライン (line)
  - 終値 (close) を結ぶ折れ線グラフ。
  - 線の色はテーマのライン色、太さ 2px、ドットなし、曲線補間 (monotone)。
  - アニメーションなし。

【カラーテーマ一覧】
${themeLines}

【プロンプトパネル】
- チャートの下に、等幅フォントでこのプロンプト文をそのまま表示するパネルを設置する。
- パネル上部にラベル「生成プロンプト」と右寄せの「コピー」ボタンを配置する。
- コピーボタン押下でプロンプト全文を navigator.clipboard.writeText でコピーし、短時間 (1.5 秒程度) 「コピーしました」に表示を切り替える。
- プロンプト本文は長くなるため、最大高さを設けて縦スクロールできるようにする。

【技術要件】
- 関数コンポーネントと React Hooks のみを使用。class コンポーネントは不可。
- TypeScript (strict 相当) で型を明示する。
- CSS は plain CSS (CSS Modules 不可)。色値はテーマ定義の定数からのみ参照する。`;
}

function PromptPanel() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PROMPT);
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
      <pre className="fxc-prompt-body">{PROMPT}</pre>
    </div>
  );
}

export default PromptPanel;
