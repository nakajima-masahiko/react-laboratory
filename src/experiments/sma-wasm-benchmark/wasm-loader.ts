import init, {
  multi_indicators_f64,
  multi_indicators_overhead_f64,
  num_indicator_series,
  ready,
  sma_f64,
} from './wasm-pkg/sma_benchmark.js';
import wasmUrl from './wasm-pkg/sma_benchmark_bg.wasm?url';

export interface WasmModule {
  smaF64(prices: Float64Array, window: number): Float64Array;
  multiIndicatorsF64(prices: Float64Array): Float64Array;
  multiIndicatorsOverheadF64(prices: Float64Array): Float64Array;
  numIndicatorSeries(): number;
  ready(): boolean;
}

interface LoadResult {
  module: WasmModule;
  initMs: number;
}

let cachedPromise: Promise<LoadResult> | null = null;

/**
 * Load and instantiate the wasm-bindgen module.
 *
 * - Initialization is cached: subsequent calls resolve to the same instance and
 *   the reported `initMs` is the cost of the *first* successful init only.
 * - The init time is measured separately from any computation so the UI can
 *   show "WASM init cost" vs. "compute cost" independently.
 * - On failure (no WebAssembly support, fetch failure, etc.) the cached
 *   promise is cleared so the user can retry after fixing the environment.
 */
export function loadWasm(): Promise<LoadResult> {
  if (cachedPromise) return cachedPromise;

  cachedPromise = (async () => {
    if (typeof WebAssembly === 'undefined') {
      throw new Error('この環境では WebAssembly が利用できません。');
    }

    const start = performance.now();
    await init(wasmUrl);
    const initMs = performance.now() - start;

    if (!ready()) {
      throw new Error('WASM モジュールの ready() ハンドシェイクに失敗しました。');
    }

    const module: WasmModule = {
      smaF64: sma_f64,
      multiIndicatorsF64: multi_indicators_f64,
      multiIndicatorsOverheadF64: multi_indicators_overhead_f64,
      numIndicatorSeries: num_indicator_series,
      ready,
    };

    return { module, initMs };
  })().catch((err) => {
    cachedPromise = null;
    throw err;
  });

  return cachedPromise;
}
