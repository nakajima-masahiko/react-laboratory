import { useCallback, useMemo, useState } from 'react';
import {
  prepareData,
  runJsBenchmark,
  runWasmBenchmark,
} from './benchmark';
import { compareResults } from './compare';
import type { BenchmarkConfig, BenchmarkRun, CompareResult } from './types';
import './styles.css';

const SIZE_OPTIONS = [
  { value: 100_000, label: '100,000' },
  { value: 1_000_000, label: '1,000,000' },
  { value: 5_000_000, label: '5,000,000' },
] as const;

const WINDOW_OPTIONS = [5, 25, 75, 200] as const;

const DEFAULT_FIXED_SEED = 20260507;
const WARMUP_RUNS = 1;
const MEASUREMENT_RUNS = 3;
const PREVIEW_COUNT = 8;

type Phase = 'idle' | 'preparing' | 'js' | 'wasm' | 'comparing';

function formatMs(ms: number): string {
  if (!Number.isFinite(ms)) return '—';
  if (ms < 1) return `${ms.toFixed(3)} ms`;
  if (ms < 100) return `${ms.toFixed(2)} ms`;
  return `${ms.toFixed(1)} ms`;
}

function formatNumber(value: number): string {
  if (Number.isNaN(value)) return 'NaN';
  if (!Number.isFinite(value)) return value > 0 ? '∞' : '-∞';
  return value.toFixed(4);
}

function formatPreview(values: Float64Array, count: number): string {
  const limit = Math.min(values.length, count);
  const slice: string[] = [];
  for (let i = 0; i < limit; i++) {
    slice.push(`[${i}] ${formatNumber(values[i])}`);
  }
  return slice.join('\n');
}

function speedupLabel(jsMs: number | null, wasmMs: number | null): string {
  if (jsMs == null || wasmMs == null) return '—';
  if (wasmMs <= 0) return '—';
  const ratio = jsMs / wasmMs;
  return `${ratio.toFixed(2)}x`;
}

