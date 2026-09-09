import { C } from './palette';
import {
  Bed,
  Box,
  Chair,
  Desk,
  Elevator,
  Plant,
  RoomShell,
  Rug,
  Sofa,
  Table,
} from './primitives';

import type { PlaceId } from '../hotel-data';

function TwinRoom({ deluxe = false }: { deluxe?: boolean }) {
  return (
    <group>
      <RoomShell width={deluxe ? 6.4 : 5.4} depth={deluxe ? 5.2 : 4.6} />
      <Rug position={[0, 0, 0.2]} args={deluxe ? [3.4, 2.2] : [2.8, 1.8]} />
      <Bed position={[-1.15, 0, -0.35]} twin />
      <Bed position={[1.15, 0, -0.35]} twin />
      <Desk position={[deluxe ? 2.4 : 1.9, 0, 1.4]} rotation={[0, -Math.PI / 2, 0]} />
      <Chair position={[deluxe ? 1.85 : 1.35, 0, 1.4]} rotation={[0, Math.PI / 2, 0]} />
      {deluxe && <Sofa position={[-1.8, 0, 1.55]} rotation={[0, 0.2, 0]} />}
      <Plant position={[deluxe ? 2.7 : 2.2, 0, -1.8]} />
      <Box args={[0.9, 0.7, 0.08]} position={[0, 1.3, -2.2]} color={C.night} />
    </group>
  );
}

function DoubleRoom() {
  return (
    <group>
      <RoomShell width={5.4} depth={4.6} />
      <Rug position={[0, 0, 0.15]} args={[2.6, 1.8]} />
      <Bed position={[0, 0, -0.4]} wide />
      <Desk position={[1.9, 0, 1.35]} rotation={[0, -Math.PI / 2, 0]} />
      <Chair position={[1.35, 0, 1.35]} rotation={[0, Math.PI / 2, 0]} />
      <Plant position={[-2.1, 0, -1.7]} />
    </group>
  );
}

function CornerTwin() {
  return (
    <group>
      <RoomShell width={6.6} depth={5.4} windows="back-right" />
      <Rug position={[0, 0, 0.3]} args={[3.6, 2.4]} />
      <Bed position={[-1.45, 0, -0.55]} twin />
      <Bed position={[0.7, 0, -0.55]} twin />
      <Sofa position={[-2.1, 0, 1.7]} />
      <Chair position={[2.3, 0, 0.6]} rotation={[0, -0.6, 0]} />
      <Plant position={[2.7, 0, -2.0]} />
      <Plant position={[-2.7, 0, -2.0]} />
    </group>
  );
}

function FamilyRoom() {
  return (
    <group>
      <RoomShell width={7.2} depth={5.6} />
      <Rug position={[0.4, 0, 0.4]} args={[4.2, 2.6]} />
      <Bed position={[-2.1, 0, -0.7]} twin />
      <Bed position={[-0.7, 0, -0.7]} twin />
      <Sofa position={[2.1, 0, -0.8]} seats={3} rotation={[0, -Math.PI / 2, 0]} />
      <Table position={[1.6, 0, 1.5]} args={[1.6, 0.06, 0.9]} />
      <Chair position={[1.15, 0, 0.95]} />
      <Chair position={[2.05, 0, 0.95]} />
      <Plant position={[-3.1, 0, 2.1]} />
    </group>
  );
}

function LobbyInterior({ overview = false }: { overview?: boolean }) {
  return (
    <group>
      <RoomShell
        width={overview ? 14 : 10}
        depth={overview ? 10 : 8}
        height={2.6}
        windows="back"
        openFront
      />
      <Rug position={[1.4, 0, 0.6]} args={[4.2, 2.8]} />
      <Box args={[3.2, 1.05, 0.7]} position={[-3.1, 0.52, -1.4]} color={C.wallInner} />
      <Box args={[3.3, 0.06, 0.78]} position={[-3.1, 1.08, -1.4]} color={C.wood} />
      <Box args={[0.5, 0.04, 0.28]} position={[-3.1, 1.14, -1.15]} color={C.ink} />
      <Chair position={[-3.1, 0, -0.7]} />
      <Sofa position={[1.1, 0, 1.1]} seats={3} />
      <Sofa position={[2.8, 0, -0.1]} seats={2} rotation={[0, -Math.PI / 2, 0]} />
      <Table position={[1.6, 0, 0.35]} args={[0.9, 0.05, 0.6]} />
      <Elevator position={[4.6, 0, -3.6]} />
      <Plant position={[-4.4, 0, -3.3]} />
      <Plant position={[3.3, 0, 3.1]} />
      <Box args={[0.08, 1.4, 0.6]} position={[-0.2, 1.2, -3.8]} color={C.woodDark} />
    </group>
  );
}

