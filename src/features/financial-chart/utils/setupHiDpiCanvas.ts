export function setupHiDpiCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  devicePixelRatio: number,
): void {
  const pixelWidth = Math.round(width * devicePixelRatio);
  const pixelHeight = Math.round(height * devicePixelRatio);

  if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
  if (canvas.height !== pixelHeight) canvas.height = pixelHeight;

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
}
