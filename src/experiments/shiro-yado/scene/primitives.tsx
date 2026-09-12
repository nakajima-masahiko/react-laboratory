import { C } from './palette';

type Vec3 = [number, number, number];

export function Box({
  position = [0, 0, 0],
  rotation,
  args,
  color,
  roughness = 0.86,
  metalness = 0.03,
}: {
  position?: Vec3;
  rotation?: Vec3;
  args: Vec3;
  color: string;
  roughness?: number;
  metalness?: number;
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={args} />
      <meshStandardMaterial
        color={color}
        roughness={roughness}
        metalness={metalness}
      />
    </mesh>
  );
}

export function FloorSlab({
  width,
  depth,
  color = C.floor,
}: {
  width: number;
  depth: number;
  color?: string;
}) {
  return (
    <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial color={color} roughness={0.95} metalness={0} />
    </mesh>
  );
}

export function Wall({
  position,
  args,
  color = C.wall,
}: {
  position: Vec3;
  args: Vec3;
  color?: string;
}) {
  return <Box position={position} args={args} color={color} roughness={0.92} />;
}

export function WindowPane({
  position,
  args,
  rotation,
}: {
  position: Vec3;
  args: Vec3;
  rotation?: Vec3;
}) {
  return (
    <group position={position} rotation={rotation}>
      <Box args={[args[0] + 0.08, args[1] + 0.08, 0.06]} color={C.wood} />
      <Box
        position={[0, 0, 0.02]}
        args={args}
        color={C.glass}
        roughness={0.18}
        metalness={0.12}
      />
    </group>
  );
}

export function Bed({
  position,
  rotation,
  twin = false,
  wide = false,
}: {
  position: Vec3;
  rotation?: Vec3;
  twin?: boolean;
  wide?: boolean;
}) {
  const w = wide ? 1.55 : twin ? 1.05 : 1.45;
  const d = 2.05;
  return (
    <group position={position} rotation={rotation}>
      <Box args={[w + 0.08, 0.18, d + 0.08]} position={[0, 0.18, 0]} color={C.wood} />
      <Box args={[w, 0.2, d]} position={[0, 0.36, 0]} color={C.linen} />
      <Box
        args={[w + 0.08, 0.62, 0.08]}
        position={[0, 0.5, -d / 2 + 0.02]}
        color={C.woodDark}
      />
      <Box
        args={[0.42, 0.12, 0.36]}
        position={[twin || wide ? -w * 0.22 : 0, 0.54, -d / 2 + 0.38]}
        color={C.pillow}
      />
      {(twin || wide) && (
        <Box
          args={[0.42, 0.12, 0.36]}
          position={[w * 0.22, 0.54, -d / 2 + 0.38]}
          color={C.pillow}
        />
      )}
    </group>
  );
}

export function Sofa({
  position,
  rotation,
  seats = 2,
}: {
  position: Vec3;
  rotation?: Vec3;
  seats?: number;
}) {
  const w = seats * 0.7 + 0.2;
  return (
    <group position={position} rotation={rotation}>
      <Box args={[w, 0.28, 0.72]} position={[0, 0.28, 0]} color={C.linen} />
      <Box args={[w, 0.42, 0.14]} position={[0, 0.52, -0.3]} color={C.linen} />
      <Box args={[0.12, 0.34, 0.72]} position={[-w / 2 + 0.06, 0.42, 0]} color={C.wood} />
      <Box args={[0.12, 0.34, 0.72]} position={[w / 2 - 0.06, 0.42, 0]} color={C.wood} />
    </group>
  );
}

export function Table({
  position,
  args = [1.1, 0.06, 0.7],
}: {
  position: Vec3;
  args?: Vec3;
}) {
  const [w, h, d] = args;
  return (
    <group position={position}>
      <Box args={[w, h, d]} position={[0, 0.52, 0]} color={C.wood} />
      <Box args={[0.06, 0.5, 0.06]} position={[-w / 2 + 0.08, 0.25, -d / 2 + 0.08]} color={C.woodDark} />
      <Box args={[0.06, 0.5, 0.06]} position={[w / 2 - 0.08, 0.25, -d / 2 + 0.08]} color={C.woodDark} />
      <Box args={[0.06, 0.5, 0.06]} position={[-w / 2 + 0.08, 0.25, d / 2 - 0.08]} color={C.woodDark} />
      <Box args={[0.06, 0.5, 0.06]} position={[w / 2 - 0.08, 0.25, d / 2 - 0.08]} color={C.woodDark} />
    </group>
  );
}