function BanquetInterior() {
  const tables: Array<[number, number]> = [
    [-2.1, -0.6],
    [0.3, -0.6],
    [2.7, -0.6],
  ];
  return (
    <group>
      <RoomShell width={10} depth={7.2} height={2.8} windows="back" />
      <Rug position={[0.2, 0, 0.2]} args={[8.2, 4.6]} />
      {tables.map(([x, z]) => (
        <group key={`${x}-${z}`}>
          <Table position={[x, 0, z]} args={[2.1, 0.06, 0.85]} />
          <Chair position={[x - 0.55, 0, z + 0.7]} />
          <Chair position={[x + 0.55, 0, z + 0.7]} />
          <Chair position={[x - 0.55, 0, z - 0.7]} rotation={[0, Math.PI, 0]} />
          <Chair position={[x + 0.55, 0, z - 0.7]} rotation={[0, Math.PI, 0]} />
        </group>
      ))}
      <Box args={[3.4, 0.18, 1.1]} position={[0, 0.12, -2.7]} color={C.wood} />
      <Plant position={[-4.4, 0, -3.0]} />
      <Plant position={[4.4, 0, -3.0]} />
    </group>
  );
}

function BathInterior() {
  return (
    <group>
      <RoomShell width={7.2} depth={5.8} height={2.5} windows="none" />
      <Box args={[7.2, 0.04, 5.8]} position={[0, 0.02, 0]} color={C.stone} />
      <Box args={[3.6, 0.46, 2.1]} position={[-0.7, 0.28, -0.7]} color={C.wood} />
      <mesh position={[-0.7, 0.52, -0.7]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.2, 1.7]} />
        <meshStandardMaterial
          color={C.water}
          roughness={0.12}
          metalness={0.15}
        />
      </mesh>
      <Box args={[0.08, 1.4, 2.2]} position={[1.5, 0.8, -0.7]} color={C.woodDark} />
      <Box args={[1.1, 0.12, 0.42]} position={[2.4, 0.28, 1.4]} color={C.stone} />
      <Box args={[1.1, 0.12, 0.42]} position={[2.4, 0.28, 0.7]} color={C.stone} />
      <Box args={[0.55, 0.32, 0.55]} position={[2.4, 0.2, -1.8]} color={C.wood} />
      <Plant position={[-3.1, 0, 2.2]} />
    </group>
  );
}

function RestroomInterior() {
  const stalls = [
    { x: -1.7, door: C.linen },
    { x: 0, door: C.sage },
    { x: 1.7, door: C.wood },
  ];
  return (
    <group>
      <RoomShell width={6.4} depth={4.6} height={2.4} windows="none" />
      {stalls.map((s) => (
        <group key={s.x} position={[s.x, 0, -0.85]}>
          <Box args={[0.05, 1.7, 1.5]} position={[-0.62, 0.85, 0]} color={C.wallInner} />
          <Box args={[0.05, 1.7, 1.5]} position={[0.62, 0.85, 0]} color={C.wallInner} />
          <Box args={[1.24, 1.7, 0.05]} position={[0, 0.85, -0.74]} color={C.wallInner} />
          <Box args={[0.7, 1.45, 0.05]} position={[0, 0.82, 0.76]} color={s.door} />
          <Box args={[0.06, 0.08, 0.08]} position={[0.22, 0.9, 0.82]} color={C.metal} />
        </group>
      ))}
      <Box args={[2.6, 0.08, 0.42]} position={[0, 0.86, 1.55]} color={C.stone} />
      <Box
        args={[0.32, 0.1, 0.32]}
        position={[-0.55, 0.96, 1.55]}
        color={C.metal}
        metalness={0.4}
      />
      <Box
        args={[0.32, 0.1, 0.32]}
        position={[0.55, 0.96, 1.55]}
        color={C.metal}
        metalness={0.4}
      />
    </group>
  );
}

export function PlaceInterior({ id }: { id: PlaceId }) {
  switch (id) {
    case 'lobby':
      return <LobbyInterior />;
    case 'room-201':
      return <TwinRoom />;
    case 'room-202':
      return <DoubleRoom />;
    case 'room-203':
      return <TwinRoom deluxe />;
    case 'room-204':
      return <CornerTwin />;
    case 'room-205':
      return <FamilyRoom />;
    case 'banquet':
      return <BanquetInterior />;
    case 'bath':
      return <BathInterior />;
    case 'restroom':
      return <RestroomInterior />;
    default:
      return <LobbyInterior />;
  }
}

