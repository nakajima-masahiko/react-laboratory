import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { CandleData } from '../types';
import { getPriceRange } from './getPriceRange';

const candles: CandleData[] = [
  { time: '2024-01-01T00:00:00.000Z', open: 100, high: 120, low: 90, close: 110 },
  { time: '2024-01-02T00:00:00.000Z', open: 110, high: 125, low: 105, close: 115 },
];

describe('getPriceRange', () => {
  it('returns default range for empty data', () => {
    assert.deepEqual(getPriceRange([], 'candlestick'), { min: 0, max: 1 });
  });

  it('adds padding for equal values', () => {
    const equal: CandleData[] = [
      { time: '2024-01-01T00:00:00.000Z', open: 100, high: 100, low: 100, close: 100 },
    ];

    const range = getPriceRange(equal, 'line');
    assert.ok(range.min < 100);
    assert.ok(range.max > 100);
  });

  it('uses low/high for candlestick', () => {
    const range = getPriceRange(candles, 'candlestick');

    assert.ok(range.min <= 90);
    assert.ok(range.max >= 125);
  });

  it('uses close values for line', () => {
    const range = getPriceRange(candles, 'line');

    assert.ok(range.min <= 110);
    assert.ok(range.max >= 115);
  });

  it('applies padding to non-equal values', () => {
    const range = getPriceRange(candles, 'line');

    assert.ok(range.min < 110);
    assert.ok(range.max > 115);
  });
});
