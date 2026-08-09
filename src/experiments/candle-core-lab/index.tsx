import { useCallback, useEffect, useRef, useState } from 'react';
import { CandleChart, type Candle } from 'candle-core';
import { makeCandles } from './data';
import './styles.css';

type IndicatorKey = 'sma' | 'ema' | 'bollingerBands' | 'rsi' | 'macd' | 'bidAskOverlay';

const INDICATORS: { key: IndicatorKey; label: string }[] = [
  { key: 'sma', label: 'SMA' },
  { key: 'ema', label: 'EMA' },
  { key: 'bollingerBands', label: 'BB' },
  { key: 'rsi', label: 'RSI' },
  { key: 'macd', label: 'MACD' },
  { key: 'bidAskOverlay', label: 'Bid/Ask' },
];

const DEFAULT_VISIBLE: Record<IndicatorKey, boolean> = {
  sma: true,
  ema: true,
  bollingerBands: true,
  rsi: true,
  macd: true,
  bidAskOverlay: true,
};

function CandleCoreLab() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<CandleChart | null>(null);
  const candlesRef = useRef<Candle[]>(makeCandles(180, 7));
  const midRef = useRef(candlesRef.current.at(-1)?.close ?? 150);

  const [realtime, setRealtime] = useState(true);
  const [visible, setVisible] = useState(DEFAULT_VISIBLE);
  const [fps, setFps] = useState(0);
  const [spread, setSpread] = useState<number | null>(null);
  const [barCount, setBarCount] = useState(candlesRef.current.length);

  const applyIndicatorVisibility = useCallback((next: Record<IndicatorKey, boolean>) => {
    const chart = chartRef.current;
    if (!chart) return;

    chart.applyOptions({
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

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const chart = new CandleChart(host, {
      symbol: 'USD/JPY',
      timeframe: '1m',
      autoSize: true,
      width: host.clientWidth || 900,
      height: host.clientHeight || 480,
    });

    chartRef.current = chart;
    chart.setData(candlesRef.current);
    chart.fitContent();
    applyIndicatorVisibility(visible);

    const ro = new ResizeObserver(() => {
      chart.resize(host.clientWidth, host.clientHeight);
    });
    ro.observe(host);

    const statsTimer = window.setInterval(() => {
      setFps(Math.round(chart.getFPS()));
      setSpread(chart.getLatestSpread());
      setBarCount(chart.getData().length);
    }, 500);

    return () => {
      window.clearInterval(statsTimer);
      ro.disconnect();
      chart.destroy();
      chartRef.current = null;
    };
    // Mount once; visibility is applied via separate effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyIndicatorVisibility(visible);
  }, [visible, applyIndicatorVisibility]);

  useEffect(() => {
    if (!realtime) return;

    const id = window.setInterval(() => {
      const chart = chartRef.current;
      if (!chart) return;

      const jitter = (Math.random() - 0.5) * 0.06;
      midRef.current += jitter;
      const mid = midRef.current;
      const halfSpread = 0.003 + Math.random() * 0.002;

      chart.updateTick({
        time: Date.now(),
        bid: Number((mid - halfSpread).toFixed(3)),
        ask: Number((mid + halfSpread).toFixed(3)),
        volume: 1 + Math.floor(Math.random() * 4),
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [realtime]);

  const toggleIndicator = (key: IndicatorKey) => {
    setVisible(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFit = () => {
    chartRef.current?.fitContent();
  };

  const handleReseed = () => {
    const chart = chartRef.current;
    if (!chart) return;
    const next = makeCandles(180, Date.now() % 10_000);
    candlesRef.current = next;
    midRef.current = next.at(-1)?.close ?? 150;
    chart.setData(next);
    chart.fitContent();
    setBarCount(next.length);
  };

  return (
    <div className="ccl-lab">
      <h2>CandleCore Lab</h2>
      <p>
        <code>candle-core</code> の Canvas ローソク足チャートを React にマウントする描画サンプルです。
        SMA / EMA / BB / RSI / MACD / Bid-Ask とリアルタイム tick を確認できます。
      </p>

      <div className="ccl-toolbar">
        <div className="ccl-group">
          <span className="ccl-label">操作</span>
          <button type="button" className="ccl-btn" data-active={realtime} onClick={() => setRealtime(v => !v)}>
            リアルタイム {realtime ? 'ON' : 'OFF'}
          </button>
          <button type="button" className="ccl-btn" onClick={handleFit}>
            Fit Content
          </button>
          <button type="button" className="ccl-btn" onClick={handleReseed}>
            データ再生成
          </button>
        </div>

        <div className="ccl-group">
          <span className="ccl-label">指標</span>
          {INDICATORS.map(item => (
            <button
              key={item.key}
              type="button"
              className="ccl-btn"
              data-active={visible[item.key]}
              onClick={() => toggleIndicator(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ccl-status">
        <span>
          Bars: <strong>{barCount}</strong>
        </span>
        <span>
          FPS: <strong>{fps}</strong>
        </span>
        <span>
          Spread: <strong>{spread == null ? '—' : spread.toFixed(4)}</strong>
        </span>
      </div>

      <div className="ccl-chart-shell">
        <div ref={hostRef} className="ccl-chart" />
      </div>

      <div className="ccl-note">
        GitHub Pages では CI が <code>vendor/candle-core</code> にソースを同期してビルドします。
        ローカルでは <code>npm run sync:candle-core</code> のあと <code>npm run dev</code> を実行してください。
        公開 URL: <code>/react-laboratory/#/experiment/candle-core-lab</code>
      </div>
    </div>
  );
}

export default CandleCoreLab;
