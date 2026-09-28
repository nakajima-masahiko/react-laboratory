import { useEffect, useRef, useState } from 'react';
import { mountOcean, type TurtleCommands, type ViewMode } from './scene';
import './styles.css';

const details: Record<string, string> = {
  '甲羅': '背中を覆う硬い甲羅。アオウミガメの左右には、それぞれ4対の肋甲板があります。',
  '頭部': '海草や海藻を食べるための、くちばし状の口を持ちます。頭を甲羅へ引っ込めることはできません。',
  '眼': '海の中を見渡す眼。ここでは自然観察のために接近して表示しています。',
  '鼻孔': '肺で呼吸するため、水面へ上がって鼻孔から空気を取り込みます。',
  '前ヒレ': '翼のような大きな前ヒレで水を押し、泳ぐ推進力を生み出します。',
  '腹甲': '腹側を覆う淡い色の甲羅。下からも観察してみてください。',
  '後ろヒレ': '泳ぐ方向や姿勢の調整を助けます。',
  '尾': '体の後端にある小さな尾。形や長さには個体差があります。',
};

export default function SeaTurtle() {
  const host = useRef<HTMLDivElement>(null);
  const commands = useRef<TurtleCommands>({ mode: 'free', part: '甲羅', breathe: false, paused: false, light: false });
  const [mode, setMode] = useState<ViewMode>('free');
  const [part, setPart] = useState('甲羅');
  const [info, setInfo] = useState(false), [help, setHelp] = useState(true);
  const [paused, setPaused] = useState(false), [light, setLight] = useState(false);
  const [status, setStatus] = useState('海の光を準備しています…');
  const [attempt, setAttempt] = useState(0), [failed, setFailed] = useState(false);
  const [sound, setSound] = useState(false);
  const audio = useRef<AudioContext | null>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    const frame = requestAnimationFrame(() => {
    if (cancelled) return;
    try {
      cleanup = mountOcean(host.current!, commands.current, selected => {
        commands.current.part = selected; commands.current.mode = 'close'; setPart(selected); setMode('close'); setInfo(true);
      }, () => setStatus(''));
    } catch { setFailed(true); setStatus('3D表示を開始できませんでした。WebGL対応ブラウザで再試行してください。'); }
    });
    return () => { cancelled = true; cancelAnimationFrame(frame); cleanup?.(); };
  }, [attempt]);
  useEffect(() => () => { void audio.current?.close(); }, []);

  const changeMode = (value: ViewMode) => { commands.current.mode = value; setMode(value); };
  const toggleSound = async () => {
    try {
      if (audio.current) {
        if (audio.current.state === 'running') { await audio.current.suspend(); setSound(false); }
        else { await audio.current.resume(); setSound(true); }
        return;
      }
      const context = new AudioContext(); audio.current = context;
      const buffer = context.createBuffer(1, context.sampleRate * 4, context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const source = context.createBufferSource(); source.buffer = buffer; source.loop = true;
      const filter = context.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 220;
      const gain = context.createGain(); gain.gain.value = .14;
      source.connect(filter).connect(gain).connect(context.destination); source.start(); await context.resume(); setSound(true);
    } catch { setStatus('サウンドを開始できませんでした。もう一度お試しください。'); }
  };

  return <main className="sea-turtle" data-testid="sea-turtle">
    <div className="sea-turtle-canvas" ref={host} />
    <header className="sea-turtle-brand"><small>PELAGIC / AN OBSERVATION OF LIFE</small><h2>蒼海を旅する<br />アオウミガメ</h2><p>Chelonia mydas · 静かな海で、ひと呼吸。</p></header>
    <div className="sea-turtle-caption">01 / GREEN SEA TURTLE<br /><span>オリジナル簡易モデル · 生態をイメージした遊泳</span></div>
    {status && <div className="sea-turtle-status" role="status">{status}{failed && <><p>アオウミガメは肺呼吸をする海の爬虫類です。</p><button onClick={() => { setFailed(false); setAttempt(v => v + 1); }}>再試行</button></>}</div>}
    {help && <aside className="sea-turtle-help"><button aria-label="操作案内を閉じる" onClick={() => setHelp(false)}>×</button><strong>海の時間に、身をゆだねる。</strong><p>ドラッグで回転 · ピンチで拡大<br />カメの体をタップすると接近観察できます。</p><small>「一時停止」で動きを止めて観察できます。</small></aside>}
    {info && <aside className="sea-turtle-info" aria-label="生態情報"><button aria-label="生態情報を閉じる" onClick={() => setInfo(false)}>×</button><small>FIELD NOTES</small><h3>{part}</h3><p>{details[part]}</p><label>観察する部位<select value={part} onChange={e => { setPart(e.target.value); commands.current.part = e.target.value; changeMode('close'); }}>{Object.keys(details).map(name => <option key={name}>{name}</option>)}</select></label><hr /><p>アオウミガメ / Chelonia mydas</p><p>熱帯・亜熱帯の海に暮らし、成体は主に海草や海藻を食べます。採餌場と繁殖地の間を長距離移動する個体もいます。</p><p><small>この画面は観察体験のデモです。形態・浮上間隔は学術的な再現ではありません。</small></p></aside>}
    <nav className="sea-turtle-controls" aria-label="観察コントロール">
      {(['free', 'follow', 'close'] as const).map((value, i) => <button key={value} aria-pressed={mode === value} onClick={() => { changeMode(value); if (value === 'close') setInfo(true); }}>{['自由観察', '追跡', '接近観察'][i]}</button>)}
      <button onClick={() => { commands.current.breathe = true; commands.current.paused = false; setPaused(false); changeMode('follow'); }}>呼吸を観察</button>
      <button onClick={() => { commands.current.breathe = false; changeMode('free'); }}>自由遊泳</button>
      <button aria-pressed={paused} onClick={() => { commands.current.paused = !paused; setPaused(!paused); }}>{paused ? '再生' : '一時停止'}</button>
      <button aria-pressed={info} onClick={() => setInfo(!info)}>情報表示</button>
      <button aria-pressed={sound} onClick={() => void toggleSound()}>音 {sound ? 'ON' : 'OFF'}</button>
      <button aria-pressed={light} onClick={() => { commands.current.light = !light; setLight(!light); }}>軽量表示</button>
    </nav>
  </main>;
}
