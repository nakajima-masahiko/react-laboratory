import { useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { CanvasStage } from './CanvasStage';
import type { CanvasLayer, Frame, StageHandle } from './CanvasStage';
import { clamp } from './canvas-api';
import type { DemoProps } from './canvas-api';
import { formatTime } from './chart-data';
import type { PricePoint } from './chart-data';
import { useRealtimeChart } from './useRealtimeChart';

export function ChartDemo({ native, theme, onNativeFailure }: DemoProps) {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<StageHandle>(null);
  const [running, setRunning] = useState(true);
  const [interval, setIntervalMs] = useState(500);
  const [windowSize, setWindowSize] = useState(90);
  const [inspected, setInspected] = useState<PricePoint | null>(null);
  const engine = useRealtimeChart({ running, interval, windowSize, theme, root, stage });
  const selected = inspected ?? engine.latest;
  const coordinate = () => engine.chart.current?.convertToPixel({ seriesIndex: 0 }, selected) as number[] | undefined;

  const draw = ({ context, width, height, palette }: Frame) => {
    if (engine.source.current) context.drawImage(engine.source.current, 0, 0, width, height);
    const point = coordinate();
    if (!point || !Number.isFinite(point[0]) || point[0] < 56 || point[0] > width - 20) return;
    context.strokeStyle = palette.accent;
    context.globalAlpha = .5;
    context.setLineDash([4, 5]);
    context.beginPath();
    context.moveTo(point[0], 162);
    context.lineTo(point[0], height - 44);
    context.stroke();
    context.setLineDash([]);
    context.globalAlpha = 1;
    context.fillStyle = palette.accent;
    context.beginPath();
    context.arc(point[0], point[1], 4, 0, Math.PI * 2);
    context.fill();
  };

  const inspect = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as Element).closest('.hic-layer')) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const chart = engine.chart.current;
    if (!chart?.containPixel({ gridIndex: 0 }, [x, y])) { setInspected(null); return; }
    const value = chart.convertFromPixel({ seriesIndex: 0 }, [x, y]) as number[];
    const visible = engine.points.current.slice(-windowSize);
    const nearest = visible.reduce((best, point) => Math.abs(point[0] - value[0]) < Math.abs(best[0] - value[0]) ? point : best);
    setInspected(nearest);
  };

  const layers: CanvasLayer[] = [
    { id: 'quote', className: 'hic-quote', place: () => ({ x: 18, y: 18 }), content: <>
      <div className="hic-label"><span className={`hic-dot ${running ? 'is-live' : ''}`} />USD / JPY <span>模擬レート</span></div>
      <div className="hic-price" data-testid="latest-price">{engine.latest[1].toFixed(3)}<small> JPY</small></div>
      <div className="hic-inline">
        <button type="button" className="hic-small-button" onClick={() => setRunning((value) => !value)}>{running ? '一時停止' : '再開'}</button>
        <span className="hic-label">{running ? '更新中' : '停止中'}</span>
      </div>
    </> },
    { id: 'annotation', className: 'hic-annotation', place: (size, box) => {
      const point = coordinate() ?? [size.width - 40, size.height / 2];
      return { x: clamp(point[0] - box.width - 16, 64, size.width - box.width - 16), y: clamp(point[1] - box.height - 16, 174, size.height - box.height - 54) };
    }, content: <>
      <div className="hic-label">{inspected ? '選択した価格' : '最新価格に追従'}</div>
      <strong>{selected[1].toFixed(3)} <small>JPY</small></strong>
      <time dateTime={new Date(selected[0]).toISOString()}>{formatTime(selected[0])} JST</time>
    </> },
  ];

  return <div ref={root} className="hic-demo" data-testid="chart-demo" data-updates={engine.updates}>
    <div className="hic-demo-heading"><div><h2>ECharts × リアルタイムHTML</h2><p>動き続ける価格と、操作できるHTMLをひとつの描画面に。</p></div><span className="hic-count" aria-label="更新回数">{engine.updates} updates</span></div>
    <CanvasStage ref={stage} native={native} theme={theme} onNativeFailure={onNativeFailure} layers={layers} label="EChartsによるUSD/JPY模擬チャートとHTML操作パネル" draw={draw} onResize={engine.resize} onPointerMove={inspect} onPointerLeave={() => setInspected(null)} />
    <div className="hic-toolbar">
      <label>更新間隔<select value={interval} onChange={(event) => setIntervalMs(Number(event.target.value))}><option value={100}>100 ms</option><option value={500}>500 ms</option><option value={1000}>1,000 ms</option></select></label>
      <label>表示データ<select value={windowSize} onChange={(event) => { setWindowSize(Number(event.target.value)); setInspected(null); }}><option value={60}>60点</option><option value={90}>90点</option><option value={180}>180点</option></select></label>
      <button type="button" onClick={() => { engine.reset(); setInspected(null); }}>リセット</button>
      <button type="button" disabled={!native} onClick={() => stage.current?.savePng()}>HTMLごとPNG保存</button>
    </div>
    <p className="hic-hint">線の上をポイントすると価格を確認できます。1回の更新で模擬時計が1秒進み、データは最大180点に保ちます。実際の相場には接続していません。</p>
    {!native && <p className="hic-hint">PNG保存はネイティブ描画時に利用できます。DOM重ね合わせのHTMLはCanvas画像に含まれません。</p>}
  </div>;
}
