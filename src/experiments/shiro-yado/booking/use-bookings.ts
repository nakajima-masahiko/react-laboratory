import { useMemo, useSyncExternalStore } from 'react';
import { parseReservations } from './model';
import { BOOKING_EVENT, BOOKING_KEY } from './storage';

function subscribe(callback: () => void) {
  const storage = (event: StorageEvent) => { if (event.key === BOOKING_KEY || event.key === null) callback(); };
  window.addEventListener('storage', storage);
  window.addEventListener(BOOKING_EVENT, callback);
  return () => { window.removeEventListener('storage', storage); window.removeEventListener(BOOKING_EVENT, callback); };
}
function snapshot() {
  try { return window.localStorage.getItem(BOOKING_KEY) ?? ''; }
  catch { return '!storage-unavailable'; }
}
export function useBookings() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => '');
  return useMemo(() => {
    try { return { reservations: parseReservations(raw), storageError: false }; }
    catch { return { reservations: [], storageError: true }; }
  }, [raw]);
}
