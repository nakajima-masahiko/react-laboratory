// Hand-written ambient types for the `wasm-bindgen --target web` JS shim
// emitted from `wasm/sma-benchmark`. Regenerate the `.js` / `.wasm` files via
// `npm run build:wasm`; this `.d.ts` only needs to track the exported surface.

export function sma_f64(prices: Float64Array, window: number): Float64Array;
export function ready(): boolean;

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
