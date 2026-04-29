import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';

import { XAxis, YAxis } from '../chart/axes';
import { sanitizeStackedValue } from '../chart/sanitize';
import { buildScales } from '../chart/scales';
import type {
  StackedBarAnimationMode,
  StackedBarChartTheme,
  StackedDataPoint,
  StackedSeries,
  ValueFormatter,
} from '../types';
import { ChartTooltip } from './ChartTooltip';

const STAGGER_WINDOW_MS = 480;

interface StackedBarChartProps<Key extends string> { chartData: StackedDataPoint<Key>[]; series: ReadonlyArray<StackedSeries<Key>>; hiddenSeriesKeys: Set<Key>; animationKey: string; animationMode: StackedBarAnimationMode; theme: StackedBarChartTheme; formatValue: ValueFormatter; height: number; pinnableTooltip: boolean; ariaLabel: string; pinnedBadgeLabel: string; pinnedHintLabel: string; }

export function StackedBarChart<Key extends string>({ chartData, series, hiddenSeriesKeys, animationKey, animationMode, theme, formatValue, height, pinnableTooltip, ariaLabel, pinnedBadgeLabel, pinnedHintLabel, }: StackedBarChartProps<Key>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [chartWidth, setChartWidth] = useState(0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [pinnedIndex, setPinnedIndex] = useState<number | null>(null);
  const [prevAnimationKey, setPrevAnimationKey] = useState(animationKey);
  const [tooltipRect, setTooltipRect] = useState({ width: 0, height: 0 });

  if (prevAnimationKey !== animationKey) { setPrevAnimationKey(animationKey); setHoverIndex(null); setPinnedIndex(null); }
  useEffect(() => { const node = containerRef.current; if (!node) return; const observer = new ResizeObserver((entries) => { for (const entry of entries) setChartWidth(Math.max(0, Math.floor(entry.contentRect.width)));}); observer.observe(node); return () => observer.disconnect(); }, []);
  useEffect(() => { const node = tooltipRef.current; if (!node) return; const observer = new ResizeObserver((entries)=>{for(const entry of entries){setTooltipRect({width:entry.contentRect.width,height:entry.contentRect.height});}}); observer.observe(node); return ()=>observer.disconnect(); }, [hoverIndex,pinnedIndex,chartData.length]);

  const isCompact = chartWidth > 0 && chartWidth < 480;
  const margin = isCompact ? { top: 8, right: 12, bottom: 28, left: 42 } : { top: 8, right: 24, bottom: 32, left: 56 };
  const resolvedHeight = isCompact ? Math.min(height, 320) : height;
  const innerWidth = Math.max(0, chartWidth - margin.left - margin.right);
  const innerHeight = Math.max(0, resolvedHeight - margin.top - margin.bottom);
  const visibleSeries = useMemo(() => series.filter((item) => !hiddenSeriesKeys.has(item.key)), [series, hiddenSeriesKeys]);
  const scales = useMemo(() => buildScales(chartData, visibleSeries.map((item) => item.key), innerWidth, innerHeight), [chartData, visibleSeries, innerWidth, innerHeight]);

  const stackSegments = useMemo(() => { if (innerWidth === 0) return []; const cumulative = new Array(chartData.length).fill(0); const segs: Array<{ seriesKey: Key; color: string; seriesIndex: number; key: string; x: number; y: number; width: number; height: number; rowIndex: number; }> = []; visibleSeries.forEach((item, seriesIndex) => { chartData.forEach((row, rowIndex) => { const value = sanitizeStackedValue(row.values[item.key]); const yTop = scales.yScale(cumulative[rowIndex] + value); const yBottom = scales.yScale(cumulative[rowIndex]); const x = scales.xScale(row.key) ?? 0; const width = scales.xScale.bandwidth(); segs.push({seriesKey:item.key,color:item.color,seriesIndex,key:`${item.key}-${row.key}`,x,y:yTop,width,height:Math.max(0,yBottom-yTop),rowIndex}); cumulative[rowIndex]+=value;});}); return segs; }, [chartData, visibleSeries, scales, innerWidth]);

  const activeIndex = hoverIndex ?? pinnedIndex;
  const tooltipAnchor = useMemo(() => { if (activeIndex === null || visibleSeries.length === 0) return null; const row = chartData[activeIndex]; if (!row) return null; const barCenterX = (scales.xScale(row.key) ?? 0) + scales.xScale.bandwidth() / 2 + margin.left; const rowSegments = stackSegments.filter((s) => s.rowIndex === activeIndex); if (!rowSegments.length) return null; return { row, x: barCenterX, y: Math.min(...rowSegments.map((s) => s.y)) + margin.top }; }, [activeIndex, chartData, scales, stackSegments, visibleSeries.length, margin.left, margin.top]);

  const canAnimate = animationMode !== 'none';

  const tooltipPosition = useMemo(() => {
    if (!tooltipAnchor || chartWidth <= 0) return null;
    const pad=8; const arrow=8;
    const minLeft = tooltipRect.width/2 + pad; const maxLeft = chartWidth - tooltipRect.width/2 - pad;
    const left = Math.min(maxLeft, Math.max(minLeft, tooltipAnchor.x));
    const canTop = tooltipAnchor.y - tooltipRect.height - arrow - pad >= 0;
    const placement = canTop ? 'top' : 'bottom';
    const top = canTop ? tooltipAnchor.y - arrow : Math.min(resolvedHeight - tooltipRect.height - arrow - pad, tooltipAnchor.y + arrow);
    const arrowX = Math.max(10, Math.min(tooltipRect.width-10, tooltipAnchor.x - (left - tooltipRect.width/2)));
    return { left, top, placement, arrowX };
  }, [tooltipAnchor, chartWidth, tooltipRect, resolvedHeight]);

  return <div ref={containerRef} className="sbwc-chart-host">{chartWidth>0?<svg ref={svgRef} width={chartWidth} height={resolvedHeight} className="sbwc-svg" role="img" aria-label={ariaLabel}><g transform={`translate(${margin.left}, ${margin.top})`}><rect x={0} y={0} width={innerWidth} height={innerHeight} fill={theme.background} rx={4}/><YAxis yScale={scales.yScale} innerWidth={innerWidth} gridColor={theme.gridColor} formatValue={formatValue}/><XAxis xScale={scales.xScale} innerHeight={innerHeight} chartData={chartData} gridColor={theme.gridColor} innerWidth={innerWidth}/><g key={canAnimate?animationKey:'no-animation'} className={`sbwc-bars ${canAnimate?'':'is-static'}`}>{stackSegments.map((segment)=>{const d=visibleSeries.length>1?STAGGER_WINDOW_MS/(visibleSeries.length-1):0;const style={'--bar-delay':`${segment.seriesIndex*d}ms`,transformOrigin:`${segment.x+segment.width/2}px ${innerHeight}px`} as CSSProperties;return <rect key={segment.key} className="sbwc-bar" x={segment.x} y={segment.y} width={segment.width} height={segment.height} fill={segment.color} style={style}/>;})}</g><rect className="sbwc-hover-layer" x={0} y={0} width={innerWidth} height={innerHeight} fill="transparent" pointerEvents="all" onPointerMove={(e)=>setHoverIndex(Math.max(0,Math.min(chartData.length-1,Math.floor((e.nativeEvent.offsetX / Math.max(1,innerWidth))*chartData.length))))} onPointerLeave={()=>setHoverIndex(null)} onClick={()=> pinnableTooltip && setPinnedIndex((p)=>p===hoverIndex?null:hoverIndex)} aria-hidden="true"/></g></svg>:<div className="sbwc-svg-placeholder" style={{height:resolvedHeight}} aria-hidden="true"/>}
  {tooltipAnchor && tooltipPosition && <div ref={tooltipRef} className="sbwc-tooltip-positioner" data-placement={tooltipPosition.placement} style={{left:tooltipPosition.left, top:tooltipPosition.top, ['--sbwc-arrow-x' as string]: `${tooltipPosition.arrowX}px`}}><ChartTooltip row={tooltipAnchor.row} series={series} hiddenSeriesKeys={hiddenSeriesKeys} isPinned={pinnedIndex!==null&&hoverIndex===null} pinnableTooltip={pinnableTooltip} tooltipBg={theme.tooltipBg} tooltipBorder={theme.tooltipBorder} formatValue={formatValue} pinnedBadgeLabel={pinnedBadgeLabel} pinnedHintLabel={pinnedHintLabel}/></div>}
  </div>;
}
