import { useState } from 'react';
import './styles.css';

interface Theme {
  name: string;
  label: string;
  vars: Record<string, string>;
}

const themes: Theme[] = [
  {
    name: 'light',
    label: 'Light',
    vars: {
      '--ts-bg': '#ffffff',
      '--ts-surface': '#f5f5f5',
      '--ts-border': '#e0e0e0',
      '--ts-text': '#333333',
      '--ts-text-sub': '#666666',
      '--ts-accent': '#646cff',
      '--ts-accent-fg': '#ffffff',
      '--ts-btn-bg': '#f0f0f0',
      '--ts-btn-hover': '#e0e0e0',
      '--ts-badge-bg': '#ede9fe',
      '--ts-badge-text': '#5b21b6',
    },
  },
  {
    name: 'dark',
    label: 'Dark',
    vars: {
      '--ts-bg': '#1a1a2e',
      '--ts-surface': '#16213e',
      '--ts-border': '#333355',
      '--ts-text': '#c0c0d0',
      '--ts-text-sub': '#7777aa',
      '--ts-accent': '#818cf8',
      '--ts-accent-fg': '#ffffff',
      '--ts-btn-bg': '#252540',
      '--ts-btn-hover': '#30305a',
      '--ts-badge-bg': '#2e2860',
      '--ts-badge-text': '#a5b4fc',
    },
  },
  {
    name: 'ocean',
    label: 'Ocean',
    vars: {
      '--ts-bg': '#0d1b2a',
      '--ts-surface': '#1b2f45',
      '--ts-border': '#1e4060',
      '--ts-text': '#a8d8ea',
      '--ts-text-sub': '#5a8fa8',
      '--ts-accent': '#00b4d8',
      '--ts-accent-fg': '#0d1b2a',
      '--ts-btn-bg': '#163048',
      '--ts-btn-hover': '#1e4060',
      '--ts-badge-bg': '#0a3550',
      '--ts-badge-text': '#48cae4',
    },
  },
  {
    name: 'forest',
    label: 'Forest',
    vars: {
      '--ts-bg': '#0f1f0f',
      '--ts-surface': '#1a2e1a',
      '--ts-border': '#2a4a2a',
      '--ts-text': '#b8ddb8',
      '--ts-text-sub': '#6a9a6a',
      '--ts-accent': '#4caf50',
      '--ts-accent-fg': '#0f1f0f',
      '--ts-btn-bg': '#1a3020',
      '--ts-btn-hover': '#224028',
      '--ts-badge-bg': '#153020',
      '--ts-badge-text': '#81c784',
    },
  },
  {
    name: 'sunset',
    label: 'Sunset',
    vars: {
      '--ts-bg': '#2a1010',
      '--ts-surface': '#3d1a10',
      '--ts-border': '#6b2a15',
      '--ts-text': '#f0c8a0',
      '--ts-text-sub': '#c07840',
      '--ts-accent': '#ff7043',
      '--ts-accent-fg': '#ffffff',
      '--ts-btn-bg': '#4a2010',
      '--ts-btn-hover': '#5a2818',
      '--ts-badge-bg': '#5a1e0e',
      '--ts-badge-text': '#ffab91',
    },
  },
];

function ThemeSwitching() {
  const [current, setCurrent] = useState<Theme>(themes[0]);
  const [liked, setLiked] = useState(false);
  const [inputVal, setInputVal] = useState('');

  const cssVars = Object.fromEntries(
    Object.entries(current.vars).map(([k, v]) => [k, v])
  ) as React.CSSProperties;

  return (
    <div className="ts-root" style={cssVars as React.CSSProperties}>
      <h2 className="ts-heading">Theme Switching</h2>
      <p className="ts-sub">
        CSS カスタムプロパティで複数テーマを切り替えるパターンを試す実験です。
      </p>

      {/* Switcher */}
      <div className="ts-switcher">
        {themes.map((t) => (
          <button
            key={t.name}
            className={`ts-chip${current.name === t.name ? ' ts-chip--active' : ''}`}
            onClick={() => setCurrent(t)}
          >
            <span className={`ts-swatch ts-swatch--${t.name}`} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Preview */}
      <div className="ts-card">
        <div className="ts-card-header">
          <span className="ts-badge">テーマ: {current.label}</span>
        </div>

        <p className="ts-text">
          テキストはこのように表示されます。サブテキストは少し薄い色で表示されます。
        </p>
        <p className="ts-text-sub">これはサブテキストのサンプルです。</p>

        <div className="ts-row">
          <input
            className="ts-input"
            placeholder="テキスト入力..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
          />
        </div>

        <div className="ts-row">
          <button className="ts-btn">通常ボタン</button>
          <button className="ts-btn ts-btn--accent" onClick={() => setLiked((v) => !v)}>
            {liked ? '♥ いいね済み' : '♡ いいね'}
          </button>
          <button className="ts-btn" disabled>
            無効
          </button>
        </div>

        <div className="ts-progress-wrap">
          <div className="ts-progress-label">進捗サンプル</div>
          <div className="ts-progress-track">
            <div className="ts-progress-bar" style={{ width: '65%' }} />
          </div>
        </div>

        <div className="ts-row ts-row--tags">
          {['React', 'TypeScript', 'CSS', 'Vite'].map((tag) => (
            <span key={tag} className="ts-tag">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Token table */}
      <div className="ts-tokens">
        <h3 className="ts-tokens-title">適用中のトークン</h3>
        <table className="ts-table">
          <thead>
            <tr>
              <th>変数</th>
              <th>値</th>
              <th>プレビュー</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(current.vars).map(([key, val]) => (
              <tr key={key}>
                <td className="ts-td-mono">{key}</td>
                <td className="ts-td-mono">{val}</td>
                <td>
                  <span
                    className="ts-color-dot"
                    style={{ background: val }}
                    title={val}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ThemeSwitching;
