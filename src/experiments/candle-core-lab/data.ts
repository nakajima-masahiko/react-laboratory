import type { Candle } from 'candle-core';

export const TIMEFRAME_MS = 60_000;

/** Seeded PRNG (same family as candle-core benchmarks). */
export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

/** Generate deterministic synthetic USD/JPY-like 1m candles. */
export function makeCandles(count: number, seed = 42, timeframeMs = TIMEFRAME_MS): Candle[] {
  const random = createSeededRandom(seed);
  const start = 1_700_000_000_000 - count * timeframeMs;
  const candles = new Array<Candle>(count);
  let previousClose = 150;

  for (let index = 0; index < count; index += 1) {
    const drift = (random() - 0.5) * 0.35;
    const open = previousClose;
    const close = open + drift;
    candles[index] = {
      time: start + index * timeframeMs,
      open,
      high: Math.max(open, close) + random() * 0.12,
      low: Math.min(open, close) - random() * 0.12,
      close,
      volume: 80 + Math.floor(random() * 420),
    };
    previousClose = close;
  }

  return candles;
}

export function makeNextCandle(previous: Candle, seed: number): Candle {
  const random = createSeededRandom(seed);
  const open = previous.close;
  const close = open + (random() - 0.5) * 0.35;
  return {
    time: previous.time + TIMEFRAME_MS,
    open,
    high: Math.max(open, close) + random() * 0.12,
    low: Math.min(open, close) - random() * 0.12,
    close,
    volume: 80 + Math.floor(random() * 420),
  };
}
