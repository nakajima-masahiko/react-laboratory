export const ROAD_HALF = 8.6;
export const LAPS = 3;
export const SECTIONS = [
  "サンゴ礁ゲート",
  "ウミガメの回廊",
  "沈没船の入り江",
  "クラゲの洞窟",
  "クジラの海",
  "光の帰還",
];
export const COLORS = {
  water: "#073b50",
  haze: "#125d71",
  deep: "#021923",
  road: "#102d3b",
  seam: "#235364",
  cyan: "#62f5dc",
  blue: "#67c7ff",
  gold: "#ffc47a",
  pink: "#fa81ae",
  purple: "#ac98ff",
  white: "#dffaff",
  dark: "#062631",
  sand: "#386e72",
  rock: "#2a626b",
  green: "#61ac88",
  metal: "#356775",
  glass: "#79ccdd",
  rust: "#8d6860",
  red: "#ff7b64",
};
export const WATER_COLORS = [
  "#125d71",
  "#104b61",
  "#103849",
  "#18233f",
  "#123b56",
  "#196479",
];
export const CAR_COLORS = [
  COLORS.gold,
  COLORS.cyan,
  COLORS.pink,
  COLORS.blue,
  COLORS.purple,
  COLORS.red,
];
type Point = { x: number; z: number; y: number };
const anchors = [
  [0, 170],
  [130, 190],
  [240, 120],
  [265, 5],
  [225, -75],
  [255, -175],
  [140, -230],
  [5, -195],
  [-95, -240],
  [-220, -165],
  [-250, -35],
  [-185, 40],
  [-230, 140],
  [-130, 195],
];
function spline(t: number): Point {
  const v = t * anchors.length,
    i = Math.floor(v),
    f = v - i;
  const at = (n: number, a: number) =>
    anchors[(n + anchors.length) % anchors.length][a];
  const axis = (a: number) => {
    const p0 = at(i - 1, a),
      p1 = at(i, a),
      p2 = at(i + 1, a),
      p3 = at(i + 2, a);
    return (
      0.5 *
      (2 * p1 +
        (-p0 + p2) * f +
        (2 * p0 - 5 * p1 + 4 * p2 - p3) * f * f +
        (-p0 + 3 * p1 - 3 * p2 + p3) * f * f * f)
    );
  };
  return {
    x: axis(0),
    z: axis(1),
    y: 3 + 3 * Math.sin(t * Math.PI * 2) - 1.8 * Math.sin(t * Math.PI * 4),
  };
}
const count = 1400;
export const TRACK: (Point & { s: number })[] = [];
for (let i = 0; i <= count; i++) {
  const p = spline((i % count) / count),
    prev = TRACK[i - 1];
  TRACK.push({
    ...p,
    s: prev ? prev.s + Math.hypot(p.x - prev.x, p.z - prev.z) : 0,
  });
}
export const LENGTH = TRACK[count].s;
export const wrap = (n: number, length = LENGTH) =>
  ((n % length) + length) % length;
export function sample(s: number) {
  const distance = wrap(s);
  let lo = 0,
    hi = count;
  while (lo + 1 < hi) {
    const m = (lo + hi) >> 1;
    if (TRACK[m].s <= distance) lo = m;
    else hi = m;
  }
  const a = TRACK[lo],
    b = TRACK[hi],
    f = (distance - a.s) / (b.s - a.s),
    dx = b.x - a.x,
    dz = b.z - a.z,
    len = Math.hypot(dx, dz);
  return {
    x: a.x + dx * f,
    z: a.z + dz * f,
    y: a.y + (b.y - a.y) * f,
    tx: dx / len,
    tz: dz / len,
    nx: dz / len,
    nz: -dx / len,
  };
}
export function position(s: number, lateral = 0) {
  const p = sample(s);
  return { x: p.x + p.nx * lateral, y: p.y, z: p.z + p.nz * lateral };
}
export function curvature(s: number) {
  const a = sample(s - 3),
    b = sample(s + 3);
  return Math.atan2(a.tx * b.tz - a.tz * b.tx, a.tx * b.tx + a.tz * b.tz) / 6;
}
export const sectionAt = (s: number) =>
  Math.min(5, Math.floor((wrap(s) / LENGTH) * 6));
export function mapPoint(s: number, lateral = 0) {
  const p = position(s, lateral);
  return {
    x: ((p.x + 280) / 570) * 220 + 10,
    y: ((p.z + 260) / 500) * 170 + 10,
  };
}
export const MAP_PATH =
  TRACK.filter((_, i) => i % 12 === 0)
    .map(
      (p, i) =>
        `${i ? "L" : "M"}${((p.x + 280) / 570) * 220 + 10},${((p.z + 260) / 500) * 170 + 10}`,
    )
    .join(" ") + " Z";
