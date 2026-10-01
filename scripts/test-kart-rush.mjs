/** Compile the DOM-free simulation in isolation and exercise actual race rules. */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createRequire } from "node:module";
const output = mkdtempSync(join(tmpdir(), "abyss-tests-"));
writeFileSync(join(output, "package.json"), '{"type":"commonjs"}');
execFileSync(
  process.execPath,
  [
    resolve("node_modules/typescript/bin/tsc"),
    "src/experiments/kart-rush/engine.ts",
    "src/experiments/kart-rush/track.ts",
    "--ignoreConfig",
    "--target",
    "ES2022",
    "--module",
    "commonjs",
    "--skipLibCheck",
    "--outDir",
    output,
  ],
  { stdio: "inherit" },
);
const require = createRequire(import.meta.url);
const { Race, STEP, emptyInput } = require(join(output, "engine.js"));
const { LENGTH, LAPS, position, curvature } = require(join(output, "track.js"));
after(() => rmSync(output, { recursive: true, force: true }));
function started(difficulty = "normal") {
  const race = new Race();
  race.start(difficulty);
  for (let i = 0; i < 181; i++) race.step(STEP, emptyInput());
  return race;
}
function advance(race, seconds, input = emptyInput()) {
  for (let i = 0; i < seconds / STEP; i++) race.step(STEP, input);
}
test("closed track is continuous and has finite geometry throughout", () => {
  const a = position(0),
    b = position(LENGTH);
  assert.deepEqual(a, b);
  for (let s = 0; s < LENGTH; s += 2) {
    const p = position(s);
    assert.ok(Number.isFinite(p.x + p.y + p.z + curvature(s)));
    const n = position(s + 1);
    assert.ok(Math.hypot(n.x - p.x, n.z - p.z) < 1.01);
  }
});
test("countdown holds all cars; start, pause and resume keep race time consistent", () => {
  const r = new Race();
  r.start("normal");
  const s = r.cars[0].s;
  advance(r, 2);
  assert.equal(r.cars[0].s, s);
  advance(r, 2);
  assert.equal(r.phase, "racing");
  r.pause();
  const before = JSON.stringify([r.cars, r.time]);
  advance(r, 5);
  assert.equal(JSON.stringify([r.cars, r.time]), before);
  r.resume();
  advance(r, 1);
  assert.ok(r.cars[0].s > s);
});
test("brake stops the car and cannot reverse across the finish for extra laps", () => {
  const r = started();
  advance(r, 6);
  const forward = r.cars[0].s;
  advance(r, 6, { ...emptyInput(), brake: true });
  assert.equal(r.cars[0].speed, 0);
  assert.ok(r.cars[0].s >= forward);
  const stopped = r.cars[0].s;
  advance(r, 3, { ...emptyInput(), brake: true });
  assert.equal(r.cars[0].s, stopped);
});
test("drift release awards boost and rails prevent leaving the course", () => {
  const r = started();
  advance(r, 3);
  advance(r, 1.3, { ...emptyInput(), steer: 1, drift: true });
  assert.ok(r.cars[0].drift > 0.45);
  r.step(STEP, emptyInput());
  assert.ok(r.cars[0].boost > 0);
  advance(r, 30, { ...emptyInput(), steer: 1 });
  assert.ok(Math.abs(r.cars[0].lane) <= 7.5);
  assert.ok(r.cars[0].s > 0);
});
test("item gates grant items; turbo is consumed once", () => {
  const r = started();
  const c = r.cars[0];
  c.s = 89.8;
  c.lane = 0;
  c.speed = 30;
  c.heading = 0;
  r.step(STEP, emptyInput());
  assert.ok(c.item);
  c.item = "turbo";
  r.useItem(c);
  assert.equal(c.item, null);
  assert.ok(c.boost > 0);
  const boost = c.boost;
  r.useItem(c);
  assert.equal(c.boost, boost);
});
test("a shield absorbs one hit, then a later hit slows the car", () => {
  const r = started();
  const c = r.cars[0];
  c.item = "shield";
  c.speed = 30;
  r.useItem(c);
  r.hit(c);
  assert.equal(c.shield, 0);
  assert.equal(c.speed, 30);
  r.hit(c);
  assert.ok(c.speed < 30);
  assert.ok(c.stun > 0);
});
test("sonar pulse hits a car across the lap seam", () => {
  const r = started();
  r.cars[0].s = LENGTH - 6;
  r.cars[0].lane = 0;
  r.cars[0].item = "pulse";
  r.cars[1].s = LENGTH + 1;
  r.cars[1].lane = 0;
  r.cars[1].speed = 0;
  r.useItem(r.cars[0]);
  advance(r, 0.08);
  assert.ok(r.cars[1].stun > 0);
});
test("all six cars can finish three laps; reset clears every race effect", () => {
  const r = started();
  advance(r, 450);
  assert.equal(r.phase, "finished");
  assert.ok(r.cars.every((c) => c.finish !== null && c.s === LENGTH * LAPS));
  assert.equal(r.order().length, 6);
  r.reset();
  assert.equal(r.phase, "ready");
  assert.equal(r.time, 0);
  assert.equal(r.pulses.length, 0);
  assert.ok(
    r.cars.every((c) => c.finish === null && c.item === null && c.boost === 0),
  );
});
test("seeded AI is repeatable and difficulty changes opponents pace", () => {
  const a = started(),
    b = started(),
    easy = started("easy"),
    hard = started("hard");
  for (const r of [a, b, easy, hard]) advance(r, 40);
  assert.deepEqual(a.cars, b.cars);
  assert.ok(
    hard.cars.slice(1).reduce((n, c) => n + c.s, 0) >
      easy.cars.slice(1).reduce((n, c) => n + c.s, 0),
  );
});
