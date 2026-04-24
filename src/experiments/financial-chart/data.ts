import type { CandleData } from '../../features/financial-chart';

// 疑似乱数 (seed固定で描画結果が毎回ブレないように)
function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateCandleData(count: number = 60, base: number = 150): CandleData[] {
  const rand = mulberry32(42);
  const data: CandleData[] = [];
  let prevClose = base;
  const start = new Date('2026-01-01T09:00:00Z').getTime();
  const stepMs = 60 * 60 * 1000; // 1時間足

  for (let i = 0; i < count; i += 1) {
    const drift = (rand() - 0.5) * 1.2;
    const open = prevClose + drift * 0.3;
    const close = open + (rand() - 0.5) * 1.6;
    const high = Math.max(open, close) + rand() * 0.8;
    const low = Math.min(open, close) - rand() * 0.8;
    data.push({
      time: new Date(start + i * stepMs).toISOString(),
      open: round2(open),
      high: round2(high),
      low: round2(low),
      close: round2(close),
    });
    prevClose = close;
  }
  return data;
}

export function generateNextCandle(prev: CandleData): CandleData {
  const drift = (Math.random() - 0.5) * 1.2;
  const open = prev.close + drift * 0.3;
  const close = open + (Math.random() - 0.5) * 1.6;
  const high = Math.max(open, close) + Math.random() * 0.8;
  const low = Math.min(open, close) - Math.random() * 0.8;
  const nextTime = new Date(new Date(prev.time).getTime() + 60 * 60 * 1000).toISOString();

  return {
    time: nextTime,
    open: round2(open),
    high: round2(high),
    low: round2(low),
    close: round2(close),
  };
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}
