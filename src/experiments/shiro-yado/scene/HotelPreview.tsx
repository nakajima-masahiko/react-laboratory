import {
  Component,
  useEffect,
  useState,
  type ComponentType,
  type ErrorInfo,
  type ReactNode,
} from 'react';
import { getUi } from '../ui-extra';
import { useHotelStore } from '../store';
import type { SceneId } from './types';

type StageProps = {
  scene: SceneId;
  autoRotate?: boolean;
};

class SceneErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Failed to render the 3D hotel scene.', error, info);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

export function HotelPreview({
  scene,
  autoRotate = false,
  hint,
}: {
  scene: SceneId;
  autoRotate?: boolean;
  hint?: string;
}) {
  const locale = useHotelStore((s) => s.locale);
  const ui = getUi(locale);
  const resolvedHint = hint ?? ui.dragHint;
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

  const fallback = (
    <div className="shiro-yado__stage-fallback" role="status">
      {ui.sceneFailed}
    </div>
  );

  return (
    <div className="shiro-yado__stage" data-scene={scene}>
      <div className="shiro-yado__canvas">
        {Stage ? (
          <SceneErrorBoundary key={scene} fallback={fallback}>
            <Stage scene={scene} autoRotate={autoRotate && !reduceMotion} />
          </SceneErrorBoundary>
        ) : (
          <div className="shiro-yado__stage-fallback" role="status">
            {failed ? ui.sceneFailed : ui.loadingScene}
          </div>
        )}
      </div>
      {resolvedHint ? <p className="shiro-yado__hint">{resolvedHint}</p> : null}
    </div>
  );
}
