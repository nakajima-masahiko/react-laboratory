import { useState } from 'react';
import SkytreeScene, { type ViewPreset } from './SkytreeScene';
import './styles.css';

const views: { id: ViewPreset; label: string }[] = [
  { id: 'overview', label: '全景' },
  { id: 'ground', label: '見上げる' },
  { id: 'deck', label: '展望台' },
];

export default function SkytreeVisualizer() {
  const [night, setNight] = useState(false);
  const [view, setView] = useState<ViewPreset>('overview');

  return (
    <main className={`skytree-lab ${night ? 'is-night' : ''}`}>
      <section className="skytree-lab__stage" aria-label="東京スカイツリー3Dビジュアライザー">
        <SkytreeScene night={night} view={view} />
        <div className="skytree-lab__title">
          <span>STRUCTURAL STUDY / 01</span>
          <h1>634<small>m</small></h1>
          <p>三角から円へ。空へほどける鉄の格子。</p>
        </div>
        <div className="skytree-lab__height" aria-hidden="true"><span>634 m</span><i /></div>
        <div className="skytree-lab__controls">
          <div className="skytree-lab__segments" aria-label="カメラ視点">
            {views.map((item) => (
              <button key={item.id} type="button" aria-pressed={view === item.id} onClick={() => setView(item.id)}>{item.label}</button>
            ))}
          </div>
          <button className="skytree-lab__time" type="button" aria-pressed={night} onClick={() => setNight((current) => !current)}>
            <span aria-hidden>{night ? '☀' : '☾'}</span>{night ? '昼景へ' : '夜景へ'}
          </button>
        </div>
        <p className="skytree-lab__hint">ドラッグで回転 · ホイールでズーム</p>
      </section>
      <aside className="skytree-lab__facts" aria-label="モデルの基準寸法">
        <div><strong>634 m</strong><span>最高高さ</span></div>
        <div><strong>約68 m</strong><span>足元の一辺</span></div>
        <div><strong>350 m</strong><span>天望デッキ</span></div>
        <div><strong>450 m</strong><span>天望回廊</span></div>
      </aside>
      <p className="skytree-lab__note">実物の公開寸法を基準にした手続き生成モデルです。公式3Dデータ・設計図面を使用した複製ではありません。</p>
    </main>
  );
}
