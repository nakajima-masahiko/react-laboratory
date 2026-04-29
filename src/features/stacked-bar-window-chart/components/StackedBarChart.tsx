import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';

import { XAxis, YAxis } from '../chart/axes';
import { sanitizeStackedValue } from '../chart/sanitize';
import { buildScales } from '../chart/scales';
import type { StackedBarChartTheme, StackedDataPoint, StackedSeries, ValueFormatter } from '../types';
import { ChartTooltip } from './ChartTooltip';

const MARGIN = { top: 8, right: 24, bottom: 32, left: 56 } as const;
const STAGGER_WINDOW_MS = 480;
const DEFAULT_TOOLTIP_SIZE = { width: 180, height: 80 } as const;
const TOOLTIP_PADDING_X = 8;
const TOOLTIP_ARROW_INSET = 14;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

interface StackedBarChartProps<Key extends string> {
  chartData: StackedDataPoint<Key>[];
  series: ReadonlyArray<StackedSeries<Key>>;
  hiddenSeriesKeys: Set<Key>;
  animationKey: string;
  theme: StackedBarChartTheme;
  formatValue: ValueFormatter;
  height: number;
  /** クリックでツールチップを固定する機能を有効にする */
  pinnableTooltip: boolean;
  ariaLabel: string;
  pinnedBadgeLabel: string;
  pinnedHintLabel: string;
}

