import { useEffect, useState, type ComponentType } from 'react';
import type { SceneId } from './types';

type StageProps = {
  scene: SceneId;
  autoRotate?: boolean;
};

export function HotelPreview({
  scene,
  autoRotate = false,
  hint = 'ドラッグで回転・ピンチで拡大',
}: {
  scene: SceneId;
  autoRotate?: boolean;
  hint?: string;
}) {
  const [Stage, setStage] = useState<ComponentType<StageProps> | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    let live = true;
    void import('./HotelStage')
      .then((mod) => {
        if (live) setStage(() => mod.HotelStage);
      })
      .catch(() => {
        if (live) setFailed(true);
      });
    return () => {
      live = false;
    };
  }, []);

  return (
    <div className="shiro-yado__stage">
      <div className="shiro-yado__canvas">
        {Stage ? (
          <Stage scene={scene} autoRotate={autoRotate && !reduceMotion} />
        ) : (
          <div className="shiro-yado__stage-fallback">
            {failed ? '3Dを表示できません' : '空間を読み込み中'}
          </div>
        )}
      </div>
      {hint ? <p className="shiro-yado__hint">{hint}</p> : null}
    </div>
  );
}
