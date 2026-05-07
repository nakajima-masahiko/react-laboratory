import { INDICATOR_KEYS, type MultiIndicatorResult } from './multi-indicators';

/**
 * JavaScript reference implementation that computes 13 indicator series for
 * the same `prices` input. The numeric algorithms must stay in lock-step with
 * `wasm/sma-benchmark/src/lib.rs` so the result-equality check is meaningful.
 *
 * Output convention: indices < (window - 1) are NaN. RSI is NaN for indices
 * 0..=period - 1. Treat NaN-vs-NaN as a match in the comparator.
 */

function fillSma(prices: Float64Array, window: number, out: Float64Array): void {
  const n = prices.length;
  if (window <= 0 || window > n) return;
  const invW = 1 / window;
  let sum = 0;
  for (let i = 0; i < window; i++) sum += prices[i];
  out[window - 1] = sum * invW;
  for (let i = window; i < n; i++) {
    sum += prices[i] - prices[i - window];
    out[i] = sum * invW;
  }
}

function fillEma(prices: Float64Array, window: number, out: Float64Array): void {
  const n = prices.length;
  if (window <= 0 || window > n) return;
  const alpha = 2 / (window + 1);
  const oneMinusAlpha = 1 - alpha;
  let seed = 0;
  for (let i = 0; i < window; i++) seed += prices[i];
  seed /= window;
  out[window - 1] = seed;
  let prev = seed;
  for (let i = window; i < n; i++) {
    const cur = alpha * prices[i] + oneMinusAlpha * prev;
    out[i] = cur;
    prev = cur;
  }
}

function fillRsi(prices: Float64Array, period: number, out: Float64Array): void {
  const n = prices.length;
  if (period <= 0 || n <= period) return;
  let sumGain = 0;
  let sumLoss = 0;
  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff > 0) sumGain += diff;
    else if (diff < 0) sumLoss -= diff;
  }
  let avgGain = sumGain / period;
  let avgLoss = sumLoss / period;
  out[period] =
    avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  const invP = 1 / period;
  const pMinus1 = period - 1;
  for (let i = period + 1; i < n; i++) {
    const diff = prices[i] - prices[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    avgGain = (avgGain * pMinus1 + gain) * invP;
    avgLoss = (avgLoss * pMinus1 + loss) * invP;
    out[i] =
      avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }
}

function fillBollinger(
  prices: Float64Array,
  window: number,
  outMid: Float64Array,
  outUp: Float64Array,
  outLow: Float64Array,
): void {
  const n = prices.length;
  if (window <= 0 || window > n) return;
  const invW = 1 / window;
  let sum = 0;
  let sumSq = 0;
  for (let i = 0; i < window; i++) {
    sum += prices[i];
    sumSq += prices[i] * prices[i];
  }
  let mean = sum * invW;
  let variance = sumSq * invW - mean * mean;
  if (variance < 0) variance = 0;
  let std = Math.sqrt(variance);
  outMid[window - 1] = mean;
  outUp[window - 1] = mean + 2 * std;
  outLow[window - 1] = mean - 2 * std;
  for (let i = window; i < n; i++) {
    const inV = prices[i];
    const outV = prices[i - window];
    sum += inV - outV;
    sumSq += inV * inV - outV * outV;
    mean = sum * invW;
    variance = sumSq * invW - mean * mean;
    if (variance < 0) variance = 0;
    std = Math.sqrt(variance);
    outMid[i] = mean;
    outUp[i] = mean + 2 * std;
    outLow[i] = mean - 2 * std;
  }
}

function fillMinMax(
  prices: Float64Array,
  window: number,
  outMin: Float64Array,
  outMax: Float64Array,
): void {
  const n = prices.length;
  if (window <= 0 || window > n) return;
  // Two monotonic deques on top of fixed-size ring buffers. We evict the front
  // before pushing the new index, so the deque size never exceeds `window`
  // and capacity = window is sufficient.
  const cap = window;
  const minBuf = new Int32Array(cap);
  const maxBuf = new Int32Array(cap);
  let minHead = 0;
  let minSize = 0;
  let maxHead = 0;
  let maxSize = 0;

  for (let i = 0; i < n; i++) {
    const v = prices[i];

    if (minSize > 0 && minBuf[minHead] + window <= i) {
      minHead = (minHead + 1) % cap;
      minSize--;
    }
    while (minSize > 0) {
      const backIdx = (minHead + minSize - 1) % cap;
      if (prices[minBuf[backIdx]] >= v) minSize--;
      else break;
    }
    minBuf[(minHead + minSize) % cap] = i;
    minSize++;

    if (maxSize > 0 && maxBuf[maxHead] + window <= i) {
      maxHead = (maxHead + 1) % cap;
      maxSize--;
    }
    while (maxSize > 0) {
      const backIdx = (maxHead + maxSize - 1) % cap;
      if (prices[maxBuf[backIdx]] <= v) maxSize--;
      else break;
    }
    maxBuf[(maxHead + maxSize) % cap] = i;
    maxSize++;

    if (i + 1 >= window) {
      outMin[i] = prices[minBuf[minHead]];
      outMax[i] = prices[maxBuf[maxHead]];
    }
  }
}

function allocResult(n: number): MultiIndicatorResult {
  // 13 separate Float64Arrays — one allocation per output series. This is the
  // "natural" JS shape; we are not packing into a single buffer because the
  // benchmark is already heavily skewed towards the JS engine and packing
  // would only shave allocator time, not reveal anything new.
  const result = {} as MultiIndicatorResult;
  for (const key of INDICATOR_KEYS) {
    const arr = new Float64Array(n);
    arr.fill(Number.NaN);
    result[key] = arr;
  }
  return result;
}

export function multiIndicatorsJs(prices: Float64Array): MultiIndicatorResult {
  const n = prices.length;
  const result = allocResult(n);

  fillSma(prices, 5, result.sma5);
  fillSma(prices, 25, result.sma25);
  fillSma(prices, 75, result.sma75);
  fillSma(prices, 200, result.sma200);

  fillEma(prices, 5, result.ema5);
  fillEma(prices, 25, result.ema25);
  fillEma(prices, 75, result.ema75);

  fillRsi(prices, 14, result.rsi14);

  fillBollinger(prices, 20, result.bbMid20, result.bbUp20, result.bbLow20);

  fillMinMax(prices, 100, result.min100, result.max100);

  return result;
}
