import type { Candle } from 'candle-core';

/** Seeded PRNG (same family as candle-core benchmarks). */
export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

/** Generate synthetic USD/JPY-like 1m candles. */
export function makeCandles(count: number, seed = 42, timeframeMs = 60_000): Candle[] {
  const random = createSeededRandom(seed);
  const start = Date.now() - count * timeframeMs;
  let previousClose = 150;

  return Array.from({ length: count }, (_, index) => {
    const drift = (random() - 0.5) * 0.35;
    const open = previousClose;
    const close = open + drift;
    const high = Math.max(open, close) + random() * 0.12;
    const low = Math.min(open, close) - random() * 0.12;
    const volume = 80 + Math.floor(random() * 420);
    previousClose = close;

    return {
      time: start + index * timeframeMs,
      open,
      high,
      low,
      close,
      volume,
    };
  });
}
