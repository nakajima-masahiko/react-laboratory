import { generatePrices } from './data-generator';
import { smaJs } from './sma-js';
import { loadWasm } from './wasm-loader';
import type {
  BenchmarkConfig,
  BenchmarkRun,
  Engine,
  PreparedData,
} from './types';

/**
 * Yield to the browser between heavy steps so the main thread can paint and the
 * "computing…" UI doesn't freeze visibly. Cheap and good enough as a stand-in
 * for moving the work into a Web Worker (the kernel functions themselves are
 * already pure-data, so they can be ported to a worker without changes).
 */
function yieldToBrowser(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export type SmaKernel = (prices: Float64Array, window: number) => Float64Array;

export interface RunSingleEngineOptions {
  engine: Engine;
  prices: Float64Array;
  config: BenchmarkConfig;
  generationMs: number;
  /** Optional progress callback fired before each warmup / measurement run. */
  onPhase?: (phase: 'warmup' | 'measure', index: number, total: number) => void;
}

async function runWithKernel(
  kernel: SmaKernel,
  options: RunSingleEngineOptions,
  wasmInitMs: number | null,
): Promise<BenchmarkRun> {
  const { engine, prices, config, generationMs, onPhase } = options;
  const { window, warmupRuns, measurementRuns } = config;

  let lastOutput: Float64Array | null = null;

  for (let i = 0; i < warmupRuns; i++) {
    onPhase?.('warmup', i, warmupRuns);
    lastOutput = kernel(prices, window);
    await yieldToBrowser();
  }

  const individualMs: number[] = [];
  for (let i = 0; i < measurementRuns; i++) {
    onPhase?.('measure', i, measurementRuns);
    const start = performance.now();
    lastOutput = kernel(prices, window);
    const elapsed = performance.now() - start;
    individualMs.push(elapsed);
    await yieldToBrowser();
  }

  if (!lastOutput) {
    // Should never happen because warmupRuns + measurementRuns >= 1 in the UI,
    // but keep the path total to satisfy the type checker.
    lastOutput = kernel(prices, window);
  }

  const averageMs =
    individualMs.length === 0
      ? 0
      : individualMs.reduce((a, b) => a + b, 0) / individualMs.length;

  return {
    engine,
    size: config.size,
    window: config.window,
    warmupRuns,
    measurementRuns,
    individualMs,
    averageMs,
    output: lastOutput,
    generationMs,
    wasmInitMs,
    ranAt: new Date().toISOString(),
  };
}

export interface RunBenchmarkOptions {
  config: BenchmarkConfig;
  /** Reuse a previously generated price series — required so JS / WASM see identical input. */
  prices?: Float64Array;
  /** If `prices` is omitted this generation cost is included; otherwise it is reported as 0. */
  onPhase?: RunSingleEngineOptions['onPhase'];
}

export function prepareData(
  config: Pick<BenchmarkConfig, 'size' | 'seed'>,
): PreparedData {
  const start = performance.now();
  const prices = generatePrices({ count: config.size, seed: config.seed });
  const generationMs = performance.now() - start;
  return { prices, generationMs };
}

export async function runJsBenchmark(
  data: PreparedData,
  config: BenchmarkConfig,
  onPhase?: RunSingleEngineOptions['onPhase'],
): Promise<BenchmarkRun> {
  return runWithKernel(
    smaJs,
    {
      engine: 'js',
      prices: data.prices,
      config,
      generationMs: data.generationMs,
      onPhase,
    },
    null,
  );
}

export async function runWasmBenchmark(
  data: PreparedData,
  config: BenchmarkConfig,
  onPhase?: RunSingleEngineOptions['onPhase'],
): Promise<BenchmarkRun> {
  const { module, initMs } = await loadWasm();
  return runWithKernel(
    (prices, window) => module.smaF64(prices, window),
    {
      engine: 'wasm',
      prices: data.prices,
      config,
      generationMs: data.generationMs,
      onPhase,
    },
    initMs,
  );
}