function SmaWasmBenchmark() {
  const [size, setSize] = useState<number>(SIZE_OPTIONS[0].value);
  const [window, setWindow] = useState<number>(25);
  const [useFixedSeed, setUseFixedSeed] = useState<boolean>(true);
  const [seed, setSeed] = useState<number>(DEFAULT_FIXED_SEED);

  const [phase, setPhase] = useState<Phase>('idle');
  const [statusText, setStatusText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [jsRun, setJsRun] = useState<BenchmarkRun | null>(null);
  const [wasmRun, setWasmRun] = useState<BenchmarkRun | null>(null);
  const [compare, setCompare] = useState<CompareResult | null>(null);

  const isRunning = phase !== 'idle';

  const config: BenchmarkConfig = useMemo(
    () => ({
      size,
      window,
      warmupRuns: WARMUP_RUNS,
      measurementRuns: MEASUREMENT_RUNS,
      seed: useFixedSeed ? seed : (seed ^ Date.now()) >>> 0,
    }),
    [size, window, useFixedSeed, seed],
  );

  const handleRun = useCallback(
    async (mode: 'js' | 'wasm' | 'both') => {
      setError(null);
      setCompare(null);
      if (mode !== 'wasm') setJsRun(null);
      if (mode !== 'js') setWasmRun(null);

      try {
        setPhase('preparing');
        setStatusText(`データ生成中 (${size.toLocaleString()} 件)…`);
        // Yield once so React can paint the disabled/状態 UI before
        // the synchronous typed-array fill starts.
        await new Promise((r) => setTimeout(r, 0));
        const data = prepareData(config);

        let nextJs: BenchmarkRun | null = jsRun;
        let nextWasm: BenchmarkRun | null = wasmRun;

        if (mode === 'js' || mode === 'both') {
          setPhase('js');
          setStatusText('JavaScript 版を計測中…');
          nextJs = await runJsBenchmark(data, config, (kind, idx, total) => {
            setStatusText(
              `JS ${kind === 'warmup' ? 'warmup' : 'measure'} ${idx + 1}/${total}`,
            );
          });
          setJsRun(nextJs);
        }

        if (mode === 'wasm' || mode === 'both') {
          setPhase('wasm');
          setStatusText('WASM 版を計測中…（初回は init コストを含みます）');
          nextWasm = await runWasmBenchmark(data, config, (kind, idx, total) => {
            setStatusText(
              `WASM ${kind === 'warmup' ? 'warmup' : 'measure'} ${idx + 1}/${total}`,
            );
          });
          setWasmRun(nextWasm);
        }

        if (mode === 'both' && nextJs && nextWasm) {
          setPhase('comparing');
          setStatusText('結果一致を判定中…');
          await new Promise((r) => setTimeout(r, 0));
          setCompare(compareResults(nextJs.output, nextWasm.output));
        } else if (jsRun && nextWasm && mode === 'wasm') {
          setCompare(compareResults(jsRun.output, nextWasm.output));
        } else if (nextJs && wasmRun && mode === 'js') {
          setCompare(compareResults(nextJs.output, wasmRun.output));
        }

        setStatusText('完了');
      } catch (e) {
        const message =
          e instanceof Error ? e.message : '不明なエラーが発生しました。';
        setError(message);
        setStatusText('');
      } finally {
        setPhase('idle');
      }
    },
    [config, jsRun, size, wasmRun],
  );

  const jsAvg = jsRun?.averageMs ?? null;
  const wasmAvg = wasmRun?.averageMs ?? null;

  return (
    <div className="sma-bench">
      <div className="sma-bench__intro">
        <h2>SMA WASM Benchmark</h2>
        <p>JavaScript 版と Rust/WASM 版の SMA（単純移動平均）計算速度を比較する実験です。</p>
        <p>
          同一の疑似価格配列に対して 2 つの実装を走らせ、処理時間・結果一致・速度倍率を比較します。
        </p>
      </div>

      <section className="sma-bench__controls" aria-label="ベンチマーク設定">
        <div className="sma-bench__control-group">
          <label htmlFor="sma-size">データ件数</label>
          <select
            id="sma-size"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            disabled={isRunning}
          >
            {SIZE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="sma-bench__control-group">
          <label htmlFor="sma-window">SMA 期間</label>
          <select
            id="sma-window"
            value={window}
            onChange={(e) => setWindow(Number(e.target.value))}
            disabled={isRunning}
          >
            {WINDOW_OPTIONS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>

        <div className="sma-bench__control-group">
          <label>乱数 seed</label>
          <div className="sma-bench__seed-row">
            <input
              id="sma-seed"
              type="number"
              value={seed}
              onChange={(e) => setSeed(Number(e.target.value) || 0)}
              disabled={isRunning || !useFixedSeed}
            />
            <label className="sma-bench__checkbox" htmlFor="sma-seed-fixed">
              <input
                id="sma-seed-fixed"
                type="checkbox"
                checked={useFixedSeed}
                onChange={(e) => setUseFixedSeed(e.target.checked)}
                disabled={isRunning}
              />
              固定
            </label>
          </div>
        </div>
      </section>

      <div className="sma-bench__actions">
        <button
          type="button"
          onClick={() => handleRun('js')}
          disabled={isRunning}
        >
          JavaScript 版を実行
        </button>
        <button
          type="button"
          onClick={() => handleRun('wasm')}
          disabled={isRunning}
        >
          WASM 版を実行
        </button>
        <button
          type="button"
          className="sma-bench__primary"
          onClick={() => handleRun('both')}
          disabled={isRunning}
        >
          両方実行して比較
        </button>
      </div>

      {(isRunning || statusText) && (
        <div className="sma-bench__status" role="status" aria-live="polite">
          {isRunning ? '実行中: ' : ''}
          {statusText || 'アイドル'}
        </div>
      )}

      {error && (
        <div className="sma-bench__error" role="alert">
          エラー: {error}
        </div>
      )}

      <section className="sma-bench__panel" aria-label="比較結果">
        <h3>計測結果</h3>
        <table className="sma-bench__table">
          <thead>
            <tr>
              <th>項目</th>
              <th className="sma-bench__num">JavaScript</th>
              <th className="sma-bench__num">WASM (Rust)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>平均処理時間 ({MEASUREMENT_RUNS} 回平均, warmup {WARMUP_RUNS} 回)</td>
              <td className="sma-bench__num">{jsAvg != null ? formatMs(jsAvg) : '—'}</td>
              <td className="sma-bench__num">{wasmAvg != null ? formatMs(wasmAvg) : '—'}</td>
            </tr>
            <tr>
              <td>個別計測 (ms)</td>
              <td className="sma-bench__num">
                {jsRun ? jsRun.individualMs.map((v) => v.toFixed(2)).join(' / ') : '—'}
              </td>
              <td className="sma-bench__num">
                {wasmRun ? wasmRun.individualMs.map((v) => v.toFixed(2)).join(' / ') : '—'}
              </td>
            </tr>
            <tr>
              <td>データ生成時間</td>
              <td className="sma-bench__num">
                {jsRun ? formatMs(jsRun.generationMs) : '—'}
              </td>
              <td className="sma-bench__num">
                {wasmRun ? formatMs(wasmRun.generationMs) : '—'}
              </td>
            </tr>
            <tr>
              <td>WASM init コスト (初回のみ)</td>
              <td className="sma-bench__num">—</td>
              <td className="sma-bench__num">
                {wasmRun?.wasmInitMs != null ? formatMs(wasmRun.wasmInitMs) : '—'}
              </td>
            </tr>
            <tr>
              <td>実行日時</td>
              <td className="sma-bench__num">{jsRun?.ranAt ?? '—'}</td>
              <td className="sma-bench__num">{wasmRun?.ranAt ?? '—'}</td>
            </tr>
          </tbody>
        </table>

        <p style={{ marginTop: 12 }}>
          <strong>速度倍率 (JS ÷ WASM):</strong>{' '}
          <span className="sma-bench__match-ok">
            {speedupLabel(jsAvg, wasmAvg)}
          </span>
        </p>
      </section>

      <div className="sma-bench__results-grid">
        <section className="sma-bench__panel" aria-label="JS 結果プレビュー">
          <h3>JS 結果 先頭 {PREVIEW_COUNT} 件</h3>
          <pre className="sma-bench__preview">
            {jsRun ? formatPreview(jsRun.output, PREVIEW_COUNT) : '未実行'}
          </pre>
        </section>
        <section className="sma-bench__panel" aria-label="WASM 結果プレビュー">
          <h3>WASM 結果 先頭 {PREVIEW_COUNT} 件</h3>
          <pre className="sma-bench__preview">
            {wasmRun ? formatPreview(wasmRun.output, PREVIEW_COUNT) : '未実行'}
          </pre>
        </section>
      </div>

      <section className="sma-bench__panel" aria-label="一致チェック">
        <h3>結果一致チェック</h3>
        {compare ? (
          <table className="sma-bench__table">
            <tbody>
              <tr>
                <th>判定 (epsilon = {compare.epsilon.toExponential()})</th>
                <td>
                  <span
                    className={
                      compare.matched
                        ? 'sma-bench__match-ok'
                        : 'sma-bench__match-fail'
                    }
                  >
                    {compare.matched ? '一致 ✓' : '不一致 ✗'}
                  </span>
                </td>
              </tr>
              <tr>
                <th>最大絶対誤差</th>
                <td className="sma-bench__num">{compare.maxAbsDiff.toExponential(3)}</td>
              </tr>
              <tr>
                <th>比較件数</th>
                <td className="sma-bench__num">{compare.comparedCount.toLocaleString()}</td>
              </tr>
              {compare.firstMismatchIndex != null && (
                <tr>
                  <th>最初の不一致 index</th>
                  <td className="sma-bench__num">{compare.firstMismatchIndex}</td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <p>「両方実行して比較」を押すと、JS と WASM の結果配列を要素単位で比較します。NaN 同士は一致扱い。</p>
        )}
      </section>

      <section className="sma-bench__notes">
        <h3>注意事項</h3>
        <ul>
          <li>
            WASM は JS↔WASM 境界コストがあるため、要素ごとに呼び出すのではなく、Float64Array
            を一括で渡しています（ここで測っているのは純粋な計算時間 + 1 回分の境界コストです）。
          </li>
          <li>
            このベンチマークは DOM 描画や React state 更新ではなく、CPU 集約的な数値計算の比較
            です。state 更新は最小限に抑えています。
          </li>
          <li>
            初回 WASM 実行には init コスト（ダウンロード + コンパイル + インスタンス化）が含まれます。
            ウォームアップ {WARMUP_RUNS} 回 + 計測 {MEASUREMENT_RUNS} 回平均で、init コストは
            別カラムで分離表示しています。
          </li>
          <li>
            5,000,000 件 × ウィンドウ 200 などの大きい設定では、ブラウザのタブが一時的に固まる
            ことがあります。Web Worker 化が次の改善ポイントです。
          </li>
        </ul>
      </section>
    </div>
  );
}

export default SmaWasmBenchmark;
