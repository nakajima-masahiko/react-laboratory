// Hand-written ambient types for the `wasm-bindgen --target web` JS shim
// emitted from `wasm/sma-benchmark`. Regenerate the `.js` / `.wasm` files via
// `npm run build:wasm`; this `.d.ts` only needs to track the exported surface.

export function sma_f64(prices: Float64Array, window: number): Float64Array;
export function ready(): boolean;

/**
 * Number of contiguous output series produced by `multi_indicators_f64`.
 * Currently 13. Each series has length `prices.length` in the flat result.
 */
export function num_indicator_series(): number;

/**
 * Compute 13 indicator series in a single JS↔WASM crossing. Returns a flat
 * `Float64Array` of length `prices.length * num_indicator_series()`. Series
 * order is fixed; see the Rust source for the layout.
 */
export function multi_indicators_f64(prices: Float64Array): Float64Array;

/**
 * Boundary-cost probe for `multi_indicators_f64`. Same input/output sizes,
 * no computation. Use to subtract marshalling cost from total time.
 */
export function multi_indicators_overhead_f64(prices: Float64Array): Float64Array;

export type WasmInitInput =
  | string
  | URL
  | Request
  | Response
  | BufferSource
  | WebAssembly.Module
  | Promise<Response | BufferSource | WebAssembly.Module>;

export default function init(
  moduleOrPath?: WasmInitInput | { module_or_path: WasmInitInput },
): Promise<unknown>;

export function initSync(
  module: BufferSource | WebAssembly.Module | { module: BufferSource | WebAssembly.Module },
): unknown;
