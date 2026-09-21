import { Canvas, useThree } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import { Suspense, useEffect } from 'react';
import {
  Floor1Overview,
  Floor2Overview,
  Floor3Overview,
  PlaceInterior,
} from './interiors';
import type { SceneId } from './types';
import { isPlaceId } from '../hotel-data';

type Cam = {
  position: [number, number, number];
  target: [number, number, number];
  min: number;
  max: number;
};

const CAM: Record<string, Cam> = {
  'floor-1': { position: [9, 8.5, 10], target: [0, 0.4, 0], min: 8, max: 18 },
  'floor-2': { position: [10, 9, 12], target: [0, 0.4, 0], min: 9, max: 20 },
  'floor-3': { position: [10, 9, 12], target: [0, 0.4, 0], min: 9, max: 20 },
  lobby: { position: [5.4, 3.6, 6.4], target: [0, 0.5, 0], min: 4.5, max: 12 },
  'room-201': { position: [3.8, 2.8, 4.2], target: [0, 0.55, 0], min: 3.2, max: 8 },
  'room-202': { position: [3.8, 2.8, 4.2], target: [0, 0.55, 0], min: 3.2, max: 8 },
  'room-203': { position: [4.4, 3.1, 4.8], target: [0, 0.55, 0], min: 3.5, max: 9 },
  'room-204': { position: [4.8, 3.2, 5.0], target: [0, 0.55, 0], min: 3.6, max: 10 },
  'room-205': { position: [5.2, 3.4, 5.4], target: [0, 0.55, 0], min: 3.8, max: 11 },
  banquet: { position: [6.4, 4.0, 6.6], target: [0.2, 0.4, 0], min: 5, max: 13 },
  bath: { position: [7.2, 4.35, 8.2], target: [-0.2, 1.15, -0.45], min: 5.4, max: 14 },
  restroom: { position: [4.0, 2.8, 4.6], target: [0, 0.5, 0], min: 3.2, max: 8 },
};

function Lights() {
  return (
    <>
      <ambientLight intensity={0.78} />
      <hemisphereLight args={['#ffffff', '#d9d1c4', 0.55]} />
      <directionalLight position={[7, 12, 6]} intensity={1.15} castShadow />
      <directionalLight position={[-6, 6, -4]} intensity={0.25} />
    </>
  );
}

function CameraRig({ scene }: { scene: SceneId }) {
  const cam = CAM[scene] ?? CAM.lobby;
  const camera = useThree((s) => s.camera);
  const invalidate = useThree((s) => s.invalidate);
  const controls = useThree((s) => s.controls);

  useEffect(() => {
    camera.position.set(...cam.position);
    camera.lookAt(...cam.target);
    const c = controls as unknown as
      | { target: { set: (...n: number[]) => void }; update: () => void }
      | null;
    if (c?.target) {
      c.target.set(...cam.target);
      c.update();
    }
    invalidate();
  }, [camera, cam, controls, invalidate, scene]);

  return null;
}

function SceneBody({ scene }: { scene: SceneId }) {
  if (scene === 'floor-1') return <Floor1Overview />;
  if (scene === 'floor-2') return <Floor2Overview />;
  if (scene === 'floor-3') return <Floor3Overview />;
  if (isPlaceId(scene)) return <PlaceInterior id={scene} />;
  return <Floor1Overview />;
}

export function HotelStage({
  scene,
  autoRotate = false,
}: {
  scene: SceneId;
  autoRotate?: boolean;
}) {
  const cam = CAM[scene] ?? CAM.lobby;
  const background = scene === 'bath' ? '#172321' : '#f3f0ea';

  return (
    <Canvas
      shadows
      dpr={[1, 1.6]}
      frameloop="always"
      camera={{ position: cam.position, fov: 36, near: 0.1, far: 80 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      onCreated={({ gl, invalidate }) => {
        gl.setClearColor(background, 1);
        invalidate();
      }}
      style={{ touchAction: 'none', background }}
    >
      <color attach="background" args={[background]} />
      {scene === 'bath' ? <fog attach="fog" args={['#dce7e2', 10, 22]} /> : null}
      <Lights />
      <CameraRig scene={scene} />
      <Suspense fallback={null}><SceneBody scene={scene} /></Suspense>
      <ContactShadows
        position={[0, 0.02, 0]}
        opacity={0.14}
        scale={28}
        blur={2.6}
        far={12}
      />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        autoRotate={autoRotate}
        autoRotateSpeed={0.35}
        minPolarAngle={0.4}
        maxPolarAngle={Math.PI / 2.12}
        minDistance={cam.min}
        maxDistance={cam.max}
        target={cam.target}
        rotateSpeed={0.7}
        zoomSpeed={0.7}
      />
    </Canvas>
  );
}

export default HotelStage;
