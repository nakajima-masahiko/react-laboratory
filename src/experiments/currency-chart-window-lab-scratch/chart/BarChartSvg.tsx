import * as RadixTooltip from '@radix-ui/react-tooltip';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { ChartRow, SeriesDefinition } from '../types';
import { XAxis, YAxis } from './axes';
import { buildScales } from './scales';
import { ChartTooltipContent } from './tooltip';

const MARGIN = { top: 8, right: 24, bottom: 32, left: 56 } as const;
const CHART_HEIGHT = 460;
const STAGGER_WINDOW_MS = 480;

interface BarChartSvgProps<Key extends string> {
  chartData: ChartRow<Key>[];
  series: ReadonlyArray<SeriesDefinition<Key>>;
  hiddenSeriesKeys: Set<Key>;
  animationKey: string;
  chartBackground: string;
  gridColor: string;
}

export function BarChartSvg<Key extends string>({
  chartData,
  series,
  hiddenSeriesKeys,
  animationKey,
  chartBackground,
  gridColor,
}: BarChartSvgProps<Key>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [chartWidth, setChartWidth] = useState(0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [pinnedIndex, setPinnedIndex] = useState<number | null>(null);

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

  // グラフ更新時にツールチップを非表示にする
  useEffect(() => {
    setPinnedIndex(null);
    setHoverIndex(null);
  }, [animationKey]);

  const innerWidth = Math.max(0, chartWidth - MARGIN.left - MARGIN.right);
  const innerHeight = Math.max(0, CHART_HEIGHT - MARGIN.top - MARGIN.bottom);

  const visibleSeries = useMemo(
    () => series.filter((item) => !hiddenSeriesKeys.has(item.key)),
    [series, hiddenSeriesKeys],
  );

  const scales = useMemo(
    () =>
      buildScales(
        chartData,
        visibleSeries.map((item) => item.key),
        innerWidth,
        innerHeight,
      ),
    [chartData, visibleSeries, innerWidth, innerHeight],
  );

  const stackSegments = useMemo(() => {
    if (innerWidth === 0) {
      return [];
    }
    const cumulative = new Array(chartData.length).fill(0);
    const segments: Array<{
      seriesKey: Key;
      color: string;
      seriesIndex: number;
      key: string;
      x: number;
      y: number;
      width: number;
      height: number;
      rowIndex: number;
    }> = [];

    visibleSeries.forEach((item, seriesIndex) => {
      chartData.forEach((row, rowIndex) => {
        const value = row.values[item.key];
        const yTop = scales.yScale(cumulative[rowIndex] + value);
        const yBottom = scales.yScale(cumulative[rowIndex]);
        const x = scales.xScale(row.key) ?? 0;
        const width = scales.xScale.bandwidth();
        const height = Math.max(0, yBottom - yTop);
        segments.push({
          seriesKey: item.key,
          color: item.color,
          seriesIndex,
          key: `${item.key}-${row.key}`,
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
  }, [chartData, visibleSeries, scales, innerWidth]);

  const getIndexFromClientX = (clientX: number): number | null => {
    const svg = svgRef.current;
    if (!svg || innerWidth === 0) {
      return null;
    }
    const rect = svg.getBoundingClientRect();
    const localX = clientX - rect.left - MARGIN.left;
    const step = scales.xScale.step();
    if (step <= 0) {
      return null;
    }
    const index = Math.max(0, Math.min(chartData.length - 1, Math.floor(localX / step)));
    const row = chartData[index];
    if (!row) {
      return null;
    }
    const bandStart = scales.xScale(row.key) ?? 0;
    const bandEnd = bandStart + scales.xScale.bandwidth();
    if (localX < bandStart || localX > bandEnd) {
      return null;
    }
    return index;
  };

  const handlePointerMove = (event: React.PointerEvent<SVGRectElement>) => {
    setHoverIndex(getIndexFromClientX(event.clientX));
  };

  const handlePointerLeave = () => setHoverIndex(null);

  const handleClick = (event: React.MouseEvent<SVGRectElement>) => {
    const index = getIndexFromClientX(event.clientX);
    setPinnedIndex((prev) => (index === null || prev === index ? null : index));
  };

  // ホバー中はホバーを優先、離れた後はピン留め表示
  const activeIndex = hoverIndex ?? pinnedIndex;

  // ツールチップのアンカー位置（棒グラフ上端の中央）
  const tooltipAnchor = useMemo(() => {
    if (activeIndex === null || visibleSeries.length === 0) return null;
    const row = chartData[activeIndex];
    if (!row) return null;
    const barCenterX = (scales.xScale(row.key) ?? 0) + scales.xScale.bandwidth() / 2 + MARGIN.left;
    const rowSegments = stackSegments.filter((s) => s.rowIndex === activeIndex);
    if (rowSegments.length === 0) return null;
    const barTopY = Math.min(...rowSegments.map((s) => s.y)) + MARGIN.top;
    return { row, x: barCenterX, y: barTopY };
  }, [activeIndex, chartData, scales, stackSegments, visibleSeries.length]);

  const ready = chartWidth > 0 && innerWidth > 0;

  return (
    <RadixTooltip.Provider>
      <RadixTooltip.Root open={tooltipAnchor !== null} onOpenChange={() => {}} delayDuration={0}>
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
                {/* チャートエリア背景 */}
                <rect
                  x={0}
                  y={0}
                  width={innerWidth}
                  height={innerHeight}
                  fill={chartBackground}
                  rx={4}
                />

                <YAxis yScale={scales.yScale} innerWidth={innerWidth} gridColor={gridColor} />
                <XAxis xScale={scales.xScale} innerHeight={innerHeight} chartData={chartData} gridColor={gridColor} />

                <g key={animationKey} className="ccws-bars">
                  {stackSegments.map((segment) => {
                    const perSeriesDelay =
                      visibleSeries.length > 1 ? STAGGER_WINDOW_MS / (visibleSeries.length - 1) : 0;
                    const style = {
                      '--bar-delay': `${segment.seriesIndex * perSeriesDelay}ms`,
                      transformOrigin: `${segment.x + segment.width / 2}px ${innerHeight}px`,
                    } as CSSProperties;
                    return (
                      <rect
                        key={segment.key}
                        className="ccws-bar"
                        x={segment.x}
                        y={segment.y}
                        width={segment.width}
                        height={segment.height}
                        fill={segment.color}
                        style={style}
                        data-series={segment.seriesKey}
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
                  onClick={handleClick}
                  aria-hidden="true"
                  style={{ cursor: 'pointer' }}
                />
              </g>
            </svg>
          ) : (
            <div className="ccws-svg-placeholder" style={{ height: CHART_HEIGHT }} aria-hidden="true" />
          )}

          {/* 棒グラフ上端中央に配置する不可視のツールチップアンカー */}
          <RadixTooltip.Trigger asChild>
            <div
              aria-hidden="true"
              tabIndex={-1}
              style={{
                position: 'absolute',
                left: tooltipAnchor?.x ?? 0,
                top: tooltipAnchor?.y ?? 0,
                width: 0,
                height: 0,
                pointerEvents: 'none',
                outline: 'none',
              }}
            />
          </RadixTooltip.Trigger>
        </div>

        <RadixTooltip.Portal>
          {tooltipAnchor && (
            <ChartTooltipContent
              row={tooltipAnchor.row}
              series={series}
              hiddenSeriesKeys={hiddenSeriesKeys}
            />
          )}
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
