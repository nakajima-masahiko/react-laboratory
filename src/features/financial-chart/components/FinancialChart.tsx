import { type MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useResizeObserver } from '../hooks/useResizeObserver';
import { drawAxis } from '../renderers/drawAxis';
import { drawBackground } from '../renderers/drawBackground';
import { drawCandlesticks } from '../renderers/drawCandlesticks';
import { drawGrid } from '../renderers/drawGrid';
import { drawLatestPriceLabel } from '../renderers/drawLatestPriceLabel';
import { drawLatestPriceLine } from '../renderers/drawLatestPriceLine';
import { drawLine } from '../renderers/drawLine';
import { formatPrice, formatTime } from '../utils/formatters';
import {
  DEFAULT_MARGIN,
  DEFAULT_TOOLTIP_DATE_FORMAT,
  DEFAULT_TOOLTIP_LABELS,
  type FinancialChartProps,
  type PlotRect,
  type TooltipLabels,
} from '../types';
import { computeCandleWidth, createScales } from '../utils/createScales';

const DEFAULT_HEIGHT = 400;
const DEFAULT_TIMEFRAME_MS = 24 * 60 * 60 * 1000;
const X_TICK_COUNT = 6;
const Y_TICK_COUNT = 6;

type TooltipState = {
  x: number;
  y: number;
  index: number;
};

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
  const [tooltipState, setTooltipState] = useState<TooltipState | null>(null);

  const width = size.width;
  const tooltipLabels: TooltipLabels = useMemo(
    () => ({ ...DEFAULT_TOOLTIP_LABELS, ...tooltip?.labels }),
    [tooltip?.labels],
  );
  const tooltipDateFormat = tooltip?.dateFormat ?? DEFAULT_TOOLTIP_DATE_FORMAT;

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

  useEffect(() => {
    if (data.length === 0) {
      setTooltipState(null);
      return;
    }

    const nextIndex = Math.min(tooltipState?.index ?? 0, data.length - 1);
    if (tooltipState && nextIndex === tooltipState.index) return;
    setTooltipState((current) =>
      current
        ? {
            ...current,
            index: nextIndex,
          }
        : null,
    );
  }, [data.length, tooltipState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (width <= 0 || height <= 0) return;

    const dpr = window.devicePixelRatio || 1;
    const pixelWidth = Math.round(width * dpr);
    const pixelHeight = Math.round(height * dpr);
    if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
    if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // 1. クリア
    ctx.clearRect(0, 0, width, height);

    // 2. 背景
    drawBackground({ ctx, width, height, theme });

    if (plot.width <= 0 || plot.height <= 0) return;

    const { xScale, yScale, times } = createScales(data, chartType, plot);
    const xTicks =
      data.length === 0 ? [] : (xScale.ticks(X_TICK_COUNT) as Date[]);
    const yTicks = data.length === 0 ? [] : yScale.ticks(Y_TICK_COUNT);

    // 3. グリッド
    drawGrid({ ctx, plot, xScale, yScale, xTicks, yTicks, theme });

    // 4. チャート本体
    if (data.length > 0) {
      if (chartType === 'candlestick') {
        const candleWidth = computeCandleWidth(times, xScale);
        drawCandlesticks({
          ctx,
          data,
          times,
          xScale,
          yScale,
          candleWidth,
          plot,
          theme,
        });
      } else {
        drawLine({ ctx, data, times, xScale, yScale, plot, theme });
      }
    }

    // 5. 軸
    drawAxis({
      ctx,
      plot,
      xScale,
      yScale,
      xTicks,
      yTicks,
      theme,
    });

    // 6, 7. 最新価格
    if (data.length > 0) {
      const latest = data[data.length - 1].close;
      drawLatestPriceLine({ ctx, price: latest, yScale, plot, theme });
      drawLatestPriceLabel({ ctx, price: latest, yScale, plot, theme });
    }
  }, [data, chartType, theme, timeframeMs, width, height, plot]);

  const tooltipContent = useMemo(() => {
    if (!tooltipState || data.length === 0) return null;
    const candle = data[tooltipState.index];
    if (!candle) return null;

    const date = new Date(candle.time);
    return [
      { label: tooltipLabels.date, value: formatTime(date, tooltipDateFormat) },
      { label: tooltipLabels.open, value: formatPrice(candle.open) },
      { label: tooltipLabels.high, value: formatPrice(candle.high) },
      { label: tooltipLabels.low, value: formatPrice(candle.low) },
      { label: tooltipLabels.close, value: formatPrice(candle.close) },
    ];
  }, [data, tooltipDateFormat, tooltipLabels, tooltipState]);

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

    const ratio = (pointerX - plot.left) / plot.width;
    const nextIndex = Math.round(ratio * (data.length - 1));
    const clampedIndex = Math.max(0, Math.min(nextIndex, data.length - 1));

    setTooltipState({
      x: pointerX,
      y: pointerY,
      index: clampedIndex,
    });
  };

  const handleMouseLeave = () => {
    setTooltipState(null);
  };

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: `${height}px`, position: 'relative' }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      {tooltipState ? (
        <div
          style={{
            position: 'absolute',
            top: `${plot.top}px`,
            left: `${tooltipState.x}px`,
            height: `${plot.height}px`,
            borderLeft: `1px dashed ${theme.tooltipGuideLine}`,
            pointerEvents: 'none',
            zIndex: 5,
          }}
        />
      ) : null}
      {tooltipContent && tooltipState ? (
        <div
          style={{
            position: 'absolute',
            top: `${Math.max(8, tooltipState.y - 12)}px`,
            left: `${Math.min(width - 180, tooltipState.x + 14)}px`,
            transform: 'translateY(-100%)',
            pointerEvents: 'none',
            background: 'rgba(20, 20, 30, 0.92)',
            color: '#fff',
            borderRadius: '6px',
            padding: '8px 10px',
            fontSize: '12px',
            lineHeight: 1.5,
            minWidth: '156px',
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)',
            zIndex: 10,
          }}
        >
          {tooltipContent.map((item) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '8px',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ opacity: 0.8 }}>{item.label}</span>
              <span style={{ fontWeight: 600 }}>{item.value}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default FinancialChart;
