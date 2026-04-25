import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { PlotRect } from '../types';
import { getNearestDataIndexFromX } from './getNearestDataIndexFromX';

const plot: PlotRect = {
  left: 10,
  right: 110,
  top: 0,
  bottom: 100,
  width: 100,
  height: 100,
};

describe('getNearestDataIndexFromX', () => {
  it('returns 0 when dataLength is 0', () => {
    assert.equal(getNearestDataIndexFromX(50, plot, 0), 0);
  });

  it('returns 0 when dataLength is 1', () => {
    assert.equal(getNearestDataIndexFromX(50, plot, 1), 0);
  });

  it('returns first index at plot.left', () => {
    assert.equal(getNearestDataIndexFromX(plot.left, plot, 5), 0);
  });

  it('returns last index at plot.right', () => {
    assert.equal(getNearestDataIndexFromX(plot.right, plot, 5), 4);
  });

  it('returns middle index near the center', () => {
    assert.equal(getNearestDataIndexFromX(60, plot, 5), 2);
  });

  it('clamps index when pointer is outside range', () => {
    assert.equal(getNearestDataIndexFromX(-100, plot, 5), 0);
    assert.equal(getNearestDataIndexFromX(1000, plot, 5), 4);
  });
});
