import { useNav } from '../nav-state';
import { localizePlace } from '../place-i18n';
import { useHotelStore } from '../store';
import { BookingEntry } from './BookingEntry';
import { RoomSummary } from './RoomSummary';
import { ROOM_OFFERS, type BookableRoomId } from './model';
import { JOURNEY } from './ux-copy';

export function RoomsView() {
  const { go } = useNav();
  const locale = useHotelStore(s => s.locale);
  const copy = JOURNEY[locale];
  return <div className="shiro-yado__stack" data-testid="rooms-page">
    <header className="shiro-yado__hero"><h2>{copy.rooms}</h2><p>{copy.lead}</p></header>
    <BookingEntry />
    <div className="shiro-yado__booking-rooms">
      {(Object.keys(ROOM_OFFERS) as BookableRoomId[]).map(id => <article key={id} className="shiro-yado__card" aria-label={localizePlace(locale, id).name}>
        <h3>{localizePlace(locale, id).name}</h3>
        <RoomSummary roomId={id} />
        <button type="button" className="shiro-yado__btn shiro-yado__btn--outline" onClick={() => go({ v: 'place', p: id })}>{copy.preview}</button>
        <BookingEntry roomId={id} />
      </article>)}
    </div>
    <button type="button" className="shiro-yado__btn shiro-yado__btn--outline" onClick={() => go({ v: 'checkin' })}>{copy.guide}</button>
  </div>;
}
