import { ContactShadows } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group, Mesh } from 'three';

let webglAvailable: boolean | undefined;

function supportsWebGl() {
  if (webglAvailable !== undefined) return webglAvailable;
  try {
    const canvas = document.createElement('canvas');
    webglAvailable = Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    webglAvailable = false;
  }
  return webglAvailable;
}

function ConciergeFallback({ hairColor }: { hairColor: string }) {
  return (
    <div className="shiro-yado__concierge-fallback" role="img" aria-label="Concierge illustration">
      <svg viewBox="0 0 240 280" aria-hidden>
        <path d="M55 255c4-57 28-88 65-88s61 31 65 88" fill="var(--sy-elevated)" stroke="var(--sy-accent)" strokeWidth="3" />
        <path d="M78 188c11-17 25-24 42-24s31 7 42 24l-13 67H91Z" fill="var(--sy-accent)" />
        <path d="m104 169 16 25 16-25" fill="var(--sy-elevated)" />
        <ellipse cx="120" cy="105" rx="53" ry="66" fill="var(--sy-skin)" />
        <path d="M68 117c-9-55 15-91 52-91 40 0 63 36 53 94l-18-43c-25 11-49 11-73 0Z" fill={hairColor} />
        <path d="M72 92c-9 35-7 73 9 101l19-17-5-79ZM168 92c9 35 7 73-9 101l-19-17 5-79Z" fill={hairColor} />
        <ellipse cx="101" cy="109" rx="5" ry="7" fill="var(--sy-fg)" />
        <ellipse cx="139" cy="109" rx="5" ry="7" fill="var(--sy-fg)" />
        <path d="M104 137c10 8 22 8 32 0" fill="none" stroke="var(--sy-lip)" strokeWidth="4" strokeLinecap="round" />
        <rect x="139" y="205" width="26" height="12" rx="3" fill="var(--sy-gold)" />
      </svg>
    </div>
  );
}

