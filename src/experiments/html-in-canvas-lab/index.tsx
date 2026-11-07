import { useState } from 'react';
import { supportsHtmlInCanvas } from './canvas-api';
import type { RenderMode, Theme } from './canvas-api';
import { ChartDemo } from './ChartDemo';
import { TypographyDemo } from './TypographyDemo';
import { OrbitDemo } from './OrbitDemo';
import './styles.css';

const samples = [
  { id: 'chart', number: '01', name: 'リアルタイムチャート', detail: 'ECharts / 追従ラベル / 操作' },
  { id: 'type', number: '02', name: '文字と座標変換', detail: '入力 / 回転 / 拡大' },
  { id: 'orbit', number: '03', name: 'アニメーションと合成', detail: '粒子 / 前後関係 / フォーム' },
] as const;
type Sample = typeof samples[number]['id'];

export default function HtmlInCanvasLab() {
  const [supported] = useState(supportsHtmlInCanvas);
  const [mode, setMode] = useState<RenderMode>('auto');
  const [nativeError, setNativeError] = useState('');
  const [theme, setTheme] = useState<Theme>(() => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const [sample, setSample] = useState<Sample>('chart');
  const native = supported && mode === 'auto' && !nativeError;
  return <main className="hic-lab" data-theme={theme}>
    <header className="hic-header">
      <div><span className="hic-eyebrow">REACT LABORATORY / GRAPHICS</span><h1>HTML in Canvas<span>Lab.</span></h1><p>HTMLの使いやすさを、Canvasの表現力と。</p></div>
      <button type="button" aria-label={theme === 'light' ? 'ダークテーマに切り替え' : 'ライトテーマに切り替え'} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme === 'light' ? '◐ Dark' : '◑ Light'}</button>
    </header>
    <div className="hic-capability">
      <div><strong data-testid="renderer-status"><span className={`hic-dot ${native ? 'is-live' : ''}`} />{native ? 'Native · HTML-in-Canvas' : 'Fallback · DOM重ね合わせ'}</strong><p>{native ? 'HTMLをCanvasの子要素として直接描画しています。' : supported ? '比較用に通常のDOM重ね合わせを使用しています。' : 'このブラウザでは現在のAPIを検出できないため、DOM重ね合わせで表示します。'}</p></div>
      <label>描画方式<select value={mode} onChange={(event) => { setMode(event.target.value as RenderMode); setNativeError(''); }}><option value="auto">自動（ネイティブ優先）</option><option value="overlay">比較用のDOM重ね合わせ</option></select></label>
    </div>
    {nativeError && <p className="hic-notice" role="status">ネイティブ描画でエラーが発生したため、DOM重ね合わせに切り替えました（{nativeError}）。</p>}
    <nav className="hic-samples" aria-label="描画サンプル">
      {samples.map((entry) => <button type="button" key={entry.id} aria-pressed={sample === entry.id} onClick={() => setSample(entry.id)}><span className="hic-sample-number">{entry.number}</span><strong>{entry.name}</strong><small>{entry.detail}</small></button>)}
    </nav>
    <section key={`${sample}-${native}`} className="hic-workbench" aria-label="選択したサンプル">
      {sample === 'chart' ? <ChartDemo native={native} theme={theme} onNativeFailure={setNativeError} /> : sample === 'type' ? <TypographyDemo native={native} theme={theme} onNativeFailure={setNativeError} /> : <OrbitDemo native={native} theme={theme} onNativeFailure={setNativeError} />}
    </section>
    <details className="hic-notes"><summary>仕組み・対応環境・ソース</summary>
      <p>現在のHTML-in-Canvas APIは <code>content="drawable"</code>、<code>drawable</code>、<code>paint</code> イベント、<code>drawElementImage()</code> を使います。APIの有無を実行時に判定し、未対応時は通常のDOMへ切り替えます。</p>
      <pre><code>{`<canvas content="drawable">\n  <div drawable>操作できるHTML</div>\n</canvas>\n\ncanvas.addEventListener('paint', () => {\n  // 先に背景やEChartsのCanvasを合成\n  ctx.drawImage(chartCanvas, 0, 0);\n  ctx.drawElementImage(panel, x, y, width, height);\n});\ncanvas.requestPaint();`}</code></pre>
      <p>EChartsはCanvasレンダラーで描画し、表示用Canvasへ合成します。ラベルの座標は <code>convertToPixel()</code> で取得します。Canvasを二重に初期化せず、EChartsとHTMLの描画タイミングを分離しています。</p>
      <p>Chrome 157の正式APIを対象にしています。旧Origin Trialの <code>layoutsubtree</code> APIは対象外です。ネイティブ時とDOM重ね合わせ時では、前後関係やPNGへのHTMLの取り込みに違いがあります。</p>
      <ul><li><a href="https://developer.chrome.com/blog/html-in-canvas" target="_blank" rel="noreferrer">Chrome公式：HTML-in-Canvas</a></li><li><a href="https://developer.chrome.com/docs/web-platform/html-in-canvas/2d?hl=ja" target="_blank" rel="noreferrer">Chrome公式：2D描画</a></li><li><a href="https://echarts.apache.org/handbook/en/how-to/data/dynamic-data/" target="_blank" rel="noreferrer">Apache ECharts：動的データ</a></li><li><a href="https://github.com/nakajima-masahiko/react-laboratory/tree/main/src/experiments/html-in-canvas-lab" target="_blank" rel="noreferrer">サンプルのソースコード</a></li></ul>
    </details>
    <footer className="hic-footer"><span>HTML + CANVAS / THREE EXPERIMENTS</span><span>React · TypeScript · Apache ECharts</span></footer>
  </main>;
}
