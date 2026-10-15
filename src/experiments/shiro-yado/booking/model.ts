export const MAX_NIGHTS = 7;
export const ROOM_OFFERS = {
  'room-201': { capacity: 2, nightlyRate: 12000 },
  'room-202': { capacity: 2, nightlyRate: 12000 },
  'room-203': { capacity: 2, nightlyRate: 16000 },
  'room-204': { capacity: 2, nightlyRate: 18000 },
  'room-205': { capacity: 4, nightlyRate: 22000 },
} as const;
export type BookableRoomId = keyof typeof ROOM_OFFERS;
export type Stay = { checkIn: string; checkOut: string; guests: number };
export type Reservation = Stay & {
  id: string; roomId: BookableRoomId; nightlyRate: number; total: number;
  createdAt: string; status: 'confirmed' | 'cancelled';
};
export type BookingError = 'dates' | 'past' | 'window' | 'nights' | 'guests' | 'capacity' | 'unavailable' | 'storage';
const DAY = 86400000;

export function isBookableRoom(id: unknown): id is BookableRoomId {
  return typeof id === 'string' && Object.hasOwn(ROOM_OFFERS, id);
}
export function dateNumber(value: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN;
  const ms = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(ms) && new Date(ms).toISOString().slice(0, 10) === value ? ms / DAY : NaN;
}
export function addDays(value: string, days: number): string {
  const day = dateNumber(value);
  return Number.isFinite(day) ? new Date((day + days) * DAY).toISOString().slice(0, 10) : '';
}
export function japanToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  return ['year', 'month', 'day'].map((kind) => parts.find((part) => part.type === kind)?.value).join('-');
}
export function bookingHorizon(today: string): string {
  const date = new Date(dateNumber(today) * DAY);
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 2, 0)).getUTCDate();
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, Math.min(date.getUTCDate(), lastDay))).toISOString().slice(0, 10);
}
export function nights(stay: Stay): number { return dateNumber(stay.checkOut) - dateNumber(stay.checkIn); }
export function validateStay(stay: Stay, today = japanToday()): BookingError | null {
  if (![stay.checkIn, stay.checkOut].every((date) => Number.isFinite(dateNumber(date)))) return 'dates';
  if (stay.checkIn < today) return 'past';
  if (stay.checkIn > bookingHorizon(today)) return 'window';
  if (nights(stay) < 1 || nights(stay) > MAX_NIGHTS) return 'nights';
  if (!Number.isInteger(stay.guests) || stay.guests < 1 || stay.guests > 4) return 'guests';
  return null;
}
export function overlaps(a: Stay, b: Stay): boolean {
  // Checkout is exclusive: another guest can arrive on the departure date.
  return a.checkIn < b.checkOut && b.checkIn < a.checkOut;
}
export function demoOccupied(roomId: BookableRoomId, date: string): boolean {
  const room = Number(roomId.slice(-3));
  return (dateNumber(date) * 7 + room * 13) % 17 === 0;
}
export function roomAvailability(roomId: BookableRoomId, stay: Stay, reservations: Reservation[], today = japanToday()): BookingError | null {
  const error = validateStay(stay, today);
  if (error) return error;
  if (stay.guests > ROOM_OFFERS[roomId].capacity) return 'capacity';
  if (reservations.some((record) => record.roomId === roomId && record.status === 'confirmed' && overlaps(record, stay))) return 'unavailable';
  for (let day = stay.checkIn; day < stay.checkOut; day = addDays(day, 1)) {
    if (demoOccupied(roomId, day)) return 'unavailable';
  }
  return null;
}
export function totalPrice(roomId: BookableRoomId, stay: Stay): number {
  return ROOM_OFFERS[roomId].nightlyRate * nights(stay);
}
export function isReservation(value: unknown): value is Reservation {
  if (!value || typeof value !== 'object') return false;
  const r = value as Record<string, unknown>;
  if (!isBookableRoom(r.roomId) || typeof r.id !== 'string' || !/^SY-\d{8}-[A-F0-9]{8}$/.test(r.id)) return false;
  if (typeof r.checkIn !== 'string' || typeof r.checkOut !== 'string' || typeof r.guests !== 'number') return false;
  const stay = { checkIn: r.checkIn, checkOut: r.checkOut, guests: r.guests };
  return Number.isFinite(dateNumber(stay.checkIn)) && Number.isFinite(dateNumber(stay.checkOut))
    && nights(stay) >= 1 && nights(stay) <= MAX_NIGHTS
    && Number.isInteger(r.guests) && r.guests >= 1 && r.guests <= ROOM_OFFERS[r.roomId].capacity
    && typeof r.nightlyRate === 'number' && Number.isInteger(r.nightlyRate) && r.nightlyRate > 0 && r.nightlyRate <= 1000000
    && r.total === r.nightlyRate * nights(stay)
    && typeof r.createdAt === 'string' && Number.isFinite(Date.parse(r.createdAt))
    && (r.status === 'confirmed' || r.status === 'cancelled');
}
export function parseReservations(raw: string | null): Reservation[] {
  if (!raw) return [];
  const data: unknown = JSON.parse(raw);
  if (!data || typeof data !== 'object' || !('version' in data) || data.version !== 1 || !('reservations' in data)
    || !Array.isArray(data.reservations) || !data.reservations.every(isReservation)) throw new Error('Invalid booking data');
  const records: Reservation[] = data.reservations;
  if (new Set(records.map((r) => r.id)).size !== records.length) throw new Error('Duplicate booking IDs');
  return records;
}

/** Keep guests and duration, offering at most three nearest bookable arrival dates. */
export function nearbyStays(stay: Stay, reservations: Reservation[], today = japanToday(), preferred?: BookableRoomId): Stay[] {
  if (validateStay(stay, today)) return [];
  const offers = preferred ? [preferred] : Object.keys(ROOM_OFFERS) as BookableRoomId[];
  const alternatives: Stay[] = [];
  for (let day = today; day <= bookingHorizon(today); day = addDays(day, 1)) {
    if (day === stay.checkIn) continue;
    const candidate = { ...stay, checkIn: day, checkOut: addDays(day, nights(stay)) };
    if (offers.some(id => !roomAvailability(id, candidate, reservations, today))) alternatives.push(candidate);
  }
  return alternatives.sort((a, b) => Math.abs(dateNumber(a.checkIn) - dateNumber(stay.checkIn)) - Math.abs(dateNumber(b.checkIn) - dateNumber(stay.checkIn)) || a.checkIn.localeCompare(b.checkIn)).slice(0, 3);
}
