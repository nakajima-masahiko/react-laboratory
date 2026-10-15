import { useNav } from '../nav-state';
import { useHotelStore } from '../store';
import { BOOKING_COPY } from './copy';
import { JOURNEY } from './ux-copy';

export function BookingWelcome() {
  const { go } = useNav();
  const locale = useHotelStore(s => s.locale);
  const copy = JOURNEY[locale];
  return <section className="shiro-yado__booking-welcome" aria-label={copy.rooms}>
    <p className="shiro-yado__booking-badge">{copy.demo}</p>
    <div className="shiro-yado__booking-actions">
      <button type="button" className="shiro-yado__btn shiro-yado__btn--accent" onClick={() => go({ v: 'booking' })}>{BOOKING_COPY[locale].search}</button>
      <button type="button" className="shiro-yado__btn shiro-yado__btn--outline" onClick={() => go({ v: 'rooms' })}>{copy.browse}</button>
    </div>
    <p className="shiro-yado__muted">{copy.window}</p>
  </section>;
}
