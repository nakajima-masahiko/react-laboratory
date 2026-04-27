import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { COLORS, CURRENCIES, type ChartRow, type Currency } from '../types';
import { XAxis, YAxis } from './axes';
import { buildScales } from './scales';
import { ChartTooltip } from './tooltip';

const MARGIN = { top: 8, right: 24, bottom: 32, left: 56 } as const;
const CHART_HEIGHT = 460;

interface BarChartSvgProps {
  chartData: ChartRow[];
  hiddenCurrencies: Set<Currency>;
  animationKey: string;
}

export function BarChartSvg({ chartData, hiddenCurrencies, animationKey }: BarChartSvgProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [chartWidth, setChartWidth] = useState(0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        setChartWidth(Math.max(0, Math.floor(width)));
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const innerWidth = Math.max(0, chartWidth - MARGIN.left - MARGIN.right);
  const innerHeight = Math.max(0, CHART_HEIGHT - MARGIN.top - MARGIN.bottom);

  const scales = useMemo(
    () => buildScales(chartData, hiddenCurrencies, innerWidth, innerHeight),
    [chartData, hiddenCurrencies, innerWidth, innerHeight],
  );

  const visibleCurrencies = useMemo(
    () => CURRENCIES.filter((currency) => !hiddenCurrencies.has(currency)),
    [hiddenCurrencies],
  );

  const stackSegments = useMemo(() => {
    if (innerWidth === 0) {
      return [];
    }
    const cumulative = new Array(chartData.length).fill(0);
    const segments: Array<{
      currency: Currency;
      currencyIndex: number;
      key: string;
      x: number;
      y: number;
      width: number;
      height: number;
      rowIndex: number;
    }> = [];
    visibleCurrencies.forEach((currency, currencyIndex) => {
      chartData.forEach((row, rowIndex) => {
        const value = row[currency];
        const yTop = scales.yScale(cumulative[rowIndex] + value);
        const yBottom = scales.yScale(cumulative[rowIndex]);
        const x = scales.xScale(row.key) ?? 0;
        const width = scales.xScale.bandwidth();
        const height = Math.max(0, yBottom - yTop);
        segments.push({
          currency,
          currencyIndex,
          key: `${currency}-${row.key}`,
          x,
          y: yTop,
          width,
          height,
          rowIndex,
        });
        cumulative[rowIndex] += value;
      });
    });
    return segments;
  }, [chartData, visibleCurrencies, scales, innerWidth]);

  const handlePointerMove = (event: React.PointerEvent<SVGRectElement>) => {
    const svg = svgRef.current;
    if (!svg || innerWidth === 0) {
      return;
    }
    const rect = svg.getBoundingClientRect();
    const localX = event.clientX - rect.left - MARGIN.left;
    const step = scales.xScale.step();
    if (step <= 0) {
      return;
    }
    const index = Math.max(
      0,
      Math.min(chartData.length - 1, Math.floor(localX / step)),
    );
    setHoverIndex(index);
  };

  const handlePointerLeave = () => setHoverIndex(null);

  const tooltipPosition = (() => {
    if (hoverIndex === null) {
      return null;
    }
    const row = chartData[hoverIndex];
    if (!row) {
      return null;
    }
    const x = (scales.xScale(row.key) ?? 0) + scales.xScale.bandwidth() / 2 + MARGIN.left;
    const y = MARGIN.top + 12;
    return { row, x, y };
  })();

  const ready = chartWidth > 0 && innerWidth > 0;

  return (
    <div ref={containerRef} className="ccws-chart-host">
      {ready ? (
        <svg
          ref={svgRef}
          width={chartWidth}
          height={CHART_HEIGHT}
          className="ccws-svg"
          role="img"
          aria-label="通貨別つみたて棒グラフ"
        >
          <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
            <YAxis yScale={scales.yScale} innerWidth={innerWidth} />
            <XAxis xScale={scales.xScale} innerHeight={innerHeight} chartData={chartData} />

            <g key={animationKey} className="ccws-bars">
              {stackSegments.map((segment) => {
                const dim =
                  hoverIndex !== null && hoverIndex !== segment.rowIndex ? 0.5 : 1;
                const style = {
                  '--bar-delay': `${segment.currencyIndex * 120}ms`,
                  transformOrigin: `${segment.x + segment.width / 2}px ${innerHeight}px`,
                  opacity: dim,
                } as CSSProperties;
                return (
                  <rect
                    key={segment.key}
                    className="ccws-bar"
                    x={segment.x}
                    y={segment.y}
                    width={segment.width}
                    height={segment.height}
                    fill={COLORS[segment.currency]}
                    style={style}
                  />
                );
              })}
            </g>

            <rect
              className="ccws-hover-layer"
              x={0}
              y={0}
              width={innerWidth}
              height={innerHeight}
              fill="transparent"
              pointerEvents="all"
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              aria-hidden="true"
            />
          </g>
        </svg>
      ) : (
        <div className="ccws-svg-placeholder" style={{ height: CHART_HEIGHT }} aria-hidden="true" />
      )}

      {tooltipPosition && (
        <ChartTooltip
          row={tooltipPosition.row}
          hiddenCurrencies={hiddenCurrencies}
          x={tooltipPosition.x}
          y={tooltipPosition.y}
          containerWidth={chartWidth}
        />
      )}
    </div>
  );
}
