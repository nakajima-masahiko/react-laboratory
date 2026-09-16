export const SKYTREE_HEIGHT = 634;
export const BASE_SIDE = 68;

type ProfilePoint = { height: number; radius: number };

const PROFILE: ProfilePoint[] = [
  { height: 0, radius: BASE_SIDE / Math.sqrt(3) },
  { height: 50, radius: 34 },
  { height: 100, radius: 29 },
  { height: 200, radius: 21 },
  { height: 300, radius: 15 },
  { height: 350, radius: 13 },
  { height: 450, radius: 9 },
  { height: 495, radius: 5.5 },
];

export function towerRadius(height: number) {
  const y = Math.max(0, Math.min(495, height));
  const upperIndex = PROFILE.findIndex((point) => point.height >= y);
  if (upperIndex <= 0) return PROFILE[0].radius;
  const lower = PROFILE[upperIndex - 1];
  const upper = PROFILE[upperIndex];
  const t = (y - lower.height) / (upper.height - lower.height);
  const eased = t * t * (3 - 2 * t);
  return lower.radius + (upper.radius - lower.radius) * eased;
}

function triangleBoundaryScale(angle: number) {
  const sector = (angle + Math.PI / 3) % (Math.PI * 2 / 3) - Math.PI / 3;
  return 0.5 / Math.cos(sector);
}

export function sectionRadius(height: number, angle: number) {
  const circularity = Math.min(1, Math.max(0, height / 320));
  const triangle = triangleBoundaryScale(angle);
  return towerRadius(height) * (triangle * (1 - circularity) + circularity);
}
