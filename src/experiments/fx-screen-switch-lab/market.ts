export const PAIRS = ['USD/JPY', 'EUR/JPY', 'GBP/JPY', 'EUR/USD'] as const;
export const FRAMES = [1, 5, 15, 60] as const;
export const COUNTS = [60, 120, 240] as const;
export const SCREENS = ['main', 'chart-1', 'chart-2', 'chart-3'] as const;
export type Pair = typeof PAIRS[number];
export type ScreenId = typeof SCREENS[number];
export type Config = { pair: Pair; minutes: typeof FRAMES[number]; count: typeof COUNTS[number] };
export type Bar = { time: number; open: number; high: number; low: number; close: number };
export type Quote = { pair: Pair; price: number; change: number };
export const INITIAL: Record<ScreenId, Config> = {
  main: { pair: 'USD/JPY', minutes: 1, count: 120 },
  'chart-1': { pair: 'USD/JPY', minutes: 5, count: 120 },
  'chart-2': { pair: 'EUR/JPY', minutes: 15, count: 120 },
  'chart-3': { pair: 'EUR/USD', minutes: 60, count: 120 },
};
const BASE: Record<Pair, number> = { 'USD/JPY': 150, 'EUR/JPY': 163, 'GBP/JPY': 193, 'EUR/USD': 1.085 };
const MINUTE = 60_000;
const CAPACITY = 14_520; // Enough underlying minutes for 240 hourly candles.

export function isScreen(value: unknown): value is ScreenId {
  return SCREENS.includes(value as ScreenId);
}
export function isConfig(value: unknown): value is Config {
  if (!value || typeof value !== 'object') return false;
  const c = value as Config;
  return PAIRS.includes(c.pair) && FRAMES.includes(c.minutes) && COUNTS.includes(c.count);
}
export function decimals(pair: Pair) { return pair.endsWith('JPY') ? 3 : 5; }
export function frameLabel(minutes: number) { return minutes === 60 ? '1時間足' : `${minutes}分足`; }

/** One shared, seeded minute history: all timeframes aggregate the same quotes. */
export function createMarket(now = Date.now()) {
  let seed = 20261117;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const move = (pair: Pair, price: number, strength = 1) =>
    Math.max(BASE[pair] * .8, price + ((random() - .5) * BASE[pair] * .00032 + (BASE[pair] - price) * .001) * strength);
  let clock = Math.floor(now / MINUTE) * MINUTE;
  let ticks = 0;
  const history = {} as Record<Pair, Bar[]>;
  for (const pair of PAIRS) {
    let price = BASE[pair];
    history[pair] = Array.from({ length: CAPACITY }, (_, i) => {
      const open = price;
      price = move(pair, open);
      const wick = random() * BASE[pair] * .00012;
      return { time: clock - (CAPACITY - 1 - i) * MINUTE, open, close: price,
        high: Math.max(open, price) + wick, low: Math.min(open, price) - wick };
    });
    // The current minute starts with a tick, not a completed historical candle.
    const last = history[pair].at(-1)!;
    last.open = last.high = last.low = last.close;
  }
  return {
    get clock() { return clock; },
    get ticks() { return ticks; },
    tick(seconds: number) {
      clock += seconds * 1000;
      ticks++;
      for (const pair of PAIRS) {
        const bars = history[pair];
        const last = bars.at(-1)!;
        const price = move(pair, last.close, .55);
        const time = Math.floor(clock / MINUTE) * MINUTE;
        if (time !== last.time) {
          bars.push({ time, open: last.close, high: Math.max(last.close, price), low: Math.min(last.close, price), close: price });
          if (bars.length > CAPACITY) bars.shift();
        } else {
          last.close = price;
          last.high = Math.max(last.high, price);
          last.low = Math.min(last.low, price);
        }
      }
    },
    quotes(): Quote[] {
      return PAIRS.map(pair => ({ pair, price: history[pair].at(-1)!.close,
        change: history[pair].at(-1)!.close - BASE[pair] }));
    },
    bars(config: Config): Bar[] {
      const bucketSize = config.minutes * MINUTE;
      const result: Bar[] = [];
      // Only scan the portion needed by this visible chart.
      for (const bar of history[config.pair].slice(-(config.count + 1) * config.minutes)) {
        const time = Math.floor(bar.time / bucketSize) * bucketSize;
        const last = result.at(-1);
        if (last?.time === time) {
          last.high = Math.max(last.high, bar.high);
          last.low = Math.min(last.low, bar.low);
          last.close = bar.close;
        } else result.push({ ...bar, time });
      }
      return result.slice(-config.count);
    },
  };
}
