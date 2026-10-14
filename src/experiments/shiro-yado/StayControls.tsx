import { PLACES, getPlace } from './hotel-data';
import { localizePlace } from './place-i18n';
import { useNav } from './nav-state';
import { useHotelStore } from './store';
import { getUi } from './ui-extra';
import { WELCOME } from './welcome-copy';

export function StayControls({ showRoom = false }: { showRoom?: boolean }) {
  const { go } = useNav();
  const locale = useHotelStore((s) => s.locale);
  const room = useHotelStore((s) => s.myRoomId);
  const here = useHotelStore((s) => s.fromPlaceId);
  const setHere = useHotelStore((s) => s.setHere);
  const ui = getUi(locale);
  const copy = WELCOME[locale];
  return <section className="shiro-yado__stay-controls">
    {showRoom && <div className="shiro-yado__stay-room">
      <strong>{ui.stayTitle}: {room ? localizePlace(locale, room).name : ui.stayUnset}</strong>
      <button className="shiro-yado__btn shiro-yado__btn--outline" type="button" onClick={() => go({ v: 'checkin' })}>{room ? ui.changeRoom : ui.setRoom}</button>
    </div>}
    <label>{copy.here}
      <select value={here} aria-describedby="location-hint" onChange={(event) => {
        const place = getPlace(event.target.value);
        if (place) setHere(place.floor, place.id);
      }}>
        {Object.values(PLACES).map((place) => <option key={place.id} value={place.id}>{place.floor}F · {localizePlace(locale, place.id).name}</option>)}
      </select>
    </label>
    <small id="location-hint">{copy.locationHint}</small>
  </section>;
}
