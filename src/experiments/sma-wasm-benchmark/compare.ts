import type { CompareResult } from './types';

/**
 * Compare two SMA result arrays.
 *
 * NaN-vs-NaN positions are treated as a match (both engines emit NaN for the
 * first `window - 1` indices). Numeric positions are compared with an absolute
 * tolerance `epsilon`. The maximum absolute difference seen across the whole
 * array is reported, even when overall match passes.
 */
export function compareResults(
  a: Float64Array,
  b: Float64Array,
  epsilon = 1e-9,
): CompareResult {
  if (a.length !== b.length) {
    return {
      matched: false,
      maxAbsDiff: Number.POSITIVE_INFINITY,
      firstMismatchIndex: 0,
      comparedCount: 0,
      epsilon,
    };
  }

  let matched = true;
  let maxAbsDiff = 0;
  let firstMismatchIndex: number | null = null;

  for (let i = 0; i < a.length; i++) {
    const av = a[i];
    const bv = b[i];
    const aNaN = Number.isNaN(av);
    const bNaN = Number.isNaN(bv);

    if (aNaN && bNaN) continue;
    if (aNaN !== bNaN) {
      matched = false;
      if (firstMismatchIndex === null) firstMismatchIndex = i;
      maxAbsDiff = Number.POSITIVE_INFINITY;
      continue;
    }

    const diff = Math.abs(av - bv);
    if (diff > maxAbsDiff) maxAbsDiff = diff;
    if (diff > epsilon && firstMismatchIndex === null) {
      matched = false;
      firstMismatchIndex = i;
    }
  }

  return {
    matched,
    maxAbsDiff,
    firstMismatchIndex,
    comparedCount: a.length,
    epsilon,
  };
}
