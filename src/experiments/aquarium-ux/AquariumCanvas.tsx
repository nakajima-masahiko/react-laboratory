import { Application, useApplication } from '@pixi/react';
import { Container, Graphics, Sprite, type RenderTexture, type Texture, type Ticker } from 'pixi.js';
import { useEffect, useMemo, useRef } from 'react';

interface Props { depth: number; reducedMotion: boolean; onDiscover: () => void }
interface Pointer { x: number; y: number; active: boolean; age: number }
interface Fish { x: number; y: number; vx: number; vy: number; speed: number; phase: number; fear: number; sprite: Sprite }
interface Scene { container: Container; update: (dt: number, time: number, width: number, height: number, pointer: Pointer) => void }

const makeFishTexture = (app: ReturnType<typeof useApplication>['app']) => {
  const g = new Graphics();
  g.ellipse(1, 0, 23, 7.5).fill({ color: 0xd1e9e4, alpha: 0.88 });
  g.poly([-20, 0, -33, -10, -31, 8]).fill({ color: 0xa9cfca, alpha: 0.7 });
  g.ellipse(12, -1.8, 1.2, 1.2).fill({ color: 0x09202b, alpha: 0.72 });
  const texture = app.renderer.generateTexture(g); g.destroy(); return texture;
};

const makeDotTexture = (app: ReturnType<typeof useApplication>['app']) => {
  const g = new Graphics(); g.circle(4, 4, 3.2).fill({ color: 0xe2ffff, alpha: 0.9 });
  const texture = app.renderer.generateTexture(g); g.destroy(); return texture;
};

const simpleDrifters = (container: Container, texture: Texture, count: number, width: number, height: number, fish = false) => {
  const items = Array.from({ length: count }, (_, index) => {
    const view = new Sprite(texture); view.anchor.set(0.5); view.alpha = 0.08 + Math.random() * 0.3;
    view.scale.set(fish ? 0.18 + Math.random() * 0.28 : 0.15 + Math.random() * 0.55);
    if (fish) view.tint = 0xa9cfca;
    container.addChild(view);
    return { view, x: Math.random() * width, y: Math.random() * height, speed: (fish ? 8 : 2) + Math.random() * (fish ? 16 : 8), phase: index * 0.71 + Math.random() };
  });
  return (dt: number, time: number, currentWidth: number, currentHeight: number) => {
    items.forEach((item) => {
      item.x += (fish ? 1 : Math.sin(time * 0.16 + item.phase) * 0.18) * item.speed * dt;
      item.y -= (fish ? Math.sin(time * 0.2 + item.phase) * 0.1 : 1) * item.speed * dt;
      if (item.x > currentWidth + 50) item.x = -50;
      if (item.y < -10) { item.y = currentHeight + 10; item.x = Math.random() * currentWidth; }
      item.view.position.set(item.x, item.y);
    });
  };
};

const surfaceScene = (fishTexture: Texture, dotTexture: Texture, width: number, height: number, reduced: boolean): Scene => {
  const container = new Container();
  const rays = new Container(); rays.blendMode = 'add';
  for (let i = 0; i < 8; i += 1) {
    const x = width / 7 * i - width * 0.15;
    const ray = new Graphics().poly([x, -30, x + width * 0.06, -30, x + width * 0.18, height * 0.8, x + width * 0.1, height * 0.8]).fill({ color: 0xa4e7df, alpha: 0.045 });
    rays.addChild(ray);
  }
  container.addChild(rays);
  const updateBubbles = simpleDrifters(container, dotTexture, reduced ? 16 : 58, width, height);
  const updateFish = simpleDrifters(container, fishTexture, reduced ? 5 : 12, width, height, true);
  return { container, update(dt, time, w, h) { rays.x = reduced ? 0 : Math.sin(time * 0.11) * w * 0.04; updateBubbles(dt, time, w, h); updateFish(dt, time, w, h); } };
};

