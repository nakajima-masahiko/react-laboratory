import type { IndicatorKey, MultiIndicatorResult } from './multi-indicators';

export type Engine = 'js' | 'wasm';

export interface BenchmarkConfig {
  size: number;
  window: number;
  warmupRuns: number;
  measurementRuns: number;
  seed: number;
}

export interface BenchmarkRun {
  engine: Engine;
  size: number;
  window: number;
  warmupRuns: number;
  measurementRuns: number;
  individualMs: number[];
  averageMs: number;
  output: Float64Array;
  generationMs: number;
  wasmInitMs: number | null;
  ranAt: string;
}

export interface CompareResult {
  matched: boolean;
  maxAbsDiff: number;
  firstMismatchIndex: number | null;
  comparedCount: number;
  epsilon: number;
}

export interface PreparedData {
  prices: Float64Array;
  generationMs: number;
}

/**
 * Multi-indicator benchmark — JS vs WASM run together against the same input
 * so the comparison is meaningful even though the JS path doesn't pay any
 * boundary cost.
 */
export interface MultiBenchmarkConfig {
  size: number;
  warmupRuns: number;
  measurementRuns: number;
  seed: number;
}

export interface MultiBenchmarkRun {
  size: number;
  warmupRuns: number;
  measurementRuns: number;
  jsMs: number[];
  jsAverageMs: number;
  wasmMs: number[];
  wasmAverageMs: number;
  /** WASM call with the same input/output sizes but no compute — boundary cost only. */
  wasmOverheadMs: number[];
  wasmOverheadAverageMs: number;
  wasmInitMs: number;
  generationMs: number;
  jsResult: MultiIndicatorResult;
  wasmResult: MultiIndicatorResult;
  ranAt: string;
}

export interface MultiCompareResult {
  matched: boolean;
  epsilon: number;
  overallMaxAbsDiff: number;
  firstMismatchIndicator: string | null;
  firstMismatchIndex: number | null;
  perIndicator: Record<
    IndicatorKey,
    {
      matched: boolean;
      maxAbsDiff: number;
      firstMismatchIndex: number | null;
    }
  >;
}
