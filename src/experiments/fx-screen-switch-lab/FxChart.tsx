import { useEffect, useRef } from 'react';
import { init, use as register } from 'echarts/core';
import type { ECharts } from 'echarts/core';
import { CandlestickChart, LineChart } from 'echarts/charts';
import { DataZoomComponent, GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { decimals } from './market';
import type { Snapshot } from './protocol';

register([CandlestickChart, LineChart, DataZoomComponent, GridComponent, TooltipComponent, CanvasRenderer]);
const labelFormatter = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
});
const timeLabel = (time: number) => labelFormatter.format(time);

export default function FxChart({ snapshot }: { snapshot: Snapshot }) {
  const container = useRef<HTMLDivElement>(null);
  const chart = useRef<ECharts | null>(null);
  const key = useRef('');
  const wasActive = useRef(false);
  useEffect(() => {
    const element = container.current!;
    const instance = init(element, undefined, { renderer: 'canvas', devicePixelRatio: Math.min(devicePixelRatio || 1, 2) });
    chart.current = instance;
    // Updated options never include dataZoom: user zoom survives live ticks and pane switches.
    instance.setOption({ dataZoom: [{ type: 'inside', start: 40, end: 100 }, { type: 'slider', height: 20, bottom: 8, start: 40, end: 100 }] });
    const observer = new ResizeObserver(() => { if (element.clientWidth && element.clientHeight) instance.resize(); });
    observer.observe(element);
    return () => { observer.disconnect(); instance.dispose(); chart.current = null; };
  }, []);
  useEffect(() => {
    const instance = chart.current;
    const becameActive = snapshot.active && !wasActive.current;
    wasActive.current = snapshot.active;
    if (!instance || !snapshot.active || !snapshot.bars.length) return;
    const { config, bars } = snapshot;
    const style = getComputedStyle(container.current!);
    const token = (name: string) => style.getPropertyValue(name).trim();
    const nextKey = `${config.pair}:${config.minutes}:${config.count}`;
    if (key.current && key.current !== nextKey) instance.dispatchAction({ type: 'dataZoom', start: 40, end: 100 });
    key.current = nextKey;
    const averages = bars.map((_, i) => i < 19 ? null : bars.slice(i - 19, i + 1).reduce((sum, bar) => sum + bar.close, 0) / 20);
    if (becameActive) instance.resize();
    instance.setOption({
      animation: false,
      grid: { left: 12, right: 12, top: 20, bottom: 52, containLabel: true },
      tooltip: { trigger: 'axis', confine: true, backgroundColor: token('--fx-surface'), borderColor: token('--fx-border'),
        textStyle: { color: token('--fx-text') }, axisPointer: { type: 'cross' },
        valueFormatter: (value: unknown) => typeof value === 'number' ? value.toFixed(decimals(config.pair)) : String(value ?? '') },
      xAxis: { type: 'category', data: bars.map(bar => timeLabel(bar.time)), boundaryGap: true,
        axisLabel: { color: token('--fx-muted'), hideOverlap: true }, axisLine: { lineStyle: { color: token('--fx-border') } }, axisTick: { show: false } },
      yAxis: { type: 'value', scale: true, position: 'right', splitNumber: 4,
        axisLabel: { color: token('--fx-muted'), formatter: (value: number) => value.toFixed(decimals(config.pair)) },
        splitLine: { lineStyle: { color: token('--fx-grid') } } },
      series: [
        { id: 'candles', type: 'candlestick', name: config.pair, data: bars.map(b => [b.open, b.close, b.low, b.high]),
          itemStyle: { color: token('--fx-up'), color0: token('--fx-down'), borderColor: token('--fx-up'), borderColor0: token('--fx-down') } },
        { id: 'average', type: 'line', name: 'SMA 20', showSymbol: false, data: averages, lineStyle: { color: token('--fx-accent'), width: 1.5 } },
      ],
    });
  }, [snapshot]);
  return <div className="fx-chart" ref={container} role="img" aria-label={`${snapshot.config.pair}のローソク足チャート。ダミーデータ。ドラッグで移動、ピンチで拡大できます。`} />;
}
