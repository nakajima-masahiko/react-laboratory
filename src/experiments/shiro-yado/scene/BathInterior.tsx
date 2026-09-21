import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Box } from './primitives';

const MURAL_SRC = `${import.meta.env.BASE_URL}shiro-yado/bath-fuji-mural.png`;

function Stone({ position, args, color = '#666967' }: { position: [number, number, number]; args: [number, number, number]; color?: string }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} roughness={0.78} metalness={0.03} />
    </mesh>
  );
}

function Cedar({ position, args, rotation }: { position: [number, number, number]; args: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color="#a97945" roughness={0.68} metalness={0.02} />
    </mesh>
  );
}

function WaterSurface() {
  const surface = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.MeshPhysicalMaterial>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (surface.current) {
      surface.current.position.y = 0.685 + Math.sin(t * 0.85) * 0.012;
      surface.current.rotation.z = Math.sin(t * 0.24) * 0.005;
    }
    if (material.current) material.current.clearcoatRoughness = 0.16 + Math.sin(t * 0.7) * 0.035;
  });

  return (
    <mesh ref={surface} position={[-0.75, 0.685, -0.35]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[5.72, 2.78, 32, 18]} />
      <meshPhysicalMaterial
        ref={material}
        color="#8fc9c4"
        roughness={0.08}
        metalness={0.08}
        transmission={0.22}
        transparent
        opacity={0.9}
        clearcoat={0.8}
        clearcoatRoughness={0.16}
      />
    </mesh>
  );
}

function SteamWisp({ position, delay, scale = 1 }: { position: [number, number, number]; delay: number; scale?: number }) {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame(({ clock, camera }) => {
    if (!mesh.current) return;
    const cycle = (clock.getElapsedTime() * 0.14 + delay) % 1;
    mesh.current.position.y = position[1] + cycle * 1.65;
    mesh.current.position.x = position[0] + Math.sin(cycle * Math.PI * 2 + delay * 4) * 0.14;
    const s = scale * (0.5 + cycle * 0.95);
    mesh.current.scale.set(s, s * 1.35, s);
    mesh.current.lookAt(camera.position);
    const mat = mesh.current.material as THREE.MeshBasicMaterial;
    mat.opacity = Math.sin(Math.PI * cycle) * 0.14;
  });

  return (
    <mesh ref={mesh} position={position}>
      <circleGeometry args={[0.32, 24]} />
      <meshBasicMaterial color="#f4fbf8" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

function FujiMural() {
  const texture = useTexture(MURAL_SRC);

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
  }, [texture]);

  return (
    <group>
      <mesh position={[0, 2.18, -3.45]} receiveShadow>
        <planeGeometry args={[9.0, 3.35]} />
        <meshStandardMaterial map={texture} roughness={0.72} metalness={0} />
      </mesh>
      <Cedar position={[0, 0.52, -3.39]} args={[9.35, 0.15, 0.15]} />
      <Cedar position={[0, 3.86, -3.39]} args={[9.35, 0.13, 0.15]} />
      <Cedar position={[-4.58, 2.18, -3.39]} args={[0.13, 3.5, 0.15]} />
      <Cedar position={[4.58, 2.18, -3.39]} args={[0.13, 3.5, 0.15]} />
    </group>
  );
}

function BathTub() {
  return (
    <group>
      <Stone position={[-0.75, 0.34, -1.86]} args={[6.25, 0.68, 0.32]} color="#59605e" />
      <Stone position={[-0.75, 0.34, 1.16]} args={[6.25, 0.68, 0.32]} color="#59605e" />
      <Stone position={[-3.71, 0.34, -0.35]} args={[0.34, 0.68, 3.34]} color="#59605e" />
      <Stone position={[2.21, 0.34, -0.35]} args={[0.34, 0.68, 3.34]} color="#59605e" />
      <Cedar position={[-0.75, 0.72, -1.91]} args={[6.45, 0.16, 0.25]} />
      <Cedar position={[-0.75, 0.72, 1.21]} args={[6.45, 0.16, 0.25]} />
      <Cedar position={[-3.82, 0.72, -0.35]} args={[0.25, 0.16, 3.36]} />
      <Cedar position={[2.32, 0.72, -0.35]} args={[0.25, 0.16, 3.36]} />
      <WaterSurface />
      <Stone position={[-3.15, 0.22, 1.62]} args={[1.0, 0.22, 0.62]} />
      <Stone position={[-2.45, 0.37, 1.62]} args={[0.65, 0.38, 0.62]} />
      <Stone position={[-1.92, 0.53, 1.62]} args={[0.5, 0.54, 0.62]} />
      {[
        [-2.7, 0.9, -0.5, 0.1],
        [-1.7, 0.86, 0.2, 0.26],
        [-0.6, 0.88, -0.85, 0.43],
        [0.35, 0.87, 0.35, 0.58],
        [1.2, 0.9, -0.45, 0.72],
        [-2.15, 0.9, -1.15, 0.86],
        [0.55, 0.89, -1.15, 0.94],
      ].map(([x, y, z, delay], index) => (
        <SteamWisp key={index} position={[x, y, z]} delay={delay} scale={0.78 + (index % 3) * 0.14} />
      ))}
    </group>
  );
}

