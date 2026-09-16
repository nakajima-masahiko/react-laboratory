import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { sectionRadius } from './tower-profile';

type Beam = { start: THREE.Vector3; end: THREE.Vector3; radius: number };

function beamMatrix(beam: Beam, target: THREE.Matrix4) {
  const direction = new THREE.Vector3().subVectors(beam.end, beam.start);
  const length = direction.length();
  const midpoint = new THREE.Vector3().addVectors(beam.start, beam.end).multiplyScalar(0.5);
  const rotation = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.normalize(),
  );
  target.compose(midpoint, rotation, new THREE.Vector3(beam.radius, length, beam.radius));
}

function createLattice() {
  const ringCount = 34;
  const sides = 12;
  const rings: THREE.Vector3[][] = [];
  for (let ring = 0; ring <= ringCount; ring += 1) {
    const y = (495 * ring) / ringCount;
    rings.push(Array.from({ length: sides }, (_, index) => {
      const angle = (index / sides) * Math.PI * 2;
      const radius = sectionRadius(y, angle);
      return new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    }));
  }

  const major: Beam[] = [];
  const braces: Beam[] = [];
  rings.forEach((points, ring) => {
    points.forEach((point, index) => {
      major.push({ start: point, end: points[(index + 1) % sides], radius: ring < 8 ? 0.85 : 0.48 });
      if (ring < ringCount) {
        major.push({ start: point, end: rings[ring + 1][index], radius: ring < 8 ? 1.05 : 0.58 });
        braces.push({
          start: point,
          end: rings[ring + 1][(index + (ring % 2 === 0 ? 1 : sides - 1)) % sides],
          radius: ring < 10 ? 0.48 : 0.3,
        });
      }
    });
  });
  return { major, braces };
}

function BeamInstances({ beams, color, emissive }: { beams: Beam[]; color: string; emissive: string }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const matrix = new THREE.Matrix4();
    beams.forEach((beam, index) => {
      beamMatrix(beam, matrix);
      mesh.setMatrixAt(index, matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [beams]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, beams.length]} castShadow receiveShadow>
      <cylinderGeometry args={[1, 1, 1, 6]} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.16} metalness={0.35} roughness={0.48} />
    </instancedMesh>
  );
}

function ObservationDeck({ night }: { night: boolean }) {
  const light = night ? '#c9e9ff' : '#91b8ca';
  return (
    <>
      <group position={[0, 350, 0]}>
        <mesh castShadow><cylinderGeometry args={[17, 14, 8, 48]} /><meshStandardMaterial color="#dce6e8" metalness={0.4} roughness={0.38} /></mesh>
        <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[17.15, 14.15, 4.2, 48, 1, true]} /><meshPhysicalMaterial color={light} emissive={night ? '#4d9fc8' : '#000000'} emissiveIntensity={1.3} transmission={0.22} transparent opacity={0.68} roughness={0.22} /></mesh>
        <mesh position={[0, 6.4, 0]}><cylinderGeometry args={[12.5, 15, 5, 48]} /><meshStandardMaterial color="#d6e0e3" metalness={0.35} roughness={0.42} /></mesh>
      </group>
      <group position={[0, 450, 0]}>
        <mesh castShadow><cylinderGeometry args={[10.5, 8.2, 9, 48]} /><meshStandardMaterial color="#dce5e7" metalness={0.42} roughness={0.38} /></mesh>
        <mesh><cylinderGeometry args={[10.65, 8.35, 5, 48, 1, true]} /><meshPhysicalMaterial color={light} emissive={night ? '#5ab4e0' : '#000000'} emissiveIntensity={1.5} transmission={0.3} transparent opacity={0.72} roughness={0.18} /></mesh>
        <mesh position={[0, 7, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[7.4, 0.7, 8, 48]} /><meshStandardMaterial color="#e4ecee" metalness={0.35} roughness={0.4} /></mesh>
      </group>
    </>
  );
}

function Antenna({ night }: { night: boolean }) {
  return (
    <group>
      <mesh position={[0, 548, 0]} castShadow>
        <cylinderGeometry args={[2.5, 4.8, 106, 16]} />
        <meshStandardMaterial color="#d8e1e4" metalness={0.5} roughness={0.36} />
      </mesh>
      <mesh position={[0, 614, 0]}><cylinderGeometry args={[0.72, 2.5, 26, 12]} /><meshStandardMaterial color="#ced9dc" metalness={0.5} roughness={0.35} /></mesh>
      <mesh position={[0, 630, 0]}><cylinderGeometry args={[0.16, 0.7, 8, 8]} /><meshStandardMaterial color="#e6edef" metalness={0.45} roughness={0.3} /></mesh>
      {[520, 558, 596, 632].map((height) => (
        <mesh key={height} position={[0, height, 2.7]}>
          <sphereGeometry args={[night ? 0.8 : 0.45, 10, 10]} />
          <meshBasicMaterial color={night ? '#ff334f' : '#951c2e'} />
        </mesh>
      ))}
    </group>
  );
}

export default function TowerModel({ night }: { night: boolean }) {
  const lattice = useMemo(() => createLattice(), []);
  const steel = night ? '#bdcbd2' : '#e0e7e9';
  const glow = night ? '#547289' : '#000000';
  return (
    <group>
      <BeamInstances beams={lattice.major} color={steel} emissive={glow} />
      <BeamInstances beams={lattice.braces} color={steel} emissive={glow} />
      <ObservationDeck night={night} />
      <Antenna night={night} />
    </group>
  );
}
