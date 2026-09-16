import { FloorPlan } from './floor-plan';
import { buildGuide } from './guide';
import {
  FACILITY_IDS,
  FLOORS,
  PLACES,
  ROOM_IDS,
  getPlace,
  type FloorId,
  type Place,
  type PlaceId,
} from './hotel-data';
import {
  IconArrow,
  IconBath,
  IconBed,
  IconCheck,
  IconDoor,
  IconHall,
  IconMap,
  IconPin,
} from './icons';
import { getUi } from './ui-extra';
import { getFloorText, localizePlace } from './place-i18n';
import { useNav } from './nav-state';
import { HotelPreview } from './scene/HotelPreview';
import type { SceneId } from './scene/types';
import { useHotelStore } from './store';
import { ConciergeGuide } from './ConciergeGuide';
import { PromoSlider } from './PromoSlider';

const FLOOR_SCENES: Record<FloorId, SceneId> = {
  1: 'floor-1',
  2: 'floor-2',
  3: 'floor-3',
};

export function HomeView() {
  const { go } = useNav();
  const myRoomId = useHotelStore((s) => s.myRoomId);
  const locale = useHotelStore((s) => s.locale);
  const ui = getUi(locale);
  const myRoom = myRoomId ? localizePlace(locale, myRoomId) : null;

  return (
    <div className="shiro-yado__stack">
      <ConciergeGuide />
      <PromoSlider />
      <section className="shiro-yado__hero">
        <p className="shiro-yado__eyebrow">{ui.homeEyebrow}</p>
        <h2 className="shiro-yado__title">{ui.hotelName}</h2>
        <p className="shiro-yado__lead">{ui.homeLead}</p>
      </section>
      <div className="shiro-yado__cta-row">
        <button type="button" className="shiro-yado__btn shiro-yado__btn--primary" onClick={() => go({ v: 'dest' })}>
          {ui.chooseDest}
          <IconArrow />
        </button>
        <button type="button" className="shiro-yado__btn shiro-yado__btn--outline" onClick={() => go({ v: 'floors' })}>
          {ui.chooseFloor}
          <IconMap />
        </button>
      </div>
      <section className="shiro-yado__section">
        <div className="shiro-yado__section-head">
          <h3>{ui.quickTitle}</h3>
          <p>{ui.quickSub}</p>
        </div>
        <div className="shiro-yado__quick-grid">
          <button type="button" className="shiro-yado__tile" onClick={() => go({ v: 'guide', p: 'banquet' })}>
            <IconHall />
            <span>
              <strong>{ui.toBanquet}</strong>
              <small>3F</small>
            </span>
          </button>
          <button type="button" className="shiro-yado__tile" onClick={() => go({ v: 'guide', p: 'bath' })}>
            <IconBath />
            <span>
              <strong>{ui.toBath}</strong>
              <small>3F</small>
            </span>
          </button>
          <button type="button" className="shiro-yado__tile" onClick={() => go({ v: 'guide', p: 'restroom' })}>
            <IconDoor />
            <span>
              <strong>{ui.toRestroom}</strong>
              <small>3F</small>
            </span>
          </button>
          <button
            type="button"
            className="shiro-yado__tile shiro-yado__tile--soft"
            onClick={() => go(myRoom ? { v: 'guide', p: myRoom.id } : { v: 'checkin' })}
          >
            <IconBed />
            <span>
              <strong>{ui.toRoom}</strong>
              <small>{myRoom ? `${myRoom.number} ${myRoom.typeLabel}` : ui.setRoom}</small>
            </span>
          </button>
        </div>
      </section>
      <section className="shiro-yado__card">
        <p className="shiro-yado__eyebrow">{ui.stayTitle}</p>
        <h3>{myRoom ? myRoom.name : ui.stayUnset}</h3>
        <p className="shiro-yado__muted">{myRoom ? ui.staySetHint : ui.stayUnsetHint}</p>
        <button
          type="button"
          className={myRoom ? 'shiro-yado__btn shiro-yado__btn--outline' : 'shiro-yado__btn shiro-yado__btn--primary'}
          onClick={() => go({ v: 'checkin' })}
        >
          {myRoom ? ui.changeRoom : ui.checkIn}
        </button>
      </section>
      <section className="shiro-yado__section">
        <h3>{ui.floors}</h3>
        <div className="shiro-yado__list">
          {FLOORS.map((floor) => {
            const ft = getFloorText(locale, floor.id);
            return (
              <button
                key={floor.id}
                type="button"
                className="shiro-yado__row"
                onClick={() => go({ v: 'floor', f: floor.id })}
              >
                <span className="shiro-yado__floor-label">{floor.label}</span>
                <span>
                  <strong>{ft.name}</strong>
                  <small>{ft.blurb}</small>
                </span>
                <IconArrow />
              </button>
            );
          })}
        </div>
      </section>
      <section className="shiro-yado__section">
        <h3>{ui.rooms}</h3>
        <div className="shiro-yado__list">
          {ROOM_IDS.map((id) => {
            const room = localizePlace(locale, id);
            return (
              <button
                key={id}
                type="button"
                className={myRoomId === id ? 'shiro-yado__row shiro-yado__row--current' : 'shiro-yado__row'}
                onClick={() => go({ v: 'place', p: id })}
              >
                <span>
                  <strong>
                    {room.number} {room.typeLabel}
                  </strong>
                  <small>
                    {room.size} · {room.capacity}
                  </small>
                </span>
                <IconArrow />
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export function FloorsView() {
  const { go } = useNav();
  const locale = useHotelStore((s) => s.locale);
  const ui = getUi(locale);
  return (
    <div className="shiro-yado__stack">
      <header className="shiro-yado__hero">
        <p className="shiro-yado__eyebrow">FLOOR</p>
        <h2>{ui.floorsTitle}</h2>
        <p className="shiro-yado__muted">{ui.floorsLead}</p>
      </header>
      <div className="shiro-yado__list">
        {FLOORS.map((floor) => {
          const ft = getFloorText(locale, floor.id);
          return (
            <button
              key={floor.id}
              type="button"
              className="shiro-yado__row shiro-yado__row--tall"
              onClick={() => go({ v: 'floor', f: floor.id })}
            >
              <span className="shiro-yado__floor-label shiro-yado__floor-label--lg">{floor.label}</span>
              <span>
                <strong>{ft.name}</strong>
                <small>{ft.blurb}</small>
              </span>
              <IconArrow />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function FloorView({ floor }: { floor: FloorId }) {
  const { go } = useNav();
  const locale = useHotelStore((s) => s.locale);
  const ui = getUi(locale);
  const meta = FLOORS.find((item) => item.id === floor) ?? FLOORS[0];
  const ft = getFloorText(locale, floor);
  const here = useHotelStore((s) => s.fromPlaceId);
  const sectionTitle = floor === 2 ? ui.rooms : floor === 3 ? ui.facilities : ui.spaces;
  return (
    <div className="shiro-yado__stack">
      <header className="shiro-yado__hero">
        <p className="shiro-yado__eyebrow">{meta.label}</p>
        <h2>{ft.name}</h2>
        <p className="shiro-yado__muted">{ft.blurb}</p>
      </header>
      <HotelPreview scene={FLOOR_SCENES[floor]} />
      <section className="shiro-yado__section">
        <h3>{ui.layout}</h3>
        <FloorPlan floor={floor} here={here} />
      </section>
      <section className="shiro-yado__section">
        <h3>{sectionTitle}</h3>
        <div className="shiro-yado__list">
          {meta.places.map((id) => {
            const place = localizePlace(locale, id);
            return (
              <button
                key={id}
                type="button"
                className={floor === 3 ? 'shiro-yado__row shiro-yado__row--tall' : 'shiro-yado__row'}
                onClick={() => go({ v: 'place', p: id })}
              >
                <span>
                  <strong>{place.number ? `${place.number}  ${place.typeLabel}` : place.name}</strong>
                  <small>
                    {place.size}
                    {place.hours ? ` · ${place.hours}` : ` · ${place.capacity}`}
                  </small>
                  {floor === 3 ? <em className="shiro-yado__summary">{place.summary}</em> : null}
                </span>
                <IconArrow />
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export function PlaceView({ place }: { place: Place }) {
  const { go } = useNav();
  const locale = useHotelStore((s) => s.locale);
  const ui = getUi(locale);
  const loc = localizePlace(locale, place.id);
  const setHere = useHotelStore((s) => s.setHere);
  const hereId = useHotelStore((s) => s.fromPlaceId);
  const isHere = hereId === place.id;
  return (
    <div className="shiro-yado__stack">
      <header className="shiro-yado__hero">
        <p className="shiro-yado__eyebrow">
          {loc.floor}F · {loc.typeLabel}
        </p>
        <h2>{loc.name}</h2>
        <p className="shiro-yado__muted">{loc.description}</p>
      </header>
      <HotelPreview scene={place.id} />
      <section className="shiro-yado__card">
        <dl className="shiro-yado__facts">
          <div>
            <dt>{ui.size}</dt>
            <dd>{loc.size}</dd>
          </div>
          <div>
            <dt>{ui.capacity}</dt>
            <dd>{loc.capacity}</dd>
          </div>
          {loc.hours ? (
            <div className="shiro-yado__facts-wide">
              <dt>{ui.hours}</dt>
              <dd>{loc.hours}</dd>
            </div>
          ) : null}
        </dl>
        <ul className="shiro-yado__chips">
          {loc.amenities.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section className="shiro-yado__section">
        <h3>{ui.location}</h3>
        <p className="shiro-yado__summary-lg">{loc.summary}</p>
        <FloorPlan floor={place.floor} highlight={place.id} here={hereId} />
      </section>
      <button type="button" className="shiro-yado__btn shiro-yado__btn--accent" onClick={() => go({ v: 'guide', p: place.id })}>
        {ui.directionsHere}
        <IconArrow />
      </button>
      <button type="button" className="shiro-yado__btn shiro-yado__btn--outline" onClick={() => setHere(place.floor, place.id)} disabled={isHere}>
        <IconPin />
        {isHere ? ui.alreadyHere : ui.setHere}
      </button>
    </div>
  );
}

export function GuideView({ destId }: { destId: PlaceId }) {
  const { go } = useNav();
  const locale = useHotelStore((s) => s.locale);
  const ui = getUi(locale);
  const fromFloor = useHotelStore((s) => s.fromFloor);
  const fromPlaceId = useHotelStore((s) => s.fromPlaceId);
  const setHere = useHotelStore((s) => s.setHere);
  const guide = buildGuide({ floor: fromFloor, placeId: fromPlaceId }, destId, locale);
  const dest = localizePlace(locale, destId);
  const origin = getPlace(fromPlaceId) ? localizePlace(locale, fromPlaceId) : null;
  if (!guide) {
    return <p className="shiro-yado__muted">{ui.guideUnavailable}</p>;
  }
  const arrived = fromPlaceId === dest.id;
  return (
    <div className="shiro-yado__stack">
      <header className="shiro-yado__hero">
        <p className="shiro-yado__eyebrow">{ui.guideEyebrow}</p>
        <h2>{ui.guideTo(dest.shortName)}</h2>
        <p className="shiro-yado__lead">{guide.summary}</p>
        <p className="shiro-yado__muted">
          {origin ? ui.fromOrigin(origin.floor, origin.shortName, guide.minutes) : guide.minutes}
        </p>
      </header>
      <HotelPreview scene={dest.id} hint={ui.destSceneHint} />
      <section className="shiro-yado__section">
        <h3>{ui.floorPosition(dest.floor)}</h3>
        <FloorPlan floor={dest.floor} highlight={dest.id} here={fromPlaceId} />
        <p className="shiro-yado__muted">
          {guide.viaElevator ? ui.nowOnFloor(fromFloor, dest.floor) : ui.sameFloorMove}
        </p>
      </section>
      <ol className="shiro-yado__steps">
        {guide.steps.map((step, index) => (
          <li key={`${step.title}-${index}`}>
            <span>{index + 1}</span>
            <div>
              <strong>{step.title}</strong>
              <p>{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
      {arrived ? (
        <div className="shiro-yado__arrived">
          <IconCheck />
          {ui.arrived}
        </div>
      ) : (
        <button type="button" className="shiro-yado__btn shiro-yado__btn--accent" onClick={() => setHere(dest.floor, dest.id)}>
          <IconPin />
          {ui.updateHereOnArrive}
        </button>
      )}
      <button type="button" className="shiro-yado__btn shiro-yado__btn--outline" onClick={() => go({ v: 'place', p: dest.id })}>
        {ui.seeDetails}
        <IconArrow />
      </button>
    </div>
  );
}

export function CheckinView() {
  const { go } = useNav();
  const locale = useHotelStore((s) => s.locale);
  const ui = getUi(locale);
  const myRoomId = useHotelStore((s) => s.myRoomId);
  const setMyRoom = useHotelStore((s) => s.setMyRoom);
  return (
    <div className="shiro-yado__stack">
      <header className="shiro-yado__hero">
        <p className="shiro-yado__eyebrow">CHECK IN</p>
        <h2>{ui.checkinTitle}</h2>
        <p className="shiro-yado__muted">{ui.checkinLead}</p>
      </header>
      <ul className="shiro-yado__list">
        {ROOM_IDS.map((id) => {
          const room = localizePlace(locale, id);
          const selected = myRoomId === id;
          return (
            <li key={id}>
              <button
                type="button"
                className={selected ? 'shiro-yado__row shiro-yado__row--selected' : 'shiro-yado__row'}
                onClick={() => setMyRoom(id)}
              >
                <span>
                  <strong>
                    {room.number} {room.typeLabel}
                  </strong>
                  <small>
                    {room.size} · {room.capacity} · {room.summary}
                  </small>
                </span>
                {selected ? <IconCheck /> : null}
              </button>
            </li>
          );
        })}
      </ul>
      <button type="button" className="shiro-yado__btn shiro-yado__btn--primary" disabled={!myRoomId} onClick={() => go({ v: 'home' })}>
        {ui.startGuide}
      </button>
      {myRoomId ? (
        <button type="button" className="shiro-yado__btn shiro-yado__btn--ghost" onClick={() => setMyRoom(null)}>
          {ui.clearRoom}
        </button>
      ) : null}
    </div>
  );
}

export function DestView() {
  const { go } = useNav();
  const locale = useHotelStore((s) => s.locale);
  const ui = getUi(locale);
  return (
    <div className="shiro-yado__stack">
      <header className="shiro-yado__hero">
        <p className="shiro-yado__eyebrow">DESTINATION</p>
        <h2>{ui.destTitle}</h2>
        <p className="shiro-yado__muted">{ui.destLead}</p>
      </header>
      <section className="shiro-yado__section">
        <h3>{ui.facilities3f}</h3>
        <div className="shiro-yado__list">
          {FACILITY_IDS.map((id) => {
            const place = localizePlace(locale, id);
            return (
              <button key={id} type="button" className="shiro-yado__row shiro-yado__row--tall" onClick={() => go({ v: 'guide', p: id })}>
                <span>
                  <strong>{place.name}</strong>
                  <small>{place.summary}</small>
                  {place.hours ? <small>{place.hours}</small> : null}
                </span>
                <IconArrow />
              </button>
            );
          })}
        </div>
      </section>
      <section className="shiro-yado__section">
        <h3>{ui.rooms2f}</h3>
        <div className="shiro-yado__list">
          {ROOM_IDS.map((id) => {
            const room = localizePlace(locale, id);
            return (
              <button key={id} type="button" className="shiro-yado__row" onClick={() => go({ v: 'guide', p: id })}>
                <span>
                  <strong>
                    {room.number} {room.typeLabel}
                  </strong>
                  <small>{room.summary}</small>
                </span>
                <IconArrow />
              </button>
            );
          })}
        </div>
      </section>
      <button type="button" className="shiro-yado__row shiro-yado__tile--soft" onClick={() => go({ v: 'guide', p: 'lobby' })}>
        <span>
          <strong>{ui.lobbyReturn}</strong>
          <small>{ui.lobbyReturnSub}</small>
        </span>
        <IconArrow />
      </button>
    </div>
  );
}
