import { japanToday, isBookableRoom, parseReservations, roomAvailability, ROOM_OFFERS, totalPrice, type BookingError, type Reservation, type Stay } from './model';

export const BOOKING_KEY = 'shiro-yado-bookings-v1';
export const BOOKING_EVENT = 'shiro-yado-bookings-change';
type StoragePort = Pick<Storage, 'getItem' | 'setItem'>;
export type SaveResult = { reservation: Reservation; error?: never } | { error: BookingError; reservation?: never };
function write(storage: StoragePort, reservations: Reservation[]) {
  storage.setItem(BOOKING_KEY, JSON.stringify({ version: 1, reservations }));
}
export function createReservation(storage: StoragePort, roomId: string, stay: Stay, id: string, now = new Date()): SaveResult {
  try {
    if (!isBookableRoom(roomId)) return { error: 'unavailable' };
    const records = parseReservations(storage.getItem(BOOKING_KEY));
    const existing = records.find((r) => r.id === id);
    if (existing) {
      return existing.status === 'confirmed' && existing.roomId === roomId && existing.checkIn === stay.checkIn
        && existing.checkOut === stay.checkOut && existing.guests === stay.guests ? { reservation: existing } : { error: 'unavailable' };
    }
    const today = japanToday(now);
    const error = roomAvailability(roomId, stay, records, today);
    if (error) return { error };
    const reservation: Reservation = { ...stay, id, roomId, status: 'confirmed', nightlyRate: ROOM_OFFERS[roomId].nightlyRate,
      total: totalPrice(roomId, stay), createdAt: now.toISOString() };
    // Validate the full payload before saving, including the supplied id.
    parseReservations(JSON.stringify({ version: 1, reservations: [...records, reservation] }));
    write(storage, [...records, reservation]);
    return { reservation };
  } catch { return { error: 'storage' }; }
}
export function cancelReservation(storage: StoragePort, id: string): BookingError | null {
  try {
    const records = parseReservations(storage.getItem(BOOKING_KEY));
    if (!records.some((r) => r.id === id)) return 'unavailable';
    write(storage, records.map((r) => r.id === id ? { ...r, status: 'cancelled' } : r));
    return null;
  } catch { return 'storage'; }
}
export async function withBookingLock<T>(work: () => T): Promise<T> {
  return typeof navigator !== 'undefined' && navigator.locks ? navigator.locks.request(BOOKING_KEY, work) : work();
}
export function notifyBookingsChanged() { window.dispatchEvent(new Event(BOOKING_EVENT)); }
