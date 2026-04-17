export interface OhlcBar {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

function generateFxData(): OhlcBar[] {
  const bars: OhlcBar[] = [];
  let price = 150.0;
  const start = new Date('2024-01-02');
  for (let i = 0; i < 60; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const day = d.getDay();
    if (day === 0 || day === 6) continue;

    const change = (Math.random() - 0.48) * 1.2;
    const open = parseFloat(price.toFixed(3));
    const close = parseFloat((open + change).toFixed(3));
    const high = parseFloat((Math.max(open, close) + Math.random() * 0.4).toFixed(3));
    const low = parseFloat((Math.min(open, close) - Math.random() * 0.4).toFixed(3));
    bars.push({
      time: `${d.getMonth() + 1}/${d.getDate()}`,
      open,
      high,
      low,
      close,
    });
    price = close;
  }
  return bars;
}

export const fxData = generateFxData();