export function Floor1Overview() {
  return <LobbyInterior overview />;
}

export function Floor2Overview() {
  const rooms: Array<{ x: number; twin?: boolean; wide?: boolean }> = [
    { x: -6.2, twin: true },
    { x: -3.1, wide: true },
    { x: 0, twin: true },
    { x: 3.1, twin: true },
    { x: 6.2, twin: true },
  ];
  return (
    <group>
      <Box args={[16.4, 0.04, 8.4]} position={[0, 0, 0]} color={C.floor} />
      <Box args={[16.4, 0.04, 2.2]} position={[0, 0.01, 2.4]} color={C.floorDark} />
      {rooms.map((r, i) => (
        <group key={i} position={[r.x, 0, -1.15]}>
          <Box args={[2.85, 0.9, 0.08]} position={[0, 0.45, -1.65]} color={C.wall} />
          <Box args={[0.08, 0.9, 3.3]} position={[-1.4, 0.45, 0]} color={C.wall} />
          <Box args={[0.08, 0.9, 3.3]} position={[1.4, 0.45, 0]} color={C.wall} />
          <Bed position={[0, 0, -0.2]} twin={r.twin} wide={r.wide} />
        </group>
      ))}
      <Elevator position={[-0.1, 0, 3.4]} />
      <Plant position={[-7.4, 0, 3.2]} />
      <Plant position={[7.4, 0, 3.2]} />
    </group>
  );
}

export function Floor3Overview() {
  return (
    <group>
      <Box args={[16.8, 0.04, 10]} position={[0, 0, 0]} color={C.floor} />
      <Box args={[4.4, 0.03, 3.4]} position={[0, 0.02, 2.7]} color={C.floorDark} />
      <group position={[-5.3, 0, -0.3]}>
        <Box args={[5.6, 0.02, 6.4]} position={[0, 0.03, 0]} color={C.stone} />
        <Box args={[5.6, 1.15, 0.08]} position={[0, 0.58, -3.16]} color={C.stone} />
        <Box args={[0.08, 1.15, 6.32]} position={[-2.76, 0.58, 0]} color={C.stone} />
        <Box args={[0.08, 1.15, 6.32]} position={[2.76, 0.58, 0]} color={C.stone} />
        <Box args={[2.8, 0.28, 1.7]} position={[0, 0.2, -0.4]} color={C.wood} />
        <Box args={[2.35, 0.04, 1.25]} position={[0, 0.36, -0.4]} color={C.water} />
        <Box args={[0.7, 0.28, 0.7]} position={[1.6, 0.18, 1.8]} color={C.woodDark} />
      </group>
      <group position={[0, 0, -0.7]}>
        <Box args={[3.4, 1.15, 0.08]} position={[0, 0.58, -1.85]} color={C.wall} />
        <Box args={[0.08, 1.15, 3.7]} position={[-1.66, 0.58, 0]} color={C.wall} />
        <Box args={[0.08, 1.15, 3.7]} position={[1.66, 0.58, 0]} color={C.wall} />
        <Box args={[0.72, 1.2, 0.06]} position={[-0.8, 0.62, 1.82]} color={C.linen} />
        <Box args={[0.72, 1.2, 0.06]} position={[0, 0.62, 1.82]} color={C.sage} />
        <Box args={[0.72, 1.2, 0.06]} position={[0.8, 0.62, 1.82]} color={C.wood} />
      </group>
      <group position={[5.4, 0, -0.15]}>
        <Box args={[5.9, 0.02, 6.8]} position={[0, 0.03, 0]} color={C.wallInner} />
        <Box args={[5.9, 1.15, 0.08]} position={[0, 0.58, -3.36]} color={C.wall} />
        <Box args={[0.08, 1.15, 6.72]} position={[-2.91, 0.58, 0]} color={C.wall} />
        <Box args={[0.08, 1.15, 6.72]} position={[2.91, 0.58, 0]} color={C.wall} />
        <Table position={[-1.2, 0, 0.15]} args={[1.9, 0.06, 0.75]} />
        <Table position={[1.2, 0, 0.15]} args={[1.9, 0.06, 0.75]} />
        <Chair position={[-1.2, 0, 0.85]} />
        <Chair position={[1.2, 0, 0.85]} />
      </group>
      <Elevator position={[0, 0, 3.85]} />
    </group>
  );
}
