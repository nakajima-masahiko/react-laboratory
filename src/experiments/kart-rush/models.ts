import * as T from "three";
import { COLORS as C } from "./track";
export const material = (color: string, emissive = false) =>
  new T.MeshStandardMaterial({
    color,
    roughness: 0.55,
    metalness: 0.2,
    ...(emissive ? { emissive: color, emissiveIntensity: 0.85 } : {}),
  });
export function ellipsoid(
  parent: T.Object3D,
  mat: T.Material,
  scale: number[],
  pos: number[],
  detail = 12,
) {
  const mesh = new T.Mesh(new T.SphereGeometry(1, detail, 8), mat);
  mesh.scale.set(scale[0], scale[1], scale[2]);
  mesh.position.set(pos[0], pos[1], pos[2]);
  parent.add(mesh);
  return mesh;
}
export function box(
  parent: T.Object3D,
  mat: T.Material,
  size: number[],
  pos: number[],
) {
  const mesh = new T.Mesh(
    new T.BoxGeometry(...(size as [number, number, number])),
    mat,
  );
  mesh.position.set(...(pos as [number, number, number]));
  parent.add(mesh);
  return mesh;
}
export function kart(color: string) {
  const root = new T.Group(),
    hull = material(color),
    dark = material(C.dark),
    chrome = material(C.metal),
    glow = material(C.cyan, true);
  ellipsoid(root, hull, [0.9, 0.48, 1.65], [0, 0.8, 0]);
  box(root, chrome, [1.5, 0.25, 2.7], [0, 0.35, 0]);
  ellipsoid(root, material(C.glass), [0.62, 0.65, 0.77], [0, 1.3, -0.05]);
  ellipsoid(root, dark, [0.48, 0.18, 0.4], [0, 1.38, 0.52]); // visor
  box(root, hull, [2.25, 0.16, 0.4], [0, 1.12, -1.1]);
  for (const x of [-1, 1])
    for (const z of [-0.9, 0.9]) {
      const wheel = new T.Mesh(
        new T.CylinderGeometry(0.43, 0.43, 0.36, 12),
        dark,
      );
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.43, z);
      root.add(wheel);
      const hub = new T.Mesh(
        new T.CylinderGeometry(0.22, 0.22, 0.38, 12),
        glow,
      );
      hub.rotation.z = Math.PI / 2;
      hub.position.copy(wheel.position);
      root.add(hub);
    }
  for (const x of [-0.6, 0.6])
    ellipsoid(root, material(C.white, true), [0.18, 0.11, 0.1], [x, 0.8, 1.5]);
  const jets = new T.Group();
  for (const x of [-0.55, 0.55])
    ellipsoid(jets, glow, [0.18, 0.18, 0.75], [x, 0.55, -1.8]);
  root.add(jets);
  const bubble = new T.Mesh(
    new T.SphereGeometry(2, 20, 12),
    new T.MeshBasicMaterial({
      color: C.cyan,
      transparent: true,
      opacity: 0.16,
      wireframe: true,
    }),
  );
  bubble.position.y = 0.8;
  root.add(bubble);
  bubble.visible = false;
  const shadow = new T.Mesh(
    new T.CircleGeometry(1.5, 20),
    new T.MeshBasicMaterial({
      color: C.deep,
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
    }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.scale.y = 1.55;
  shadow.position.y = 0.025;
  root.add(shadow);
  return { root, jets, bubble };
}
export function turtle() {
  const root = new T.Group(),
    shell = material(C.green),
    body = material(C.sand);
  ellipsoid(root, shell, [2.1, 0.85, 2.8], [0, 0, 0]);
  ellipsoid(root, body, [1.9, 0.25, 2.5], [0, -0.3, 0]);
  ellipsoid(root, body, [0.65, 0.5, 0.9], [0, 0, 3]);
  for (const x of [-0.3, 0.3])
    ellipsoid(root, material(C.deep), [0.1, 0.12, 0.12], [x, 0.25, 3.6]);
  const fins: T.Mesh[] = [];
  for (const side of [-1, 1]) {
    const fin = ellipsoid(root, body, [2, 0.14, 0.75], [side * 2, -0.2, 0.8]);
    fin.rotation.y = side * 0.45;
    fins.push(fin);
    ellipsoid(root, body, [0.9, 0.12, 0.5], [side * 1.6, -0.2, -2]);
  }
  // Shell plates are raised, not an external texture dependency.
  for (let i = -1; i <= 1; i++)
    ellipsoid(
      root,
      material(C.rock),
      [0.67, 0.1, 0.65],
      [0, 0.79 - Math.abs(i) * 0.08, i * 1.2],
      6,
    );
  return { root, fins };
}
export function whale() {
  const root = new T.Group(),
    skin = material(C.blue),
    belly = material(C.white);
  ellipsoid(root, skin, [5.7, 5, 17], [0, 0, 0], 24);
  ellipsoid(root, belly, [4.8, 1.3, 12], [0, -3.7, 2]);
  ellipsoid(root, skin, [2.8, 2.1, 8], [0, 0.5, -16]);
  const tail = new T.Group();
  tail.position.set(0, 1, -23);
  root.add(tail);
  for (const side of [-1, 1]) {
    const fluke = ellipsoid(tail, skin, [6, 0.7, 2.5], [side * 4, 0, 0]);
    fluke.rotation.y = side * 0.25;
    const fin = ellipsoid(root, skin, [1.5, 0.6, 8], [side * 6, -1, -1]);
    fin.rotation.y = -side * 0.55;
    ellipsoid(root, material(C.deep), [0.25, 0.35, 0.25], [side * 4.8, 0, 9]);
  }
  return { root, tail };
}
export function jelly() {
  const root = new T.Group();
  const dome = new T.Mesh(
    new T.SphereGeometry(2, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.58),
    new T.MeshBasicMaterial({
      color: C.purple,
      transparent: true,
      opacity: 0.43,
      side: T.DoubleSide,
      depthWrite: false,
    }),
  );
  root.add(dome);
  ellipsoid(root, material(C.pink, true), [0.6, 0.45, 0.6], [0, 0.1, 0]);
  const tentacles: T.Line[] = [];
  for (let j = 0; j < 7; j++) {
    const angle = (j / 7) * Math.PI * 2;
    const pts = Array.from(
      { length: 12 },
      (_, i) =>
        new T.Vector3(
          Math.cos(angle) * 1.4 + Math.sin(i * 0.8 + j) * 0.25,
          -i * 0.6,
          Math.sin(angle) * 1.4,
        ),
    );
    const line = new T.Line(
      new T.BufferGeometry().setFromPoints(pts),
      new T.LineBasicMaterial({
        color: C.purple,
        transparent: true,
        opacity: 0.65,
      }),
    );
    root.add(line);
    tentacles.push(line);
  }
  return { root, tentacles };
}