export function StackedBarChart<Key extends string>({
  chartData,
  series,
  hiddenSeriesKeys,
  animationKey,
  theme,
  formatValue,
  height,
  pinnableTooltip,
  ariaLabel,
  pinnedBadgeLabel,
  pinnedHintLabel,
}: StackedBarChartProps<Key>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [chartWidth, setChartWidth] = useState(0);
  const [tooltipSize, setTooltipSize] = useState<TooltipSize>(DEFAULT_TOOLTIP_SIZE);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [pinnedIndex, setPinnedIndex] = useState<number | null>(null);
  const [prevAnimationKey, setPrevAnimationKey] = useState(animationKey);

  // データ更新時はツールチップ・ピン留めをクリア（React 推奨: render 中に props 変化を検知）
  if (prevAnimationKey !== animationKey) {
    setPrevAnimationKey(animationKey);
    setHoverIndex(null);
    setPinnedIndex(null);
  }

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

  // チャート外クリックでツールチップを閉じる
  useEffect(() => {
    const handleOutsideClick = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setHoverIndex(null);
        setPinnedIndex(null);
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, []);

  const innerWidth = Math.max(0, chartWidth - MARGIN.left - MARGIN.right);
  const innerHeight = Math.max(0, height - MARGIN.top - MARGIN.bottom);

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
        const value = sanitizeStackedValue(row.values[item.key]);
        const yTop = scales.yScale(cumulative[rowIndex] + value);
        const yBottom = scales.yScale(cumulative[rowIndex]);
        const x = scales.xScale(row.key) ?? 0;
        const width = scales.xScale.bandwidth();
        const segHeight = Math.max(0, yBottom - yTop);
        segments.push({
          seriesKey: item.key,
          color: item.color,
          seriesIndex,
          key: `${item.key}-${row.key}`,
          x,
          y: yTop,
          width,
          height: segHeight,
          rowIndex,
        });
        cumulative[rowIndex] += value;
      });
    });
    return segments;
  }, [chartData, visibleSeries, scales, innerWidth]);

  const getIndexFromClientX = (clientX: number): number | null => {
    const svg = svgRef.current;
    if (!svg || innerWidth === 0 || chartData.length === 0) {
      return null;
    }
    const rect = svg.getBoundingClientRect();
    const localX = clientX - rect.left - MARGIN.left;
    if (localX < 0 || localX > innerWidth) {
      return null;
    }
    const bandwidth = scales.xScale.bandwidth();
    let bestIndex = 0;
    let bestDist = Infinity;
    chartData.forEach((row, i) => {
      const barCenter = (scales.xScale(row.key) ?? 0) + bandwidth / 2;
      const dist = Math.abs(localX - barCenter);
      if (dist < bestDist) {
        bestDist = dist;
        bestIndex = i;
      }
    });
    return bestIndex;
  };

  const handlePointerMove = (event: React.PointerEvent<SVGRectElement>) => {
    setHoverIndex(getIndexFromClientX(event.clientX));
  };

  const handlePointerDown = (event: React.PointerEvent<SVGRectElement>) => {
    if (event.pointerType !== 'touch') {
      return;
    }
    setHoverIndex(getIndexFromClientX(event.clientX));
  };

  const handlePointerLeave = (event: React.PointerEvent<SVGRectElement>) => {
    // タッチ操作では指を離すと pointerleave が発火するため hover を維持し、
    // ピン留め可能なら pinnedIndex に転写する。
    if (event.pointerType === 'touch') {
      if (pinnableTooltip) {
        setPinnedIndex(hoverIndex);
      }
      return;
    }
    setHoverIndex(null);
  };

  const handleClick = (event: React.MouseEvent<SVGRectElement>) => {
    if (!pinnableTooltip) return;
    const index = getIndexFromClientX(event.clientX);
    if (index === null) {
      setPinnedIndex(null);
      return;
    }
    setPinnedIndex((prev) => (prev === index ? null : index));
  };

  const activeIndex = hoverIndex ?? pinnedIndex;
  const isPinned = pinnedIndex !== null && hoverIndex === null;

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

  useEffect(() => {
    if (!tooltipAnchor || !tooltipRef.current) {
      return;
    }
    const { width, height } = tooltipRef.current.getBoundingClientRect();
    if (width <= 0 || height <= 0) {
      return;
    }
    setTooltipSize((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height },
    );
  }, [tooltipAnchor, isPinned, hiddenSeriesKeys, series]);

  const tooltipLayout = useMemo(() => {
    if (!tooltipAnchor || chartWidth <= 0) {
      return null;
    }
    const halfWidth = tooltipSize.width / 2;
    const minLeft = halfWidth + TOOLTIP_PADDING_X;
    const maxLeft = Math.max(minLeft, chartWidth - halfWidth - TOOLTIP_PADDING_X);
    const tooltipLeft = clamp(tooltipAnchor.x, minLeft, maxLeft);
    const tooltipLeftEdge = tooltipLeft - halfWidth;
    const rawArrowX = tooltipAnchor.x - tooltipLeftEdge;
    const arrowX = clamp(rawArrowX, TOOLTIP_ARROW_INSET, tooltipSize.width - TOOLTIP_ARROW_INSET);
    return { left: tooltipLeft, top: tooltipAnchor.y, arrowX };
  }, [chartWidth, tooltipAnchor, tooltipSize.width]);

  const ready = chartWidth > 0 && innerWidth > 0;

  return (
    <div ref={containerRef} className="sbwc-chart-host">
      {ready ? (
        <svg
          ref={svgRef}
          width={chartWidth}
          height={height}
          className="sbwc-svg"
          role="img"
          aria-label={ariaLabel}
        >
          <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
            <rect
              x={0}
              y={0}
              width={innerWidth}
              height={innerHeight}
              fill={theme.background}
              rx={4}
            />

            <YAxis
              yScale={scales.yScale}
              innerWidth={innerWidth}
              gridColor={theme.gridColor}
              formatValue={formatValue}
            />
            <XAxis
              xScale={scales.xScale}
              innerHeight={innerHeight}
              chartData={chartData}
              gridColor={theme.gridColor}
              innerWidth={innerWidth}
            />

            {pinnedIndex !== null && hoverIndex !== pinnedIndex && chartData[pinnedIndex] && (
              <rect
                className="sbwc-column-highlight is-pinned"
                x={scales.xScale(chartData[pinnedIndex]!.key) ?? 0}
                y={0}
                width={scales.xScale.bandwidth()}
                height={innerHeight}
                rx={3}
                pointerEvents="none"
              />
            )}

            {hoverIndex !== null && chartData[hoverIndex] && (
              <rect
                className="sbwc-column-highlight"
                x={scales.xScale(chartData[hoverIndex]!.key) ?? 0}
                y={0}
                width={scales.xScale.bandwidth()}
                height={innerHeight}
                rx={3}
                pointerEvents="none"
              />
            )}

            <g key={animationKey} className="sbwc-bars">
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
                    className="sbwc-bar"
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
              className="sbwc-hover-layer"
              x={0}
              y={0}
              width={innerWidth}
              height={innerHeight}
              fill="transparent"
              pointerEvents="all"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              onClick={handleClick}
              aria-hidden="true"
              style={{ cursor: pinnableTooltip && pinnedIndex !== null ? 'pointer' : 'default' }}
            />
          </g>
        </svg>
      ) : (
        <div className="sbwc-svg-placeholder" style={{ height }} aria-hidden="true" />
      )}

      {tooltipAnchor && tooltipLayout && (
        <div
          className="sbwc-tooltip-positioner"
          style={
            {
              left: tooltipLayout.left,
              top: tooltipLayout.top,
              '--sbwc-tooltip-arrow-x': `${tooltipLayout.arrowX}px`,
            } as CSSProperties
          }
        >
          <ChartTooltip
            tooltipRef={tooltipRef}
            row={tooltipAnchor.row}
            series={series}
            hiddenSeriesKeys={hiddenSeriesKeys}
            isPinned={isPinned}
            pinnableTooltip={pinnableTooltip}
            tooltipBg={theme.tooltipBg}
            tooltipBorder={theme.tooltipBorder}
            formatValue={formatValue}
            pinnedBadgeLabel={pinnedBadgeLabel}
            pinnedHintLabel={pinnedHintLabel}
          />
        </div>
      )}
    </div>
  );
}
type TooltipSize = { width: number; height: number };
