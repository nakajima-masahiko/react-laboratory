import { useEffect, useEffectEvent, useImperativeHandle, useRef, useState } from 'react';
import type { ReactNode, Ref, PointerEventHandler } from 'react';
import { readPalette } from './canvas-api';
import type { DrawableCanvas, DrawableContext, Palette, Placement, Size } from './canvas-api';

export type Frame = Size & { context: CanvasRenderingContext2D; palette: Palette; time: number };
export type CanvasLayer = {
  id: string;
  className?: string;
  content: ReactNode;
  place: (stage: Size, element: Size) => Placement;
};
export type StageHandle = { redraw: () => void; savePng: () => void };

type Props = {
  ref?: Ref<StageHandle>;
  native: boolean;
  layers: CanvasLayer[];
  label: string;
  animate?: boolean;
  theme: string;
  draw: (frame: Frame) => void;
  drawForeground?: (frame: Frame) => void;
  onResize?: (size: Size) => void;
  onNativeFailure?: (reason: string) => void;
  onPointerMove?: PointerEventHandler<HTMLDivElement>;
  onPointerLeave?: PointerEventHandler<HTMLDivElement>;
};

/** One visible canvas owns the composite. React owns its drawable children. */
export function CanvasStage({ ref, native, layers, label, animate = false, theme, draw, drawForeground, onResize, onNativeFailure, onPointerMove, onPointerLeave }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const elements = useRef(new Map<string, HTMLDivElement>());
  const redraw = useRef<() => void>(() => {});
  const pendingExport = useRef(false);
  const elapsed = useRef(0);
  const [failure, setFailure] = useState('');
  const [exportStatus, setExportStatus] = useState('');
  const useNative = native && !failure;

  useImperativeHandle(ref, () => ({
    redraw: () => redraw.current(),
    savePng: () => {
      if (!useNative) return;
      pendingExport.current = true;
      setExportStatus('画像を準備しています…');
      redraw.current();
    },
  }), [useNative]);

  const renderFrame = useEffectEvent((size: Size, ratio: Size, time: number) => {
    const target = canvas.current;
    const root = host.current;
    if (!target || !root) return;
    const context = target.getContext('2d') as DrawableContext | null;
    if (!context) return;
    context.setTransform(ratio.width, 0, 0, ratio.height, 0, 0);
    context.clearRect(0, 0, size.width, size.height);
    const frame = { ...size, context, palette: readPalette(root), time };
    context.fillStyle = frame.palette.background;
    context.fillRect(0, 0, size.width, size.height);
    draw(frame);
    for (const layer of layers) {
      const element = elements.current.get(layer.id);
      if (!element) continue;
      const box = { width: element.offsetWidth, height: element.offsetHeight };
      const { x, y, rotation = 0, scale = 1 } = layer.place(size, box);
      if (useNative) {
        context.save();
        context.translate(x, y);
        context.rotate(rotation * Math.PI / 180);
        context.scale(scale, scale);
        // Explicit destination size avoids double-DPR scaling of the default element image.
        context.drawElementImage(element, 0, 0, box.width, box.height);
        context.restore();
      } else {
        element.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${scale})`;
      }
    }
    drawForeground?.(frame);
    if (pendingExport.current) {
      pendingExport.current = false;
      try {
        target.toBlob((blob) => {
          if (!blob) { setExportStatus('画像を作成できませんでした。'); return; }
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'html-in-canvas.png';
          link.click();
          window.setTimeout(() => URL.revokeObjectURL(url), 1000);
          setExportStatus('HTMLを含むPNGを保存しました。');
        }, 'image/png');
      } catch {
        setExportStatus('このブラウザでは画像を書き出せませんでした。');
      }
    }
  });
  const notifyResize = useEffectEvent((size: Size) => onResize?.(size));
  const notifyFailure = useEffectEvent((reason: string) => onNativeFailure?.(reason));

  useEffect(() => {
    const root = host.current;
    const target = canvas.current as DrawableCanvas | null;
    if (!root || !target) return;
    let size: Size = { width: 1, height: 1 };
    let ratio: Size = { width: 1, height: 1 };
    let animation = 0;
    let queuedFrame = 0;
    let visible = true;
    let disposed = false;
    let previousTime = 0;

    const paint = () => {
      if (disposed) return;
      try { renderFrame(size, ratio, elapsed.current); }
      catch (error) {
        if (useNative) {
          pendingExport.current = false;
          const reason = error instanceof Error ? error.name : '描画エラー';
          setFailure(reason);
          notifyFailure(reason);
        } else {
          setExportStatus('描画に失敗しました。ページを再読み込みしてください。');
        }
      }
    };
    const request = () => {
      if (disposed) return;
      if (useNative) target.requestPaint();
      else if (!queuedFrame) queuedFrame = requestAnimationFrame(() => { queuedFrame = 0; paint(); });
    };
    redraw.current = request;
    if (useNative) target.addEventListener('paint', paint);
    const resize = () => {
      const rect = target.getBoundingClientRect();
      size = { width: Math.max(1, rect.width), height: Math.max(1, rect.height) };
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      target.width = Math.round(size.width * dpr);
      target.height = Math.round(size.height * dpr);
      ratio = { width: target.width / size.width, height: target.height / size.height };
      notifyResize(size);
      request();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(target);
    const layerObserver = new ResizeObserver(request);
    for (const element of elements.current.values()) layerObserver.observe(element);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      previousTime = 0;
      if (visible) request();
    });
    intersection.observe(root);
    const visibility = () => { previousTime = 0; if (!document.hidden) request(); };
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('resize', resize);
    const tick = (time: number) => {
      if (visible && !document.hidden) {
        if (previousTime) elapsed.current += Math.min(time - previousTime, 100);
        previousTime = time;
        request();
      }
      animation = requestAnimationFrame(tick);
    };
    if (animate) animation = requestAnimationFrame(tick);
    resize();
    return () => {
      disposed = true;
      redraw.current = () => {};
      resizeObserver.disconnect();
      layerObserver.disconnect();
      intersection.disconnect();
      target.removeEventListener('paint', paint);
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animation);
      cancelAnimationFrame(queuedFrame);
    };
  }, [useNative, animate]);

  useEffect(() => { redraw.current(); }, [layers, theme]);

  const content = layers.map((layer) => (
    <div key={layer.id} {...(useNative ? { drawable: '' } : {})}
      ref={(element) => { if (element) elements.current.set(layer.id, element); else elements.current.delete(layer.id); }}
      className={`hic-layer ${layer.className ?? ''}`} data-layer={layer.id}>
      {layer.content}
    </div>
  ));

  return <>
    <div ref={host} className="hic-stage" data-renderer={useNative ? 'native' : 'overlay'} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
      <canvas ref={canvas} {...(useNative ? { content: 'drawable' } : {})} aria-label={label}>
        {useNative ? content : null}
      </canvas>
      {!useNative && <div className="hic-overlay">{content}</div>}
    </div>
    {failure && <p role="status" className="hic-notice">ネイティブ描画を継続できないため、DOM重ね合わせに切り替えました（{failure}）。</p>}
    <p className="hic-export-status" role="status">{exportStatus}</p>
  </>;
}
