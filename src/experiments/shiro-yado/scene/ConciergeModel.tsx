import { ContactShadows, useGLTF } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import type { Object3D } from 'three';

const MODEL_URL = `${import.meta.env.BASE_URL}models/shiro-yado/hotel-concierge.glb`;

function ConciergeFigure({ speaking }: { speaking: boolean }) {
  const { scene } = useGLTF(MODEL_URL);
  const model = useMemo(() => scene.clone(true), [scene]);
  const lowerLipRef = useRef<Object3D[]>([]);
  const mouthInnerRef = useRef<Object3D | null>(null);
  const restYRef = useRef(new Map<string, number>());

  useEffect(() => {
    const restPositions = restYRef.current;
    const lowerLip = ['mouth_lower_left', 'mouth_lower_right']
      .map((name) => model.getObjectByName(name))
      .filter((part): part is Object3D => Boolean(part));
    const mouthInner = model.getObjectByName('mouth_inner') ?? null;
    lowerLipRef.current = lowerLip;
    mouthInnerRef.current = mouthInner;
    [...lowerLip, ...(mouthInner ? [mouthInner] : [])].forEach((part) => {
      restPositions.set(part.name, part.position.y);
    });

    return () => {
      lowerLip.forEach((part) => {
        part.position.y = restPositions.get(part.name) ?? 0;
      });
      if (mouthInner) mouthInner.position.y = restPositions.get(mouthInner.name) ?? 0;
    };
  }, [model]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const syllable = speaking
      ? Math.max(0, Math.sin(time * 16) * 0.72 + Math.sin(time * 29) * 0.28)
      : 0;
    const opening = speaking ? 0.003 + syllable * 0.016 : 0;

    lowerLipRef.current.forEach((part) => {
      part.position.y = (restYRef.current.get(part.name) ?? 0) - opening;
    });
    const mouthInner = mouthInnerRef.current;
    if (mouthInner) {
      mouthInner.position.y =
        (restYRef.current.get(mouthInner.name) ?? 0) - opening * 0.42;
    }
  });

  return <primitive object={model} position={[0, -0.92, 0]} rotation={[0, 0, 0]} />;
}

function ConciergeFallback() {
  return (
    <mesh position={[0, 0, 0]}>
      <capsuleGeometry args={[0.2, 0.9, 6, 12]} />
      <meshStandardMaterial color="#d9d1c4" />
    </mesh>
  );
}

export function ConciergeModel({ speaking }: { speaking: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.35, 3.7], fov: 30, near: 0.1, far: 20 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ touchAction: 'none' }}
    >
      <ambientLight intensity={1.45} />
      <hemisphereLight args={['#ffffff', '#d9d1c4', 1.05]} />
      <directionalLight position={[3, 5, 4]} intensity={2.2} />
      <directionalLight position={[-3, 2, -2]} intensity={0.65} />
      <Suspense fallback={<ConciergeFallback />}>
        <ConciergeFigure speaking={speaking} />
      </Suspense>
      <ContactShadows position={[0, -0.93, 0]} opacity={0.18} scale={3} blur={2.4} far={3} />
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL);
