import { useCallback, useEffect, useRef, useState } from 'react';
import { init, use as useECharts } from 'echarts/core';
import type { ECharts } from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { RefObject } from 'react';
import { readPalette } from './canvas-api';
import type { Size, Theme } from './canvas-api';
import type { StageHandle } from './CanvasStage';
import { formatTime, HISTORY_SIZE, initialPrices, makePoint } from './chart-data';

type Options = { running: boolean; interval: number; windowSize: number; theme: Theme; root: RefObject<HTMLDivElement | null>; stage: RefObject<StageHandle | null> };
useECharts([LineChart, GridComponent, CanvasRenderer]);

export function useRealtimeChart({ running, interval, windowSize, theme, root, stage }: Options) {
  const chart = useRef<ECharts | null>(null);
  const source = useRef<HTMLCanvasElement | null>(null);
  const size = useRef<Size>({ width: 720, height: 480 });
  const points = useRef(initialPrices());
  const sequence = useRef(HISTORY_SIZE);
  const [updates, setUpdates] = useState(0);
  const [latest, setLatest] = useState(points.current.at(-1)!);

  const updateChart = useCallback(() => {
    if (!chart.current || !root.current) return;
    const colors = readPalette(root.current);
    chart.current.setOption({
      animation: false,
      backgroundColor: colors.background,
      grid: { left: 56, right: 24, top: 162, bottom: 44 },
      xAxis: { type: 'time', min: points.current.at(-windowSize)![0], max: points.current.at(-1)![0], splitNumber: size.current.width < 450 ? 2 : 5,
        axisLine: { lineStyle: { color: colors.grid } }, axisTick: { show: false },
        axisLabel: { color: colors.muted, formatter: (value: number) => formatTime(value) }, splitLine: { show: false } },
      yAxis: { type: 'value', scale: true, splitNumber: 4,
        axisLabel: { color: colors.muted, formatter: (value: number) => value.toFixed(2) }, splitLine: { lineStyle: { color: colors.grid } } },
      series: [{ id: 'simulated-price', name: 'USD/JPY 模擬レート', type: 'line', showSymbol: false, smooth: .2,
        data: points.current.slice(-windowSize), lineStyle: { width: 2.5, color: colors.accent }, areaStyle: { color: colors.accent, opacity: .09 } }],
    });
  }, [root, windowSize]);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    source.current = canvas;
    const instance = init(canvas, undefined, { renderer: 'canvas', ...size.current, devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2) });
    chart.current = instance;
    const rendered = () => stage.current?.redraw();
    instance.on('rendered', rendered);
    return () => { instance.off('rendered', rendered); instance.dispose(); chart.current = null; source.current = null; };
  }, [stage]);

  useEffect(() => { updateChart(); }, [updateChart, theme]);
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      const point = makePoint(sequence.current++);
      points.current = [...points.current.slice(-(HISTORY_SIZE - 1)), point];
      setLatest(point);
      setUpdates(sequence.current - HISTORY_SIZE);
      updateChart();
    }, interval);
    return () => clearInterval(timer);
  }, [running, interval, updateChart]);

  const resize = useCallback((next: Size) => {
    size.current = next;
    chart.current?.resize(next);
    updateChart();
  }, [updateChart]);
  const reset = () => {
    points.current = initialPrices();
    sequence.current = HISTORY_SIZE;
    setLatest(points.current.at(-1)!);
    setUpdates(0);
    updateChart();
  };
  return { chart, source, points, latest, updates, resize, reset };
}
