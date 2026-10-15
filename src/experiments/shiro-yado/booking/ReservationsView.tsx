import { useState } from 'react';
import { useNav } from '../nav-state';
import { localizePlace } from '../place-i18n';
import { useHotelStore } from '../store';
import { BOOKING_COPY } from './copy';
import { BookingDetails } from './BookingDetails';
import type { BookingError } from './model';
import { cancelReservation, notifyBookingsChanged, withBookingLock } from './storage';
import { useBookings } from './use-bookings';

export function ReservationsView() {
  const { go } = useNav();
  const locale = useHotelStore((s) => s.locale);
  const setMyRoom = useHotelStore((s) => s.setMyRoom);
  const copy = BOOKING_COPY[locale];
  const { reservations, storageError } = useBookings();
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [error, setError] = useState<BookingError | null>(null);
  const [busy, setBusy] = useState(false);
  async function cancel(id: string) {
    if (busy) return;
    setBusy(true);
    try {
      const issue = await withBookingLock(() => cancelReservation(window.localStorage, id));
      setError(issue);
      if (!issue) { setCancelId(null); notifyBookingsChanged(); }
    } catch { setError('storage'); }
    finally { setBusy(false); }
  }
  return <div className="shiro-yado__stack" data-testid="reservations-page">
    <header className="shiro-yado__hero"><p className="shiro-yado__booking-badge">{copy.demo}</p><h2>{copy.myBookings}</h2><p className="shiro-yado__muted">{copy.deviceNote}</p></header>
    <button type="button" className="shiro-yado__btn shiro-yado__btn--accent" onClick={() => go({ v: 'booking' })}>{copy.search}</button>
    {(storageError || error) && <p role="alert" className="shiro-yado__booking-notice">{copy.errors[storageError ? 'storage' : error!]}</p>}
    {!storageError && !reservations.length && <p className="shiro-yado__card">{copy.empty}</p>}
    {[...reservations].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((record) => <article key={record.id} className="shiro-yado__card shiro-yado__booking-confirm" data-reservation={record.id}>
      <p className="shiro-yado__booking-badge">{record.status === 'confirmed' ? copy.confirmed : copy.cancelled}</p>
      <h3>{localizePlace(locale, record.roomId).name}</h3>
      <p>{copy.reference}: <strong>{record.id}</strong></p>
      <BookingDetails roomId={record.roomId} stay={record} nightlyRate={record.nightlyRate} total={record.total} />
      {record.status === 'confirmed' && <>
        <button type="button" className="shiro-yado__btn shiro-yado__btn--outline" onClick={() => { setMyRoom(record.roomId); go({ v: 'guide', p: record.roomId }); }}>{copy.guide}</button>
        {cancelId === record.id ? <div className="shiro-yado__booking-cancel" role="group" aria-label={copy.cancelQuestion}>
          <p>{copy.cancelQuestion}</p>
          <button type="button" className="shiro-yado__btn shiro-yado__btn--outline" disabled={busy} onClick={() => void cancel(record.id)}>{copy.cancelYes}</button>
          <button type="button" className="shiro-yado__btn shiro-yado__btn--ghost" disabled={busy} onClick={() => setCancelId(null)}>{copy.cancelNo}</button>
        </div> : <button type="button" className="shiro-yado__btn shiro-yado__btn--ghost" onClick={() => { setCancelId(record.id); setError(null); }}>{copy.cancel}</button>}
      </>}
    </article>)}
  </div>;
}
