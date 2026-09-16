import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { BackSide, RepeatWrapping, SRGBColorSpace } from 'three';
import { tanks, type TankDefinition } from './data';
import { MarineLife } from './MarineLife';
import { PlayerController } from './PlayerController';

function Tank({ tank }: { tank: TankDefinition }) {
  const backdrop = useTexture(tank.texture);
  useEffect(() => { backdrop.colorSpace = SRGBColorSpace; }, [backdrop]);
  const x = tank.side * 5.75;
  const front = tank.side * 4.02;
  const back = tank.side * 7.46;
  return (
    <group>
      <mesh position={[back, 2.45, tank.z]} rotation={[0, tank.side === -1 ? Math.PI / 2 : -Math.PI / 2, 0]}>
        <planeGeometry args={[10.2, 4.15]} />
        <meshBasicMaterial map={backdrop} toneMapped={false} />
      </mesh>
      <group position={[x, 0, tank.z]}><MarineLife theme={tank.id} /></group>
      <mesh position={[x, 2.45, tank.z]}>
        <boxGeometry args={[3.35, 4.15, 10.2]} />
        <meshBasicMaterial color={tank.light} transparent opacity={0.035} side={BackSide} depthWrite={false} />
      </mesh>
      <mesh position={[front, 2.45, tank.z]} rotation={[0, tank.side === -1 ? Math.PI / 2 : -Math.PI / 2, 0]}>
        <planeGeometry args={[10.2, 4.15]} />
        <meshPhysicalMaterial color="#bcecff" transparent opacity={0.1} roughness={0.08} metalness={0.05} transmission={0.45} thickness={0.12} depthWrite={false} />
      </mesh>
      <mesh position={[front, 0.28, tank.z]}><boxGeometry args={[0.28, 0.38, 10.7]} /><meshStandardMaterial color="#10181c" roughness={0.7} /></mesh>
      <mesh position={[front, 4.62, tank.z]}><boxGeometry args={[0.28, 0.38, 10.7]} /><meshStandardMaterial color="#10181c" roughness={0.7} /></mesh>
      {[-5.25, 5.25].map((edge) => <mesh key={edge} position={[front, 2.45, tank.z + edge]}><boxGeometry args={[0.28, 4.7, 0.34]} /><meshStandardMaterial color="#10181c" roughness={0.7} /></mesh>)}
      <pointLight position={[tank.side * 3.55, 3.2, tank.z]} color={tank.light} intensity={8} distance={7.5} decay={2} />
    </group>
  );
}

function Hall() {
  const [floor, wall] = useTexture([
    `${import.meta.env.BASE_URL}aquarium-walk/floor.webp`,
    `${import.meta.env.BASE_URL}aquarium-walk/wall.webp`,
  ]);
  useEffect(() => {
    [floor, wall].forEach((texture) => {
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
      texture.colorSpace = SRGBColorSpace;
    });
    floor.repeat.set(3, 15);
    wall.repeat.set(3, 10);
  }, [floor, wall]);
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 44]} />
        <meshStandardMaterial map={floor} color="#9aa3a6" roughness={0.31} metalness={0.16} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5, 0]}>
        <planeGeometry args={[15, 44]} />
        <meshStandardMaterial map={wall} color="#596164" roughness={0.9} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 4.08, 4.83, 0]}><boxGeometry args={[0.25, 0.34, 44]} /><meshStandardMaterial map={wall} color="#62696c" roughness={0.88} /></mesh>
          <mesh position={[side * 4.08, 0.12, 0]}><boxGeometry args={[0.25, 0.24, 44]} /><meshStandardMaterial map={wall} color="#62696c" roughness={0.88} /></mesh>
        </group>
      ))}
      <mesh position={[0, 2.5, -22]}><boxGeometry args={[8.3, 5, 0.3]} /><meshStandardMaterial map={wall} color="#343b3e" roughness={0.9} /></mesh>
      <mesh position={[0, 2.5, 22]}><boxGeometry args={[8.3, 5, 0.3]} /><meshStandardMaterial map={wall} color="#343b3e" roughness={0.9} /></mesh>
      {[-16, -8, 0, 8, 16].map((z) => <pointLight key={z} position={[0, 4.65, z]} color="#d5e3df" intensity={4} distance={5.5} decay={2} />)}
      {tanks.map((tank) => <Tank key={tank.id} tank={tank} />)}
    </>
  );
}

function LoadingScene() {
  return <mesh position={[0, 1.7, -3]}><sphereGeometry args={[0.18, 16, 12]} /><meshBasicMaterial color="#6bd6e8" /></mesh>;
}

export default function AquariumScene() {
  return (
    <Canvas camera={{ position: [0, 1.65, 20], fov: 64, near: 0.08, far: 90 }} dpr={[1, 1.65]} gl={{ antialias: true, powerPreference: 'high-performance' }}>
      <color attach="background" args={['#04090c']} />
      <fog attach="fog" args={['#071014', 18, 52]} />
      <ambientLight color="#8db1b3" intensity={0.22} />
      <Suspense fallback={<LoadingScene />}><Hall /></Suspense>
      <PlayerController />
    </Canvas>
  );
}
