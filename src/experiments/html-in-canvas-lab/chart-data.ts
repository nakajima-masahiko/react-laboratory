export type PricePoint = [time: number, price: number];
export const HISTORY_SIZE = 180;
const START = Date.UTC(2026, 10, 7, 0, 0, 0);

/** A reproducible demonstration feed, never a market-data connection. */
export function makePoint(index: number): PricePoint {
  return [START + index * 1000, Number((153.2 + Math.sin(index / 16) * .17 + Math.sin(index / 4.7) * .035 + Math.cos(index / 41) * .08).toFixed(3))];
}
export const initialPrices = () => Array.from({ length: HISTORY_SIZE }, (_, index) => makePoint(index));
export const formatTime = (time: number) => new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(time);
