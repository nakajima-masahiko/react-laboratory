import { type ChartTheme, type PlotRect, type TooltipContentItem, type TooltipState } from '../types';

const TOOLTIP_HORIZONTAL_PADDING = 8;
const TOOLTIP_OFFSET_X = 14;
const TOOLTIP_WIDTH = 180;

type ChartTooltipOverlayProps = {
  activeTooltipState: TooltipState | null;
  tooltipContent: TooltipContentItem[] | null;
  plot: PlotRect;
  width: number;
  theme: ChartTheme;
};

function ChartTooltipOverlay({
  activeTooltipState,
  tooltipContent,
  plot,
  width,
  theme,
}: ChartTooltipOverlayProps) {
  if (!activeTooltipState) return null;

  const tooltipLeft = Math.max(
    TOOLTIP_HORIZONTAL_PADDING,
    Math.min(
      width - TOOLTIP_WIDTH - TOOLTIP_HORIZONTAL_PADDING,
      activeTooltipState.x + TOOLTIP_OFFSET_X,
    ),
  );

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: `${plot.top}px`,
          left: `${activeTooltipState.x}px`,
          height: `${plot.height}px`,
          borderLeft: `1px dashed ${theme.tooltipGuideLine}`,
          pointerEvents: 'none',
          zIndex: 5,
        }}
      />
      {tooltipContent ? (
        <div
          style={{
            position: 'absolute',
            top: `${Math.max(8, activeTooltipState.y - 12)}px`,
            left: `${tooltipLeft}px`,
            transform: 'translateY(-100%)',
            pointerEvents: 'none',
            background: theme.tooltipBackground,
            color: theme.tooltipText,
            borderRadius: '6px',
            padding: '8px 10px',
            fontSize: '12px',
            lineHeight: 1.5,
            minWidth: '156px',
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            boxShadow: theme.tooltipShadow,
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
    </>
  );
}

export default ChartTooltipOverlay;
