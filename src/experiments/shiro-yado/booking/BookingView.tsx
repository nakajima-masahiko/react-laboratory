import { useEffect, useRef, useState } from 'react';
import type { PlaceId } from '../hotel-data';
import { useNav } from '../nav-state';
import { localizePlace } from '../place-i18n';
import { useHotelStore } from '../store';
import { BOOKING_COPY, money } from './copy';
import { NearbyDates } from './NearbyDates';
import { JOURNEY, stayDate } from './ux-copy';
import { RoomVisual } from './RoomVisual';
import { BookingDetails } from './BookingDetails';
import { addDays, bookingHorizon, isBookableRoom, japanToday, MAX_NIGHTS, nights, roomAvailability, ROOM_OFFERS, totalPrice, validateStay, type BookableRoomId, type BookingError, type Reservation, type Stay } from './model';
import { createReservation, notifyBookingsChanged, withBookingLock } from './storage';
import { useBookings } from './use-bookings';

export function BookingView({ preferredRoom }: { preferredRoom?: PlaceId }) {
  const { go } = useNav();
  const locale = useHotelStore((s) => s.locale);
  const setMyRoom = useHotelStore((s) => s.setMyRoom);
  const copy = BOOKING_COPY[locale];
  const { reservations, storageError } = useBookings();
  const [today, setToday] = useState(japanToday);
  const [draft, setDraft] = useState<Stay>(() => ({ checkIn: japanToday(), checkOut: addDays(japanToday(), 1), guests: 2 }));
  const [searched, setSearched] = useState<Stay | null>(null);
  const [selected, setSelected] = useState<BookableRoomId | null>(null);
  const [phase, setPhase] = useState<'search' | 'confirm' | 'complete'>('search');
  const [error, setError] = useState<BookingError | null>(null);
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState<Reservation | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const resultsHeading = useRef<HTMLHeadingElement>(null);
  const preferred = isBookableRoom(preferredRoom) ? preferredRoom : null;
  const requestId = useRef('');
  const submitting = useRef(false);
  const horizon = bookingHorizon(today);

  useEffect(() => {
    const refresh = () => setToday(japanToday());
    const timer = window.setInterval(refresh, 60000);
    document.addEventListener('visibilitychange', refresh);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', refresh); };
  }, []);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); heading.current?.scrollIntoView({ block: 'start' }); }, [phase]);

  useEffect(() => { if (searched) { resultsHeading.current?.focus({ preventScroll: true }); resultsHeading.current?.scrollIntoView({ block: 'start' }); } }, [searched]);

  const update = (next: Stay) => { setDraft(next); setSearched(null); setError(null); };
  const rooms = (Object.keys(ROOM_OFFERS) as BookableRoomId[]).sort((a, b) => Number(b === preferred) - Number(a === preferred));
  const available = searched ? rooms.filter((id) => !roomAvailability(id, searched, reservations, today)) : [];
  const room = selected ? localizePlace(locale, selected) : null;
  const result = completed ? reservations.find((r) => r.id === completed.id) ?? completed : null;
  const issue = storageError ? 'storage' : error;
  const guide = (id: BookableRoomId) => { setMyRoom(id); go({ v: 'guide', p: id }); };

  async function confirm() {
    if (!selected || !searched || submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError(null);
    try {
      const saved = await withBookingLock(() => createReservation(window.localStorage, selected, searched, requestId.current));
      if (saved.error) setError(saved.error);
      else { setCompleted(saved.reservation); setPhase('complete'); notifyBookingsChanged(); }
    } catch { setError('storage'); }
    finally { submitting.current = false; setBusy(false); }
  }

  return <div className="shiro-yado__stack" data-testid="booking-page">
    <header className="shiro-yado__hero">
      <p className="shiro-yado__booking-badge">{copy.demo}</p>
      <h2 ref={heading} tabIndex={-1}>{phase === 'search' ? copy.title : phase === 'confirm' ? copy.confirmTitle : result?.status === 'cancelled' ? copy.cancelled : copy.completeTitle}</h2>
      <p className="shiro-yado__muted">{phase === 'complete' ? copy.completeBody : copy.lead}</p>
    </header>
    <button type="button" className="shiro-yado__btn shiro-yado__btn--outline" onClick={() => go({ v: 'reservations' })}>{copy.myBookings}</button>
    {issue && <p className="shiro-yado__booking-notice" role="alert" id="booking-error">{copy.errors[issue]}</p>}
    {phase === 'search' && <>
      <p className="shiro-yado__muted">{JOURNEY[locale].window}</p>
      <form className="shiro-yado__card shiro-yado__booking-form" noValidate aria-describedby={issue ? 'booking-policy booking-error' : 'booking-policy'} onSubmit={(event) => {
        event.preventDefault();
        const current = japanToday(); setToday(current);
        const invalid = validateStay(draft, current);
        setError(invalid); setSearched(invalid ? null : { ...draft });
      }}>
        <label>{copy.checkIn}<input aria-label={copy.checkIn} type="date" required value={draft.checkIn} min={today} max={horizon} onChange={(event) => {
          const checkIn = event.target.value;
          const checkOut = !draft.checkOut || draft.checkOut <= checkIn || nights({ ...draft, checkIn }) > MAX_NIGHTS ? addDays(checkIn, 1) : draft.checkOut;
          update({ ...draft, checkIn, checkOut });
        }} /></label>
        <label>{copy.checkOut}<input aria-label={copy.checkOut} type="date" required value={draft.checkOut} min={addDays(draft.checkIn, 1)} max={addDays(draft.checkIn, MAX_NIGHTS)} onChange={(event) => update({ ...draft, checkOut: event.target.value })} /></label>
        <label>{copy.guests}<select aria-label={copy.guests} value={draft.guests} onChange={(event) => update({ ...draft, guests: Number(event.target.value) })}>
          {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
        </select></label>
        <p id="booking-policy" className="shiro-yado__muted">{copy.policy(horizon)}</p>
        <button type="submit" className="shiro-yado__btn shiro-yado__btn--accent" disabled={storageError}>{copy.search}</button>
      </form>
      {searched && <section className="shiro-yado__section" aria-labelledby="booking-results-title">
        <h3 ref={resultsHeading} tabIndex={-1} id="booking-results-title">{copy.available}</h3>
        <p className="shiro-yado__muted">{stayDate(locale, searched.checkIn)} → {stayDate(locale, searched.checkOut)} · {copy.nights}: {nights(searched)} · {copy.guests}: {searched.guests}</p>
        {preferred && roomAvailability(preferred, searched, reservations, today) && <p className="shiro-yado__booking-notice">
          {localizePlace(locale, preferred).name}: {copy.errors[roomAvailability(preferred, searched, reservations, today)!]}
        </p>}
        {!available.length && <>
          <p role="status" className="shiro-yado__card">{copy.noRooms}</p>
          <NearbyDates stay={searched} reservations={reservations} today={today} preferred={preferred ?? undefined} onChoose={next => { setDraft(next); setSearched(next); setError(null); }} />
        </>}
        <div className="shiro-yado__booking-rooms">
          {available.map((id) => {
            const place = localizePlace(locale, id);
            return <article key={id} className="shiro-yado__card" data-room={id}>
              <h4>{place.name}</h4>
              {id === 'room-204' && <RoomVisual roomId={id} />}
              <p>{place.description}</p>
              <p className="shiro-yado__muted">{place.size} · {copy.capacity}: {ROOM_OFFERS[id].capacity}</p>
              <dl className="shiro-yado__booking-facts">
                <div><dt>{copy.nightly}</dt><dd>{money(locale, ROOM_OFFERS[id].nightlyRate)}</dd></div>
                <div><dt>{copy.total}</dt><dd>{money(locale, totalPrice(id, searched))}</dd></div>
              </dl>
              <button type="button" className="shiro-yado__btn shiro-yado__btn--accent" onClick={() => {
                setSelected(id); requestId.current = `SY-${japanToday().replaceAll('-', '')}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
                setError(null); setPhase('confirm');
              }}>{copy.choose}</button>
            </article>;
          })}
        </div>
      </section>}
    </>}
    {phase === 'confirm' && selected && searched && room && <section className="shiro-yado__card shiro-yado__booking-confirm">
      <h3>{room.name}</h3>
      <p className="shiro-yado__muted">{copy.deviceNote}</p>
      <BookingDetails roomId={selected} stay={searched} nightlyRate={ROOM_OFFERS[selected].nightlyRate} total={totalPrice(selected, searched)} />
      <button type="button" className="shiro-yado__btn shiro-yado__btn--accent" disabled={busy || storageError} onClick={() => void confirm()}>{busy ? copy.checking : copy.confirmAction}</button>
      <button type="button" className="shiro-yado__btn shiro-yado__btn--outline" disabled={busy} onClick={() => { setError(null); setPhase('search'); }}>{copy.back}</button>
    </section>}
    {phase === 'complete' && result && <section className="shiro-yado__card shiro-yado__booking-confirm" role="status">
      <p>{copy.reference}: <strong>{result.id}</strong></p>
      <p className="shiro-yado__booking-badge">{result.status === 'confirmed' ? copy.confirmed : copy.cancelled}</p>
      <BookingDetails roomId={result.roomId} stay={result} nightlyRate={result.nightlyRate} total={result.total} />
      {result.status === 'confirmed' && <button type="button" className="shiro-yado__btn shiro-yado__btn--accent" onClick={() => guide(result.roomId)}>{copy.guide}</button>}
      <button type="button" className="shiro-yado__btn shiro-yado__btn--outline" onClick={() => { setCompleted(null); setError(null); setSearched(null); setPhase('search'); }}>{copy.newSearch}</button>
      {result.status === 'confirmed' && <div className="shiro-yado__booking-actions">
        <button type="button" className="shiro-yado__btn shiro-yado__btn--outline" onClick={() => go({ v: 'place', p: 'bath' })}>{JOURNEY[locale].bath}</button>
        <button type="button" className="shiro-yado__btn shiro-yado__btn--outline" onClick={() => go({ v: 'nearby' })}>{JOURNEY[locale].explore}</button>
      </div>}
    </section>}
    <p className="shiro-yado__muted">{copy.deviceNote}</p>
  </div>;
}
