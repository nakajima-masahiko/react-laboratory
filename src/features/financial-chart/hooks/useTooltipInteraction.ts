import { type MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import type { PlotRect, TooltipState } from '../types';
import { getNearestDataIndexFromX } from '../utils/getNearestDataIndexFromX';

type UseTooltipInteractionParams = {
  dataLength: number;
  plot: PlotRect;
};

type UseTooltipInteractionResult = {
  activeTooltipState: TooltipState | null;
  handleMouseMove: (event: MouseEvent<HTMLCanvasElement>) => void;
  handleMouseLeave: () => void;
};

export function useTooltipInteraction({
  dataLength,
  plot,
}: UseTooltipInteractionParams): UseTooltipInteractionResult {
  const rafIdRef = useRef<number | null>(null);
  const pendingPointerRef = useRef<TooltipState | null>(null);
  const tooltipStateRef = useRef<TooltipState | null>(null);
  const [tooltipState, setTooltipState] = useState<TooltipState | null>(null);

  useEffect(() => {
    tooltipStateRef.current = tooltipState;
  }, [tooltipState]);
  useEffect(
    () => () => {
      if (rafIdRef.current !== null && typeof window !== 'undefined') {
        window.cancelAnimationFrame(rafIdRef.current);
      }
    },
    [],
  );

  const activeTooltipState = useMemo<TooltipState | null>(() => {
    if (!tooltipState || dataLength === 0) return null;

    return {
      ...tooltipState,
      index: Math.min(tooltipState.index, dataLength - 1),
    };
  }, [dataLength, tooltipState]);

  const handleMouseMove = (event: MouseEvent<HTMLCanvasElement>) => {
    if (dataLength === 0 || plot.width <= 0) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;

    const isOutOfPlot =
      pointerX < plot.left ||
      pointerX > plot.right ||
      pointerY < plot.top ||
      pointerY > plot.bottom;

    if (isOutOfPlot) {
      pendingPointerRef.current = null;
      setTooltipState((current) => (current ? null : current));
      return;
    }

    const nextIndex = getNearestDataIndexFromX(pointerX, plot, dataLength);
    pendingPointerRef.current = { x: pointerX, y: pointerY, index: nextIndex };

    if (rafIdRef.current !== null) return;

    if (typeof window === 'undefined') {
      const pendingPointer = pendingPointerRef.current;
      if (!pendingPointer) return;
      setTooltipState(pendingPointer);
      return;
    }

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
    if (rafIdRef.current !== null && typeof window !== 'undefined') {
      window.cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    pendingPointerRef.current = null;
    setTooltipState((current) => (current ? null : current));
  };

  return {
    activeTooltipState,
    handleMouseMove,
    handleMouseLeave,
  };
}
