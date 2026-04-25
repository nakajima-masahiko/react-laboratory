import { type MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useResizeObserver } from '../hooks/useResizeObserver';
import { renderFinancialChart } from '../renderers/renderFinancialChart';
import {
  DEFAULT_MARGIN,
  DEFAULT_TOOLTIP_DATE_FORMAT,
  DEFAULT_TOOLTIP_LABELS,
  type FinancialChartProps,
  type PlotRect,
  type TooltipLabels,
  type TooltipState,
} from '../types';
import { formatPrice, formatTime } from '../utils/formatters';
import { getNearestDataIndexFromX } from '../utils/getNearestDataIndexFromX';
import { setupHiDpiCanvas } from '../utils/setupHiDpiCanvas';
import ChartTooltipOverlay from './ChartTooltipOverlay';

const DEFAULT_HEIGHT = 400;
const DEFAULT_TIMEFRAME_MS = 24 * 60 * 60 * 1000;

function FinancialChart({
  data,
  chartType,
  theme,
  timeframeMs = DEFAULT_TIMEFRAME_MS,
  height = DEFAULT_HEIGHT,
  tooltip,
}: FinancialChartProps) {
  const [containerRef, size] = useResizeObserver<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const pendingPointerRef = useRef<TooltipState | null>(null);
  const tooltipStateRef = useRef<TooltipState | null>(null);
  const [tooltipState, setTooltipState] = useState<TooltipState | null>(null);
  const [devicePixelRatio, setDevicePixelRatio] = useState(
    () => window.devicePixelRatio || 1,
  );

  const width = size.width;
  const tooltipLabels: TooltipLabels = useMemo(
    () => ({ ...DEFAULT_TOOLTIP_LABELS, ...tooltip?.labels }),
    [tooltip?.labels],
  );
  const tooltipDateFormat = tooltip?.dateFormat ?? DEFAULT_TOOLTIP_DATE_FORMAT;

  useEffect(() => {
    tooltipStateRef.current = tooltipState;
  }, [tooltipState]);

  const plot = useMemo<PlotRect>(() => {
    const left = DEFAULT_MARGIN.left;
    const right = Math.max(left, width - DEFAULT_MARGIN.right);
    const top = DEFAULT_MARGIN.top;
    const bottom = Math.max(top, height - DEFAULT_MARGIN.bottom);
    return {
      left,
      right,
      top,
      bottom,
      width: right - left,
      height: bottom - top,
    };
  }, [width, height]);

  const activeTooltipState = useMemo(() => {
    if (!tooltipState || data.length === 0) return null;

    return {
      ...tooltipState,
      index: Math.min(tooltipState.index, data.length - 1),
    };
  }, [data.length, tooltipState]);

  useEffect(
    () => () => {
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    const updateDevicePixelRatio = () => {
      setDevicePixelRatio(window.devicePixelRatio || 1);
    };

    let mediaQuery = window.matchMedia(
      `(resolution: ${window.devicePixelRatio || 1}dppx)`,
    );
    const handleResolutionChange = () => {
      updateDevicePixelRatio();
      mediaQuery.removeEventListener('change', handleResolutionChange);
      mediaQuery = window.matchMedia(
        `(resolution: ${window.devicePixelRatio || 1}dppx)`,
      );
      mediaQuery.addEventListener('change', handleResolutionChange);
    };

    mediaQuery.addEventListener('change', handleResolutionChange);
    window.addEventListener('resize', updateDevicePixelRatio);

    return () => {
      mediaQuery.removeEventListener('change', handleResolutionChange);
      window.removeEventListener('resize', updateDevicePixelRatio);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (width <= 0 || height <= 0) return;

    setupHiDpiCanvas(canvas, width, height, devicePixelRatio);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    renderFinancialChart({
      ctx,
      width,
      height,
      data,
      chartType,
      theme,
      timeframeMs,
      plot,
    });
  }, [data, chartType, theme, timeframeMs, width, height, plot, devicePixelRatio]);

  const tooltipContent = useMemo(() => {
    if (!activeTooltipState || data.length === 0) return null;
    const candle = data[activeTooltipState.index];
    if (!candle) return null;

    const date = new Date(candle.time);
    return [
      { label: tooltipLabels.date, value: formatTime(date, tooltipDateFormat) },
      { label: tooltipLabels.open, value: formatPrice(candle.open) },
      { label: tooltipLabels.high, value: formatPrice(candle.high) },
      { label: tooltipLabels.low, value: formatPrice(candle.low) },
      { label: tooltipLabels.close, value: formatPrice(candle.close) },
    ];
  }, [activeTooltipState, data, tooltipDateFormat, tooltipLabels]);

  const handleMouseMove = (event: MouseEvent<HTMLCanvasElement>) => {
    if (data.length === 0 || plot.width <= 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;

    if (
      pointerX < plot.left ||
      pointerX > plot.right ||
      pointerY < plot.top ||
      pointerY > plot.bottom
    ) {
      setTooltipState(null);
      return;
    }

    const nextIndex = getNearestDataIndexFromX(pointerX, plot, data.length);

    pendingPointerRef.current = {
      x: pointerX,
      y: pointerY,
      index: nextIndex,
    };

    if (rafIdRef.current !== null) return;

    rafIdRef.current = window.requestAnimationFrame(() => {
      rafIdRef.current = null;
      const pendingPointer = pendingPointerRef.current;
      if (!pendingPointer) return;

      const current = tooltipStateRef.current;
      if (current && current.index === pendingPointer.index) {
        setTooltipState({
          x: pendingPointer.x,
          y: pendingPointer.y,
          index: current.index,
        });
        return;
      }

      setTooltipState({
        x: pendingPointer.x,
        y: pendingPointer.y,
        index: pendingPointer.index,
      });
    });
  };

  const handleMouseLeave = () => {
    if (rafIdRef.current !== null) {
      window.cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    pendingPointerRef.current = null;
    setTooltipState(null);
  };

  const latest = data.length > 0 ? data[data.length - 1] : null;
  const first = data.length > 0 ? data[0] : null;
  const canvasAriaLabel = latest
    ? `Financial chart from ${first?.time ?? latest.time} to ${latest.time}. Latest close ${formatPrice(
        latest.close,
      )}.`
    : 'Financial chart. No data available.';

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: `${height}px`, position: 'relative' }}
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={canvasAriaLabel}
        style={{ display: 'block' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      <ChartTooltipOverlay
        activeTooltipState={activeTooltipState}
        tooltipContent={tooltipContent}
        plot={plot}
        width={width}
        theme={theme}
      />
    </div>
  );
}

export default FinancialChart;
