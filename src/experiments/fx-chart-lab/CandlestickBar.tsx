import type { OhlcBar } from './data';

interface Props {
  x?: number;
  width?: number;
  payload?: OhlcBar;
  yAxis?: {
    scale?: (value: number) => number;
  };
  bullColor: string;
  bearColor: string;
}

function CandlestickBar(props: Props) {
  const { x = 0, width = 0, payload, yAxis, bullColor, bearColor } = props;
  const scale = yAxis?.scale;

  if (!payload || !scale) return null;

  const { open, high, low, close } = payload;
  const isBull = close >= open;
  const color = isBull ? bullColor : bearColor;

  const highY = scale(high);
  const lowY = scale(low);
  const openY = scale(open);
  const closeY = scale(close);

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
