import { useEffect, useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';
import { RoomShell } from './primitives';

/**
 * Room 204 is the high-detail pilot room.
 * Its architectural size and furniture arrangement stay consistent with the
 * existing corner twin; generated textures avoid external asset dependencies.
 */
function useInteriorTextures() {
  const textures = useMemo(() => {
    const make = (kind: 'oak' | 'fabric') => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      const image = ctx.createImageData(256, 256);
      for (let y = 0; y < 256; y += 1) {
        for (let x = 0; x < 256; x += 1) {
          const i = (y * 256 + x) * 4;
          const grain = kind === 'oak'
            ? Math.sin(x * 0.17 + Math.sin(y * 0.029) * 3) * 7 + Math.sin(x * 0.53 + y * 0.02) * 3
            : Math.sin(x * 0.8) * Math.sin(y * 0.8) * 5;
          const jitter = ((x * 37 + y * 91 + x * y * 7) % 19) - 9;
          const base = kind === 'oak' ? [185, 153, 117] : [238, 232, 222];
          image.data[i] = Math.min(255, base[0] + grain + jitter * 0.5);
          image.data[i + 1] = Math.min(255, base[1] + grain + jitter * 0.5);
          image.data[i + 2] = Math.min(255, base[2] + grain + jitter * 0.5);
          image.data[i + 3] = 255;
        }
      }
      ctx.putImageData(image, 0, 0);
      const texture = new CanvasTexture(canvas);
      texture.colorSpace = SRGBColorSpace;
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
      texture.anisotropy = 4;
      return texture;
    };
    const floor = make('oak');
    floor?.repeat.set(4, 3);
    const fabric = make('fabric');
    fabric?.repeat.set(2, 3);
    return { floor, fabric };
  }, []);

  useEffect(() => () => {
    textures.floor?.dispose();
    textures.fabric?.dispose();
  }, [textures]);

  return textures;
}

function SoftBox({
  position, args, color, roughness = 0.92, radius = 0.06,
}: {
  position: [number, number, number];
  args: [number, number, number];
  color: string;
  roughness?: number;
  radius?: number;
}) {
  return (
    <RoundedBox position={position} args={args} radius={radius} smoothness={3} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={roughness} />
    </RoundedBox>
  );
}

function PhotorealBed({ x, fabric }: { x: number; fabric: CanvasTexture | null }) {
  return (
    <group position={[x, 0, -0.62]}>
      {/* The wooden plinth, upholstered headboard and layered linen have rounded edges. */}
      <SoftBox position={[0, 0.18, 0]} args={[1.12, 0.24, 2.17]} color="#b89b7b" radius={0.04} />
      <SoftBox position={[0, 0.44, 0]} args={[1.06, 0.29, 2.1]} color="#eee7da" radius={0.09} />
      <SoftBox position={[0, 0.69, -1.025]} args={[1.14, 0.9, 0.15]} color="#d2c2af" radius={0.065} />
      <mesh castShadow receiveShadow position={[0, 0.635, 0.27]}>
        <boxGeometry args={[1.04, 0.07, 1.45]} />
        <meshStandardMaterial color="#f7f6f1" map={fabric} roughness={1} />
      </mesh>
      <SoftBox position={[-0.25, 0.69, -0.72]} args={[0.44, 0.17, 0.42]} color="#faf9f5" radius={0.075} />
      <SoftBox position={[0.25, 0.69, -0.72]} args={[0.44, 0.17, 0.42]} color="#faf9f5" radius={0.075} />
      <SoftBox position={[0, 0.72, 0.29]} args={[1.06, 0.19, 1.44]} color="#fbfaf6" radius={0.09} />
      {/* Folded top sheet and casually placed throw add depth without a heavy mesh. */}
      <SoftBox position={[0, 0.78, -0.36]} args={[1.03, 0.035, 0.16]} color="#e9e5de" radius={0.015} />
      <SoftBox position={[0, 0.82, 0.79]} args={[1.04, 0.055, 0.42]} color="#dad5c9" radius={0.025} />
    </group>
  );
}

function Lamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.03, 0]}><cylinderGeometry args={[0.18, 0.19, 0.06, 24]} /><meshStandardMaterial color="#b69b7d" roughness={0.55} /></mesh>
      <mesh castShadow position={[0, 0.26, 0]}><cylinderGeometry args={[0.025, 0.025, 0.47, 12]} /><meshStandardMaterial color="#b69b7d" metalness={0.3} roughness={0.45} /></mesh>
      <mesh castShadow position={[0, 0.52, 0]}><cylinderGeometry args={[0.17, 0.25, 0.33, 32, 1, true]} /><meshStandardMaterial color="#f6e8d4" side={2} roughness={0.85} emissive="#f1c99c" emissiveIntensity={0.17} /></mesh>
      <pointLight position={[0, 0.42, 0]} color="#ffe6c4" intensity={0.35} distance={2.6} decay={2} />
    </group>
  );
}

