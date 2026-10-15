import type { PlaceId } from '../hotel-data';
import { useNav } from '../nav-state';
import { useHotelStore } from '../store';
import { JOURNEY } from './ux-copy';
import { BOOKING_COPY } from './copy';

export function BookingEntry({ roomId }: { roomId?: PlaceId }) {
  const { go } = useNav();
  const locale = useHotelStore((s) => s.locale);
  const copy = BOOKING_COPY[locale];
  return <div className="shiro-yado__booking-entry">
    <span className="shiro-yado__booking-badge">{JOURNEY[locale].demo}</span>
    <button type="button" className="shiro-yado__btn shiro-yado__btn--accent" onClick={() => go({ v: 'booking', p: roomId })}>{copy.search}</button>
    <button type="button" className="shiro-yado__btn shiro-yado__btn--outline" onClick={() => go({ v: 'reservations' })}>{copy.myBookings}</button>
  </div>;
}
