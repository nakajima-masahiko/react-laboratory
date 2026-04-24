import { useEffect, useMemo, useRef } from 'react';
import { useResizeObserver } from '../hooks/useResizeObserver';
import { drawAxis } from '../renderers/drawAxis';
import { drawBackground } from '../renderers/drawBackground';
import { drawCandlesticks } from '../renderers/drawCandlesticks';
import { drawGrid } from '../renderers/drawGrid';
import { drawLatestPriceLabel } from '../renderers/drawLatestPriceLabel';
import { drawLatestPriceLine } from '../renderers/drawLatestPriceLine';
import { drawLine } from '../renderers/drawLine';
import { DEFAULT_MARGIN, type FinancialChartProps, type PlotRect } from '../types';
import { computeCandleWidth, createScales } from '../utils/createScales';

const DEFAULT_HEIGHT = 400;
const X_TICK_COUNT = 6;
const Y_TICK_COUNT = 6;

function FinancialChart({
  data,
  chartType,
  theme,
  height = DEFAULT_HEIGHT,
}: FinancialChartProps) {
  const [containerRef, size] = useResizeObserver<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const width = size.width;

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
    drawAxis({ ctx, plot, xScale, yScale, xTicks, yTicks, theme });

    // 6, 7. 最新価格
    if (data.length > 0) {
      const latest = data[data.length - 1].close;
      drawLatestPriceLine({ ctx, price: latest, yScale, plot, theme });
      drawLatestPriceLabel({ ctx, price: latest, yScale, plot, theme });
    }
  }, [data, chartType, theme, width, height, plot]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: `${height}px`, position: 'relative' }}
    >
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  );
}

export default FinancialChart;