export function Desk({ position, rotation }: { position: Vec3; rotation?: Vec3 }) {
  return (
    <group position={position} rotation={rotation}>
      <Box args={[1.2, 0.05, 0.5]} position={[0, 0.72, 0]} color={C.wood} />
      <Box args={[1.18, 0.55, 0.46]} position={[0, 0.4, 0]} color={C.wallInner} />
      <Box args={[0.36, 0.02, 0.24]} position={[0, 0.78, 0.02]} color={C.ink} />
    </group>
  );
}

export function Chair({
  position,
  rotation,
}: {
  position: Vec3;
  rotation?: Vec3;
}) {
  return (
    <group position={position} rotation={rotation}>
      <Box args={[0.4, 0.06, 0.4]} position={[0, 0.42, 0]} color={C.wood} />
      <Box args={[0.4, 0.38, 0.06]} position={[0, 0.64, -0.17]} color={C.linen} />
      <Box args={[0.05, 0.4, 0.05]} position={[-0.15, 0.2, -0.15]} color={C.woodDark} />
      <Box args={[0.05, 0.4, 0.05]} position={[0.15, 0.2, -0.15]} color={C.woodDark} />
      <Box args={[0.05, 0.4, 0.05]} position={[-0.15, 0.2, 0.15]} color={C.woodDark} />
      <Box args={[0.05, 0.4, 0.05]} position={[0.15, 0.2, 0.15]} color={C.woodDark} />
    </group>
  );
}

export function Plant({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <Box args={[0.22, 0.2, 0.22]} position={[0, 0.1, 0]} color={C.stone} />
      <mesh position={[0, 0.42, 0]}>
        <coneGeometry args={[0.18, 0.46, 6]} />
        <meshStandardMaterial color={C.sage} roughness={0.9} />
      </mesh>
    </group>
  );
}

export function Elevator({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <Box args={[1.6, 2.2, 0.12]} position={[0, 1.1, 0]} color={C.metal} metalness={0.35} roughness={0.4} />
      <Box args={[0.72, 2.02, 0.04]} position={[-0.38, 1.1, 0.08]} color={C.wall} />
      <Box args={[0.72, 2.02, 0.04]} position={[0.38, 1.1, 0.08]} color={C.wall} />
      <Box args={[0.08, 0.08, 0.04]} position={[0.58, 1.1, 0.12]} color={C.woodDark} />
    </group>
  );
}

export function Rug({
  position,
  args,
}: {
  position: Vec3;
  args: [number, number];
}) {
  return (
    <mesh position={[position[0], 0.015, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={args} />
      <meshStandardMaterial color={C.rug} roughness={1} />
    </mesh>
  );
}

export function RoomShell({
  width,
  depth,
  height = 2.4,
  windows = 'back',
  openFront = true,
}: {
  width: number;
  depth: number;
  height?: number;
  windows?: 'back' | 'back-right' | 'none';
  openFront?: boolean;
}) {
  const t = 0.08;
  const hw = width / 2;
  const hd = depth / 2;
  return (
    <group>
      <FloorSlab width={width} depth={depth} />
      <Wall position={[0, height / 2, -hd]} args={[width, height, t]} />
      <Wall position={[-hw, height / 2, 0]} args={[t, height, depth]} />
      <Wall position={[hw, height / 2, 0]} args={[t, height, depth]} />
      {!openFront && (
        <Wall position={[0, height / 2, hd]} args={[width, height, t]} />
      )}
      {windows !== 'none' && (
        <WindowPane
          position={[windows === 'back-right' ? hw * 0.25 : 0, 1.35, -hd + 0.06]}
          args={[windows === 'back-right' ? width * 0.55 : width * 0.42, 1.1, 0.03]}
        />
      )}
      {windows === 'back-right' && (
        <WindowPane
          position={[hw - 0.06, 1.35, 0]}
          rotation={[0, Math.PI / 2, 0]}
          args={[depth * 0.5, 1.1, 0.03]}
        />
      )}
    </group>
  );
}
