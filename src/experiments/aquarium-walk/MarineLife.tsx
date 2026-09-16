import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import type { TankTheme } from './data';

interface SwimmerProps {
  color: string;
  accent?: string;
  offset: number;
  size?: number;
  speed?: number;
  glow?: boolean;
  long?: boolean;
}

function Swimmer({ color, accent, offset, size = 1, speed = 1, glow = false, long = false }: SwimmerProps) {
  const ref = useRef<Group>(null);
  const path = useMemo(() => ({
    radiusX: 0.72 + ((offset * 37) % 9) * 0.09,
    radiusZ: 2.1 + ((offset * 19) % 7) * 0.22,
    height: 1.0 + ((offset * 23) % 8) * 0.28,
    phase: offset * 1.618,
  }), [offset]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * speed * 0.38 + path.phase;
    const x = Math.sin(t) * path.radiusX;
    const z = Math.cos(t) * path.radiusZ;
    ref.current.position.set(x, path.height + Math.sin(t * 1.7) * 0.16, z);
    ref.current.rotation.y = Math.atan2(Math.cos(t) * path.radiusX, -Math.sin(t) * path.radiusZ);
    ref.current.rotation.z = Math.sin(t * 1.7) * 0.06;
  });

  const bodyScale: [number, number, number] = long ? [0.58, 0.15, 0.15] : [0.38, 0.17, 0.14];
  return (
    <group ref={ref} scale={size}>
      <mesh scale={bodyScale}>
        <sphereGeometry args={[1, 16, 10]} />
        <meshStandardMaterial color={color} roughness={0.62} metalness={long ? 0.22 : 0.05} emissive={glow ? color : '#000000'} emissiveIntensity={glow ? 1.8 : 0} />
      </mesh>
      <mesh position={[-0.48, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.18, 0.21, 0.08]}>
        <coneGeometry args={[1, 1, 3]} />
        <meshStandardMaterial color={accent ?? color} roughness={0.7} side={2} />
      </mesh>
      <mesh position={[0.29, 0.065, -0.12]}>
        <sphereGeometry args={[0.024, 8, 8]} />
        <meshBasicMaterial color="#071015" />
      </mesh>
    </group>
  );
}

function Jelly({ offset }: { offset: number }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * 0.35 + offset;
    ref.current.position.set(Math.sin(t * 0.7) * 1.1, 1.1 + ((offset * 13) % 5) * 0.48 + Math.sin(t) * 0.28, Math.cos(t * 0.53) * 3.2);
    const pulse = 1 + Math.sin(t * 3) * 0.08;
    ref.current.scale.set(0.72 / pulse, pulse, 0.72 / pulse);
  });
  return (
    <group ref={ref}>
      <mesh scale={[0.35, 0.22, 0.35]}>
        <sphereGeometry args={[1, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color="#b9d8ff" transparent opacity={0.28} roughness={0.15} transmission={0.5} emissive="#6479ff" emissiveIntensity={0.75} side={2} />
      </mesh>
      {[-0.18, 0, 0.18].map((x) => (
        <mesh key={x} position={[x, -0.38, 0]}>
          <cylinderGeometry args={[0.012, 0.008, 0.72, 6]} />
          <meshBasicMaterial color="#9baeff" transparent opacity={0.38} />
        </mesh>
      ))}
    </group>
  );
}

function Ray() {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * 0.22;
    ref.current.position.set(Math.sin(t) * 1.1, 2.5 + Math.sin(t * 2) * 0.25, Math.cos(t) * 3.2);
    ref.current.rotation.y = -t;
    ref.current.rotation.z = Math.sin(t * 2) * 0.08;
  });
  return (
    <group ref={ref} scale={0.72}>
      <mesh scale={[0.35, 0.06, 1.05]} rotation={[0, 0, Math.PI / 4]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#7d99a8" roughness={0.72} />
      </mesh>
      <mesh position={[-0.55, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.035, 0.75, 0.035]}>
        <cylinderGeometry args={[1, 1, 1, 8]} />
        <meshStandardMaterial color="#657f8e" />
      </mesh>
    </group>
  );
}

function Turtle() {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * 0.17 + 2;
    ref.current.position.set(Math.sin(t) * 0.9, 1.45 + Math.sin(t * 1.3) * 0.32, Math.cos(t) * 2.6);
    ref.current.rotation.y = -t;
  });
  return (
    <group ref={ref} scale={0.62}>
      <mesh scale={[0.65, 0.22, 0.48]}><sphereGeometry args={[1, 18, 12]} /><meshStandardMaterial color="#56745e" roughness={0.86} /></mesh>
      <mesh position={[0.7, 0, 0]} scale={0.18}><sphereGeometry args={[1, 12, 8]} /><meshStandardMaterial color="#78917a" /></mesh>
      {[-1, 1].map((side) => <mesh key={side} position={[0, -0.05, side * 0.52]} rotation={[side * 0.2, 0, side * 0.55]} scale={[0.42, 0.06, 0.18]}><sphereGeometry args={[1, 12, 8]} /><meshStandardMaterial color="#718b75" /></mesh>)}
    </group>
  );
}

function Octopus() {
  return (
    <group position={[0.5, 0.48, 2.9]} scale={0.55}>
      <mesh scale={[0.55, 0.65, 0.55]}><sphereGeometry args={[1, 18, 14]} /><meshStandardMaterial color="#a95042" roughness={0.82} /></mesh>
      {Array.from({ length: 8 }, (_, index) => {
        const angle = (index / 8) * Math.PI * 2;
        return <mesh key={angle} position={[Math.cos(angle) * 0.5, -0.72, Math.sin(angle) * 0.5]} rotation={[Math.sin(angle) * 0.5, 0, Math.cos(angle) * 0.5]}><cylinderGeometry args={[0.1, 0.045, 1.15, 8]} /><meshStandardMaterial color="#9d493d" roughness={0.88} /></mesh>;
      })}
    </group>
  );
}

const fishSet = (count: number, colors: string[], options?: { long?: boolean; glow?: boolean; size?: number; speed?: number }) =>
  Array.from({ length: count }, (_, index) => (
    <Swimmer key={index} color={colors[index % colors.length]} accent={colors[(index + 1) % colors.length]} offset={index + colors.length * 0.31} {...options} />
  ));

export function MarineLife({ theme }: { theme: TankTheme }) {
  if (theme === 'coral') return <>{fishSet(15, ['#ff8b3d', '#f7eee1', '#277acf', '#f1cf4a'], { size: 0.72, speed: 1.25 })}</>;
  if (theme === 'temperate') return <>{fishSet(9, ['#87969b', '#b05e44', '#b8b299'], { size: 0.88, speed: 0.72 })}<Octopus /></>;
  if (theme === 'ocean') return <>{fishSet(22, ['#bacbd2', '#748f9d'], { size: 0.56, speed: 1.55, long: true })}{fishSet(3, ['#64889f'], { size: 1.45, speed: 1.15, long: true })}</>;
  if (theme === 'deep') return <>{fishSet(9, ['#55cfc5', '#758cff', '#a5e8df'], { size: 0.62, speed: 0.45, glow: true })}</>;
  if (theme === 'tropical') return <>{fishSet(5, ['#718996', '#9aabb0'], { size: 1.2, speed: 0.65, long: true })}<Ray /><Turtle /></>;
  return <>{Array.from({ length: 9 }, (_, index) => <Jelly key={index} offset={index * 0.81} />)}</>;
}

