/** Current content/drawable API (Chrome 157); deliberately excludes the old origin-trial API. */
export interface DrawableCanvas extends HTMLCanvasElement {
  content: string;
  requestPaint: () => void;
}

export interface DrawableContext extends CanvasRenderingContext2D {
  drawElementImage: (element: Element, x: number, y: number, width: number, height: number) => void;
}

export function supportsHtmlInCanvas(): boolean {
  if (typeof document === 'undefined') return false;
  const canvas = document.createElement('canvas') as DrawableCanvas;
  canvas.setAttribute('content', 'drawable');
  const context = canvas.getContext('2d') as DrawableContext | null;
  return canvas.content === 'drawable'
    && typeof canvas.requestPaint === 'function'
    && typeof context?.drawElementImage === 'function';
}

export type RenderMode = 'auto' | 'overlay';
export type Theme = 'light' | 'dark';
export type DemoProps = { native: boolean; theme: Theme; onNativeFailure: (reason: string) => void };
export type Size = { width: number; height: number };
export type Placement = { x: number; y: number; rotation?: number; scale?: number };
export type Palette = { background: string; text: string; muted: string; grid: string; accent: string; secondary: string };

export function readPalette(element: Element): Palette {
  const style = getComputedStyle(element);
  const token = (name: string) => style.getPropertyValue(`--hic-${name}`).trim();
  return { background: token('canvas'), text: token('text'), muted: token('muted'), grid: token('grid'), accent: token('accent'), secondary: token('secondary') };
}

export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(Math.max(min, max), value));
