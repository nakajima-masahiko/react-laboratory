import { useCallback, useEffect, useRef, useState } from 'react';
import { CandleChart, type Candle } from 'candle-core';
import {
  INDICATOR_PRESETS,
  type DatasetSize,
  type IndicatorKey,
  type IndicatorPreset,
  type IndicatorVisibility,
  type InteractionMode,
  type RangePreset,
  type RealtimeMode,
} from './config';
import { createSeededRandom, makeCandles, makeNextCandle, TIMEFRAME_MS } from './data';

type RenderStats = ReturnType<CandleChart['getRenderStats']>;

export interface LabMetrics {
  barCount: number;
  burstElapsedMs: number | null;
  effectiveTicksPerSecond: number | null;
  fps: number;
  fpsAvg: number | null;
  fpsMin: number | null;
  generationMs: number;
  renderStats: RenderStats | null;
  setDataMs: number;
  spread: number | null;
  ticksSent: number;
  visibleRange: { start: number; end: number } | null;
}

const INITIAL_SIZE: DatasetSize = 180;
const INITIAL_SEED = 7;
const INITIAL_NAVIGATOR = { visible: true, height: 72, maxOverviewPoints: 1600 };
/** Rolling window length for FPS min/avg (sampled every 300 ms → ~6 s). */
const FPS_SAMPLE_WINDOW = 20;

function readVisibleRange(chart: CandleChart): { start: number; end: number } | null {
  const range = chart.getVisibleRange();
  if (!range) return null;
  return { start: range.start, end: range.end };
}

