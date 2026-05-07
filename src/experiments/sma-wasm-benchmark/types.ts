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