function WindowCorner() {
  return (
    <group>
      {/* Window faces are pale and translucent; depth is created by the outside view. */}
      <mesh position={[0.8, 1.45, -2.635]}><planeGeometry args={[3.36, 1.4]} /><meshStandardMaterial color="#b0d1d0" roughness={0.8} /></mesh>
      <mesh position={[3.235, 1.45, 0]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[2.6, 1.4]} /><meshStandardMaterial color="#bdd3c8" roughness={0.8} /></mesh>
      <mesh position={[0.8, 0.75, -2.58]}><boxGeometry args={[3.35, 0.045, 0.045]} /><meshStandardMaterial color="#e3d6c6" /></mesh>
      <mesh position={[3.17, 0.75, 0]}><boxGeometry args={[0.045, 0.045, 2.6]} /><meshStandardMaterial color="#e3d6c6" /></mesh>
      {[-0.55, 1.85].map((x) => (
        <mesh key={x} position={[x, 1.46, -2.56]} castShadow>
          <boxGeometry args={[0.035, 1.47, 0.045]} />
          <meshStandardMaterial color="#c5b39d" />
        </mesh>
      ))}
      {/* Sheer curtains are intentionally translucent, not opaque rectangular furniture. */}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[-0.66 + i * 0.078, 1.47, -2.41 + Math.sin(i * 1.45) * 0.06]}>
          <boxGeometry args={[0.09, 1.66, 0.017]} />
          <meshStandardMaterial color="#f5f0e8" transparent opacity={0.56} depthWrite={false} side={2} />
        </mesh>
      ))}
      <directionalLight position={[3.2, 4.5, -2.1]} intensity={1.7} color="#fff4e5" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={7} shadow-camera-bottom={-7} shadow-bias={-0.0004} />
    </group>
  );
}

function Lounge() {
  return (
    <group>
      <SoftBox position={[-2.27, 0.43, 1.34]} args={[1.47, 0.4, 0.76]} color="#ddd5c8" radius={0.13} />
      <SoftBox position={[-2.27, 0.79, 1.02]} args={[1.48, 0.72, 0.18]} color="#e7e0d5" radius={0.09} />
      <SoftBox position={[-2.91, 0.62, 1.34]} args={[0.15, 0.37, 0.77]} color="#d9cbbb" radius={0.07} />
      <SoftBox position={[-1.63, 0.62, 1.34]} args={[0.15, 0.37, 0.77]} color="#d9cbbb" radius={0.07} />
      <SoftBox position={[-2.67, 0.79, 1.16]} args={[0.37, 0.38, 0.13]} color="#c4afa0" radius={0.08} />
      <mesh position={[-1.2, 0.37, 1.55]} castShadow>
        <cylinderGeometry args={[0.32, 0.32, 0.05, 36]} />
        <meshStandardMaterial color="#b99c78" roughness={0.65} />
      </mesh>
      <mesh position={[-1.2, 0.18, 1.55]} castShadow><cylinderGeometry args={[0.04, 0.04, 0.34, 18]} /><meshStandardMaterial color="#9c8064" /></mesh>
      <SoftBox position={[-1.2, 0.435, 1.55]} args={[0.26, 0.014, 0.19]} color="#e9e2d7" radius={0.01} />
    </group>
  );
}

function Decor() {
  return (
    <group>
      {/* Center bedside table, vase, and paired lights help establish real-world scale. */}
      <SoftBox position={[-0.38, 0.35, -1.75]} args={[0.36, 0.62, 0.36]} color="#c6aa88" radius={0.025} />
      <Lamp position={[-0.38, 0.66, -1.75]} />
      <SoftBox position={[2.47, 0.43, 1.4]} args={[0.94, 0.08, 0.48]} color="#bd9b74" radius={0.025} />
      <SoftBox position={[2.47, 0.27, 1.4]} args={[0.84, 0.29, 0.42]} color="#ddd0ba" radius={0.025} />
      <mesh castShadow position={[2.3, 0.55, 1.38]}><cylinderGeometry args={[0.08, 0.11, 0.18, 18]} /><meshStandardMaterial color="#f8f5ef" roughness={0.4} /></mesh>
      <mesh castShadow position={[2.62, 0.51, 1.38]}><boxGeometry args={[0.2, 0.05, 0.24]} /><meshStandardMaterial color="#344b55" roughness={0.85} /></mesh>
      <mesh position={[0.2, 1.48, -2.55]}><boxGeometry args={[0.72, 0.48, 0.035]} /><meshStandardMaterial color="#c8b598" /></mesh>
      <mesh position={[0.2, 1.48, -2.515]}><planeGeometry args={[0.59, 0.35]} /><meshStandardMaterial color="#78877a" /></mesh>
    </group>
  );
}

export function Room204Interior() {
  const { floor, fabric } = useInteriorTextures();
  return (
    <group>
      <RoomShell width={6.6} depth={5.4} height={2.65} windows="back-right" />
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6.58, 5.38]} />
        <meshStandardMaterial color="#ffffff" map={floor} roughness={0.88} metalness={0} />
      </mesh>
      <mesh position={[-0.15, 0.023, 0.18]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3.8, 2.5]} />
        <meshStandardMaterial color="#ded7ca" roughness={0.99} />
      </mesh>
      <WindowCorner />
      <PhotorealBed x={-1.45} fabric={fabric} />
      <PhotorealBed x={0.76} fabric={fabric} />
      <Lounge />
      <Decor />
      <ambientLight color="#eaf3ef" intensity={0.22} />
    </group>
  );
}
