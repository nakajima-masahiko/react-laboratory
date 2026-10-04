import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useRef, useState } from 'react';
import { NeutralToneMapping, Object3D, SRGBColorSpace } from 'three';
import type { Group } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js';
import type { ConciergePlayback } from '../concierge-playback';
import { createConciergeRig } from './concierge-rig';
import { CONCIERGE_LIGHT } from './palette';

const MODEL_URL = `${import.meta.env.BASE_URL}models/shiro-yado/hotel-concierge.glb`;
const PHOTO_URL = `${import.meta.env.BASE_URL}shiro-yado/concierge.jpg`;
let assetPromise: Promise<GLTF> | undefined;
let webglAvailable: boolean | undefined;

function supportsWebGl() {
  if (webglAvailable !== undefined) return webglAvailable;
  try {
    const context = document.createElement('canvas').getContext('webgl2');
    webglAvailable = Boolean(context);
    context?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch { webglAvailable = false; }
  return webglAvailable;
}

function loadAsset() {
  assetPromise ??= new GLTFLoader().loadAsync(MODEL_URL).catch((error: unknown) => {
    assetPromise = undefined;
    throw error;
  });
  return assetPromise;
}

function ConciergePhoto() {
  return <div className="shiro-yado__concierge-fallback" role="img" aria-label="白の宿コンシェルジュ（写真）">
    <img className="shiro-yado__concierge-photo" src={PHOTO_URL} alt="白の宿のコンシェルジュ" />
  </div>;
}

function ConciergeFigure({ asset, playback, onUnavailable, onReady }: {
  asset: GLTF;
  playback: ConciergePlayback;
  onUnavailable: () => void;
  onReady: () => void;
}) {
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('webglcontextlost', onUnavailable);
    return () => canvas.removeEventListener('webglcontextlost', onUnavailable);
  }, [gl, onUnavailable]);
  const group = useRef<Group>(null);
  const rig = useRef<ReturnType<typeof createConciergeRig> | null>(null);
  useEffect(() => {
    const parent = group.current;
    if (!parent) return;
    let current: ReturnType<typeof createConciergeRig>;
    try { current = createConciergeRig(asset.scene, asset.animations, playback.completeBow); }
    catch { onUnavailable(); return; }
    rig.current = current;
    parent.add(current.model);
    onReady();
    return () => { rig.current = null; parent.remove(current.model); current.dispose(); };
  }, [asset, playback, onUnavailable, onReady]);

  useFrame(({ camera }, dt) => {
    const current = rig.current;
    if (!current) return;
    current.update(playback.state, dt, performance.now(), playback.getBoundaryTime());
    camera.position.set(0, 1.51 + current.cameraOffset.y, 0.85 + current.cameraOffset.z);
    camera.lookAt(0, 1.51 + current.cameraOffset.y, 0);
  });
  return <group ref={group} dispose={null} />;
}

export type ConciergeMode = 'auto' | '3d' | 'photo';

export function ConciergeModel({ playback, mode = 'auto' }: {
  playback: ConciergePlayback;
  mode?: ConciergeMode;
}) {
  const [asset, setAsset] = useState<GLTF | null>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [lightTarget] = useState(() => {
    const target = new Object3D(); target.position.set(0, 1.51, 0); return target;
  });
  const photo = mode === 'photo' || !supportsWebGl() || failed;
  const { phase, requestId } = playback.state;
  const unavailable = useCallback(() => setFailed(true), []);
  const loaded = useCallback(() => setReady(true), []);

  useEffect(() => {
    if (photo) return;
    let alive = true;
    void loadAsset().then((result) => { if (alive) setAsset(result); }, () => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [photo]);
  useEffect(() => {
    // A photo or unavailable GPU must not leave the spoken guide waiting for a bow.
    if (photo && phase === 'bowing') playback.completeBow(requestId);
  }, [photo, phase, requestId, playback]);

  return <div className="shiro-yado__concierge-portrait" data-testid="concierge-model"
    data-phase={phase} data-model={photo ? 'photo' : ready && asset ? 'ready' : 'loading'}>
    {photo || !asset ? <ConciergePhoto /> : <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 1.51, 0.85], fov: 34, near: 0.01, far: 20 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl, camera }) => {
        gl.outputColorSpace = SRGBColorSpace;
        gl.toneMapping = NeutralToneMapping;
        gl.toneMappingExposure = 0.90;
        camera.lookAt(0, 1.51, 0);
      }}
      fallback={<ConciergePhoto />}
      style={{ pointerEvents: 'none', touchAction: 'pan-y', width: '100%', height: '100%' }}
    >
      <primitive object={lightTarget} />
      <ambientLight color={CONCIERGE_LIGHT.neutral} intensity={1.6} />
      <hemisphereLight args={[CONCIERGE_LIGHT.soft, CONCIERGE_LIGHT.bounce, 0.65]} />
      <directionalLight color={CONCIERGE_LIGHT.warm} position={[-2, 4, 4]} intensity={0.45} />
      <directionalLight color={CONCIERGE_LIGHT.neutral} position={[-1, 3, -3]} intensity={0.6} />
      <directionalLight color={CONCIERGE_LIGHT.soft} position={[-0.3, 1.96, 1.85]} intensity={0.7} target={lightTarget} />
      <directionalLight color={CONCIERGE_LIGHT.neutral} position={[0.2, 0.96, 1.45]} intensity={0.2} target={lightTarget} />
      <ConciergeFigure asset={asset} playback={playback} onUnavailable={unavailable} onReady={loaded} />
    </Canvas>}
  </div>;
}
