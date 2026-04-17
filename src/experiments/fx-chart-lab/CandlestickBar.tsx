import type { OhlcBar } from './data';

interface Props {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: OhlcBar;
  bullColor: string;
  bearColor: string;
}

function CandlestickBar(props: Props) {
  const { x = 0, y = 0, width = 0, height = 0, payload, bullColor, bearColor } = props;

  if (!payload) return null;

  const { open, high, low, close } = payload;
  const isBull = close >= open;
  const color = isBull ? bullColor : bearColor;

  const range = high - low;
  const toY = (value: number) =>
    range === 0 ? y : y + ((high - value) / range) * height;

  const highY = y;
  const lowY = y + height;
  const openY = toY(open);
  const closeY = toY(close);

  const cx = x + width / 2;
  const bodyTop = Math.min(openY, closeY);
  const bodyHeight = Math.max(Math.abs(closeY - openY), 1);
  const bodyX = x + 1;
  const bodyWidth = Math.max(width - 2, 1);

  return (
    <g>
      <line x1={cx} y1={highY} x2={cx} y2={lowY} stroke={color} strokeWidth={1} />
      <rect x={bodyX} y={bodyTop} width={bodyWidth} height={bodyHeight} fill={color} />
    </g>
  );
}

export default CandlestickBar;
