import type { CSSProperties } from 'react';
import { frameLabel, SCREENS } from './market';
import { frameUrl } from './protocol';
import { useScreenHost } from './useScreenHost';
import './styles.css';

export default function FxScreenSwitchLab() {
  const host = useScreenHost();
  const activeIndex = SCREENS.indexOf(host.active);
  return <section className="fx-switch fx-switch-host" data-theme={host.theme}>
    <header className="fx-lab-heading">
      <div><span className="fx-eyebrow">INTERACTION LAB / 01</span><h1>FX Screen Switch</h1><p>チャートを残したまま、画面を滑らかに。</p></div>
      <span className="fx-demo-badge">架空レート・注文機能なし</span>
    </header>
    <div className="fx-toolbar">
      <div className="fx-feed-status"><span className={host.running ? 'fx-live-dot' : 'fx-paused-dot'} />
        <span>{host.running ? '1秒ごとに模擬配信' : '配信を一時停止'}</span><small data-testid="host-ticks">{host.ticks} ticks</small></div>
      <div className="fx-toolbar-actions">
        <label>デモ時計<select aria-label="デモ時計の速度" value={host.speed} onChange={e => host.setSpeed(Number(e.target.value))}>
          <option value={1}>等速</option><option value={15}>15倍速</option><option value={60}>60倍速</option>
        </select></label>
        <button type="button" onClick={() => host.setRunning(!host.running)}>{host.running ? '一時停止' : '配信再開'}</button>
        <button type="button" onClick={() => host.setTheme(host.theme === 'dark' ? 'light' : 'dark')}>{host.theme === 'dark' ? 'ライト表示' : 'ダーク表示'}</button>
      </div>
    </div>
    <div className="fx-device">
      <header className="fx-app-header"><strong>FX WORKSPACE</strong><span>メイン ＋ 3チャート</span></header>
      <div className="fx-viewport" data-testid="screen-viewport">
        {SCREENS.map((id, index) => {
          const selected = host.active === id;
          const moving = selected || host.previous === id;
          return <div key={id} id={`fx-pane-${id}`} className="fx-screen-panel"
            role="tabpanel" aria-labelledby={`fx-tab-${id}`} aria-hidden={!selected} inert={!selected}
            style={{ '--fx-pane-direction': Math.sign(index - activeIndex), visibility: moving ? 'visible' : 'hidden' } as CSSProperties}>
            <iframe ref={element => { if (element) host.frames.current[id] = element; else delete host.frames.current[id]; }}
              src={frameUrl(id, host.session)} title={id === 'main' ? 'メイン画面' : `チャート${index}`}
              tabIndex={selected ? 0 : -1} />
          </div>;
        })}
      </div>
      <nav className="fx-tabbar" role="tablist" aria-label="表示する画面">
        <span className="fx-tab-indicator" aria-hidden="true" style={{ transform: `translateX(${activeIndex * 100}%)` }} />
        {SCREENS.map((id, index) => <button key={id} id={`fx-tab-${id}`} type="button" role="tab"
          aria-selected={host.active === id} aria-controls={`fx-pane-${id}`} tabIndex={host.active === id ? 0 : -1}
          onClick={() => host.setActive(id)} onKeyDown={event => {
            const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
            const target = event.key === 'Home' ? 0 : event.key === 'End' ? 3 : delta ? (index + delta + 4) % 4 : -1;
            if (target < 0) return;
            event.preventDefault(); host.setActive(SCREENS[target]); document.getElementById(`fx-tab-${SCREENS[target]}`)?.focus();
          }}>
          <span>{id === 'main' ? 'メイン画面' : host.configs[id].pair}</span>
          <small>{id === 'main' ? 'レート・設定' : `${frameLabel(host.configs[id].minutes)} / ${host.configs[id].count}本`}</small>
        </button>)}
      </nav>
    </div>
    <div className="fx-explainer">
      <div><strong>01 / STATE</strong><p>4つのiframeは保持。画面IDとズーム位置は、切替で変わりません。</p></div>
      <div><strong>02 / MOTION</strong><p>24pxの横移動とフェードで軽快に切替。チャートのドラッグ操作とは競合しません。</p></div>
      <div><strong>03 / REALTIME</strong><p>同じ模擬レートから全時間足を集計。15倍速なら1分足が約4秒で進みます。</p></div>
    </div>
    <p className="fx-note" role="status">接続済み {host.ready.length}/4画面 · 実データ配信なし · 非表示タブではデモ時計を停止します。</p>
  </section>;
}
