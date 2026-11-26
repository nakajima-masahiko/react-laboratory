import { useEffect, useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';
import { RoomShell } from './primitives';

type Vec3 = [number, number, number];

/** Family suite pilot: two fixed beds, a convertible sofa and a four-seat round table. */
function SoftBox({
  position, args, color, radius = 0.06, roughness = 0.91,
}: {
  position: Vec3;
  args: Vec3;
  color: string;
  radius?: number;
  roughness?: number;
}) {
  return (
    <RoundedBox args={args} position={position} radius={radius} smoothness={3} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={roughness} />
    </RoundedBox>
  );
}

function useRoomMaterials() {
  const materials = useMemo(() => {
    const generate = (kind: 'oak' | 'linen') => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 256;
      const context = canvas.getContext('2d');
      if (!context) return null;
      const pixels = context.createImageData(256, 256);
      for (let y = 0; y < 256; y += 1) {
        for (let x = 0; x < 256; x += 1) {
          const n = (y * 256 + x) * 4;
          const noise = ((x * 67 + y * 101 + x * y * 11) % 23) - 11;
          const fiber = kind === 'oak'
            ? Math.sin(x * 0.13 + 2.7 * Math.sin(y * 0.021)) * 8 + Math.sin(x * 0.48) * 3
            : Math.sin(x * 0.95) * Math.sin(y * 0.8) * 4;
          const base = kind === 'oak' ? [197, 163, 126] : [248, 245, 239];
          for (let channel = 0; channel < 3; channel += 1) {
            pixels.data[n + channel] = Math.max(0, Math.min(255, base[channel] + fiber + noise * 0.3));
          }
          pixels.data[n + 3] = 255;
        }
      }
      context.putImageData(pixels, 0, 0);
      const texture = new CanvasTexture(canvas);
      texture.colorSpace = SRGBColorSpace;
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
      texture.anisotropy = 4;
      return texture;
    };
    const oak = generate('oak');
    oak?.repeat.set(4, 3);
    const linen = generate('linen');
    linen?.repeat.set(2, 3);
    return { oak, linen };
  }, []);

  useEffect(() => () => {
    materials.oak?.dispose();
    materials.linen?.dispose();
  }, [materials]);
  return materials;
}

function FamilyBed({ x, fabric }: { x: number; fabric: CanvasTexture | null }) {
  return (
    <group position={[x, 0, -1.24]}>
      <SoftBox position={[0, 0.2, 0]} args={[1.08, 0.23, 2.08]} color="#b99d7b" radius={0.04} />
      <SoftBox position={[0, 0.43, 0]} args={[1.05, 0.29, 2.05]} color="#e9e2d7" radius={0.08} />
      <SoftBox position={[0, 0.73, -1.035]} args={[1.1, 0.88, 0.16]} color="#d7c6b1" radius={0.065} />
      <mesh position={[0, 0.64, 0.2]} castShadow receiveShadow>
        <boxGeometry args={[1.035, 0.065, 1.43]} />
        <meshStandardMaterial color="#ffffff" map={fabric} roughness={1} />
      </mesh>
      <SoftBox position={[-0.23, 0.69, -0.7]} args={[0.41, 0.16, 0.43]} color="#fdfaf5" radius={0.07} />
      <SoftBox position={[0.23, 0.69, -0.7]} args={[0.41, 0.16, 0.43]} color="#fdfaf5" radius={0.07} />
      <SoftBox position={[0, 0.75, 0.29]} args={[1.055, 0.19, 1.4]} color="#faf9f5" radius={0.085} />
      <SoftBox position={[0, 0.83, 0.82]} args={[1.055, 0.055, 0.36]} color="#d8d4c9" radius={0.02} />
    </group>
  );
}

