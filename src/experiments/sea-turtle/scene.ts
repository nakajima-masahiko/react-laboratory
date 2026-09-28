import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createTurtle, ocean } from './model';

export type ViewMode = 'free' | 'follow' | 'close';
export type TurtleCommands = { mode: ViewMode; part: string; breathe: boolean; paused: boolean; light: boolean };

export function mountOcean(host: HTMLDivElement, commands: TurtleCommands, select: (part: string) => void, ready: () => void) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  host.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label', 'アオウミガメの3D海中観察');
  const scene = new THREE.Scene(); scene.background = new THREE.Color(ocean.water);
  scene.fog = new THREE.FogExp2(ocean.haze, .028);
  const camera = new THREE.PerspectiveCamera(45, 1, .1, 100);
  camera.position.set(5, 3, -7);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.minDistance = 1.4; controls.maxDistance = 22;
  controls.maxPolarAngle = Math.PI * .92; controls.enablePan = false;
  scene.add(new THREE.HemisphereLight(ocean.light, ocean.grass, 2.3));
  const sun = new THREE.DirectionalLight(ocean.light, 3.5); sun.position.set(-8, 15, -4); scene.add(sun);
  const turtle = createTurtle(); scene.add(turtle.root);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(130, 130), new THREE.MeshStandardMaterial({ color: ocean.sand, roughness: 1 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -4; scene.add(floor);
  const surface = new THREE.Mesh(new THREE.PlaneGeometry(130, 130), new THREE.MeshBasicMaterial({ color: ocean.light, transparent: true, opacity: .12, side: THREE.DoubleSide }));
  surface.rotation.x = Math.PI / 2; surface.position.y = 6; scene.add(surface);
  const grasses: THREE.Mesh[] = [];
  for (let i = 0; i < 70; i++) {
    const blade = new THREE.Mesh(new THREE.ConeGeometry(.14, 1 + (i % 5) * .22, 4), new THREE.MeshStandardMaterial({ color: ocean.grass, roughness: 1 }));
    blade.position.set(Math.sin(i * 13.7) * 16, -3.4, Math.cos(i * 5.8) * 16); scene.add(blade); grasses.push(blade);
  }
  for (let i = 0; i < 15; i++) {
    const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshStandardMaterial({ color: ocean.grass, roughness: 1 }));
    rock.position.set(Math.sin(i * 3.7) * 19, -3.9, Math.cos(i * 8.3) * 19);
    rock.scale.set(1 + i % 3, .5 + i % 2, .8); scene.add(rock);
  }
  const particleGeometry = new THREE.BufferGeometry();
  const coords = new Float32Array(450 * 3);
  for (let i = 0; i < coords.length; i++) coords[i] = Math.sin(i * 127.1) * (i % 3 === 1 ? 5 : 24);
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(coords, 3));
  const particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({ color: ocean.light, size: .035, transparent: true, opacity: .4 })); scene.add(particles);
  const fish = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshStandardMaterial({ color: ocean.light, metalness: .35, roughness: .5 }), 32);
  scene.add(fish); const dummy = new THREE.Object3D();
  const caustics = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, uniforms: { time: { value: 0 }, tint: { value: new THREE.Color(ocean.light) } },
    vertexShader: 'varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: 'varying vec2 vUv; uniform float time; uniform vec3 tint; void main(){vec2 p=vUv*110.; float a=sin(p.x+sin(p.y+time*.3))*sin(p.y*.9+cos(p.x-time*.25)); float c=pow(1.-abs(a),18.); gl_FragColor=vec4(tint,c*.22);}',
  })); caustics.rotation.x = -Math.PI / 2; caustics.position.y = -3.98; scene.add(caustics);
  const resize = new ResizeObserver(() => {
    const { width, height } = host.getBoundingClientRect();
    renderer.setSize(width, height); camera.aspect = width / Math.max(height, 1); camera.updateProjectionMatrix();
  }); resize.observe(host);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const ray = new THREE.Raycaster(); const pointer = new THREE.Vector2();
  let down = [0, 0], lastInput = performance.now();
  const onDown = (e: PointerEvent) => { down = [e.clientX, e.clientY]; lastInput = performance.now(); };
  const onUp = (e: PointerEvent) => {
    if (Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return;
    const box = renderer.domElement.getBoundingClientRect();
    pointer.set((e.clientX - box.left) / box.width * 2 - 1, -(e.clientY - box.top) / box.height * 2 + 1);
    ray.setFromCamera(pointer, camera);
    const hit = ray.intersectObject(turtle.root, true)[0];
    if (hit) select(String(hit.object.userData.part || '甲羅'));
  };
  renderer.domElement.addEventListener('pointerdown', onDown); renderer.domElement.addEventListener('pointerup', onUp);
  const center = new THREE.Vector3(), desired = new THREE.Vector3(), offset = new THREE.Vector3();
  let frame = 0, last = performance.now(), elapsed = 0, breathTime = 0, disposed = false;
  const animate = (now: number) => {
    if (disposed) return;
    const dt = Math.min((now - last) / 1000, .05); last = now;
    if (!commands.paused && !document.hidden) elapsed += dt * (motion.matches ? .35 : 1);
    if (commands.breathe && !commands.paused) breathTime += dt;
    else if (!commands.breathe) breathTime = 0;
    if (breathTime >= 24) { commands.breathe = false; breathTime = 0; }
    const ascent = breathTime ? Math.sin(Math.PI * Math.min(breathTime / 24, 1)) ** 2 * 5.55 : 0;
    const angle = elapsed * .065;
    turtle.root.position.set(Math.sin(angle) * 3, Math.sin(elapsed * .4) * .12 + ascent, Math.cos(angle) * 2 - 2);
    turtle.root.rotation.set(-Math.cos(breathTime / 24 * Math.PI) * (breathTime ? .18 : 0), -angle - Math.PI / 2, Math.sin(elapsed * .35) * .025);
    turtle.fins.forEach((fin, i) => { fin.rotation.z = Math.sin(elapsed * 1.5) * .38 * (i === 0 ? 1 : -1); });
    turtle.head.rotation.y = Math.sin(elapsed * .5) * .08;
    grasses.forEach((grass, i) => { grass.rotation.z = Math.sin(elapsed * .6 + i) * .13; });
    particles.rotation.y = elapsed * .006;
    for (let i = 0; i < 32; i++) {
      dummy.position.set(Math.sin(elapsed * .06 + i * .15) * 13, 1.2 + Math.sin(i * 4.1) * 1.5, Math.cos(elapsed * .06 + i * .15) * 13);
      dummy.rotation.y = elapsed * .06 + i * .15; dummy.scale.set(.08, .13, .35); dummy.updateMatrix(); fish.setMatrixAt(i, dummy.matrix);
    } fish.instanceMatrix.needsUpdate = true;
    caustics.material.uniforms.time.value = elapsed; caustics.visible = !commands.light;
    particles.visible = !commands.light;
    center.copy(turtle.root.position);
    if (commands.mode === 'close') {
      offset.set(0, commands.part === '腹甲' ? -.3 : .15, ['頭部', '眼', '鼻孔'].includes(commands.part) ? -2 : 0).applyQuaternion(turtle.root.quaternion);
      center.add(offset);
    }
    controls.target.lerp(center, 1 - Math.exp(-dt * 5));
    if (commands.mode !== 'free') {
      offset.set(commands.mode === 'follow' ? 4 : 2.5, commands.part === '腹甲' && commands.mode === 'close' ? -2 : 1.5, commands.mode === 'follow' ? 6 : -2).applyQuaternion(turtle.root.quaternion);
      desired.copy(center).add(offset); camera.position.lerp(desired, 1 - Math.exp(-dt * (motion.matches ? 1 : 2)));
    }
    controls.enabled = commands.mode === 'free';
    controls.autoRotate = commands.mode === 'free' && !motion.matches && !commands.paused && now - lastInput > 18000;
    controls.autoRotateSpeed = .3; controls.update();
    renderer.render(scene, camera); frame = requestAnimationFrame(animate);
  };
  frame = requestAnimationFrame(animate); ready();
  return () => {
    disposed = true; cancelAnimationFrame(frame); resize.disconnect(); controls.dispose();
    renderer.domElement.removeEventListener('pointerdown', onDown); renderer.domElement.removeEventListener('pointerup', onUp);
    const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>(), textures = new Set<THREE.Texture>();
    scene.traverse(object => { if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
      geometries.add(object.geometry); (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => { materials.add(material); Object.values(material).forEach(value => { if (value instanceof THREE.Texture) textures.add(value); }); });
    } });
    geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose());
    renderer.dispose(); renderer.domElement.remove();
  };
}
