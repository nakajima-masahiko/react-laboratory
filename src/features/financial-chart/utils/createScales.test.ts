import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { CandleData, PlotRect } from '../types';
import { createScales } from './createScales';

const plot: PlotRect = {
  left: 10,
  right: 110,
  top: 10,
  bottom: 90,
  width: 100,
  height: 80,
};

const sampleData: CandleData[] = [
  { time: '2024-01-01T00:00:00.000Z', open: 100, high: 110, low: 95, close: 105 },
  { time: '2024-01-02T00:00:00.000Z', open: 105, high: 115, low: 100, close: 112 },
  { time: '2024-01-03T00:00:00.000Z', open: 112, high: 118, low: 108, close: 109 },
];

describe('createScales', () => {
  it('handles empty data', () => {
    const scales = createScales([], 'candlestick', plot);

    assert.deepEqual(scales.times, []);
    assert.equal(scales.xScale.domain()[0].getTime(), 0);
    assert.equal(scales.xScale.domain()[1].getTime(), 1);
  });

  it('handles single data point by expanding time domain', () => {
    const scales = createScales([sampleData[0]], 'line', plot);
    const [start, end] = scales.xScale.domain();

    assert.equal(end.getTime() - start.getTime(), 1);
  });

  it('handles multiple data points', () => {
    const scales = createScales(sampleData, 'candlestick', plot);
    const [start, end] = scales.xScale.domain();

    assert.equal(start.getTime(), new Date(sampleData[0].time).getTime());
    assert.equal(end.getTime(), new Date(sampleData[2].time).getTime());
  });

  it('uses min/max domain when data is unsorted', () => {
    const unsorted: CandleData[] = [sampleData[2], sampleData[0], sampleData[1]];
    const scales = createScales(unsorted, 'candlestick', plot);
    const [start, end] = scales.xScale.domain();

    assert.equal(start.getTime(), new Date(sampleData[0].time).getTime());
    assert.equal(end.getTime(), new Date(sampleData[2].time).getTime());
  });

  it('works for both candlestick and line chart types', () => {
    assert.doesNotThrow(() => createScales(sampleData, 'candlestick', plot));
    assert.doesNotThrow(() => createScales(sampleData, 'line', plot));
  });
});
