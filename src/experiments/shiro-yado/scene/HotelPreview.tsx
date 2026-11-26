import {
  Component,
  useEffect,
  useState,
  type ComponentType,
  type ErrorInfo,
  type ReactNode,
} from 'react';
import { INSIDE } from '../inside-copy';
import { getUi } from '../ui-extra';
import { useHotelStore } from '../store';
import { FloorPlan } from '../floor-plan';
import { getPlace, type FloorId } from '../hotel-data';
import { useSceneActivity } from './use-scene-activity';
import type { SceneId } from './types';

type StageProps = {
  scene: SceneId;
  view?: 'inside' | 'overview';
  autoRotate?: boolean;
  animate?: boolean;
  fallback?: ReactNode;
  onUnavailable?: () => void;
};

const ROOM_VIEW_LABELS = {
  ja: { inside: '室内から見る', overview: '全体を見る', label: '204号室の視点' },
  en: { inside: 'Inside view', overview: 'Overview', label: 'Room 204 camera view' },
  fr: { inside: 'Vue intérieure', overview: 'Vue générale', label: 'Vue de la chambre 204' },
  es: { inside: 'Vista interior', overview: 'Vista general', label: 'Vista de la habitación 204' },
  zh: { inside: '室内视角', overview: '全景视角', label: '204号房视角' },
  ko: { inside: '실내 시점', overview: '전체 보기', label: '204호 객실 시점' },
} as const;

const IMMERSIVE_ROOMS = new Set<SceneId>(['room-204', 'room-205']);

const BATH_FALLBACK_SRC = `${import.meta.env.BASE_URL}shiro-yado/bath-fuji-mural.svg`;

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
  const { ref, visible, reduced } = useSceneActivity();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [roomView, setRoomView] = useState<'inside' | 'overview'>('inside');

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

  const place = getPlace(scene);
  const floor = place?.floor ?? Number(scene.slice(-1)) as FloorId;
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
      ) : <FloorPlan floor={floor} highlight={place?.id} />}
      <div className="shiro-yado__stage-fallback-copy">
        <strong>{scene === 'bath' ? INSIDE[locale].imageMode : INSIDE[locale].mapMode}</strong>
        <button type="button" onClick={() => setAttempt((value) => value + 1)}>
          {ui.retryScene}
        </button>
      </div>
    </div>
  );

  return (
    <div ref={ref} className="shiro-yado__stage" data-scene={scene}>
      <div className="shiro-yado__canvas">
        {failed ? (
          fallback
        ) : Stage ? (
          <SceneErrorBoundary key={`${scene}-${attempt}`} fallback={fallback}>
            <Stage
              scene={scene}
              view={IMMERSIVE_ROOMS.has(scene) ? roomView : 'overview'}
              autoRotate={autoRotate && !reduced && visible}
              animate={!reduced && visible}
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
      {IMMERSIVE_ROOMS.has(scene) && (
        <div className="shiro-yado__room-view-switch" role="group" aria-label={scene === 'room-205' ? ROOM_VIEW_LABELS[locale].label.replace('204', '205') : ROOM_VIEW_LABELS[locale].label}>
          {(['inside', 'overview'] as const).map((view) => (
            <button key={view} type="button" aria-pressed={roomView === view}
              className={roomView === view ? 'is-active' : undefined}
              onClick={() => setRoomView(view)}>
              {ROOM_VIEW_LABELS[locale][view]}
            </button>
          ))}
        </div>
      )}
      {resolvedHint && !(IMMERSIVE_ROOMS.has(scene) && roomView === 'inside') ? <p className="shiro-yado__hint">{resolvedHint}</p> : null}
    </div>
  );
}