function SingleWallWindow() {
  return (
    <group>
      {/* One wide garden-facing window; unlike room 204, no corner glazing. */}
      <mesh position={[0.85, 1.47, -2.76]} receiveShadow>
        <planeGeometry args={[3.5, 1.48]} />
        <meshStandardMaterial color="#b3cec5" roughness={0.86} />
      </mesh>
      <mesh position={[0.85, 1.47, -2.72]}>
        <planeGeometry args={[3.4, 1.39]} />
        <meshStandardMaterial color="#e0e8dc" transparent opacity={0.2} depthWrite={false} />
      </mesh>
      {[-0.9, 0.85, 2.6].map((x) => (
        <mesh key={x} position={[x, 1.47, -2.69]} castShadow>
          <boxGeometry args={[0.045, 1.53, 0.06]} />
          <meshStandardMaterial color="#d0bca4" roughness={0.7} />
        </mesh>
      ))}
      {[0.72, 2.2].map((y) => (
        <mesh key={y} position={[0.85, y, -2.69]} castShadow>
          <boxGeometry args={[3.52, 0.055, 0.06]} />
          <meshStandardMaterial color="#d0bca4" roughness={0.7} />
        </mesh>
      ))}
      {/* Curtain folds are translucent, light-weight meshes. */}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[-0.87 + i * 0.09, 1.43, -2.5 + Math.sin(i * 1.3) * 0.04]}>
          <boxGeometry args={[0.1, 1.67, 0.02]} />
          <meshStandardMaterial color="#fff8ed" transparent opacity={0.58} depthWrite={false} />
        </mesh>
      ))}
      <directionalLight position={[0.9, 5.5, -2.0]} intensity={1.5} color="#fff2df" castShadow
        shadow-mapSize={[1024, 1024]} shadow-camera-left={-8} shadow-camera-right={8}
        shadow-camera-top={8} shadow-camera-bottom={-8} shadow-bias={-0.0004} />
    </group>
  );
}

function SofaBed() {
  return (
    <group position={[2.48, 0, -0.6]} rotation={[0, -Math.PI / 2, 0]}>
      {/* Daytime configuration of the convertible sofa; only two fixed beds exist. */}
      <SoftBox position={[0, 0.22, 0.05]} args={[1.85, 0.24, 0.88]} color="#b9a48d" radius={0.08} />
      <SoftBox position={[0, 0.43, 0.12]} args={[1.75, 0.29, 0.79]} color="#ece5d9" radius={0.13} />
      <SoftBox position={[0, 0.8, -0.31]} args={[1.8, 0.65, 0.2]} color="#e9e0d3" radius={0.095} />
      <SoftBox position={[-0.87, 0.59, 0.1]} args={[0.16, 0.48, 0.9]} color="#d9cdbd" radius={0.06} />
      <SoftBox position={[0.87, 0.59, 0.1]} args={[0.16, 0.48, 0.9]} color="#d9cdbd" radius={0.06} />
      <SoftBox position={[-0.46, 0.7, -0.15]} args={[0.43, 0.39, 0.17]} color="#c8b5a2" radius={0.07} />
      <SoftBox position={[0.4, 0.71, -0.14]} args={[0.42, 0.39, 0.17]} color="#f3eee6" radius={0.07} />
      <SoftBox position={[0.05, 0.6, 0.42]} args={[1.45, 0.045, 0.16]} color="#d8c4ac" radius={0.015} />
    </group>
  );
}

function DiningChair({ position, angle }: { position: Vec3; angle: number }) {
  return (
    <group position={position} rotation={[0, angle, 0]}>
      <SoftBox position={[0, 0.44, 0]} args={[0.45, 0.095, 0.43]} color="#d7c5ac" radius={0.045} />
      <SoftBox position={[0, 0.78, -0.18]} args={[0.45, 0.53, 0.09]} color="#e4d9cb" radius={0.045} />
      {[-0.16, 0.16].map((x) => [-0.15, 0.15].map((z) => (
        <mesh key={`${x}-${z}`} position={[x, 0.22, z]} castShadow>
          <cylinderGeometry args={[0.027, 0.033, 0.43, 10]} />
          <meshStandardMaterial color="#b99c77" roughness={0.72} />
        </mesh>
      )))}
    </group>
  );
}

