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
  fallback?: ReactNode;
  onUnavailable?: () => void;
};

const BATH_FALLBACK_SRC = `${import.meta.env.BASE_URL}shiro-yado/bath-fuji-mural.webp`;

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
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    let live = true;
    setStage(null);
    setFailed(false);

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
  }, [attempt]);

  const fallback = (
    <div
      className={
        scene === 'bath'
          ? 'shiro-yado__stage-fallback shiro-yado__stage-fallback--bath'
          : 'shiro-yado__stage-fallback'
      }
      role="status"
    >
      {scene === 'bath' ? (
        <img src={BATH_FALLBACK_SRC} alt="" aria-hidden="true" />
      ) : null}
      <div className="shiro-yado__stage-fallback-copy">
        <strong>{ui.sceneFailed}</strong>
        <button type="button" onClick={() => setAttempt((value) => value + 1)}>
          {ui.retryScene}
        </button>
      </div>
    </div>
  );

  return (
    <div className="shiro-yado__stage" data-scene={scene}>
      <div className="shiro-yado__canvas">
        {failed ? (
          fallback
        ) : Stage ? (
          <SceneErrorBoundary key={`${scene}-${attempt}`} fallback={fallback}>
            <Stage
              scene={scene}
              autoRotate={autoRotate && !reduceMotion}
              fallback={fallback}
              onUnavailable={() => setFailed(true)}
            />
          </SceneErrorBoundary>
        ) : (
          <div className="shiro-yado__stage-fallback" role="status">
            {ui.loadingScene}
          </div>
        )}
      </div>
      {resolvedHint ? <p className="shiro-yado__hint">{resolvedHint}</p> : null}
    </div>
  );
}
