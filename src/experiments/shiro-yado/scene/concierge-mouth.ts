import {
  BufferAttribute, BufferGeometry, Color, Float32BufferAttribute, MathUtils,
  MeshBasicMaterial, SkinnedMesh, SphereGeometry, Uint16BufferAttribute,
} from 'three';
import type { Object3D } from 'three';

const MOUTH_Y = (1420 - 184.3) * 1.72 / 1402;
const lipLine = (x: number) => MOUTH_Y + 0.0017 * Math.min(1, Math.abs(x) / 0.028) ** 2;
type Vertex = Record<string, number[]>;
const signed = (vertex: Vertex) => vertex.position[1] - lipLine(vertex.position[0]);

/** Split crossing triangles at the closed lip seam without changing the rest pose. */
function splitLips(source: BufferGeometry) {
  const geometry = source.index ? source.toNonIndexed() : source.clone();
  const names = Object.keys(geometry.attributes);
  const output: Record<string, number[]> = Object.fromEntries(names.map((name) => [name, []]));
  const read = (i: number): Vertex => Object.fromEntries(names.map((name) => {
    const attribute = geometry.getAttribute(name);
    return [name, Array.from({ length: attribute.itemSize }, (_, j) => attribute.getComponent(i, j))];
  }));
  const mix = (a: Vertex, b: Vertex, t: number): Vertex => Object.fromEntries(names.map((name) => [name,
    name === 'skinIndex' ? a[name].slice() : a[name].map((value, i) => value + (b[name][i] - value) * t),
  ]));
  const clip = (polygon: Vertex[], upper: boolean) => {
    const result: Vertex[] = [];
    for (let i = 0; i < polygon.length; i++) {
      const a = polygon[i], b = polygon[(i + 1) % polygon.length];
      const insideA = upper ? signed(a) >= 0 : signed(a) <= 0;
      const insideB = upper ? signed(b) >= 0 : signed(b) <= 0;
      if (insideA) result.push(a);
      if (insideA !== insideB) {
        const vertex = mix(a, b, -signed(a) / (signed(b) - signed(a)));
        vertex.position[1] = lipLine(vertex.position[0]) + (upper ? 1 : -1) * 1e-7;
        result.push(vertex);
      }
    }
    return result;
  };
  const emit = (polygon: Vertex[]) => {
    for (let i = 1; i < polygon.length - 1; i++) {
      for (const vertex of [polygon[0], polygon[i], polygon[i + 1]]) {
        for (const name of names) output[name].push(...vertex[name]);
      }
    }
  };
  for (let i = 0; i < geometry.attributes.position.count; i += 3) {
    const triangle = [read(i), read(i + 1), read(i + 2)];
    const ys = triangle.map(signed);
    const near = triangle.every((vertex) => vertex.position[2] > 0.06)
      && triangle.some((vertex) => Math.abs(vertex.position[0]) < 0.034);
    if (near && Math.min(...ys) < 0 && Math.max(...ys) > 0) {
      emit(clip(triangle, true)); emit(clip(triangle, false));
    } else emit(triangle);
  }
  const result = new BufferGeometry();
  for (const name of names) {
    const values = name === 'skinIndex' ? new Uint16Array(output[name]) : new Float32Array(output[name]);
    result.setAttribute(name, new BufferAttribute(values, geometry.attributes[name].itemSize));
  }
  result.computeBoundingSphere();
  geometry.dispose();
  return result;
}

