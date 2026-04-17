import { Rectangle } from 'recharts';

interface Props {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  low?: number;
  high?: number;
  openClose?: [number, number];
  bullColor: string;
  bearColor: string;
}

function CandlestickBar(props: Props) {
  const { x = 0, width = 0, low = 0, high = 0, openClose, bullColor, bearColor } = props;

  if (!openClose) return null;

  const [open, close] = openClose;
  const isBull = close >= open;
  const color = isBull ? bullColor : bearColor;
  const bodyY = Math.min(open, close);
  const bodyHeight = Math.abs(open - close) || 1;
  const cx = x + width / 2;

  return (
    <g>
      {/* wick */}
      <line x1={cx} y1={high} x2={cx} y2={low} stroke={color} strokeWidth={1} />
      {/* body */}
      <Rectangle x={x + 1} y={bodyY} width={width - 2} height={bodyHeight} fill={color} />
    </g>
  );
}

export default CandlestickBar;
