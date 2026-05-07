import { useCallback, useMemo, useState } from 'react';
import {
  prepareData,
  runJsBenchmark,
  runWasmBenchmark,
} from './benchmark';
import { compareResults } from './compare';
import { compareMulti, runMultiBenchmark } from './multi-benchmark';
import {
  INDICATOR_KEYS,
  INDICATOR_LABELS,
  NUM_SERIES,
} from './multi-indicators';
import type {
  BenchmarkConfig,
  BenchmarkRun,
  CompareResult,
  MultiBenchmarkConfig,
  MultiBenchmarkRun,
  MultiCompareResult,
} from './types';
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

type SinglePhase = 'idle' | 'preparing' | 'js' | 'wasm' | 'comparing';
type MultiPhase =
  | 'idle'
  | 'preparing'
  | 'js'
  | 'wasm-overhead'
  | 'wasm'
  | 'comparing';

function formatMs(ms: number | null | undefined): string {
  if (ms == null || !Number.isFinite(ms)) return '—';
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

/**
 * Approximate memory used by the Float64Array outputs of one engine. The JS
 * side allocates 13 separate Float64Arrays (size * 8 bytes each); the WASM
 * side allocates one Float64Array of size * NUM_SERIES * 8. Both end up at
 * the same bytes, but we report it explicitly so the user can read the cost
 * of holding the result set in memory.
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GiB`;
}

function SmaWasmBenchmark() {
  const [size, setSize] = useState<number>(SIZE_OPTIONS[0].value);
  const [window, setWindow] = useState<number>(25);
  const [useFixedSeed, setUseFixedSeed] = useState<boolean>(true);
  const [seed, setSeed] = useState<number>(DEFAULT_FIXED_SEED);

  // ---- Single SMA bench state (existing) ----
  const [singlePhase, setSinglePhase] = useState<SinglePhase>('idle');
  const [singleStatus, setSingleStatus] = useState<string>('');
  const [singleError, setSingleError] = useState<string | null>(null);
  const [jsRun, setJsRun] = useState<BenchmarkRun | null>(null);
  const [wasmRun, setWasmRun] = useState<BenchmarkRun | null>(null);
  const [compare, setCompare] = useState<CompareResult | null>(null);

  // ---- Multi-indicator bench state ----
  const [multiPhase, setMultiPhase] = useState<MultiPhase>('idle');
  const [multiStatus, setMultiStatus] = useState<string>('');
  const [multiError, setMultiError] = useState<string | null>(null);
  const [multiRun, setMultiRun] = useState<MultiBenchmarkRun | null>(null);
  const [multiCompare, setMultiCompare] = useState<MultiCompareResult | null>(null);

  const isSingleRunning = singlePhase !== 'idle';
  const isMultiRunning = multiPhase !== 'idle';
  const isAnyRunning = isSingleRunning || isMultiRunning;

  const singleConfig: BenchmarkConfig = useMemo(
    () => ({
      size,
      window,
      warmupRuns: WARMUP_RUNS,
      measurementRuns: MEASUREMENT_RUNS,
      seed: useFixedSeed ? seed : (seed ^ Date.now()) >>> 0,
    }),
    [size, window, useFixedSeed, seed],
  );

  const multiConfig: MultiBenchmarkConfig = useMemo(
    () => ({
      size,
      warmupRuns: WARMUP_RUNS,
      measurementRuns: MEASUREMENT_RUNS,
      seed: useFixedSeed ? seed : (seed ^ Date.now()) >>> 0,
    }),
    [size, useFixedSeed, seed],
  );

  const handleRunSingle = useCallback(
    async (mode: 'js' | 'wasm' | 'both') => {
      setSingleError(null);
      setCompare(null);
      if (mode !== 'wasm') setJsRun(null);
      if (mode !== 'js') setWasmRun(null);

      try {
        setSinglePhase('preparing');
        setSingleStatus(`データ生成中 (${size.toLocaleString()} 件)…`);
        await new Promise((r) => setTimeout(r, 0));
        const data = prepareData(singleConfig);

        let nextJs: BenchmarkRun | null = jsRun;
        let nextWasm: BenchmarkRun | null = wasmRun;

        if (mode === 'js' || mode === 'both') {
          setSinglePhase('js');
          setSingleStatus('JavaScript 版を計測中…');
          nextJs = await runJsBenchmark(data, singleConfig, (kind, idx, total) => {
            setSingleStatus(
              `JS ${kind === 'warmup' ? 'warmup' : 'measure'} ${idx + 1}/${total}`,
            );
          });
          setJsRun(nextJs);
        }

        if (mode === 'wasm' || mode === 'both') {
          setSinglePhase('wasm');
          setSingleStatus('WASM 版を計測中…（初回は init コストを含みます）');
          nextWasm = await runWasmBenchmark(data, singleConfig, (kind, idx, total) => {
            setSingleStatus(
              `WASM ${kind === 'warmup' ? 'warmup' : 'measure'} ${idx + 1}/${total}`,
            );
          });
          setWasmRun(nextWasm);
        }

        if (mode === 'both' && nextJs && nextWasm) {
          setSinglePhase('comparing');
          setSingleStatus('結果一致を判定中…');
          await new Promise((r) => setTimeout(r, 0));
          setCompare(compareResults(nextJs.output, nextWasm.output));
        } else if (jsRun && nextWasm && mode === 'wasm') {
          setCompare(compareResults(jsRun.output, nextWasm.output));
        } else if (nextJs && wasmRun && mode === 'js') {
          setCompare(compareResults(nextJs.output, wasmRun.output));
        }

        setSingleStatus('完了');
      } catch (e) {
        const message =
          e instanceof Error ? e.message : '不明なエラーが発生しました。';
        setSingleError(message);
        setSingleStatus('');
      } finally {
        setSinglePhase('idle');
      }
    },
    [singleConfig, jsRun, size, wasmRun],
  );

  const handleRunMulti = useCallback(async () => {
    setMultiError(null);
    setMultiCompare(null);
    setMultiRun(null);

    try {
      setMultiPhase('preparing');
      setMultiStatus(`データ生成中 (${size.toLocaleString()} 件)…`);
      await new Promise((r) => setTimeout(r, 0));
      const data = prepareData(multiConfig);

      const run = await runMultiBenchmark({
        config: multiConfig,
        data,
        onPhase: (label, phase, idx, total) => {
          if (label === 'js') setMultiPhase('js');
          else if (label === 'wasm-overhead') setMultiPhase('wasm-overhead');
          else setMultiPhase('wasm');
          const phaseLabel =
            label === 'js'
              ? 'JS'
              : label === 'wasm-overhead'
                ? 'WASM overhead'
                : 'WASM';
          setMultiStatus(
            `${phaseLabel} ${phase === 'warmup' ? 'warmup' : 'measure'} ${idx + 1}/${total}`,
          );
        },
      });
      setMultiRun(run);

      setMultiPhase('comparing');
      setMultiStatus('結果一致を判定中…');
      await new Promise((r) => setTimeout(r, 0));
      setMultiCompare(compareMulti(run.jsResult, run.wasmResult));
      setMultiStatus('完了');
    } catch (e) {
      const message =
        e instanceof Error ? e.message : '不明なエラーが発生しました。';
      setMultiError(message);
      setMultiStatus('');
    } finally {
      setMultiPhase('idle');
    }
  }, [multiConfig, size]);

  const jsAvg = jsRun?.averageMs ?? null;
  const wasmAvg = wasmRun?.averageMs ?? null;

  const multiJsAvg = multiRun?.jsAverageMs ?? null;
  const multiWasmAvg = multiRun?.wasmAverageMs ?? null;
  const multiOverheadAvg = multiRun?.wasmOverheadAverageMs ?? null;
  const multiPureCompute =
    multiWasmAvg != null && multiOverheadAvg != null
      ? Math.max(multiWasmAvg - multiOverheadAvg, 0)
      : null;

  // Output memory: 13 series of Float64 (8 B) per element, allocated for
  // both JS and WASM result bags simultaneously while the comparator runs.
  const outputBytesPerEngine = size * NUM_SERIES * 8;

  return (
    <div className="sma-bench">
      <div className="sma-bench__intro">
        <h2>SMA WASM Benchmark</h2>
        <p>JavaScript 版と Rust/WASM 版で「単一 SMA」と「複数インジケータ一括計算」を比較する実験です。</p>
        <p>
          単一 SMA は JS の JIT が極めて速いため差が付きにくいことが分かっています。複数インジケータ一括計算では、
          1 回の WASM 呼び出しで重い処理をまとめて行うことで境界コストを償却し、WASM のメリットが出やすくなります。
        </p>
      </div>

      <section className="sma-bench__controls" aria-label="ベンチマーク設定">
        <div className="sma-bench__control-group">
          <label htmlFor="sma-size">データ件数</label>
          <select
            id="sma-size"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            disabled={isAnyRunning}
          >
            {SIZE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="sma-bench__control-group">
          <label htmlFor="sma-window">SMA 期間 (単一ベンチ用)</label>
          <select
            id="sma-window"
            value={window}
            onChange={(e) => setWindow(Number(e.target.value))}
            disabled={isAnyRunning}
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
              disabled={isAnyRunning || !useFixedSeed}
            />
            <label className="sma-bench__checkbox" htmlFor="sma-seed-fixed">
              <input
                id="sma-seed-fixed"
                type="checkbox"
                checked={useFixedSeed}
                onChange={(e) => setUseFixedSeed(e.target.checked)}
                disabled={isAnyRunning}
              />
              固定
            </label>
          </div>
        </div>
      </section>

      {/* ----- 単一 SMA ベンチ ----- */}
      <section className="sma-bench__panel" aria-label="単一 SMA ベンチ">
        <h3>① 単一 SMA ベンチ</h3>
        <div className="sma-bench__actions">
          <button type="button" onClick={() => handleRunSingle('js')} disabled={isAnyRunning}>
            JavaScript 版を実行
          </button>
          <button type="button" onClick={() => handleRunSingle('wasm')} disabled={isAnyRunning}>
            WASM 版を実行
          </button>
          <button
            type="button"
            className="sma-bench__primary"
            onClick={() => handleRunSingle('both')}
            disabled={isAnyRunning}
          >
            両方実行して比較
          </button>
        </div>

        {(isSingleRunning || singleStatus) && (
          <div className="sma-bench__status" role="status" aria-live="polite">
            {isSingleRunning ? '実行中: ' : ''}
            {singleStatus || 'アイドル'}
          </div>
        )}

        {singleError && (
          <div className="sma-bench__error" role="alert">
            エラー: {singleError}
          </div>
        )}

        <table className="sma-bench__table" style={{ marginTop: 12 }}>
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
              <td className="sma-bench__num">{formatMs(jsAvg)}</td>
              <td className="sma-bench__num">{formatMs(wasmAvg)}</td>
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
              <td className="sma-bench__num">{jsRun ? formatMs(jsRun.generationMs) : '—'}</td>
              <td className="sma-bench__num">{wasmRun ? formatMs(wasmRun.generationMs) : '—'}</td>
            </tr>
            <tr>
              <td>WASM init コスト (初回のみ)</td>
              <td className="sma-bench__num">—</td>
              <td className="sma-bench__num">{formatMs(wasmRun?.wasmInitMs ?? null)}</td>
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
          <span className="sma-bench__match-ok">{speedupLabel(jsAvg, wasmAvg)}</span>
        </p>

        <div className="sma-bench__results-grid" style={{ marginTop: 12 }}>
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

        <section className="sma-bench__panel" aria-label="一致チェック" style={{ marginTop: 12 }}>
          <h3>結果一致チェック</h3>
          {compare ? (
            <table className="sma-bench__table">
              <tbody>
                <tr>
                  <th>判定 (epsilon = {compare.epsilon.toExponential()})</th>
                  <td>
                    <span
                      className={
                        compare.matched ? 'sma-bench__match-ok' : 'sma-bench__match-fail'
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
      </section>

      {/* ----- 複数インジケータ一括ベンチ ----- */}
      <section className="sma-bench__panel" aria-label="複数インジケータ一括ベンチ">
        <h3>② 複数インジケータ一括計算ベンチ</h3>
        <p>
          同じ価格配列に対して、SMA 5 / 25 / 75 / 200、EMA 5 / 25 / 75、RSI 14、Bollinger Bands 20
          (中・上・下)、Rolling min/max 100 の合計 {NUM_SERIES} 系列を一度に計算します。
          WASM 側は <code>multi_indicators_f64</code> を <strong>1 回</strong>だけ呼び出し、出力配列も 1 本にまとめて返します。
        </p>

        <div className="sma-bench__actions">
          <button
            type="button"
            className="sma-bench__primary"
            onClick={handleRunMulti}
            disabled={isAnyRunning}
          >
            JS / WASM を計測して比較
          </button>
        </div>

        {(isMultiRunning || multiStatus) && (
          <div className="sma-bench__status" role="status" aria-live="polite">
            {isMultiRunning ? '実行中: ' : ''}
            {multiStatus || 'アイドル'}
          </div>
        )}

        {multiError && (
          <div className="sma-bench__error" role="alert">
            エラー: {multiError}
          </div>
        )}

        <table className="sma-bench__table" style={{ marginTop: 12 }}>
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
              <td className="sma-bench__num">{formatMs(multiJsAvg)}</td>
              <td className="sma-bench__num">{formatMs(multiWasmAvg)}</td>
            </tr>
            <tr>
              <td>個別計測 (ms)</td>
              <td className="sma-bench__num">
                {multiRun ? multiRun.jsMs.map((v) => v.toFixed(1)).join(' / ') : '—'}
              </td>
              <td className="sma-bench__num">
                {multiRun ? multiRun.wasmMs.map((v) => v.toFixed(1)).join(' / ') : '—'}
              </td>
            </tr>
            <tr>
              <td>データ受け渡し時間 (overhead 推定)</td>
              <td className="sma-bench__num">—</td>
              <td className="sma-bench__num">{formatMs(multiOverheadAvg)}</td>
            </tr>
            <tr>
              <td>純粋計算時間 (WASM 平均 − overhead)</td>
              <td className="sma-bench__num">—</td>
              <td className="sma-bench__num">{formatMs(multiPureCompute)}</td>
            </tr>
            <tr>
              <td>WASM init コスト (初回のみ)</td>
              <td className="sma-bench__num">—</td>
              <td className="sma-bench__num">{formatMs(multiRun?.wasmInitMs ?? null)}</td>
            </tr>
            <tr>
              <td>データ生成時間</td>
              <td className="sma-bench__num" colSpan={2}>
                {multiRun ? formatMs(multiRun.generationMs) : '—'}
              </td>
            </tr>
            <tr>
              <td>計算した出力配列数</td>
              <td className="sma-bench__num" colSpan={2}>
                {NUM_SERIES} 系列 × {size.toLocaleString()} 要素
              </td>
            </tr>
            <tr>
              <td>推定メモリ使用量 (片側出力, Float64)</td>
              <td className="sma-bench__num" colSpan={2}>
                {formatBytes(outputBytesPerEngine)}
              </td>
            </tr>
            <tr>
              <td>実行日時</td>
              <td className="sma-bench__num" colSpan={2}>
                {multiRun?.ranAt ?? '—'}
              </td>
            </tr>
          </tbody>
        </table>

        <p style={{ marginTop: 12 }}>
          <strong>速度倍率 (JS ÷ WASM):</strong>{' '}
          <span className="sma-bench__match-ok">{speedupLabel(multiJsAvg, multiWasmAvg)}</span>
        </p>

        <section className="sma-bench__panel" aria-label="一致チェック" style={{ marginTop: 12 }}>
          <h3>結果一致チェック (指標ごと)</h3>
          {multiCompare ? (
            <>
              <table className="sma-bench__table">
                <tbody>
                  <tr>
                    <th>総合判定 (epsilon = {multiCompare.epsilon.toExponential()})</th>
                    <td>
                      <span
                        className={
                          multiCompare.matched
                            ? 'sma-bench__match-ok'
                            : 'sma-bench__match-fail'
                        }
                      >
                        {multiCompare.matched ? '全指標一致 ✓' : '一部不一致 ✗'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <th>全体最大絶対誤差</th>
                    <td className="sma-bench__num">
                      {multiCompare.overallMaxAbsDiff.toExponential(3)}
                    </td>
                  </tr>
                  {multiCompare.firstMismatchIndicator && (
                    <tr>
                      <th>最初の不一致</th>
                      <td>
                        {multiCompare.firstMismatchIndicator} @ index{' '}
                        {multiCompare.firstMismatchIndex ?? '?'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <table className="sma-bench__table" style={{ marginTop: 12 }}>
                <thead>
                  <tr>
                    <th>指標</th>
                    <th>判定</th>
                    <th className="sma-bench__num">最大絶対誤差</th>
                  </tr>
                </thead>
                <tbody>
                  {INDICATOR_KEYS.map((key) => {
                    const row = multiCompare.perIndicator[key];
                    return (
                      <tr key={key}>
                        <td>{INDICATOR_LABELS[key]}</td>
                        <td>
                          <span
                            className={
                              row.matched ? 'sma-bench__match-ok' : 'sma-bench__match-fail'
                            }
                          >
                            {row.matched ? '一致 ✓' : '不一致 ✗'}
                          </span>
                        </td>
                        <td className="sma-bench__num">
                          {row.maxAbsDiff.toExponential(3)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          ) : (
            <p>計測を実行すると、{NUM_SERIES} 系列それぞれの最大絶対誤差を表示します。NaN 同士は一致扱い。</p>
          )}
        </section>
      </section>

      <section className="sma-bench__notes">
        <h3>SMA 単体では差が出にくい理由</h3>
        <ul>
          <li>
            JS エンジン（V8 / SpiderMonkey）は <code>Float64Array</code> 上の単純な加算・減算ループを
            極めて強力に最適化します。SMA の rolling-sum は分岐がほぼ無く、JIT が SIMD 化に近い水準まで詰められるため、
            ネイティブに近い WASM 実行と同等の速度になりやすいです。
          </li>
          <li>
            WASM 側には毎回必ず <strong>JS↔WASM 境界コスト</strong> が乗ります。具体的には、入力 <code>Float64Array</code> を
            WASM のリニアメモリにコピーする時間と、出力配列を JS 側へコピーして返す時間です。SMA のように 1 系列だけ返す
            軽い計算では、この境界コストが計算自体の時間と同じオーダーになり、WASM の優位性を相殺します。
          </li>
          <li>
            一方、複数インジケータを 1 回の呼び出しでまとめて計算すると、境界コストは「同じ入力 1 回 + 全出力 1 回」で
            済みます。計算量は <code>{NUM_SERIES}</code> 倍になっても境界コストは増えないので、WASM の純粋計算速度の良さが効いてきます。
          </li>
          <li>
            つまり「SMA 単体ベンチで差が出ない」のは <em>WASM が遅いから</em> ではなく、
            <em>計算が軽すぎて境界コストが支配的になるから</em>です。重い処理をまとめて WASM に渡すことが、実用上の鉄則です。
          </li>
        </ul>
      </section>

      <section className="sma-bench__notes">
        <h3>注意事項</h3>
        <ul>
          <li>
            WASM は JS↔WASM 境界コストがあるため、要素ごとに呼び出すのではなく、Float64Array
            を一括で渡しています。マルチインジケータ版でも入力 1 回・出力 1 回しか配列をコピーしません。
          </li>
          <li>
            ベンチマークは DOM 描画や React state 更新ではなく、CPU 集約的な数値計算の比較です。
            状態更新は最小限に抑え、計測中はメインスレッドに setTimeout で yield しています。
          </li>
          <li>
            初回 WASM 実行には init コスト（フェッチ + コンパイル + インスタンス化）が含まれます。
            ウォームアップ {WARMUP_RUNS} 回 + 計測 {MEASUREMENT_RUNS} 回平均で、init コストは別カラム表示です。
          </li>
          <li>
            5,000,000 件などの大きい設定では、ブラウザのタブが一時的に固まることがあります。Web Worker 化が次の改善ポイントです。
          </li>
        </ul>
      </section>
    </div>
  );
}

export default SmaWasmBenchmark;