export function installMouth(model: Object3D) {
  let candidate: SkinnedMesh | undefined;
  model.traverse((object) => {
    if (object instanceof SkinnedMesh && !Array.isArray(object.material) && object.material.name === 'Head') candidate = object;
  });
  const face = candidate;
  if (!face) throw new Error('Concierge face is missing');
  const original = face.geometry;
  const headIndex = face.skeleton.bones.findIndex((bone) => /^Head(?:_\d+)?$/.test(bone.name));
  if (headIndex < 0) throw new Error('Concierge head bone is missing');
  face.geometry = splitLips(original);
  const position = face.geometry.getAttribute('position');
  const base = new Float32Array(position.array);
  const affected: number[] = [];
  for (let i = 0; i < position.count; i++) {
    const x = base[i * 3], y = base[i * 3 + 1], z = base[i * 3 + 2];
    if (Math.abs(x) < 0.065 && y > MOUTH_Y - 0.043 && y < 1.606 && z > 0.040) affected.push(i);
  }
  const skin = (geometry: BufferGeometry, material: MeshBasicMaterial, name: string) => {
    const count = geometry.attributes.position.count;
    const indices = new Uint16Array(count * 4), weights = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) { indices[i * 4] = headIndex; weights[i * 4] = 1; }
    geometry.setAttribute('skinIndex', new Uint16BufferAttribute(indices, 4));
    geometry.setAttribute('skinWeight', new Float32BufferAttribute(weights, 4));
    const mesh = new SkinnedMesh(geometry, material);
    mesh.name = name;
    mesh.bind(face.skeleton, face.bindMatrix);
    mesh.frustumCulled = false;
    face.parent?.add(mesh);
    return mesh;
  };
  const cavityGeometry = new SphereGeometry(1, 32, 20);
  cavityGeometry.scale(0.027, 0.021, 0.016).translate(0, MOUTH_Y - 0.006, 0.063);
  const cavity = skin(cavityGeometry, new MeshBasicMaterial({ color: 0x34171c }), 'Mouth_Cavity');
  const vertices: number[] = [], colors: number[] = [], indices: number[] = [];
  for (let j = 0; j <= 24; j++) {
    const x = (j / 24 * 2 - 1) * 0.018, q = Math.abs(x / 0.018), z = 0.083 - 0.008 * q * q;
    vertices.push(x, MOUTH_Y + 0.0016 + 0.0017 * q * q, z, x, MOUTH_Y - 0.0025 + 0.0032 * q * q, z);
    const color = new Color().setRGB(0.78 - 0.25 * q * q, 0.71 - 0.25 * q * q, 0.64 - 0.24 * q * q);
    colors.push(color.r, color.g, color.b, color.r * 0.95, color.g * 0.95, color.b * 0.95);
    if (j < 24) { const k = j * 2; indices.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  }
  const teethGeometry = new BufferGeometry();
  teethGeometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  teethGeometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  teethGeometry.setIndex(indices);
  teethGeometry.computeVertexNormals();
  const teeth = skin(teethGeometry, new MeshBasicMaterial({ vertexColors: true }), 'Upper_Teeth');

  return {
    set(open: number, smile = 0) {
      const value = MathUtils.clamp(open, 0, 1), smileValue = MathUtils.clamp(smile, 0, 1);
      for (const i of affected) {
        const x = base[i * 3], y = base[i * 3 + 1], z = base[i * 3 + 2], dy = y - lipLine(x);
        const side = Math.max(0, 1 - (x / 0.029) ** 2) ** 1.5;
        const front = MathUtils.smoothstep(z, 0.05, 0.078);
        const jaw = Math.exp(-((dy / (dy < 0 ? 0.024 : 0.007)) ** 2));
        const corner = Math.exp(-(((Math.abs(x) - 0.023) / 0.014) ** 2) - (dy / 0.017) ** 2) * front;
        const cheeks = Math.exp(-(((Math.abs(x) - 0.033) / 0.020) ** 2) - ((y - 1.558) / 0.020) ** 2) * front;
        const eyes = Math.exp(-(((Math.abs(x) - 0.034) / 0.016) ** 2) - ((y - 1.578) / 0.007) ** 2) * front;
        position.setXYZ(i,
          x * (1 - 0.055 * value * side * jaw * front) + Math.sign(x) * 0.0021 * smileValue * corner,
          y + value * side * jaw * front * (dy < 0 ? -0.010 : 0.0014)
            + smileValue * (0.0041 * corner + 0.0012 * cheeks - (y - 1.578) * 0.09 * eyes),
          z + value * side * jaw * front * 0.0007 + smileValue * 0.00065 * cheeks,
        );
      }
      position.needsUpdate = true;
      cavity.visible = value > 0.015;
      teeth.visible = value > 0.12;
    },
    dispose() {
      face.geometry.dispose();
      face.geometry = original;
      for (const mesh of [cavity, teeth]) {
        mesh.removeFromParent(); mesh.geometry.dispose(); mesh.material.dispose();
      }
    },
  };
}
