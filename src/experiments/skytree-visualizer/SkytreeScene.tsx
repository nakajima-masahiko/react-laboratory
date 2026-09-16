import { Canvas, useThree } from '@react-three/fiber';
import { Environment, OrbitControls, Stars } from '@react-three/drei';
import { useEffect } from 'react';
import * as THREE from 'three';
import TowerModel from './TowerModel';

export type ViewPreset = 'overview' | 'ground' | 'deck';

const CAMERA_PRESETS: Record<ViewPreset, { position: [number, number, number]; target: [number, number, number] }> = {
  overview: { position: [235, 175, 420], target: [0, 270, 0] },
  ground: { position: [72, 8, 115], target: [0, 245, 0] },
  deck: { position: [78, 362, 118], target: [0, 365, 0] },
};

function CameraRig({ view }: { view: ViewPreset }) {
  const { camera } = useThree();
  useEffect(() => {
    const preset = CAMERA_PRESETS[view];
    camera.position.set(...preset.position);
    camera.lookAt(...preset.target);
    camera.updateProjectionMatrix();
  }, [camera, view]);
  return <OrbitControls target={CAMERA_PRESETS[view].target} minDistance={35} maxDistance={900} maxPolarAngle={Math.PI / 2 - 0.01} enableDamping />;
}

function City({ night }: { night: boolean }) {
  const buildings = Array.from({ length: 90 }, (_, index) => {
    const angle = index * 2.399;
    const distance = 90 + (index % 13) * 13;
    const height = 7 + ((index * 17) % 38);
    return { x: Math.cos(angle) * distance, z: Math.sin(angle) * distance, height, width: 6 + (index % 5) * 2 };
  });
  return (
    <group>
      {buildings.map((building, index) => (
        <mesh key={index} position={[building.x, building.height / 2 - 1, building.z]} receiveShadow>
          <boxGeometry args={[building.width, building.height, building.width * 0.8]} />
          <meshStandardMaterial color={night ? '#182532' : '#9aa8ad'} emissive={night && index % 4 === 0 ? '#514521' : '#000000'} emissiveIntensity={0.45} roughness={0.86} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
        <circleGeometry args={[430, 96]} />
        <meshStandardMaterial color={night ? '#101922' : '#75837d'} roughness={0.94} />
      </mesh>
    </group>
  );
}

export default function SkytreeScene({ night, view }: { night: boolean; view: ViewPreset }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ fov: 42, near: 0.5, far: 2400, position: CAMERA_PRESETS.overview.position }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      onCreated={({ gl }) => { gl.toneMappingExposure = night ? 0.72 : 1.05; }}
    >
      <color attach="background" args={[night ? '#050914' : '#a7cce0']} />
      <fog attach="fog" args={[night ? '#07101c' : '#b9d2dc', 330, 1050]} />
      <ambientLight intensity={night ? 0.24 : 0.82} color={night ? '#6684b0' : '#dcecff'} />
      <directionalLight position={[180, 520, 160]} intensity={night ? 0.5 : 3.2} color={night ? '#91b3dc' : '#fff4df'} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-far={900} shadow-camera-left={-120} shadow-camera-right={120} shadow-camera-top={650} shadow-camera-bottom={-40} />
      {night ? <Stars radius={850} depth={260} count={1800} factor={3} fade speed={0.15} /> : <Environment preset="city" environmentIntensity={0.36} />}
      <TowerModel night={night} />
      <City night={night} />
      <CameraRig view={view} />
    </Canvas>
  );
}
