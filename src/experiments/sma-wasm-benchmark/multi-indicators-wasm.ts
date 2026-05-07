import {
  INDICATOR_KEYS,
  NUM_SERIES,
  type MultiIndicatorResult,
} from './multi-indicators';
import type { WasmModule } from './wasm-loader';

/**
 * JS-side adapter that calls the single `multi_indicators_f64` WASM export
 * and slices the flat returned buffer into 13 typed-array views — one per
 * indicator. The slicing is cheap: each subarray shares the underlying
 * buffer, no extra allocation or copy.
 */
export function multiIndicatorsWasm(
  module: WasmModule,
  prices: Float64Array,
): MultiIndicatorResult {
  const n = prices.length;
  const flat = module.multiIndicatorsF64(prices);
  if (flat.length !== n * NUM_SERIES) {
    throw new Error(
      `WASM 出力長 ${flat.length} が期待値 ${n * NUM_SERIES} と一致しません。`,
    );
  }
  const result = {} as MultiIndicatorResult;
  for (let k = 0; k < NUM_SERIES; k++) {
    result[INDICATOR_KEYS[k]] = flat.subarray(k * n, (k + 1) * n);
  }
  return result;
}

/**
 * Boundary-cost probe. Calls the no-compute WASM export so the caller can
 * subtract marshalling time from the real call. Discards the returned buffer
 * — only the elapsed time is interesting.
 */
export function multiIndicatorsWasmOverhead(
  module: WasmModule,
  prices: Float64Array,
): void {
  module.multiIndicatorsOverheadF64(prices);
}
