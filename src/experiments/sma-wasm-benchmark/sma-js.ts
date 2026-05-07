/**
 * O(n) rolling-sum SMA reference implementation for JavaScript.
 *
 * - Input is a `Float64Array` of prices.
 * - `window` must be >= 1. If `window > prices.length` every output is NaN.
 * - The first `window - 1` outputs are NaN to match the Rust/WASM port and
 *   to keep alignment with downstream charting code that relies on indices.
 * - Output length always equals `prices.length`.
 */
export function smaJs(prices: Float64Array, window: number): Float64Array {
  const n = prices.length;
  const out = new Float64Array(n);
  // Pre-fill with NaN so callers can distinguish "no value yet" from 0.
  out.fill(Number.NaN);

  if (window <= 0 || window > n) {
    return out;
  }

  const w = window;
  const invW = 1 / w;
  let sum = 0;

  for (let i = 0; i < w; i++) {
    sum += prices[i];
  }
  out[w - 1] = sum * invW;

  for (let i = w; i < n; i++) {
    sum += prices[i] - prices[i - w];
    out[i] = sum * invW;
  }

  return out;
}
