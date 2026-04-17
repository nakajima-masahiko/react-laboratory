import { Rectangle } from 'recharts';

interface Props {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  openClose?: [number, number];
  payload?: {
    low: number;
    high: number;
  };
  yAxis?: {
    scale?: (value: number) => number;
  };
  bullColor: string;
  bearColor: string;
}

function CandlestickBar(props: Props) {
  const { x = 0, y = 0, width = 0, height = 0, openClose, payload, yAxis, bullColor, bearColor } = props;

  if (!openClose) return null;

  const [open, close] = openClose;
  const isBull = close >= open;
  const color = isBull ? bullColor : bearColor;
  const bodyY = y;
  const bodyHeight = Math.max(height, 1);
  const cx = x + width / 2;
  const scale = yAxis?.scale;
  const highY = payload && scale ? scale(payload.high) : y;
  const lowY = payload && scale ? scale(payload.low) : y + height;

  return (
    <g>
      {/* wick */}
      <line x1={cx} y1={highY} x2={cx} y2={lowY} stroke={color} strokeWidth={1} />
      {/* body */}
      <Rectangle x={x + 1} y={bodyY} width={width - 2} height={bodyHeight} fill={color} />
    </g>
  );
}

export default CandlestickBar;
