import { FloorPlan } from './floor-plan';
import { buildGuide } from './guide';
import {
  FACILITY_IDS,
  FLOORS,
  HOTEL_NAME,
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
import { useNav } from './nav-state';
import { HotelPreview } from './scene/HotelPreview';
import type { SceneId } from './scene/types';
import { useHotelStore } from './store';

const FLOOR_SCENES: Record<FloorId, SceneId> = {
  1: 'floor-1',
  2: 'floor-2',
  3: 'floor-3',
};

export function HomeView() {
  const { go } = useNav();
  const myRoomId = useHotelStore((s) => s.myRoomId);
  const myRoom = myRoomId ? PLACES[myRoomId] : null;

  return (
    <div className="shiro-yado__stack">
      <section className="shiro-yado__hero">
        <p className="shiro-yado__eyebrow">小さなホテルの案内</p>
        <h2 className="shiro-yado__title">{HOTEL_NAME}</h2>
        <p className="shiro-yado__lead">
          チェックインのあと、宴会場・浴場・お手洗いまで迷わないための案内です。
        </p>
      </section>

      <HotelPreview scene="lobby" autoRotate />

      <div className="shiro-yado__cta-row">
        <button type="button" className="shiro-yado__btn shiro-yado__btn--primary" onClick={() => go({ v: 'dest' })}>
          目的地を選ぶ
          <IconArrow />
        </button>
        <button type="button" className="shiro-yado__btn shiro-yado__btn--outline" onClick={() => go({ v: 'floors' })}>
          フロアを選ぶ
          <IconMap />
        </button>
      </div>

      <section className="shiro-yado__section">
        <div className="shiro-yado__section-head">
          <h3>すぐに案内</h3>
          <p>チェックイン後はこちら</p>
        </div>
        <div className="shiro-yado__quick-grid">
          <button type="button" className="shiro-yado__tile" onClick={() => go({ v: 'guide', p: 'banquet' })}>
            <IconHall />
            <span>
              <strong>宴会場へ</strong>
              <small>3F 右側</small>
            </span>
          </button>
          <button type="button" className="shiro-yado__tile" onClick={() => go({ v: 'guide', p: 'bath' })}>
            <IconBath />
            <span>
              <strong>浴場へ</strong>
              <small>3F 左側</small>
            </span>
          </button>
          <button type="button" className="shiro-yado__tile" onClick={() => go({ v: 'guide', p: 'restroom' })}>
            <IconDoor />
            <span>
              <strong>トイレへ</strong>
              <small>3F 正面</small>
            </span>
          </button>
          <button
            type="button"
            className="shiro-yado__tile shiro-yado__tile--soft"
            onClick={() => go(myRoom ? { v: 'guide', p: myRoom.id } : { v: 'checkin' })}
          >
            <IconBed />
            <span>
              <strong>自分の部屋へ</strong>
              <small>{myRoom ? `${myRoom.number} ${myRoom.typeLabel}` : '部屋を設定'}</small>
            </span>
          </button>
        </div>
      </section>

      <section className="shiro-yado__card">
        <p className="shiro-yado__eyebrow">ご滞在の部屋</p>
        <h3>{myRoom ? myRoom.name : 'まだ設定されていません'}</h3>
        <p className="shiro-yado__muted">
          {myRoom
            ? '案内の起点は1階ロビーです。到着したら現在地を更新できます。'
            : '部屋番号を設定すると、お部屋への案内が使えます。'}
        </p>
        <button
          type="button"
          className={myRoom ? 'shiro-yado__btn shiro-yado__btn--outline' : 'shiro-yado__btn shiro-yado__btn--primary'}
          onClick={() => go({ v: 'checkin' })}
        >
          {myRoom ? '部屋を変更する' : 'チェックインする'}
        </button>
      </section>

      <section className="shiro-yado__section">
        <h3>フロア</h3>
        <div className="shiro-yado__list">
          {FLOORS.map((floor) => (
            <button
              key={floor.id}
              type="button"
              className="shiro-yado__row"
              onClick={() => go({ v: 'floor', f: floor.id })}
            >
              <span className="shiro-yado__floor-label">{floor.label}</span>
              <span>
                <strong>{floor.name}</strong>
                <small>{floor.blurb}</small>
              </span>
              <IconArrow />
            </button>
          ))}
        </div>
      </section>

      <section className="shiro-yado__section">
        <h3>客室</h3>
        <div className="shiro-yado__list">
          {ROOM_IDS.map((id) => {
            const room = PLACES[id];
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
                    {room.size} ・ {room.capacity}
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
  return (
    <div className="shiro-yado__stack">
      <header className="shiro-yado__hero">
        <p className="shiro-yado__eyebrow">FLOOR</p>
        <h2>フロアを選ぶ</h2>
        <p className="shiro-yado__muted">白い俯瞰で、いまいる階の雰囲気を確かめられます。</p>
      </header>
      <div className="shiro-yado__list">
        {FLOORS.map((floor) => (
          <button
            key={floor.id}
            type="button"
            className="shiro-yado__row shiro-yado__row--tall"
            onClick={() => go({ v: 'floor', f: floor.id })}
          >
            <span className="shiro-yado__floor-label shiro-yado__floor-label--lg">{floor.label}</span>
            <span>
              <strong>{floor.name}</strong>
              <small>{floor.blurb}</small>
            </span>
            <IconArrow />
          </button>
        ))}
      </div>
    </div>
  );
}

export function FloorView({ floor }: { floor: FloorId }) {
  const { go } = useNav();
  const meta = FLOORS.find((item) => item.id === floor) ?? FLOORS[0];
  const here = useHotelStore((s) => s.fromPlaceId);

  return (
    <div className="shiro-yado__stack">
      <header className="shiro-yado__hero">
        <p className="shiro-yado__eyebrow">{meta.label}</p>
        <h2>{meta.name}</h2>
        <p className="shiro-yado__muted">{meta.blurb}</p>
      </header>
      <HotelPreview scene={FLOOR_SCENES[floor]} />
      <section className="shiro-yado__section">
        <h3>配置</h3>
        <FloorPlan floor={floor} here={here} />
      </section>
      <section className="shiro-yado__section">
        <h3>{floor === 2 ? '客室' : floor === 3 ? '施設' : 'スペース'}</h3>
        <div className="shiro-yado__list">
          {meta.places.map((id) => {
            const place = PLACES[id];
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
  const setHere = useHotelStore((s) => s.setHere);
  const hereId = useHotelStore((s) => s.fromPlaceId);
  const isHere = hereId === place.id;

  return (
    <div className="shiro-yado__stack">
      <header className="shiro-yado__hero">
        <p className="shiro-yado__eyebrow">
          {place.floor}F · {place.typeLabel}
        </p>
        <h2>{place.name}</h2>
        <p className="shiro-yado__muted">{place.description}</p>
      </header>
      <HotelPreview scene={place.id} />
      <section className="shiro-yado__card">
        <dl className="shiro-yado__facts">
          <div>
            <dt>広さ</dt>
            <dd>{place.size}</dd>
          </div>
          <div>
            <dt>定員</dt>
            <dd>{place.capacity}</dd>
          </div>
          {place.hours ? (
            <div className="shiro-yado__facts-wide">
              <dt>時間</dt>
              <dd>{place.hours}</dd>
            </div>
          ) : null}
        </dl>
        <ul className="shiro-yado__chips">
          {place.amenities.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section className="shiro-yado__section">
        <h3>位置</h3>
        <p className="shiro-yado__summary-lg">{place.summary}</p>
        <FloorPlan floor={place.floor} highlight={place.id} here={hereId} />
      </section>
      <button type="button" className="shiro-yado__btn shiro-yado__btn--accent" onClick={() => go({ v: 'guide', p: place.id })}>
        ここへの行き方
        <IconArrow />
      </button>
      <button type="button" className="shiro-yado__btn shiro-yado__btn--outline" onClick={() => setHere(place.floor, place.id)} disabled={isHere}>
        <IconPin />
        {isHere ? '現在地に設定済み' : 'ここを現在地にする'}
      </button>
    </div>
  );
}

export function GuideView({ destId }: { destId: PlaceId }) {
  const { go } = useNav();
  const fromFloor = useHotelStore((s) => s.fromFloor);
  const fromPlaceId = useHotelStore((s) => s.fromPlaceId);
  const setHere = useHotelStore((s) => s.setHere);
  const guide = buildGuide({ floor: fromFloor, placeId: fromPlaceId }, destId);
  const dest = getPlace(destId);
  const origin = getPlace(fromPlaceId);

  if (!guide || !dest) {
    return <p className="shiro-yado__muted">案内を準備できませんでした。</p>;
  }

  const arrived = fromPlaceId === dest.id;

  return (
    <div className="shiro-yado__stack">
      <header className="shiro-yado__hero">
        <p className="shiro-yado__eyebrow">ご案内</p>
        <h2>{dest.shortName}へ</h2>
        <p className="shiro-yado__lead">{guide.summary}</p>
        <p className="shiro-yado__muted">
          {origin ? `${origin.floor}F ${origin.shortName}から · ${guide.minutes}` : guide.minutes}
        </p>
      </header>
      <HotelPreview scene={dest.id} hint="行き先の雰囲気" />
      <section className="shiro-yado__section">
        <h3>{dest.floor}階の位置</h3>
        <FloorPlan floor={dest.floor} highlight={dest.id} here={fromPlaceId} />
        <p className="shiro-yado__muted">
          {guide.viaElevator
            ? `いまは${fromFloor}階です。エレベーターで${dest.floor}階へ。`
            : '同じ階の移動です。'}
        </p>
      </section>
      <ol className="shiro-yado__steps">
        {guide.steps.map((step, index) => (
          <li key={step.title}>
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
          到着しています
        </div>
      ) : (
        <button type="button" className="shiro-yado__btn shiro-yado__btn--accent" onClick={() => setHere(dest.floor, dest.id)}>
          <IconPin />
          到着したので現在地を更新
        </button>
      )}
      <button type="button" className="shiro-yado__btn shiro-yado__btn--outline" onClick={() => go({ v: 'place', p: dest.id })}>
        空間の詳細を見る
        <IconArrow />
      </button>
    </div>
  );
}

export function CheckinView() {
  const { go } = useNav();
  const myRoomId = useHotelStore((s) => s.myRoomId);
  const setMyRoom = useHotelStore((s) => s.setMyRoom);

  return (
    <div className="shiro-yado__stack">
      <header className="shiro-yado__hero">
        <p className="shiro-yado__eyebrow">CHECK IN</p>
        <h2>ご滞在の部屋</h2>
        <p className="shiro-yado__muted">
          部屋を設定すると、案内の起点が1階ロビーになり、お部屋への行き方が使えます。
        </p>
      </header>
      <ul className="shiro-yado__list">
        {ROOM_IDS.map((id) => {
          const room = PLACES[id];
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
        案内を始める
      </button>
      {myRoomId ? (
        <button type="button" className="shiro-yado__btn shiro-yado__btn--ghost" onClick={() => setMyRoom(null)}>
          設定を解除
        </button>
      ) : null}
    </div>
  );
}

export function DestView() {
  const { go } = useNav();
  return (
    <div className="shiro-yado__stack">
      <header className="shiro-yado__hero">
        <p className="shiro-yado__eyebrow">DESTINATION</p>
        <h2>目的地を選ぶ</h2>
        <p className="shiro-yado__muted">行きたい場所を選ぶと、いまの位置からの行き方をご案内します。</p>
      </header>
      <section className="shiro-yado__section">
        <h3>共用施設 · 3階</h3>
        <div className="shiro-yado__list">
          {FACILITY_IDS.map((id) => {
            const place = PLACES[id];
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
        <h3>客室 · 2階</h3>
        <div className="shiro-yado__list">
          {ROOM_IDS.map((id) => {
            const room = PLACES[id];
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
          <strong>フロント・ロビー</strong>
          <small>1階 · チェックインの場所へ戻る</small>
        </span>
        <IconArrow />
      </button>
    </div>
  );
}
