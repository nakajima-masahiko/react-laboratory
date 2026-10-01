import * as T from "three";
import { Race, STEP, PICKUPS, type Input } from "./engine";
import {
  COLORS as C,
  CAR_COLORS,
  WATER_COLORS,
  sectionAt,
  LENGTH,
  ROAD_HALF,
  wrap,
  position,
  sample,
} from "./track";
import { kart, material } from "./models";
import { buildScenery } from "./scenery";
export type SceneOptions = { light: boolean; reducedMotion: boolean };
function ribbon(left: number, right: number, height: number, mat: T.Material) {
  const vertices: number[] = [],
    indices: number[] = [];
  const segments = 900;
  for (let i = 0; i <= segments; i++)
    for (const lane of [left, right]) {
      const p = position((i / segments) * LENGTH, lane);
      vertices.push(p.x, p.y + height, p.z);
    }
  for (let i = 0; i < segments; i++) {
    const a = i * 2;
    indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
  }
  const geo = new T.BufferGeometry();
  geo.setAttribute("position", new T.Float32BufferAttribute(vertices, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return new T.Mesh(geo, mat);
}
function buildTrack(scene: T.Scene) {
  scene.add(ribbon(-ROAD_HALF, ROAD_HALF, 0, material(C.road)));
  scene.add(
    ribbon(-ROAD_HALF - 0.7, -ROAD_HALF, 0.04, material(C.metal)),
    ribbon(ROAD_HALF, ROAD_HALF + 0.7, 0.04, material(C.metal)),
  );
  for (const side of [-1, 1]) {
    scene.add(
      ribbon(
        side * 8.1 - 0.09,
        side * 8.1 + 0.09,
        0.055,
        material(C.cyan, true),
      ),
    );
    const railPoints = Array.from({ length: 901 }, (_, i) => {
      const p = position((i / 900) * LENGTH, side * 8.6);
      return new T.Vector3(p.x, p.y + 0.6, p.z);
    });
    scene.add(
      new T.Mesh(
        new T.TubeGeometry(
          new T.CatmullRomCurve3(railPoints),
          900,
          0.12,
          5,
          true,
        ),
        material(C.metal),
      ),
    );
  }
  const dummy = new T.Object3D();
  const marks = new T.InstancedMesh(
    new T.BoxGeometry(0.12, 0.025, 3),
    material(C.seam),
    Math.floor(LENGTH / 8) * 2,
  );
  scene.add(marks);
  for (let i = 0; i < marks.count; i++) {
    const s = Math.floor(i / 2) * 8,
      p = position(s, i % 2 ? -2.8 : 2.8),
      t = sample(s);
    dummy.position.set(p.x, p.y + 0.02, p.z);
    dummy.rotation.set(0, Math.atan2(t.tx, t.tz), 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    marks.setMatrixAt(i, dummy.matrix);
  }
  const archCount = Math.floor(LENGTH / 25),
    archSegments = 24;
  const archVertices: number[] = [],
    glassVertices: number[] = [],
    glassIndices: number[] = [];
  for (let i = 0; i <= archCount; i++) {
    const s = (i / archCount) * LENGTH,
      p = sample(s);
    for (let j = 0; j <= archSegments; j++) {
      const a = (j / archSegments) * Math.PI,
        lane = Math.cos(a) * 11.7;
      const x = p.x + p.nx * lane,
        y = p.y + Math.sin(a) * 11.7 + 0.1,
        z = p.z + p.nz * lane;
      glassVertices.push(x, y, z);
      if (j < archSegments) {
        const b = ((j + 1) / archSegments) * Math.PI;
        archVertices.push(
          x,
          y,
          z,
          p.x + p.nx * Math.cos(b) * 11.7,
          p.y + Math.sin(b) * 11.7 + 0.1,
          p.z + p.nz * Math.cos(b) * 11.7,
        );
      }
      if (i < archCount && j < archSegments) {
        const v = i * (archSegments + 1) + j;
        glassIndices.push(
          v,
          v + 1,
          v + archSegments + 1,
          v + 1,
          v + archSegments + 2,
          v + archSegments + 1,
        );
      }
    }
  }
  const archGeometry = new T.BufferGeometry().setAttribute(
    "position",
    new T.Float32BufferAttribute(archVertices, 3),
  );
  scene.add(
    new T.LineSegments(
      archGeometry,
      new T.LineBasicMaterial({
        color: C.glass,
        transparent: true,
        opacity: 0.42,
      }),
    ),
  );
  const glass = new T.BufferGeometry();
  glass.setAttribute(
    "position",
    new T.Float32BufferAttribute(glassVertices, 3),
  );
  glass.setIndex(glassIndices);
  glass.computeVertexNormals();
  scene.add(
    new T.Mesh(
      glass,
      new T.MeshBasicMaterial({
        color: C.glass,
        transparent: true,
        opacity: 0.025,
        side: T.DoubleSide,
        depthWrite: false,
      }),
    ),
  );
  // Alternating finish tiles, with no external image or font fetches.
  for (let i = 0; i < 16; i++)
    for (let row = 0; row < 2; row++) {
      const p = position(row * 1.05, (i - 7.5) * 1.05),
        t = sample(0);
      const tile = new T.Mesh(
        new T.BoxGeometry(1.04, 0.03, 1.04),
        material((i + row) % 2 ? C.white : C.dark),
      );
      tile.position.set(p.x, p.y + 0.04, p.z);
      tile.rotation.y = Math.atan2(t.tx, t.tz);
      scene.add(tile);
    }
  const boxes: T.Mesh[] = [];
  const geo = new T.OctahedronGeometry(0.85, 0),
    mat = material(C.gold, true);
  for (const s of PICKUPS)
    for (const lane of [-5, 0, 5]) {
      const p = position(s, lane);
      const mesh = new T.Mesh(geo, mat);
      mesh.position.set(p.x, p.y + 1.7, p.z);
      scene.add(mesh);
      boxes.push(mesh);
    }
  return boxes;
}
export function mountRace(
  host: HTMLDivElement,
  race: Race,
  input: Input,
  options: SceneOptions,
  notify: (fps: number) => void,
  failed: (message: string) => void,
) {
  const renderer = new T.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(C.water);
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  renderer.domElement.setAttribute("aria-label", "海中トンネルを走る3Dレース");
  renderer.domElement.setAttribute("role", "img");
  host.appendChild(renderer.domElement);
  const scene = new T.Scene();
  scene.background = new T.Color(C.haze);
  scene.fog = new T.FogExp2(C.haze, 0.0048);
  const camera = new T.PerspectiveCamera(65, 1, 0.1, 360);
  scene.add(new T.HemisphereLight(C.white, C.sand, 2.5));
  const sun = new T.DirectionalLight(C.blue, 3.2);
  sun.position.set(60, 120, 30);
  scene.add(sun);
  const fill = new T.DirectionalLight(C.gold, 1);
  fill.position.set(-40, 30, -60);
  scene.add(fill);
  const items = buildTrack(scene),
    scenery = buildScenery(scene),
    cars = CAR_COLORS.map((color) => {
      const model = kart(color);
      scene.add(model.root);
      return model;
    });
  const pulseMaterial = material(C.cyan, true),
    pulseGeometry = new T.SphereGeometry(0.7, 10, 6),
    pulseMeshes: T.Mesh[] = [];
  for (let i = 0; i < 12; i++) {
    const mesh = new T.Mesh(pulseGeometry, pulseMaterial);
    mesh.visible = false;
    scene.add(mesh);
    pulseMeshes.push(mesh);
  }
  const shadow = new T.Mesh(
    new T.CircleGeometry(1, 24),
    new T.MeshBasicMaterial({
      color: C.deep,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.scale.set(8, 18, 1);
  scene.add(shadow);
  let running = true,
    raf = 0,
    last = performance.now(),
    accumulator = 0,
    visual = 0,
    lastNotify = 0,
    frames = 0,
    fps = 60,
    lastQuality = options.light;
  const resize = () => {
    const r = host.getBoundingClientRect();
    renderer.setPixelRatio(
      Math.min(devicePixelRatio, options.light ? 1 : 1.65),
    );
    renderer.setSize(Math.max(1, r.width), Math.max(1, r.height));
    camera.aspect = r.width / Math.max(r.height, 1);
    camera.updateProjectionMatrix();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  const cameraPosition = new T.Vector3(),
    lookAt = new T.Vector3();
  let initialized = false;
  const onLost = (e: Event) => {
    e.preventDefault();
    running = false;
    race.pause();
    failed("3D描画が中断されました。軽量表示で再試行できます。");
  };
  renderer.domElement.addEventListener("webglcontextlost", onLost);
  function frame(now: number) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    accumulator += dt;
    while (accumulator >= STEP) {
      race.step(STEP, input);
      input.use = false;
      accumulator -= STEP;
    }
    if (race.phase !== "paused") visual += dt;
    const player = race.cars[0];
    const water = new T.Color(WATER_COLORS[sectionAt(player.s)]);
    (scene.background as T.Color).lerp(water, Math.min(1, dt * 0.5));
    scene.fog!.color.copy(scene.background as T.Color);
    cars.forEach((model, i) => {
      const car = race.cars[i],
        p = position(car.s, car.lane),
        t = sample(car.s);
      const behindPlayer = wrap(player.s - car.s + LENGTH / 2) - LENGTH / 2;
      model.root.visible = i === 0 || behindPlayer < 4 || behindPlayer > 20;
      model.root.position.set(p.x, p.y + 0.03, p.z);
      model.root.rotation.set(
        0,
        Math.atan2(t.tx, t.tz) + car.heading,
        car.drift > 0 ? -car.heading * 0.16 : 0,
      );
      model.jets.visible = car.boost > 0;
      model.jets.scale.z = 1 + Math.sin(visual * 40) * 0.18;
      model.bubble.visible = car.shield > 0;
    });
    const p = position(player.s, player.lane),
      behind = position(
        player.s - (race.phase === "ready" ? 13 : 10),
        player.lane * 0.6,
      ),
      ahead = position(player.s + 16, player.lane * 0.3);
    const targetPosition = new T.Vector3(
      behind.x,
      behind.y + (race.phase === "ready" ? 6 : 5),
      behind.z,
    );
    const targetLook = new T.Vector3(ahead.x, ahead.y + 1.1, ahead.z);
    if (!initialized) {
      cameraPosition.copy(targetPosition);
      lookAt.copy(targetLook);
      initialized = true;
    }
    cameraPosition.lerp(targetPosition, 1 - Math.exp(-dt * 7));
    lookAt.lerp(targetLook, 1 - Math.exp(-dt * 9));
    camera.position.copy(cameraPosition);
    camera.lookAt(lookAt);
    const targetFov = 65 + (player.boost > 0 && !options.reducedMotion ? 9 : 0);
    camera.fov += (targetFov - camera.fov) * Math.min(1, dt * 4);
    camera.updateProjectionMatrix();
    scenery.update(visual, options.light);
    items.forEach((box, i) => {
      box.rotation.y = visual * 0.8 + i;
      box.rotation.z = Math.sin(visual + i) * 0.15;
    });
    pulseMeshes.forEach((mesh, i) => {
      const pulse = race.pulses[i];
      mesh.visible = !!pulse;
      if (pulse) {
        const q = position(pulse.s, pulse.lane);
        mesh.position.set(q.x, q.y + 1, q.z);
      }
    });
    const shadowP = position(LENGTH * 0.74 + Math.sin(visual * 0.06) * 24),
      shadowT = sample(LENGTH * 0.74);
    shadow.position.set(shadowP.x, shadowP.y + 0.08, shadowP.z);
    shadow.rotation.z = -Math.atan2(shadowT.tx, shadowT.tz);
    if (options.light !== lastQuality) {
      resize();
      lastQuality = options.light;
    }
    renderer.render(scene, camera);
    frames++;
    if (now - lastNotify > 100) {
      fps = Math.round((frames * 1000) / Math.max(1, now - lastNotify));
      frames = 0;
      lastNotify = now;
      notify(fps);
    }
    // Keep the camera target finite even before the first countdown.
    if (!Number.isFinite(p.x)) {
      running = false;
      failed("コースを読み込めませんでした。再試行してください。");
    }
  }
  raf = requestAnimationFrame(frame);
  return () => {
    running = false;
    cancelAnimationFrame(raf);
    observer.disconnect();
    renderer.domElement.removeEventListener("webglcontextlost", onLost);
    const geometries = new Set<T.BufferGeometry>(),
      materials = new Set<T.Material>();
    scene.traverse((o) => {
      if (o instanceof T.Mesh || o instanceof T.Line || o instanceof T.Points) {
        geometries.add(o.geometry);
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => materials.add(m));
      }
    });
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  };
}