function WashStation({ z }: { z: number }) {
  return (
    <group position={[3.45, 0, z]} rotation={[0, -Math.PI / 2, 0]}>
      <mesh position={[0, 1.18, -0.04]}>
        <planeGeometry args={[1.22, 1.28]} />
        <meshPhysicalMaterial color="#b9cfcb" roughness={0.08} metalness={0.32} clearcoat={0.85} />
      </mesh>
      <Cedar position={[0, 0.71, 0.18]} args={[1.28, 0.08, 0.44]} />
      <mesh position={[-0.3, 0.78, 0.26]}>
        <cylinderGeometry args={[0.045, 0.045, 0.22, 16]} />
        <meshStandardMaterial color="#b7aaa0" metalness={0.75} roughness={0.25} />
      </mesh>
      <mesh position={[0.3, 0.78, 0.26]}>
        <cylinderGeometry args={[0.045, 0.045, 0.22, 16]} />
        <meshStandardMaterial color="#b7aaa0" metalness={0.75} roughness={0.25} />
      </mesh>
      <Cedar position={[0, 0.19, 0.5]} args={[0.62, 0.38, 0.42]} />
      <mesh position={[0, 0.45, 0.53]}>
        <cylinderGeometry args={[0.27, 0.23, 0.16, 24]} />
        <meshStandardMaterial color="#c89b62" roughness={0.72} />
      </mesh>
    </group>
  );
}

function RockGarden() {
  return (
    <group position={[-4.15, 0, 2.35]}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <dodecahedronGeometry args={[0.62, 0]} />
        <meshStandardMaterial color="#4c5551" roughness={0.96} />
      </mesh>
      <mesh position={[0.65, 0.18, 0.15]} castShadow>
        <dodecahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial color="#737773" roughness={0.96} />
      </mesh>
      <mesh position={[-0.45, 0.12, 0.5]} castShadow>
        <dodecahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color="#8a8b84" roughness={0.96} />
      </mesh>
      {[[-0.25, 0.7, 0], [0.15, 0.75, 0.12], [0.45, 0.62, 0.2]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, i * 1.4, 0]}>
          <coneGeometry args={[0.28, 0.9 + i * 0.08, 7]} />
          <meshStandardMaterial color={i === 1 ? '#2f5144' : '#3b6452'} roughness={0.92} />
        </mesh>
      ))}
    </group>
  );
}

export function ImmersiveBathInterior() {
  return (
    <group>
      <fog attach="fog" args={['#dce7e2', 9, 21]} />
      <Box args={[10, 0.12, 7]} position={[0, 0, 0]} color="#414846" roughness={0.94} />
      <Box args={[10, 4.2, 0.16]} position={[0, 2.1, -3.5]} color="#e8e3d7" roughness={0.9} />
      <Box args={[0.16, 4.2, 7]} position={[-5, 2.1, 0]} color="#d8d5cb" roughness={0.9} />
      <Box args={[0.16, 4.2, 7]} position={[5, 2.1, 0]} color="#d8d5cb" roughness={0.9} />
      <FujiMural />
      <BathTub />
      <WashStation z={-1.7} />
      <WashStation z={0} />
      <WashStation z={1.7} />
      <RockGarden />
      <Cedar position={[3.95, 0.28, 2.65]} args={[1.6, 0.5, 0.62]} />
      <Cedar position={[3.95, 0.55, 2.65]} args={[1.6, 0.08, 0.62]} />
      {[-4.1, 0, 4.1].map((x) => (
        <group key={x}>
          <Cedar position={[x, 4.02, 0]} args={[0.18, 0.18, 7]} />
          <pointLight position={[x, 3.72, 0]} color="#ffd6a0" intensity={5.2} distance={5.8} decay={2} />
        </group>
      ))}
      <rectAreaLight position={[0, 3.65, 1.2]} rotation={[-Math.PI / 2, 0, 0]} width={7} height={1.2} color="#fff0d2" intensity={2.8} />
      <spotLight position={[-1.8, 4.1, 2.8]} target-position={[0, 0, -0.8]} angle={0.62} penumbra={0.85} intensity={6} color="#d7f5ee" distance={12} />
    </group>
  );
}
