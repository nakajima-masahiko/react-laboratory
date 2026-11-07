import { useRef, useState } from 'react';
import { CanvasStage } from './CanvasStage';
import type { CanvasLayer, Frame, StageHandle } from './CanvasStage';
import type { DemoProps } from './canvas-api';

export function OrbitDemo({ native, theme, onNativeFailure }: DemoProps) {
  const stage = useRef<StageHandle>(null);
  const [running, setRunning] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [speed, setSpeed] = useState(1);
  const [count, setCount] = useState(36);
  const drawParticles = (frame: Frame, front: boolean) => {
    const { context, width, height, palette, time } = frame;
    for (let index = 0; index < count; index++) {
      const phase = index * 2.39996 + time * .00025 * speed;
      const depth = Math.sin(phase);
      if ((depth > 0) !== front) continue;
      const orbit = index % 3;
      const radius = Math.min(width * .42, 300) + orbit * 9;
      const x = width / 2 + Math.cos(phase) * radius;
      const y = height / 2 + depth * (80 + orbit * 40) + Math.cos(phase) * (orbit - 1) * 45;
      context.globalAlpha = front ? .9 : .3;
      context.fillStyle = orbit === 1 ? palette.secondary : palette.accent;
      context.beginPath(); context.arc(x, y, 3 + (depth + 1) * 2, 0, Math.PI * 2); context.fill();
    }
    context.globalAlpha = 1;
  };
  const draw = (frame: Frame) => {
    const { context, width, height, palette } = frame;
    context.strokeStyle = palette.grid;
    [0, 1, 2].forEach((orbit) => {
      context.beginPath(); context.ellipse(width / 2, height / 2, Math.min(width * .42, 300) + orbit * 9, 80 + orbit * 40, (orbit - 1) * .18, 0, Math.PI * 2); context.stroke();
    });
    drawParticles(frame, false);
  };
  const layers: CanvasLayer[] = [{
    id: 'orbit-controls', className: 'hic-orbit-card', place: (size, box) => ({ x: (size.width - box.width) / 2, y: (size.height - box.height) / 2 }),
    content: <>
      <span className="hic-eyebrow">MOTION / DEPTH</span>
      <h3>描画の、あいだに。</h3>
      <p>HTMLの前後を粒子が通り抜ける、操作できるコントロールパネル。</p>
      <label>軌道の速さ {speed.toFixed(1)}×<input type="range" min={.2} max={2} step={.1} value={speed} onChange={(event) => setSpeed(Number(event.target.value))} /></label>
      <label>粒子の数<select value={count} onChange={(event) => setCount(Number(event.target.value))}><option value={18}>18</option><option value={36}>36</option><option value={72}>72</option></select></label>
      <button type="button" onClick={() => setRunning((value) => !value)}>{running ? '動きを止める' : '動きを再開'}</button>
    </>,
  }];
  return <div className="hic-demo">
    <div className="hic-demo-heading"><div><h2>動く図形とHTMLの前後関係</h2><p>背景 → HTML → 前景。描画順の違いを比較できます。</p></div><span className="hic-count">{count} particles</span></div>
    <CanvasStage ref={stage} native={native} theme={theme} onNativeFailure={onNativeFailure} animate={running} layers={layers} label="HTMLパネルの前後を粒子が移動するアニメーション" draw={draw} drawForeground={(frame) => drawParticles(frame, true)} />
    <div className="hic-toolbar"><button type="button" disabled={!native} onClick={() => stage.current?.savePng()}>HTMLごとPNG保存</button><span className="hic-hint">画面外・タブ非表示中はアニメーション描画を休止します。</span></div>
    <p className="hic-hint">{native ? 'ネイティブ描画では、明るい粒子がHTMLパネルの手前を通ります。' : 'DOM重ね合わせではHTMLが常にCanvasより手前になります。ネイティブ描画との違いを比較してください。'}</p>
  </div>;
}
