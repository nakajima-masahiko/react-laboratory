import { useHotelStore } from '../store';
import { nearbyStays, type BookableRoomId, type Reservation, type Stay } from './model';
import { JOURNEY, stayDate } from './ux-copy';

export function NearbyDates({ stay, reservations, today, preferred, onChoose }: {
  stay: Stay; reservations: Reservation[]; today: string; preferred?: BookableRoomId; onChoose: (stay: Stay) => void;
}) {
  const locale = useHotelStore(s => s.locale);
  const alternatives = nearbyStays(stay, reservations, today, preferred);
  if (!alternatives.length) return null;
  return <section className="shiro-yado__booking-confirm" aria-label={JOURNEY[locale].nearby}>
    <h4>{JOURNEY[locale].nearby}</h4>
    {alternatives.map(next => <button type="button" className="shiro-yado__btn shiro-yado__btn--outline" key={next.checkIn} onClick={() => onChoose(next)}>
      {stayDate(locale, next.checkIn)} → {stayDate(locale, next.checkOut)}
    </button>)}
  </section>;
}
