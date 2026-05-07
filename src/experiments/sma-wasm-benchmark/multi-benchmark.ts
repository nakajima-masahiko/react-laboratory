import { multiIndicatorsJs } from './multi-indicators-js';
import { INDICATOR_KEYS, type MultiIndicatorResult } from './multi-indicators';
import {
  multiIndicatorsWasm,
  multiIndicatorsWasmOverhead,
} from './multi-indicators-wasm';
import { loadWasm } from './wasm-loader';
import type {
  MultiBenchmarkConfig,
  MultiBenchmarkRun,
  MultiCompareResult,
  PreparedData,
} from './types';

function yieldToBrowser(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  let s = 0;
  for (const v of values) s += v;
  return s / values.length;
}

async function timeRuns(
  fn: () => unknown,
  warmupRuns: number,
  measurementRuns: number,
  onPhase?: (phase: 'warmup' | 'measure', i: number, total: number) => void,
): Promise<number[]> {
  for (let i = 0; i < warmupRuns; i++) {
    onPhase?.('warmup', i, warmupRuns);
    fn();
    await yieldToBrowser();
  }
  const ms: number[] = [];
  for (let i = 0; i < measurementRuns; i++) {
    onPhase?.('measure', i, measurementRuns);
    const start = performance.now();
    fn();
    ms.push(performance.now() - start);
    await yieldToBrowser();
  }
  return ms;
}

export interface RunMultiBenchmarkOptions {
  config: MultiBenchmarkConfig;
  data: PreparedData;
  onPhase?: (
    label: 'js' | 'wasm-overhead' | 'wasm',
    phase: 'warmup' | 'measure',
    index: number,
    total: number,
  ) => void;
}

export async function runMultiBenchmark(
  options: RunMultiBenchmarkOptions,
): Promise<MultiBenchmarkRun> {
  const { config, data, onPhase } = options;
  const { warmupRuns, measurementRuns } = config;

  // Hold the latest outputs so we can compare them after timing finishes.
  let lastJs: MultiIndicatorResult | null = null;
  let lastWasm: MultiIndicatorResult | null = null;

  // ---- JS ----
  const jsMs = await timeRuns(
    () => {
      lastJs = multiIndicatorsJs(data.prices);
    },
    warmupRuns,
    measurementRuns,
    (phase, i, total) => onPhase?.('js', phase, i, total),
  );

  // ---- WASM init ----
  const { module, initMs: wasmInitMs } = await loadWasm();

  // ---- WASM boundary-only probe ----
  const wasmOverheadMs = await timeRuns(
    () => {
      multiIndicatorsWasmOverhead(module, data.prices);
    },
    warmupRuns,
    measurementRuns,
    (phase, i, total) => onPhase?.('wasm-overhead', phase, i, total),
  );

  // ---- WASM real call ----
  const wasmMs = await timeRuns(
    () => {
      lastWasm = multiIndicatorsWasm(module, data.prices);
    },
    warmupRuns,
    measurementRuns,
    (phase, i, total) => onPhase?.('wasm', phase, i, total),
  );

  if (!lastJs || !lastWasm) {
    throw new Error('内部エラー: マルチインジケータの最終結果が取得できませんでした。');
  }

  return {
    size: config.size,
    warmupRuns,
    measurementRuns,
    jsMs,
    jsAverageMs: average(jsMs),
    wasmMs,
    wasmAverageMs: average(wasmMs),
    wasmOverheadMs,
    wasmOverheadAverageMs: average(wasmOverheadMs),
    wasmInitMs,
    generationMs: data.generationMs,
    jsResult: lastJs,
    wasmResult: lastWasm,
    ranAt: new Date().toISOString(),
  };
}

/**
 * Compare two MultiIndicatorResult bags element-by-element. NaN-vs-NaN counts
 * as a match. Returns an overall verdict plus per-indicator max-abs-diff.
 */
export function compareMulti(
  js: MultiIndicatorResult,
  wasm: MultiIndicatorResult,
  epsilon = 1e-9,
): MultiCompareResult {
  let overallMaxAbsDiff = 0;
  let allMatched = true;
  let firstMismatchIndicator: string | null = null;
  let firstMismatchIndex: number | null = null;
  const perIndicator = {} as MultiCompareResult['perIndicator'];

  for (const key of INDICATOR_KEYS) {
    const a = js[key];
    const b = wasm[key];
    let maxAbsDiff = 0;
    let mismatchIndex: number | null = null;
    let matched = true;

    if (a.length !== b.length) {
      perIndicator[key] = {
        matched: false,
        maxAbsDiff: Number.POSITIVE_INFINITY,
        firstMismatchIndex: 0,
      };
      allMatched = false;
      if (firstMismatchIndicator === null) {
        firstMismatchIndicator = key;
        firstMismatchIndex = 0;
      }
      overallMaxAbsDiff = Number.POSITIVE_INFINITY;
      continue;
    }

    for (let i = 0; i < a.length; i++) {
      const av = a[i];
      const bv = b[i];
      const aNaN = Number.isNaN(av);
      const bNaN = Number.isNaN(bv);
      if (aNaN && bNaN) continue;
      if (aNaN !== bNaN) {
        matched = false;
        if (mismatchIndex === null) mismatchIndex = i;
        maxAbsDiff = Number.POSITIVE_INFINITY;
        continue;
      }
      const diff = Math.abs(av - bv);
      if (diff > maxAbsDiff) maxAbsDiff = diff;
      if (diff > epsilon && mismatchIndex === null) {
        matched = false;
        mismatchIndex = i;
      }
    }

    perIndicator[key] = {
      matched,
      maxAbsDiff,
      firstMismatchIndex: mismatchIndex,
    };
    if (maxAbsDiff > overallMaxAbsDiff) overallMaxAbsDiff = maxAbsDiff;
    if (!matched && firstMismatchIndicator === null) {
      firstMismatchIndicator = key;
      firstMismatchIndex = mismatchIndex;
    }
    if (!matched) allMatched = false;
  }

  return {
    matched: allMatched,
    epsilon,
    overallMaxAbsDiff,
    firstMismatchIndicator,
    firstMismatchIndex,
    perIndicator,
  };
}
