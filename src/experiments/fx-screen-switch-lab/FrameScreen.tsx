import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Controls from './Controls';
import FxChart from './FxChart';
import { decimals, frameLabel, isScreen, SCREENS } from './market';
import { CHANNEL } from './protocol';
import type { Request, Snapshot } from './protocol';
import type { Config, ScreenId } from './market';
import './styles.css';

function send(screen: ScreenId, session: string, request: Request) {
  if (window.parent === window) return;
  window.parent.postMessage({ channel: CHANNEL, session, screen, ...request }, location.origin);
}

function ConnectedScreen({ screen, session }: { screen: ScreenId; session: string }) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [view, setView] = useState<'market' | 'settings'>('market');
  const [instance] = useState(() => crypto.randomUUID().slice(0, 8));
  useEffect(() => {
    let connected = false;
    let retry = 0;
    const receive = (event: MessageEvent) => {
      const message = event.data;
      if (event.origin !== location.origin || event.source !== window.parent || !message ||
        message.channel !== CHANNEL || message.session !== session || message.type !== 'snapshot') return;
      connected = true;
      clearInterval(retry);
      setSnapshot(message.payload as Snapshot);
    };
    window.addEventListener('message', receive);
    send(screen, session, { type: 'ready' });
    retry = window.setInterval(() => { if (!connected) send(screen, session, { type: 'ready' }); }, 750);
    return () => { clearInterval(retry); window.removeEventListener('message', receive); };
  }, [screen, session]);
  const configure = (target: ScreenId, config: Config) => send(screen, session, { type: 'configure', target, config });
  if (!snapshot) return <div className="fx-switch fx-switch-frame"><p role="status">デモ配信に接続しています…</p></div>;
  const { config } = snapshot;
  const quote = snapshot.quotes.find(q => q.pair === config.pair)!;
  const title = screen === 'main' ? 'メイン画面' : `チャート ${screen.slice(-1)}`;
  return <main className="fx-switch fx-switch-frame" data-theme={snapshot.theme} data-instance={instance} data-screen={screen}>
    <header className="fx-pane-heading">
      <div><span className="fx-eyebrow">{screen === 'main' ? 'MARKET OVERVIEW' : 'CHART WORKSPACE'}</span><h2>{title}</h2></div>
      <span className="fx-tag">{snapshot.running ? '● LIVE DEMO' : 'Ⅱ PAUSED'}</span>
    </header>
    {screen === 'main' && <>
      <nav className="fx-main-menu" aria-label="メイン画面のメニュー">
        <button type="button" aria-pressed={view === 'market'} onClick={() => setView('market')}>レート一覧</button>
        <button type="button" aria-pressed={view === 'settings'} onClick={() => setView('settings')}>子画面の設定</button>
      </nav>
      {view === 'market' ? <div className="fx-quotes" aria-label="ダミーレート一覧">
        {snapshot.quotes.map(q => <button type="button" className="fx-quote" key={q.pair}
          aria-pressed={config.pair === q.pair} onClick={() => configure(screen, { ...config, pair: q.pair })}>
          <span>{q.pair}</span><strong>{q.price.toFixed(decimals(q.pair))}</strong>
          <small className={q.change >= 0 ? 'fx-up' : 'fx-down'}>{q.change >= 0 ? '+' : ''}{q.change.toFixed(decimals(q.pair))}</small>
        </button>)}
      </div> : <section className="fx-settings" aria-label="子画面の設定">
        <p>ここで変更した条件は、子画面にも反映されます。</p>
        {SCREENS.filter(id => id !== 'main').map(id => <div className="fx-child-setting" key={id}>
          <div className="fx-setting-heading"><strong>チャート {id.slice(-1)}</strong>
            <button type="button" onClick={() => send(screen, session, { type: 'navigate', target: id })}>表示する</button></div>
          <Controls config={snapshot.configs[id]} prefix={`チャート${id.slice(-1)}`} onChange={next => configure(id, next)} />
        </div>)}
      </section>}
    </>}
    <section className="fx-chart-card">
      <div className="fx-price-heading"><div><h3>{config.pair}</h3><span>{frameLabel(config.minutes)} · {config.count}本 · SMA 20</span></div>
        <strong data-testid="latest-price">{quote.price.toFixed(decimals(config.pair))}</strong></div>
      <Controls config={config} prefix={title} onChange={next => configure(screen, next)} />
      <FxChart snapshot={snapshot} />
      <div className="fx-chart-foot"><span>陽線 <i className="fx-up">━</i> / 陰線 <i className="fx-down">━</i> / SMA 20</span><span>JST</span></div>
    </section>
    <footer className="fx-pane-foot">
      <span>模擬時刻 {new Date(snapshot.clock).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', hour12: false })}</span>
      <span>受信 <b data-testid="received-ticks">{snapshot.ticks}</b> · 画面ID {instance}</span>
    </footer>
    <p className="fx-note">価格はすべて架空です。非表示中は描画を休止し、再表示時に共有データを同期します。</p>
  </main>;
}

export default function FrameScreen() {
  const { screenId } = useParams();
  const [params] = useSearchParams();
  const session = params.get('session');
  if (!isScreen(screenId) || !session || window.parent === window) {
    return <main className="fx-switch"><h2>FXデモの子画面</h2><p>実験ページから開いてください。</p><a href={`${import.meta.env.BASE_URL}#/experiments/fx-screen-switch-lab`}>実験へ戻る</a></main>;
  }
  return <ConnectedScreen key={`${screenId}:${session}`} screen={screenId} session={session} />;
}
