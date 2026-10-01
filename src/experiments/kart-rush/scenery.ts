import * as T from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { COLORS as C, LENGTH, position, sample, sectionAt } from "./track";
import { box, ellipsoid, jelly, material, turtle, whale } from "./models";
const vector = (p: { x: number; y: number; z: number }) =>
  new T.Vector3(p.x, p.y, p.z);
export function buildScenery(scene: T.Scene) {
  const root = new T.Group();
  scene.add(root);
  const dummy = new T.Object3D();
  const sand = new T.Mesh(new T.PlaneGeometry(1800, 1800), material(C.sand));
  sand.rotation.x = -Math.PI / 2;
  sand.position.y = -15;
  root.add(sand);
  const rocks = new T.InstancedMesh(
    new T.IcosahedronGeometry(1, 0),
    material(C.rock),
    260,
  );
  root.add(rocks);
  const coral = new T.InstancedMesh(
    mergeGeometries([
      new T.CylinderGeometry(0.13, 0.22, 1, 5),
      new T.CylinderGeometry(0.05, 0.12, 0.65, 5)
        .rotateZ(0.65)
        .translate(-0.22, 0.2, 0),
      new T.CylinderGeometry(0.05, 0.12, 0.65, 5)
        .rotateZ(-0.65)
        .translate(0.22, 0.2, 0),
      new T.CylinderGeometry(0.05, 0.1, 0.55, 5)
        .rotateX(0.6)
        .translate(0, 0.2, 0.18),
    ]),
    material(C.pink),
    420,
  );
  root.add(coral);
  const plantColors = [C.pink, C.green, C.purple, C.gold];
  for (let i = 0; i < 260; i++) {
    const s = (i / 260) * LENGTH,
      lane = (i % 2 ? 1 : -1) * (19 + ((i * 17) % 57)),
      p = position(s, lane);
    dummy.position.set(p.x, -13 + (i % 3), p.z);
    dummy.rotation.set(i, 0.4 * i, 0.15 * i);
    dummy.scale.set(3 + (i % 8), 3 + (i % 5), 3 + (i % 6));
    dummy.updateMatrix();
    rocks.setMatrixAt(i, dummy.matrix);
  }
  for (let i = 0; i < 420; i++) {
    const s = (i / 420) * LENGTH,
      lane = (i % 2 ? 1 : -1) * (15 + ((i * 7) % 28)),
      p = position(s, lane);
    const height = 3 + ((i * 13) % 9);
    dummy.position.set(p.x, -14 + height / 2, p.z);
    dummy.rotation.set(0.12 * Math.sin(i), i, 0.16 * Math.cos(i));
    dummy.scale.set(0.8 + (i % 3) * 0.4, height, 0.8);
    dummy.updateMatrix();
    coral.setMatrixAt(i, dummy.matrix);
    coral.setColorAt(i, new T.Color(plantColors[sectionAt(s) % 4]));
  }
  const fishCount = 240;
  const fish = new T.InstancedMesh(
    new T.SphereGeometry(1, 8, 5).scale(0.4, 0.55, 1.4),
    material(C.gold),
    fishCount,
  );

  root.add(fish);
  const turtles = Array.from({ length: 5 }, (_, i) => {
    const model = turtle();
    const p = position(LENGTH * (0.18 + i * 0.024), i % 2 ? 22 : -22);
    model.root.position.set(p.x, p.y + 13 + i * 2, p.z);
    model.root.rotation.y = i * 0.9;
    root.add(model.root);
    return { ...model, base: model.root.position.clone() };
  });
  const jellies = Array.from({ length: 11 }, (_, i) => {
    const model = jelly();
    const p = position(LENGTH * (0.5 + i * 0.01), i % 2 ? 18 : -21);
    model.root.position.set(p.x, 10 + (i % 4) * 4, p.z);
    root.add(model.root);
    return { ...model, base: model.root.position.y };
  });
  const giant = whale(),
    whaleBase = position(LENGTH * 0.74, -10);
  giant.root.position.set(whaleBase.x, 24, whaleBase.z);
  const wt = sample(LENGTH * 0.74);
  giant.root.rotation.y = Math.atan2(wt.tx, wt.tz) + Math.PI / 2;
  root.add(giant.root);
  const ship = new T.Group(),
    sp = position(LENGTH * 0.4, -36);
  ship.position.set(sp.x, 1, sp.z);
  const wreckReef = ellipsoid(
    root,
    material(C.rock),
    [12, 8, 32],
    [sp.x, -12, sp.z],
    8,
  );
  wreckReef.rotation.y = 1.1;
  ship.rotation.set(0.05, 1.1, 0.2);
  root.add(ship);
  const rust = material(C.rust),
    wood = material(C.dark);
  ellipsoid(ship, rust, [9, 6, 30], [0, 0, 0]);
  box(ship, wood, [15, 1, 45], [0, 4, 0]);
  box(ship, rust, [9, 9, 11], [0, 8, -9]);
  for (let i = 0; i < 7; i++)
    for (const side of [-1, 1])
      ellipsoid(
        ship,
        material(C.cyan, true),
        [0.1, 0.6, 0.6],
        [side * 8, 1.5, -18 + i * 6],
      );
  box(ship, wood, [0.6, 28, 0.6], [0, 15, 4]);
  box(ship, wood, [21, 0.5, 0.6], [0, 23, 4]);
  // Rock ribs and a violet-lit backdrop give the jellyfish zone a cave silhouette.
  for (let i = 0; i < 9; i++) {
    const p = position(LENGTH * (0.505 + i * 0.012), i % 2 ? -28 : 28);
    const rock = ellipsoid(
      root,
      material(C.deep),
      [13, 25, 13],
      [p.x, 0, p.z],
      6,
    );
    rock.rotation.z = i * 0.1;
  }
  const dustPositions = new Float32Array(1200 * 3);
  for (let i = 0; i < 1200; i++) {
    dustPositions[i * 3] = Math.sin(i * 127.1) * 340;
    dustPositions[i * 3 + 1] = -8 + ((i * 13.7) % 58);
    dustPositions[i * 3 + 2] = Math.cos(i * 93.3) * 310;
  }
  const dust = new T.Points(
    new T.BufferGeometry().setAttribute(
      "position",
      new T.BufferAttribute(dustPositions, 3),
    ),
    new T.PointsMaterial({
      color: C.white,
      size: 0.16,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
    }),
  );
  root.add(dust);
  const caustics = new T.Mesh(
    new T.PlaneGeometry(1400, 1400),
    new T.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { time: { value: 0 }, tint: { value: new T.Color(C.cyan) } },
      vertexShader:
        "varying vec2 p; void main(){p=uv*500.;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
      fragmentShader:
        "varying vec2 p;uniform float time;uniform vec3 tint;void main(){float w=sin(p.x+sin(p.y+time*.3))*sin(p.y*.83+cos(p.x-time*.21));gl_FragColor=vec4(tint,pow(1.-abs(w),24.)*.12);}",
    }),
  );
  caustics.rotation.x = -Math.PI / 2;
  caustics.position.y = -14.9;
  root.add(caustics);
  return {
    update(time: number, light: boolean) {
      caustics.visible = !light;
      caustics.material.uniforms.time.value = time;
      fish.count = light ? 100 : fishCount;
      for (let i = 0; i < fish.count; i++) {
        const s =
            ((i % 8) / 8) * LENGTH +
            Math.sin(time * 0.07 + i) * 20 +
            (Math.floor(i / 8) % 10) * 2,
          p = position(
            s,
            (i % 2 ? 1 : -1) * (19 + (Math.floor(i / 8) % 6) * 2),
          );
        dummy.position.set(
          p.x + Math.sin(time + i) * 1.4,
          10 + (Math.floor(i / 8) % 7) * 1.3,
          p.z,
        );
        const tangent = sample(s);
        dummy.rotation.set(
          0,
          Math.atan2(tangent.tx, tangent.tz) + Math.sin(time + i) * 0.1,
          0,
        );
        dummy.scale.setScalar(0.5 + (i % 4) * 0.14);
        dummy.updateMatrix();
        fish.setMatrixAt(i, dummy.matrix);
      }
      fish.instanceMatrix.needsUpdate = true;
      turtles.forEach((t, i) => {
        t.root.position
          .copy(t.base)
          .add(
            new T.Vector3(
              Math.sin(time * 0.16 + i) * 5,
              Math.sin(time * 0.5 + i) * 0.6,
              Math.cos(time * 0.16 + i) * 5,
            ),
          );
        t.fins.forEach(
          (fin, j) =>
            (fin.rotation.z = Math.sin(time * 1.5 + i) * 0.3 * (j ? 1 : -1)),
        );
      });
      jellies.forEach((j, i) => {
        j.root.position.y = j.base + Math.sin(time * 0.8 + i) * 1.2;
        j.root.scale.setScalar(1 + Math.sin(time * 1.3 + i) * 0.07);
      });
      giant.root.position
        .copy(vector(whaleBase))
        .add(
          new T.Vector3(
            Math.sin(time * 0.06) * 24,
            24 + Math.sin(time * 0.25),
            Math.cos(time * 0.06) * 12,
          ),
        );
      giant.tail.rotation.z = Math.sin(time * 0.7) * 0.12;
    },
  };
}