const reefScene = (fishTexture: Texture, dotTexture: Texture, width: number, height: number, reduced: boolean): Scene => {
  const container = new Container();
  const back = new Container(); const mid = new Container(); const front = new Container();
  back.alpha = 0.42; mid.alpha = 0.72; front.alpha = 0.92;
  const coral = new Graphics();
  coral.ellipse(width * 0.12, height * 1.02, width * 0.28, height * 0.2).fill({ color: 0x092328, alpha: 0.86 });
  coral.ellipse(width * 0.76, height * 1.01, width * 0.38, height * 0.22).fill({ color: 0x071e24, alpha: 0.92 });
  for (let i = 0; i < 14; i += 1) { const x = width * (0.04 + i * 0.071); coral.moveTo(x, height).bezierCurveTo(x - 14, height * 0.82, x + 12, height * 0.77, x + (i % 2 ? 8 : -7), height * 0.73).stroke({ color: 0x18443f, width: 3 + i % 4, alpha: 0.42 }); }
  container.addChild(back, mid, coral, front);
  const layers = [back, mid, front];
  const count = reduced ? 20 : innerWidth < 720 ? 30 : 46;
  const school: Fish[] = Array.from({ length: count }, (_, index) => {
    const layer = index % 3; const sprite = new Sprite(fishTexture); sprite.anchor.set(0.5); sprite.scale.set([0.3, 0.46, 0.63][layer] * (0.8 + Math.random() * 0.35)); sprite.tint = [0x78a7a4, 0xa0c5bc, index % 7 === 0 ? 0xd4b985 : 0xc2d8ce][layer];
    layers[layer].addChild(sprite); const angle = -0.3 + Math.random() * 0.6;
    return { x: width * (0.12 + Math.random() * 0.74), y: height * (0.22 + Math.random() * 0.56), vx: Math.cos(angle) * 0.6, vy: Math.sin(angle) * 0.3, speed: 0.38 + layer * 0.16 + Math.random() * 0.25, phase: Math.random() * 6.28, fear: 0.35 + Math.random() * 0.55, sprite };
  });
  const updateDust = simpleDrifters(container, dotTexture, reduced ? 80 : 300, width, height);
  return { container, update(dt, time, w, h, pointer) {
    for (const fish of school) {
      let ax = 0.012 + Math.sin(time * 0.13 + fish.phase) * 0.008; let ay = Math.sin(time * 0.09 + fish.phase) * 0.006; let nx = 0; let ny = 0; let countNear = 0;
      for (const other of school) { if (other === fish) continue; const dx = other.x - fish.x; const dy = other.y - fish.y; const d2 = dx * dx + dy * dy; if (d2 < 12000) { nx += other.x; ny += other.y; countNear += 1; if (d2 < 1500 && d2 > 1) { ax -= dx / d2 * 1.8; ay -= dy / d2 * 1.8; } } }
      if (countNear) { ax += (nx / countNear - fish.x) * 0.0007; ay += (ny / countNear - fish.y) * 0.0007; }
      if (pointer.active && pointer.age < 2.8) { const dx = fish.x - pointer.x; const dy = fish.y - pointer.y; const d2 = dx * dx + dy * dy; if (d2 < 26000 && d2 > 1) { const d = Math.sqrt(d2); ax += dx / d * fish.fear * 0.24; ay += dy / d * fish.fear * 0.24; } }
      if (fish.x < 60) ax += 0.06; if (fish.x > w - 60) ax -= 0.06; if (fish.y < 60) ay += 0.05; if (fish.y > h - 80) ay -= 0.05;
      fish.vx += ax * dt * 60; fish.vy += ay * dt * 60; const mag = Math.hypot(fish.vx, fish.vy) || 1; const speed = fish.speed * (reduced ? 0.28 : 1); fish.vx = fish.vx / mag * speed; fish.vy = fish.vy / mag * speed; fish.x += fish.vx * dt * 42; fish.y += fish.vy * dt * 42;
      fish.sprite.position.set(fish.x, fish.y); fish.sprite.rotation = Math.atan2(fish.vy, fish.vx);
    }
    updateDust(dt, time, w, h);
  } };
};

