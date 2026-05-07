/**
 * Deterministic pseudo-price generator.
 *
 * Uses mulberry32 — a tiny 32-bit PRNG that is reproducible across browsers and
 * across the JS / WASM runs as long as the same `seed` and `count` are used.
 * That deterministic stream is what lets the comparison check be meaningful.
 *
 * The price walk starts at `initialPrice` (default 100.0) and advances by a
 * symmetric step in [-volatility/2, +volatility/2] per tick, with a small
 * additional uniform noise term layered on top. Output is a `Float64Array`.
 */
export interface DataGeneratorOptions {
  count: number;
  seed: number;
  initialPrice?: number;
  volatility?: number;
  noise?: number;
}

function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function next() {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generatePrices(options: DataGeneratorOptions): Float64Array {
  const {
    count,
    seed,
    initialPrice = 100.0,
    volatility = 0.5,
    noise = 0.05,
  } = options;

  const out = new Float64Array(count);
  if (count === 0) return out;

  const rand = mulberry32(seed);
  let price = initialPrice;
  out[0] = price;

  for (let i = 1; i < count; i++) {
    const step = (rand() - 0.5) * volatility;
    const jitter = (rand() - 0.5) * noise;
    price = price + step + jitter;
    if (price < 1) price = 1;
    out[i] = price;
  }

  return out;
}
