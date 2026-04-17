export interface OhlcBar {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

function formatTimeLabel(date: Date): string {
  return date.toLocaleTimeString('ja-JP', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function createNextFxBar(prevClose: number, time: Date): OhlcBar {
  const change = (Math.random() - 0.48) * 0.18;
  const open = parseFloat(prevClose.toFixed(3));
  const close = parseFloat((open + change).toFixed(3));
  const high = parseFloat((Math.max(open, close) + Math.random() * 0.08).toFixed(3));
  const low = parseFloat((Math.min(open, close) - Math.random() * 0.08).toFixed(3));

  return {
    time: formatTimeLabel(time),
    open,
    high,
    low,
    close,
  };
}

function generateFxData(): OhlcBar[] {
  const bars: OhlcBar[] = [];
  let price = 150.0;
  const now = new Date();
  now.setMilliseconds(0);

  for (let i = 59; i >= 0; i--) {
    const d = new Date(now);
    d.setSeconds(now.getSeconds() - i);
    const nextBar = createNextFxBar(price, d);
    bars.push(nextBar);
    price = nextBar.close;
  }

  return bars;
}

export const fxData = generateFxData();