const oceanScene = (fishTexture: Texture, dotTexture: Texture, width: number, height: number, reduced: boolean, onDiscover: () => void): Scene => {
  const container = new Container(); const dust = simpleDrifters(container, dotTexture, reduced ? 60 : 190, width, height);
  const creature = new Container(); creature.alpha = 0.13;
  const body = new Graphics().ellipse(420, 0, 370, 79).fill({ color: 0x020b13, alpha: 0.98 }); body.poly([85, 0, 0, -95, 26, -10, 0, 82]).fill({ color: 0x020b13 }); body.poly([490, 34, 365, 130, 555, 54]).fill({ color: 0x020b13, alpha: 0.84 });
  creature.addChild(body); creature.scale.set(Math.max(520, width * 0.68) / 900); container.addChild(creature);
  let x = -Math.max(520, width * 0.68) * 1.3; let attention = 0; let found = false;
  const passing = simpleDrifters(container, fishTexture, reduced ? 5 : 14, width, height, true);
  return { container, update(dt, time, w, h, pointer) { const size = Math.max(520, w * 0.68); x += (w + size * 2.4) / (reduced ? 84 : 47) * dt; if (x > w + size * 0.3) x = -size * 1.3; creature.position.set(x, h * 0.29 + Math.sin(time * 0.1) * 9); dust(dt, time, w, h); passing(dt, time, w, h); if (!found && pointer.active && Math.abs(pointer.x - (x + size * 0.5)) < size * 0.52 && Math.abs(pointer.y - h * 0.29) < size * 0.22) { attention += dt; if (attention > 1.4) { found = true; onDiscover(); } } else attention = Math.max(0, attention - dt); } };
};

const jellyScene = (width: number, height: number, reduced: boolean): Scene => {
  const container = new Container();
  const jellies = Array.from({ length: reduced ? 4 : innerWidth < 720 ? 6 : 9 }, (_, index) => {
    const view = new Container(); const color = index % 3 ? 0xa9d5dc : 0xc9c7e5; const body = new Graphics().moveTo(-25, 15).bezierCurveTo(-32, 8, -27, -31, 0, -36).bezierCurveTo(27, -31, 32, 8, 25, 15).bezierCurveTo(12, 8, -12, 8, -25, 15).closePath().fill({ color, alpha: 0.18 }).stroke({ color, width: 1, alpha: 0.28 }); const tentacles = new Graphics();
    for (let line = -2; line <= 2; line += 1) { const lx = line * 8; tentacles.moveTo(lx, 12).bezierCurveTo(lx - 7, 32, lx + 8, 47, lx + Math.sin(index + line) * 8, 71).stroke({ color, width: 0.8, alpha: 0.2 }); }
    view.addChild(body, tentacles); const scale = 0.58 + Math.random(); const x = width * (0.08 + Math.random() * 0.84); const y = height * (0.15 + Math.random() * 0.68); view.position.set(x, y); view.scale.set(scale); container.addChild(view); return { view, x, y, phase: Math.random() * 6.28, cycle: 6 + Math.random() * 9, scale };
  });
  return { container, update(_dt, time) { jellies.forEach((jelly) => { const pulse = Math.sin(time / jelly.cycle * Math.PI * 2 + jelly.phase); jelly.view.position.set(jelly.x + Math.sin(time * 0.07 + jelly.phase) * 9, jelly.y + Math.sin(time * 0.09 + jelly.phase) * 17); jelly.view.scale.set(jelly.scale * (1 - pulse * 0.035), jelly.scale * (1 + pulse * 0.065)); }); } };
};