function FamilyDining() {
  const cx = 0.75;
  const cz = 1.5;
  return (
    <group>
      <mesh position={[cx, 0.72, cz]} castShadow receiveShadow>
        <cylinderGeometry args={[0.69, 0.69, 0.085, 48]} />
        <meshStandardMaterial color="#c9aa84" roughness={0.7} />
      </mesh>
      <mesh position={[cx, 0.36, cz]} castShadow>
        <cylinderGeometry args={[0.1, 0.11, 0.67, 20]} />
        <meshStandardMaterial color="#a98d6b" roughness={0.72} />
      </mesh>
      <mesh position={[cx, 0.045, cz]} castShadow>
        <cylinderGeometry args={[0.37, 0.38, 0.09, 32]} />
        <meshStandardMaterial color="#ad9476" roughness={0.75} />
      </mesh>
      {/* Four chairs, exactly; no extra seating around this table. */}
      <DiningChair position={[cx - 1.12, 0, cz]} angle={-Math.PI / 2} />
      <DiningChair position={[cx + 1.12, 0, cz]} angle={Math.PI / 2} />
      <DiningChair position={[cx, 0, cz + 1.04]} angle={Math.PI} />
      <DiningChair position={[cx, 0, cz - 1.04]} angle={0} />
      <mesh position={[cx + 0.16, 0.78, cz + 0.07]} castShadow>
        <cylinderGeometry args={[0.095, 0.12, 0.06, 22]} />
        <meshStandardMaterial color="#f5f1e9" roughness={0.45} />
      </mesh>
      <mesh position={[cx - 0.17, 0.77, cz - 0.18]} castShadow>
        <boxGeometry args={[0.21, 0.045, 0.27]} />
        <meshStandardMaterial color="#5d7775" roughness={0.88} />
      </mesh>
      <mesh position={[cx - 0.12, 0.8, cz - 0.13]} castShadow>
        <boxGeometry args={[0.21, 0.025, 0.26]} />
        <meshStandardMaterial color="#d0b58e" roughness={0.9} />
      </mesh>
    </group>
  );
}

function RoomAccents() {
  return (
    <group>
      <SoftBox position={[-1.36, 0.34, -2.05]} args={[0.37, 0.57, 0.42]} color="#bea17d" radius={0.03} />
      <mesh position={[-1.36, 0.71, -2.05]}>
        <cylinderGeometry args={[0.14, 0.2, 0.27, 28]} />
        <meshStandardMaterial color="#f6e9d9" roughness={0.78} emissive="#ffdcad" emissiveIntensity={0.12} />
      </mesh>
      <pointLight position={[-1.36, 0.95, -2.05]} color="#ffdfb5" intensity={0.4} distance={3} decay={2} />
      <mesh position={[-3.0, 0.19, 1.65]} castShadow>
        <cylinderGeometry args={[0.18, 0.14, 0.32, 18]} />
        <meshStandardMaterial color="#c4b49e" roughness={0.82} />
      </mesh>
      <mesh position={[-3.0, 0.56, 1.65]} castShadow>
        <sphereGeometry args={[0.31, 9, 7]} />
        <meshStandardMaterial color="#658575" roughness={0.95} />
      </mesh>
    </group>
  );
}

export function Room205Interior() {
  const { oak, linen } = useRoomMaterials();
  return (
    <group>
      <RoomShell width={7.2} depth={5.6} height={2.65} windows="back" />
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[7.18, 5.58]} />
        <meshStandardMaterial color="#fff" map={oak} roughness={0.87} />
      </mesh>
      <mesh position={[0.57, 0.026, 1.25]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3.55, 2.75]} />
        <meshStandardMaterial color="#ded6c9" roughness={1} />
      </mesh>
      <SingleWallWindow />
      <FamilyBed x={-2.24} fabric={linen} />
      <FamilyBed x={-0.94} fabric={linen} />
      <SofaBed />
      <FamilyDining />
      <RoomAccents />
      <ambientLight color="#eef3ec" intensity={0.17} />
    </group>
  );
}
