import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatPrice, formatTime } from './formatters';

describe('formatters', () => {
  it('formats price with grouping and 2 decimals', () => {
    assert.equal(formatPrice(12345.678), '12,345.68');
  });

  it('formats time with default format', () => {
    const value = formatTime(new Date('2024-01-02T03:04:00.000Z'));

    assert.ok(value.includes('01/02'));
  });

  it('formats time with explicit pattern', () => {
    const value = formatTime(new Date('2024-01-02T03:04:00.000Z'), '%Y-%m-%d %H:%M');

    assert.equal(value, '2024-01-02 03:04');
  });
});