const deepScene = (width: number, height: number, reduced: boolean): Scene => {
  const container = new Container(); container.addChild(new Graphics().rect(0, 0, width, height).fill({ color: 0x00050a, alpha: 0.74 }));
  const life = Array.from({ length: reduced ? 8 : innerWidth < 720 ? 14 : 24 }, (_, index) => { const view = new Graphics().circle(0, 0, index % 8 ? 1.1 : 2.4).fill({ color: index % 5 ? 0x76ead5 : 0x82aaff }); const x = Math.random() * width; const y = height * (0.08 + Math.random() * 0.84); view.position.set(x, y); view.alpha = 0; container.addChild(view); return { view, x, phase: Math.random() * 6.28, interval: 0.055 + Math.random() * 0.11 }; });
  const halo = new Graphics().circle(0, 0, 140).fill({ color: 0x6db7ae, alpha: 0.022 }).circle(0, 0, 70).fill({ color: 0xa0d7cc, alpha: 0.03 }); halo.blendMode = 'add'; container.addChild(halo);
  return { container, update(_dt, time, w, h, pointer) { halo.position.set(pointer.active ? pointer.x : w * 0.5, pointer.active ? pointer.y : h * 0.48); life.forEach((item) => { item.view.alpha = Math.pow(Math.max(0, Math.sin(time * item.interval + item.phase)), 12) * 0.72; item.view.x = item.x + Math.sin(time * 0.07 + item.phase) * 7; }); } };
};

function Stage({ depthRef, pointerRef, reducedMotion, onDiscover }: { depthRef: React.RefObject<number>; pointerRef: React.RefObject<Pointer>; reducedMotion: boolean; onDiscover: () => void }) {
  const { app, isInitialised } = useApplication();
  useEffect(() => {
    if (!isInitialised) return;
    const fish = makeFishTexture(app); const dot = makeDotTexture(app); const w = app.screen.width; const h = app.screen.height;
    const scenes = [surfaceScene(fish, dot, w, h, reducedMotion), reefScene(fish, dot, w, h, reducedMotion), oceanScene(fish, dot, w, h, reducedMotion, onDiscover), jellyScene(w, h, reducedMotion), deepScene(w, h, reducedMotion)];
    scenes.forEach((scene) => app.stage.addChild(scene.container)); let time = 0;
    const tick = (ticker: Ticker) => { const dt = Math.min(0.05, ticker.deltaMS / 1000); time += dt; pointerRef.current.age += dt; const position = Math.max(0, Math.min(4, depthRef.current * 5 - 0.5)); scenes.forEach((scene, index) => { const n = Math.max(0, 1 - Math.abs(position - index)); const alpha = n * n * (3 - 2 * n); scene.container.alpha = alpha; scene.container.visible = alpha > 0.006; if (alpha > 0.006) scene.update(dt, time, app.screen.width, app.screen.height, pointerRef.current); }); };
    app.ticker.add(tick); return () => { app.ticker.remove(tick); scenes.forEach((scene) => { app.stage.removeChild(scene.container); scene.container.destroy({ children: true }); }); (fish as RenderTexture).destroy(true); (dot as RenderTexture).destroy(true); };
  }, [app, depthRef, isInitialised, onDiscover, pointerRef, reducedMotion]);
  return null;
}

export default function AquariumCanvas({ depth, reducedMotion, onDiscover }: Props) {
  const host = useRef<HTMLDivElement>(null); const depthRef = useRef(depth); depthRef.current = depth; const pointerRef = useRef<Pointer>({ x: 0, y: 0, active: false, age: 99 });
  const resolution = useMemo(() => Math.min(devicePixelRatio || 1, innerWidth < 720 ? 1.3 : 1.75), []);
  return <div ref={host} className="aquarium-canvas" role="img" aria-label="魚群、大型生物、クラゲ、深海生物が漂う水中世界" tabIndex={0} onPointerMove={(event) => { const rect = host.current?.getBoundingClientRect(); if (!rect) return; pointerRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top, active: true, age: 0 }; }} onPointerLeave={() => { pointerRef.current.active = false; }}><Application resizeTo={host} backgroundAlpha={0} resolution={resolution} autoDensity antialias={innerWidth >= 720} preference="webgl" powerPreference="high-performance"><Stage depthRef={depthRef} pointerRef={pointerRef} reducedMotion={reducedMotion} onDiscover={onDiscover} /></Application></div>;
}
