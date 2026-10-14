import { useRef, useState } from 'react';
import { getLocaleMeta } from './i18n';
import { ConciergeModel } from './scene/ConciergeModel';
import { useHotelStore } from './store';
import { getTourism } from './tourism-content';
import { useConciergeSpeech } from './use-concierge-speech';

const MAP_URL = `${import.meta.env.BASE_URL}shiro-yado/shioshiro-island-map.webp`;

const MAP_POINTS: Record<number, [number, number]> = {
  1: [88.8, 52.4], 2: [80.2, 12.6], 3: [83.5, 36], 4: [10.6, 39.6],
  5: [28, 12], 6: [22.9, 55.6], 7: [48.9, 37.1], 8: [54.3, 63],
};

export function TourismGuide() {
  const locale = useHotelStore((state) => state.locale);
  const tourism = getTourism(locale);
  const localeMeta = getLocaleMeta(locale);
  const [selectedId, setSelectedId] = useState(tourism.spots[0].id);
  const selected = tourism.spots.find((spot) => spot.id === selectedId) ?? tourism.spots[0];
  const { isBusy, isSupported, message, playback, speak, stop } = useConciergeSpeech(localeMeta.speechLang);

  const detail = useRef<HTMLHeadingElement>(null);

  const selectSpot = (spotId: string) => {
    setSelectedId(spotId);
    stop();
    requestAnimationFrame(() => detail.current?.focus());
  };

  return (
    <div className="shiro-yado__stack">
      <header className="shiro-yado__hero">
        <p className="shiro-yado__eyebrow">SHIOSHIRO ISLAND</p>
        <h2>{tourism.title}</h2>
        <p className="shiro-yado__muted">{tourism.lead}</p>
      </header>

      <figure className="shiro-yado__island-map">
        <div className="shiro-yado__map-surface">
          <img src={MAP_URL} alt={tourism.mapAlt} width="1050" height="700" />
          {tourism.spots.map((spot) => <button key={spot.id} type="button"
            className="shiro-yado__map-pin"
            style={{ left: `${MAP_POINTS[spot.number][0]}%`, top: `${MAP_POINTS[spot.number][1]}%` }}
            aria-label={`${spot.number}. ${spot.name}`} aria-pressed={selected.id === spot.id}
            aria-controls="tourism-detail" onClick={() => selectSpot(spot.id)}>{spot.number}</button>)}
        </div>
        <figcaption>{tourism.mapCaption}</figcaption>
      </figure>

      <section className="shiro-yado__tourism-detail" id="tourism-detail" aria-labelledby="tourism-detail-title">
        <div className="shiro-yado__tourism-concierge" aria-label={tourism.conciergeLabel}><ConciergeModel playback={playback} /></div>
        <div className="shiro-yado__tourism-copy">
          <p className="shiro-yado__eyebrow">SPOT {selected.number}</p>
          <h3 id="tourism-detail-title" tabIndex={-1} ref={detail}>{selected.name}</h3>
          <p>{selected.summary}</p>
          <dl>
            <div><dt>{tourism.fromHotel}</dt><dd>{selected.access}</dd></div>
            <div><dt>{tourism.recommended}</dt><dd>{selected.bestTime}</dd></div>
          </dl>
          <div className="shiro-yado__speech-actions">
            <button type="button" onClick={() => speak(tourism.speech(selected))}>{message ? tourism.listenAgain : tourism.listen}</button>
            {isBusy ? <button type="button" onClick={stop}>{tourism.stop}</button> : null}
          </div>
          {!isSupported ? <small>{tourism.unsupported}</small> : null}
        </div>
      </section>

      <section className="shiro-yado__section" aria-labelledby="tourism-spots-title">
        <div className="shiro-yado__section-head">
          <h3 id="tourism-spots-title">{tourism.spotsTitle}</h3>
          <p>{tourism.spotsHint}</p>
        </div>
        <div className="shiro-yado__spot-grid">
          {tourism.spots.map((spot) => (
            <button key={spot.id} type="button" className={spot.id === selected.id ? 'shiro-yado__spot is-active' : 'shiro-yado__spot'} aria-pressed={spot.id === selected.id} onClick={() => selectSpot(spot.id)}>
              <span className="shiro-yado__spot-number">{spot.number}</span>
              <span><strong>{spot.name}</strong><small>{spot.area}</small></span>
            </button>
          ))}
        </div>
      </section>

      <section className="shiro-yado__section">
        <h3>{tourism.coursesTitle}</h3>
        <div className="shiro-yado__course-list">
          {tourism.courses.map((course) => (
            <article key={course.title}><div><strong>{course.title}</strong><span>{course.duration}</span></div><p>{course.route}</p></article>
          ))}
        </div>
      </section>

      <section className="shiro-yado__card">
        <p className="shiro-yado__eyebrow">{tourism.serviceEyebrow}</p>
        <h3>{tourism.serviceTitle}</h3>
        <p className="shiro-yado__muted">{tourism.serviceBody}</p>
      </section>
    </div>
  );
}
