import assert from 'node:assert/strict';
import test from 'node:test';
import { createMarket, PAIRS, FRAMES, COUNTS, isConfig } from '../src/experiments/fx-screen-switch-lab/market.ts';

test('all currencies, timeframes and history sizes have valid OHLC and ordered buckets', () => {
  const market = createMarket(Date.UTC(2026, 10, 17, 0, 0));
  for (const pair of PAIRS) for (const minutes of FRAMES) for (const count of COUNTS) {
    const bars = market.bars({ pair, minutes, count });
    assert.equal(bars.length, count);
    bars.forEach((bar, i) => {
      assert.ok(bar.low <= Math.min(bar.open, bar.close));
      assert.ok(bar.high >= Math.max(bar.open, bar.close));
      assert.ok(bar.low > 0);
      if (i) assert.equal(bar.time - bars[i - 1].time, minutes * 60_000);
    });
  }
});

test('live ticks share prices across timeframes; hourly candles aggregate minute OHLC', () => {
  const market = createMarket(Date.UTC(2026, 10, 17, 0, 0));
  for (let i = 0; i < 280; i++) market.tick(15);
  for (const quote of market.quotes()) {
    for (const minutes of FRAMES) {
      const bars = market.bars({ pair: quote.pair, minutes, count: 120 });
      assert.equal(bars.at(-1).close, quote.price);
    }
    const hour = market.bars({ pair: quote.pair, minutes: 60, count: 60 }).at(-1);
    const minutes = market.bars({ pair: quote.pair, minutes: 1, count: 120 }).filter(bar => bar.time >= hour.time);
    assert.equal(hour.open, minutes[0].open);
    assert.equal(hour.high, Math.max(...minutes.map(bar => bar.high)));
    assert.equal(hour.low, Math.min(...minutes.map(bar => bar.low)));
  }
});

test('seeded sessions are deterministic and invalid controls are rejected', () => {
  const first = createMarket(0), second = createMarket(0);
  for (const speed of [1, 15, 60]) { first.tick(speed); second.tick(speed); }
  assert.deepEqual(first.quotes(), second.quotes());
  assert.equal(isConfig({ pair: 'USD/JPY', minutes: 5, count: 120 }), true);
  assert.equal(isConfig({ pair: 'USD/JPY', minutes: 2, count: 120 }), false);
  assert.equal(isConfig({ pair: 'OTHER', minutes: 5, count: 120 }), false);
  assert.equal(isConfig(null), false);
});