export function useCandleCoreLab() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<CandleChart | null>(null);
  const candlesRef = useRef<Candle[]>(makeCandles(INITIAL_SIZE, INITIAL_SEED));
  const seedRef = useRef(INITIAL_SEED);
  const tickRandomRef = useRef(createSeededRandom(INITIAL_SEED + 1));
  const midRef = useRef(candlesRef.current.at(-1)?.close ?? 150);
  const tickBucketRef = useRef(candlesRef.current.at(-1)?.time ?? 0);
  const ticksSentRef = useRef(0);
  const burstRunRef = useRef(0);
  const mountedRef = useRef(false);
  const visibilityRef = useRef<IndicatorVisibility>(INDICATOR_PRESETS.all);
  const interactionModeRef = useRef<InteractionMode>('pan');
  const navigatorRef = useRef(INITIAL_NAVIGATOR);
  const fpsSamplesRef = useRef<number[]>([]);

  const [datasetSize, setDatasetSize] = useState<DatasetSize>(INITIAL_SIZE);
  const [realtimeMode, setRealtimeMode] = useState<RealtimeMode>('off');
  const [interactionMode, setInteractionModeState] = useState<InteractionMode>('pan');
  const [navigator, setNavigator] = useState(INITIAL_NAVIGATOR);
  const [visible, setVisible] = useState<IndicatorVisibility>(INDICATOR_PRESETS.all);
  const [isBusy, setIsBusy] = useState(false);
  const [scenarioNote, setScenarioNote] = useState('Choose a scenario or configure the console manually.');
  const [metrics, setMetrics] = useState<LabMetrics>({
    barCount: INITIAL_SIZE,
    burstElapsedMs: null,
    effectiveTicksPerSecond: null,
    fps: 0,
    fpsAvg: null,
    fpsMin: null,
    generationMs: 0,
    renderStats: null,
    setDataMs: 0,
    spread: null,
    ticksSent: 0,
    visibleRange: null,
  });

  const setInteractionMode = useCallback((mode: InteractionMode) => {
    interactionModeRef.current = mode;
    setInteractionModeState(mode);
    chartRef.current?.applyOptions({ interaction: { dragMode: mode } });
  }, []);

  const applyNavigator = useCallback((next: typeof INITIAL_NAVIGATOR) => {
    navigatorRef.current = next;
    setNavigator(next);
    chartRef.current?.applyOptions({ navigator: next });
  }, []);

  const setNavigatorVisible = useCallback((visible: boolean) => {
    applyNavigator({ ...navigatorRef.current, visible });
  }, [applyNavigator]);

  const setNavigatorHeight = useCallback((height: number) => {
    if (!Number.isFinite(height)) return;
    applyNavigator({ ...navigatorRef.current, height: Math.min(160, Math.max(48, height)) });
  }, [applyNavigator]);

  const setNavigatorMaxOverviewPoints = useCallback((maxOverviewPoints: number) => {
    if (!Number.isFinite(maxOverviewPoints)) return;
    applyNavigator({ ...navigatorRef.current, maxOverviewPoints: Math.min(5000, Math.max(200, maxOverviewPoints)) });
  }, [applyNavigator]);

  const showRangePreset = useCallback((preset: RangePreset) => {
    const chart = chartRef.current;
    const candles = candlesRef.current;
    if (!chart || candles.length === 0) return;
    const windowSize = Math.max(1, Math.ceil(candles.length * 0.1));
    const maxStart = Math.max(0, candles.length - windowSize);
    const startIndex = preset === 'first' ? 0 : preset === 'last' ? maxStart : Math.floor(maxStart / 2);
    const endIndex = Math.min(candles.length - 1, startIndex + windowSize - 1);
    chart.setVisibleRange({ start: candles[startIndex].time, end: candles[endIndex].time });
  }, []);

  const applyIndicatorVisibility = useCallback((next: IndicatorVisibility) => {
    visibilityRef.current = next;
    chartRef.current?.applyOptions({
      sma: { visible: next.sma, period: 20, color: '#f5a623', lineWidth: 2 },
      ema: { visible: next.ema, period: 20, color: '#42a5f5', lineWidth: 2 },
      bollingerBands: {
        visible: next.bollingerBands,
        period: 20,
        stdDev: 2,
        middleColor: '#ffb300',
        upperColor: '#7e57c2',
        lowerColor: '#7e57c2',
        fillColor: 'rgba(126, 87, 194, 0.12)',
        lineWidth: 2,
      },
      rsi: {
        visible: next.rsi,
        period: 14,
        color: '#7e57c2',
        lineWidth: 2,
        overbought: 70,
        oversold: 30,
        showMiddleLine: true,
        middleLineValue: 50,
        paneHeight: 110,
      },
      macd: {
        visible: next.macd,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
        macdColor: '#42a5f5',
        signalColor: '#ffb300',
        histogramPositiveColor: '#26a69a',
        histogramNegativeColor: '#ef5350',
        showZeroLine: true,
        paneHeight: 110,
      },
      bidAskOverlay: {
        visible: next.bidAskOverlay,
        bidColor: '#ff4d4f',
        askColor: '#52c41a',
        lineWidth: 1,
        fillSpread: true,
        spreadFillColor: 'rgba(200, 200, 200, 0.18)',
      },
    });
  }, []);

  const setPreset = useCallback((preset: IndicatorPreset) => {
    const next = { ...INDICATOR_PRESETS[preset] };
    setVisible(next);
    applyIndicatorVisibility(next);
  }, [applyIndicatorVisibility]);

  const loadDataset = useCallback((size: DatasetSize, fit = false): Promise<void> => {
    const chart = chartRef.current;
    if (!chart) return Promise.resolve();
    setIsBusy(true);
    fpsSamplesRef.current = [];
    return new Promise(resolve => window.setTimeout(() => {
      if (!mountedRef.current || !chartRef.current) { resolve(); return; }
      const generationStart = performance.now();
      const next = makeCandles(size, seedRef.current);
      const generationMs = performance.now() - generationStart;
      const setDataStart = performance.now();
      chart.setData(next);
      const setDataMs = performance.now() - setDataStart;
      candlesRef.current = next;
      midRef.current = next.at(-1)?.close ?? 150;
      tickBucketRef.current = next.at(-1)?.time ?? 0;
      if (fit) chart.fitContent();
      setDatasetSize(size);
      setMetrics(previous => ({
        ...previous,
        barCount: size,
        generationMs,
        setDataMs,
        fpsMin: null,
        fpsAvg: null,
      }));
      setIsBusy(false);
      resolve();
    }, 0));
  }, []);

  const sendTick = useCallback((newBucket = false) => {
    const chart = chartRef.current;
    const previous = candlesRef.current.at(-1);
    if (!chart || !previous) return;
    const random = tickRandomRef.current;
    midRef.current += (random() - 0.5) * 0.06;
    const halfSpread = 0.003 + random() * 0.002;
    if (newBucket) tickBucketRef.current += TIMEFRAME_MS;
    chart.updateTick({
      time: tickBucketRef.current,
      bid: Number((midRef.current - halfSpread).toFixed(3)),
      ask: Number((midRef.current + halfSpread).toFixed(3)),
      volume: 1 + Math.floor(random() * 4),
    });
    ticksSentRef.current += 1;
  }, []);

  const runBurst = useCallback(async () => {
    const run = ++burstRunRef.current;
    const startedAt = performance.now();
    setIsBusy(true);
    for (let offset = 0; offset < 1_000; offset += 50) {
      if (!mountedRef.current || burstRunRef.current !== run) return;
      for (let index = 0; index < 50; index += 1) sendTick(false);
      await new Promise<void>(resolve => window.setTimeout(resolve, 0));
    }
    const elapsed = performance.now() - startedAt;
    if (!mountedRef.current || burstRunRef.current !== run) return;
    setMetrics(previous => ({
      ...previous,
      burstElapsedMs: elapsed,
      effectiveTicksPerSecond: 1_000 / (elapsed / 1_000),
      ticksSent: ticksSentRef.current,
    }));
    setIsBusy(false);
  }, [sendTick]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    mountedRef.current = true;
    const chart = new CandleChart(host, {
      symbol: 'USD/JPY', timeframe: '1m', autoSize: true,
      width: host.clientWidth || 900, height: host.clientHeight || 480,
    });
    chartRef.current = chart;
    const startedAt = performance.now();
    chart.setData(candlesRef.current);
    const setDataMs = performance.now() - startedAt;
    chart.fitContent();
    applyIndicatorVisibility(visibilityRef.current);
    chart.applyOptions({ interaction: { dragMode: interactionModeRef.current }, navigator: navigatorRef.current });
    setMetrics(previous => ({ ...previous, setDataMs }));

    const observer = new ResizeObserver(() => chart.resize(host.clientWidth, host.clientHeight));
    observer.observe(host);
    const statsTimer = window.setInterval(() => {
      const fps = Math.round(chart.getFPS());
      const samples = fpsSamplesRef.current;
      samples.push(fps);
      if (samples.length > FPS_SAMPLE_WINDOW) samples.shift();
      const fpsMin = samples.length ? Math.min(...samples) : null;
      const fpsAvg = samples.length
        ? Math.round(samples.reduce((sum, value) => sum + value, 0) / samples.length)
        : null;
      setMetrics(previous => ({
        ...previous,
        barCount: chart.getData().length,
        fps,
        fpsMin,
        fpsAvg,
        renderStats: chart.getRenderStats(),
        spread: chart.getLatestSpread(),
        ticksSent: ticksSentRef.current,
        visibleRange: readVisibleRange(chart),
      }));
    }, 300);
    return () => {
      mountedRef.current = false;
      burstRunRef.current += 1;
      window.clearInterval(statsTimer);
      observer.disconnect();
      chart.destroy();
      chartRef.current = null;
    };
  }, [applyIndicatorVisibility]);

  useEffect(() => {
    const rate = Number(realtimeMode);
    if (!rate) return;
    const timer = window.setInterval(() => sendTick(false), 1_000 / rate);
    return () => window.clearInterval(timer);
  }, [realtimeMode, sendTick]);

  const toggleIndicator = (key: IndicatorKey) => {
    const next = { ...visible, [key]: !visible[key] };
    setVisible(next);
    applyIndicatorVisibility(next);
  };

  const reseed = () => {
    seedRef.current += 1;
    tickRandomRef.current = createSeededRandom(seedRef.current + 1);
    loadDataset(datasetSize, true);
  };

  const appendCandle = () => {
    const previous = candlesRef.current.at(-1);
    if (!previous) return;
    const next = makeNextCandle(previous, seedRef.current + candlesRef.current.length);
    candlesRef.current.push(next);
    chartRef.current?.setData(candlesRef.current);
    midRef.current = next.close;
    tickBucketRef.current = next.time;
  };

  const runScenario = async (
    scenario: 'a' | 'b' | 'c' | 'd-base' | 'd-all' | 'e' | 'f' | 'g' | 'h',
  ) => {
    setRealtimeMode('off');
    if (scenario === 'a') {
      setPreset('base');
      setScenarioNote('Scenario A: 1M initial load, Base only. Watch setData duration and FPS after fit.');
      await loadDataset(1_000_000, true);
    } else if (scenario === 'b') {
      setPreset('all');
      setScenarioNote('Scenario B: 100k dataset, all indicators visible.');
      await loadDataset(100_000, true);
    } else if (scenario === 'c') {
      setPreset('trend');
      setScenarioNote('Scenario C: 10k Trend dataset followed by a chunked 1,000 tick burst.');
      await loadDataset(10_000, true);
      await runBurst();
    } else if (scenario === 'e') {
      setPreset('base');
      setNavigatorVisible(true);
      setInteractionMode('pan');
      setScenarioNote('Scenario E: 1M Navigator. Narrow the handles, then drag the selection across history.');
      await loadDataset(1_000_000, true);
    } else if (scenario === 'f') {
      setInteractionMode('inspect');
      setScenarioNote('Scenario F: Inspect. Press and drag in the plot, release to pin, then press outside the plot to clear.');
      await loadDataset(10_000, true);
    } else if (scenario === 'g') {
      setNavigatorVisible(true);
      setInteractionMode('pan');
      setScenarioNote('Scenario G: Range synchronization. Pan, zoom, fit, and toggle Navigator after using the middle 10% preset.');
      await loadDataset(10_000, true);
      showRangePreset('middle');
    } else if (scenario === 'h') {
      setPreset('trend');
      setNavigatorVisible(true);
      setInteractionMode('pan');
      setScenarioNote(
        'Scenario H: Perf stress — 50k candles + Trend overlays + continuous 60 ticks/sec. Watch FPS live / min / avg while panning.',
      );
      await loadDataset(50_000, true);
      setRealtimeMode('60');
    } else {
      const preset = scenario === 'd-base' ? 'base' : 'all';
      setPreset(preset);
      setScenarioNote(`Scenario D: ${preset === 'base' ? 'Base only' : 'All visible'} on the current dataset.`);
      await loadDataset(datasetSize, false);
    }
  };

  return {
    appendCandle, chartRef, datasetSize, hostRef, interactionMode, isBusy, loadDataset, metrics, navigator, realtimeMode, reseed,
    runBurst, runScenario, scenarioNote, sendTick, setDatasetSize, setPreset, setRealtimeMode,
    setInteractionMode, setNavigatorHeight, setNavigatorMaxOverviewPoints, setNavigatorVisible,
    showRangePreset, toggleIndicator, visible,
  };
}
