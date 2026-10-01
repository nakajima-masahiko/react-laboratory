import { curvature, LENGTH, LAPS, ROAD_HALF, wrap } from "./track";
export type Item = "turbo" | "pulse" | "shield";
export type Difficulty = "easy" | "normal" | "hard";
export type Phase = "ready" | "countdown" | "racing" | "paused" | "finished";
export type Input = {
  steer: number;
  throttle: boolean;
  brake: boolean;
  drift: boolean;
  use: boolean;
};
export type Car = {
  id: number;
  name: string;
  s: number;
  lane: number;
  speed: number;
  heading: number;
  drift: number;
  boost: number;
  shield: number;
  stun: number;
  item: Item | null;
  finish: number | null;
  pickup: number;
  aiUse: number;
  wall: number;
};
export type Pulse = { s: number; lane: number; life: number; owner: number };
export const ITEM_NAMES: Record<Item, string> = {
  turbo: "ターボ",
  pulse: "ソナーパルス",
  shield: "バブルシールド",
};
export const STEP = 1 / 60;
export const PICKUPS = Array.from(
  { length: 12 },
  (_, i) => 90 + (i * LENGTH) / 12,
);
const names = ["YOU", "CORAL", "MANTA", "PEARL", "LUMEN", "ORCA"];
const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));
export class Race {
  cars: Car[] = [];
  pulses: Pulse[] = [];
  phase: Phase = "ready";
  resumePhase: Phase = "racing";
  time = 0;
  countdown = 3;
  difficulty: Difficulty = "normal";
  event = "";
  eventUntil = 0;
  seed = 4711;
  constructor() {
    this.reset();
  }
  reset() {
    this.cars = names.map((name, id) => ({
      id,
      name,
      s: -8 - Math.floor(id / 2) * 7,
      lane: id % 2 === 0 ? -2.5 : 2.5,
      speed: 0,
      heading: 0,
      drift: 0,
      boost: 0,
      shield: 0,
      stun: 0,
      item: null,
      finish: null,
      pickup: -1,
      aiUse: 0,
      wall: 0,
    }));
    this.pulses = [];
    this.time = 0;
    this.countdown = 3;
    this.phase = "ready";
    this.event = "";
    this.eventUntil = 0;
    this.seed = 4711;
  }
  start(difficulty: Difficulty) {
    this.reset();
    this.difficulty = difficulty;
    this.phase = "countdown";
  }
  pause() {
    if (this.phase === "racing" || this.phase === "countdown") {
      this.resumePhase = this.phase;
      this.phase = "paused";
    }
  }
  resume() {
    if (this.phase === "paused") this.phase = this.resumePhase;
  }
  random() {
    this.seed = (Math.imul(this.seed, 1664525) + 1013904223) >>> 0;
    return this.seed / 4294967296;
  }
  announce(message: string) {
    this.event = message;
    this.eventUntil = this.time + 2.2;
  }
  order() {
    return [...this.cars].sort((a, b) =>
      a.finish !== null && b.finish !== null
        ? a.finish - b.finish
        : a.finish !== null
          ? -1
          : b.finish !== null
            ? 1
            : b.s - a.s,
    );
  }
  hit(car: Car) {
    if (car.shield > 0) {
      car.shield = 0;
      if (car.id === 0) this.announce("シールドで防御！");
      return;
    }
    car.stun = 0.85;
    car.speed *= 0.58;
    if (car.id === 0) this.announce("被弾！ アクセルで立て直そう");
  }
  useItem(car: Car) {
    const item = car.item;
    if (!item || car.finish !== null) return;
    car.item = null;
    if (item === "turbo") car.boost = 2.7;
    if (item === "shield") car.shield = 9;
    if (item === "pulse")
      this.pulses.push({
        s: car.s + 4,
        lane: car.lane,
        life: 3,
        owner: car.id,
      });
    if (car.id === 0) this.announce(`${ITEM_NAMES[item]}！`);
  }
  ai(car: Car): Input {
    const bend = curvature(car.s + 16),
      difficulty =
        this.difficulty === "easy"
          ? 0.8
          : this.difficulty === "hard"
            ? 1.06
            : 0.94;
    const targetSpeed =
      (32 - Math.min(13, Math.abs(bend) * 430)) * difficulty +
      (car.id % 3) * 0.8;
    let targetLane = Math.sin(car.s / 95 + car.id * 2) * 2.3;
    const front = this.cars.find(
      (other) =>
        other.id !== car.id &&
        other.s > car.s &&
        other.s - car.s < 20 &&
        Math.abs(other.lane - car.lane) < 2.7,
    );
    if (front) targetLane = front.lane > 0 ? -4.4 : 4.4;
    // Steer and brake through the same vehicle model as the human driver.
    const correction = (targetLane - car.lane) * 0.075 - car.heading * 0.85;
    const steer = clamp(
      (correction - curvature(car.s) * car.speed) / 1.1,
      -1,
      1,
    );
    const ready = this.time > car.aiUse;
    return {
      steer,
      throttle: car.speed < targetSpeed,
      brake: car.speed > targetSpeed + 3,
      drift: Math.abs(bend) > 0.009 && car.speed > 19,
      use: ready && !!car.item,
    };
  }
  step(dt: number, input: Input) {
    if (this.phase === "countdown") {
      this.countdown -= dt;
      if (this.countdown <= 0) {
        this.phase = "racing";
        this.announce("GO! 海底グランプリ、スタート");
      }
      return;
    }
    if (this.phase !== "racing" && this.phase !== "finished") return;
    if (
      this.phase === "finished" &&
      this.cars.every((car) => car.finish !== null)
    )
      return;
    this.time += dt;
    for (const car of this.cars) {
      if (car.finish !== null) continue;
      const controls = car.id === 0 ? input : this.ai(car);
      if (controls.use) {
        this.useItem(car);
        if (car.id) car.aiUse = this.time + 2 + this.random() * 5;
      }
      car.boost = Math.max(0, car.boost - dt);
      car.shield = Math.max(0, car.shield - dt);
      car.stun = Math.max(0, car.stun - dt);
      car.wall = Math.max(0, car.wall - dt);
      const slip = this.cars.some(
        (other) =>
          other.id !== car.id &&
          other.s > car.s &&
          other.s - car.s < 19 &&
          Math.abs(other.lane - car.lane) < 1.8,
      );
      const boosting = car.boost > 0,
        drifting =
          controls.drift && car.speed > 11 && Math.abs(controls.steer) > 0.13;
      const top = (boosting ? 47 : 34) + (slip ? 3 : 0);
      car.speed = clamp(
        car.speed +
          ((controls.throttle ? 13 : 0) -
            (controls.brake ? 24 : 0) -
            2.1 -
            car.speed * 0.075) *
            dt,
        0,
        top,
      );
      if (boosting) car.speed = Math.min(top, car.speed + 22 * dt);
      if (car.stun > 0) car.speed = Math.min(car.speed, 16);
      car.heading +=
        (controls.steer *
          (drifting ? 1.55 : 1.1) *
          Math.min(1, car.speed / 12) +
          curvature(car.s) * car.speed -
          car.heading * 2.1) *
        dt;
      car.heading = clamp(car.heading, -0.85, 0.85);
      if (drifting) car.drift = Math.min(1, car.drift + dt * 0.56);
      else if (car.drift > 0) {
        if (car.drift > 0.45) {
          car.boost = Math.max(car.boost, car.drift * 1.8);
          if (car.id === 0) this.announce("ドリフトブースト！");
        }
        car.drift = 0;
      }
      car.lane += Math.sin(car.heading) * car.speed * dt;
      if (Math.abs(car.lane) > ROAD_HALF - 1.1) {
        car.lane = clamp(car.lane, -ROAD_HALF + 1.1, ROAD_HALF - 1.1);
        car.heading *= 0.7;
        if (car.wall <= 0) {
          car.speed *= 0.7;
          car.wall = 0.8;
          if (car.id === 0) this.announce("ガードレールに接触");
        }
      }
      const before = car.s;
      car.s += Math.max(0, Math.cos(car.heading)) * car.speed * dt;
      // Progress is continuous and forward-only; touching the finish twice cannot add a lap.
      for (let i = 0; i < PICKUPS.length; i++) {
        const gate = Math.floor(before / LENGTH) * LENGTH + PICKUPS[i];
        if (before < gate && car.s >= gate && !car.item) {
          const laneIndex = Math.round(car.lane / 5);
          if (Math.abs(car.lane - laneIndex * 5) < 2.1) {
            car.item = (["turbo", "pulse", "shield"] as const)[
              Math.floor(this.random() * 3)
            ];
            car.pickup = i;
            car.aiUse = this.time + 1 + this.random() * 4;
            if (car.id === 0) this.announce(`${ITEM_NAMES[car.item]}を獲得`);
          }
        }
      }
      if (car.s >= LENGTH * LAPS) {
        car.s = LENGTH * LAPS;
        car.finish = this.time;
        if (car.id === 0) {
          this.phase = "finished";
          this.announce("FINISH!");
        }
      }
    }
    for (let i = 0; i < this.cars.length; i++)
      for (let j = i + 1; j < this.cars.length; j++) {
        const a = this.cars[i],
          b = this.cars[j];
        if (a.finish !== null || b.finish !== null) continue;
        const longitudinal = Math.abs(
          wrap(a.s - b.s + LENGTH / 2) - LENGTH / 2,
        );
        if (longitudinal < 3.2 && Math.abs(a.lane - b.lane) < 1.8) {
          const sign = a.lane <= b.lane ? -1 : 1;
          a.lane = clamp(a.lane + sign * dt * 5, -7.5, 7.5);
          b.lane = clamp(b.lane - sign * dt * 5, -7.5, 7.5);
          if (a.s < b.s) a.speed = Math.min(a.speed, b.speed + 1);
          else b.speed = Math.min(b.speed, a.speed + 1);
        }
      }
    this.pulses = this.pulses.filter((p) => {
      const before = p.s;
      p.s += 65 * dt;
      p.life -= dt;
      for (const car of this.cars) {
        if (car.id === p.owner || car.finish !== null) continue;
        const offset = wrap(car.s - before);
        if (offset < 65 * dt + 3 && Math.abs(car.lane - p.lane) < 2) {
          this.hit(car);
          return false;
        }
      }
      return p.life > 0;
    });
  }
}
export function emptyInput(): Input {
  return { steer: 0, throttle: true, brake: false, drift: false, use: false };
}
export function clock(time: number) {
  const m = Math.floor(time / 60),
    s = Math.floor(time % 60),
    ms = Math.floor((time % 1) * 100);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms).padStart(2, "0")}`;
}