function CuteConciergeFigure({ speaking, hairColor }: { speaking: boolean; hairColor: string }) {
  const groupRef = useRef<Group>(null);
  const lowerLipRef = useRef<Mesh>(null);
  const mouthInnerRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    const syllable = speaking
      ? Math.max(0, Math.sin(t * 16) * 0.72 + Math.sin(t * 29) * 0.28)
      : 0;
    const open = speaking ? 0.011 + syllable * 0.026 : 0;

    if (lowerLipRef.current) {
      lowerLipRef.current.position.y = 0.298 - open;
    }
    if (mouthInnerRef.current) {
      mouthInnerRef.current.position.y = 0.305 - open * 0.45;
      mouthInnerRef.current.scale.y = 0.55 + open * 20;
    }

    if (groupRef.current) {
      groupRef.current.position.y = -0.42 + Math.sin(t * 1.35) * 0.006;
      groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.03;
    }
  });

  const SKIN = '#f8d5c8';
  const HAIR = hairColor;
  const BLUSH = '#f0a090';
  const LIP = '#e07878';
  const EYE_W = '#fffaf6';
  const IRIS = '#4a3428';
  const BLOUSE = '#f8f5f0';
  const VEST = '#3d4a56';
  const GOLD = '#c9a84c';

  return (
    <group ref={groupRef} position={[0, -0.42, 0]} scale={0.95}>
      <mesh position={[0, 0.38, 0]}>
        <sphereGeometry args={[0.215, 32, 24]} />
        <meshStandardMaterial color={SKIN} roughness={0.5} />
      </mesh>

      <mesh position={[0, 0.4, -0.08]} scale={[1.08, 1.05, 0.92]}>
        <sphereGeometry args={[0.255, 24, 18]} />
        <meshStandardMaterial color={HAIR} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.54, -0.02]} scale={[1.15, 0.7, 1]}>
        <sphereGeometry args={[0.18, 20, 14]} />
        <meshStandardMaterial color={HAIR} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.535, 0.13]} scale={[1.45, 0.28, 0.5]}>
        <sphereGeometry args={[0.15, 18, 12]} />
        <meshStandardMaterial color={HAIR} roughness={0.8} />
      </mesh>
      <mesh position={[-0.25, 0.28, -0.01]}>
        <capsuleGeometry args={[0.058, 0.26, 6, 10]} />
        <meshStandardMaterial color={HAIR} roughness={0.8} />
      </mesh>
      <mesh position={[0.25, 0.28, -0.01]}>
        <capsuleGeometry args={[0.058, 0.26, 6, 10]} />
        <meshStandardMaterial color={HAIR} roughness={0.8} />
      </mesh>

      <mesh position={[-0.11, 0.325, 0.17]}>
        <sphereGeometry args={[0.042, 12, 10]} />
        <meshStandardMaterial color={BLUSH} transparent opacity={0.5} roughness={0.7} />
      </mesh>
      <mesh position={[0.11, 0.325, 0.17]}>
        <sphereGeometry args={[0.042, 12, 10]} />
        <meshStandardMaterial color={BLUSH} transparent opacity={0.5} roughness={0.7} />
      </mesh>

      <group position={[-0.075, 0.405, 0.19]}>
        <mesh>
          <sphereGeometry args={[0.05, 16, 12]} />
          <meshStandardMaterial color={EYE_W} roughness={0.3} />
        </mesh>
        <mesh position={[0.005, -0.003, 0.03]}>
          <sphereGeometry args={[0.029, 12, 10]} />
          <meshStandardMaterial color={IRIS} roughness={0.4} />
        </mesh>
        <mesh position={[0.005, -0.003, 0.048]}>
          <sphereGeometry args={[0.013, 8, 6]} />
          <meshStandardMaterial color="#1a100c" roughness={0.25} />
        </mesh>
        <mesh position={[0.012, 0.012, 0.055]}>
          <sphereGeometry args={[0.011, 8, 6]} />
          <meshStandardMaterial color="#ffffff" roughness={0.1} />
        </mesh>
      </group>
      <group position={[0.075, 0.405, 0.19]}>
        <mesh>
          <sphereGeometry args={[0.05, 16, 12]} />
          <meshStandardMaterial color={EYE_W} roughness={0.3} />
        </mesh>
        <mesh position={[-0.005, -0.003, 0.03]}>
          <sphereGeometry args={[0.029, 12, 10]} />
          <meshStandardMaterial color={IRIS} roughness={0.4} />
        </mesh>
        <mesh position={[-0.005, -0.003, 0.048]}>
          <sphereGeometry args={[0.013, 8, 6]} />
          <meshStandardMaterial color="#1a100c" roughness={0.25} />
        </mesh>
        <mesh position={[-0.012, 0.012, 0.055]}>
          <sphereGeometry args={[0.011, 8, 6]} />
          <meshStandardMaterial color="#ffffff" roughness={0.1} />
        </mesh>
      </group>

      <mesh ref={mouthInnerRef} position={[0, 0.305, 0.195]}>
        <boxGeometry args={[0.05, 0.016, 0.018]} />
        <meshStandardMaterial color="#3a2824" roughness={0.7} />
      </mesh>
      <mesh ref={lowerLipRef} position={[0, 0.298, 0.2]}>
        <boxGeometry args={[0.062, 0.016, 0.022]} />
        <meshStandardMaterial color={LIP} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.316, 0.202]}>
        <boxGeometry args={[0.058, 0.011, 0.018]} />
        <meshStandardMaterial color={LIP} roughness={0.35} />
      </mesh>

      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.065, 0.085, 0.14, 16]} />
        <meshStandardMaterial color={SKIN} roughness={0.5} />
      </mesh>

      <mesh position={[0, 0.02, 0]}>
        <capsuleGeometry args={[0.195, 0.24, 8, 16]} />
        <meshStandardMaterial color={BLOUSE} roughness={0.6} />
      </mesh>
      <mesh position={[-0.105, -0.01, 0.14]}>
        <boxGeometry args={[0.155, 0.34, 0.08]} />
        <meshStandardMaterial color={VEST} roughness={0.55} />
      </mesh>
      <mesh position={[0.105, -0.01, 0.14]}>
        <boxGeometry args={[0.155, 0.34, 0.08]} />
        <meshStandardMaterial color={VEST} roughness={0.55} />
      </mesh>
      <mesh position={[0, -0.01, 0.175]}>
        <boxGeometry args={[0.055, 0.32, 0.04]} />
        <meshStandardMaterial color={BLOUSE} roughness={0.55} />
      </mesh>
      <mesh position={[-0.07, 0.145, 0.13]} rotation={[0.25, 0.15, 0.2]}>
        <boxGeometry args={[0.12, 0.04, 0.06]} />
        <meshStandardMaterial color={BLOUSE} roughness={0.5} />
      </mesh>
      <mesh position={[0.07, 0.145, 0.13]} rotation={[0.25, -0.15, -0.2]}>
        <boxGeometry args={[0.12, 0.04, 0.06]} />
        <meshStandardMaterial color={BLOUSE} roughness={0.5} />
      </mesh>
      <mesh position={[-0.04, 0.12, 0.16]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[0.055, 0.038, 0.02]} />
        <meshStandardMaterial color={VEST} roughness={0.45} />
      </mesh>
      <mesh position={[0.04, 0.12, 0.16]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.055, 0.038, 0.02]} />
        <meshStandardMaterial color={VEST} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.12, 0.165]}>
        <boxGeometry args={[0.028, 0.028, 0.024]} />
        <meshStandardMaterial color={VEST} roughness={0.45} />
      </mesh>
      <mesh position={[0.12, 0.05, 0.185]}>
        <boxGeometry args={[0.07, 0.035, 0.012]} />
        <meshStandardMaterial color={GOLD} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.05, 0.19]}>
        <sphereGeometry args={[0.012, 8, 6]} />
        <meshStandardMaterial color={GOLD} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.01, 0.19]}>
        <sphereGeometry args={[0.012, 8, 6]} />
        <meshStandardMaterial color={GOLD} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.07, 0.19]}>
        <sphereGeometry args={[0.012, 8, 6]} />
        <meshStandardMaterial color={GOLD} roughness={0.3} />
      </mesh>

      <mesh position={[-0.26, 0.04, 0]} rotation={[0, 0, 0.32]}>
        <capsuleGeometry args={[0.055, 0.2, 6, 10]} />
        <meshStandardMaterial color={BLOUSE} roughness={0.6} />
      </mesh>
      <mesh position={[0.26, 0.04, 0]} rotation={[0, 0, -0.32]}>
        <capsuleGeometry args={[0.055, 0.2, 6, 10]} />
        <meshStandardMaterial color={BLOUSE} roughness={0.6} />
      </mesh>
    </group>
  );
}

export function ConciergeModel({
  speaking,
  hairColor = '#5c4033',
}: {
  speaking: boolean;
  hairColor?: string;
}) {
  if (!supportsWebGl()) return <ConciergeFallback hairColor={hairColor} />;

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.18, 2.35], fov: 28, near: 0.1, far: 20 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ touchAction: 'none', width: '100%', height: '100%' }}
    >
      <ambientLight intensity={1.25} />
      <hemisphereLight args={['#fff8f0', '#e0d4c4', 1.05]} />
      <directionalLight position={[2.2, 3.5, 2.5]} intensity={1.7} />
      <directionalLight position={[-2, 1.2, -1.5]} intensity={0.45} />
      <CuteConciergeFigure speaking={speaking} hairColor={hairColor} />
      <ContactShadows position={[0, -0.62, 0]} opacity={0.1} scale={2} blur={2} far={2.2} />
    </Canvas>
  );
}
