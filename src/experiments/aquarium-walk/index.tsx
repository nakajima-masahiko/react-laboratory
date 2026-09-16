import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { tanks } from './data';
import { useAquariumControls, type MovementKey } from './control-store';
import './styles.css';

const AquariumScene = lazy(() => import('./AquariumScene'));

function TouchButton({ control, label }: { control: MovementKey; label: string }) {
  const setPressed = useAquariumControls((state) => state.setPressed);
  const release = () => setPressed(control, false);
  return (
    <button
      type="button"
      className="walk-aquarium-touch-button"
      aria-label={label}
      onPointerDown={(event) => { event.preventDefault(); setPressed(control, true); }}
      onPointerUp={release}
      onPointerCancel={release}
      onPointerLeave={release}
    >{label}</button>
  );
}

export default function AquariumWalkLab() {
  const [started, setStarted] = useState(false);
  const [pointerLocked, setPointerLocked] = useState(false);
  const currentTank = useAquariumControls((state) => state.currentTank);
  const tank = useMemo(() => tanks.find((item) => item.id === currentTank), [currentTank]);

  useEffect(() => {
    const update = () => setPointerLocked(Boolean(document.pointerLockElement));
    document.addEventListener('pointerlockchange', update);
    return () => document.removeEventListener('pointerlockchange', update);
  }, []);

  const enter = () => {
    setStarted(true);
    document.querySelector<HTMLCanvasElement>('.walk-aquarium canvas')?.requestPointerLock?.();
  };

  return (
    <main className="walk-aquarium" data-testid="aquarium-walk">
      <Suspense fallback={<div className="walk-aquarium-loading">水槽を準備しています…</div>}><AquariumScene /></Suspense>

      <header className="walk-aquarium-brand">
        <small>IMMERSIVE AQUARIUM 01</small>
        <h2>静かな海を、歩く。</h2>
      </header>

      {tank && <aside className="walk-aquarium-label" aria-live="polite"><small>{tank.subtitle}</small><strong>{tank.title}</strong></aside>}

      {!started && (
        <section className="walk-aquarium-intro" aria-label="水族館を開始">
          <small>THREE.JS AQUARIUM</small>
          <h3>六つの海が待つ、夜の水族館。</h3>
          <p>左右の水槽を眺めながら、ゆっくりと館内を歩いてください。</p>
          <button type="button" onClick={enter}>水族館に入る</button>
          <span>W / S 前後移動　A / D 左右移動　マウスで視点変更　ESCで解除</span>
        </section>
      )}

      {started && !pointerLocked && <button type="button" className="walk-aquarium-resume" onClick={enter}>視点操作を再開</button>}

      <div className="walk-aquarium-reticle" aria-hidden="true" />
      <div className="walk-aquarium-touch" aria-label="タッチ操作">
        <div><TouchButton control="forward" label="前" /><TouchButton control="backward" label="後" /></div>
        <div><TouchButton control="turnLeft" label="左を見る" /><TouchButton control="turnRight" label="右を見る" /></div>
      </div>
      <footer className="walk-aquarium-footer"><span>SIX WATERS / ONE CORRIDOR</span><span>{pointerLocked ? 'LOOK AROUND' : 'CLICK TO LOOK'}</span></footer>
    </main>
  );
}

