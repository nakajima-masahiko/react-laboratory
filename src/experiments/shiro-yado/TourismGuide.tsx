import { useState } from 'react';
import { getLocaleMeta } from './i18n';
import { ConciergeModel } from './scene/ConciergeModel';
import { useHotelStore } from './store';
import { getTourism } from './tourism-content';
import { useConciergeSpeech } from './use-concierge-speech';

const MAP_URL = `${import.meta.env.BASE_URL}shiro-yado/shioshiro-island-map.webp`;

export function TourismGuide() {
  const locale = useHotelStore((state) => state.locale);
  const tourism = getTourism(locale);
  const localeMeta = getLocaleMeta(locale);
  const [selectedId, setSelectedId] = useState(tourism.spots[0].id);
  const selected = tourism.spots.find((spot) => spot.id === selectedId) ?? tourism.spots[0];
  const { isSpeaking, isSupported, message, speak, stop } = useConciergeSpeech(localeMeta.speechLang);

  const selectSpot = (spotId: string) => {
    setSelectedId(spotId);
    const spot = tourism.spots.find((item) => item.id === spotId);
    if (spot) speak(tourism.speech(spot));
  };

  return (
    <div className="shiro-yado__stack">
      <header className="shiro-yado__hero">
        <p className="shiro-yado__eyebrow">SHIOSHIRO ISLAND</p>
        <h2>{tourism.title}</h2>
        <p className="shiro-yado__muted">{tourism.lead}</p>
      </header>

      <figure className="shiro-yado__island-map">
        <img src={MAP_URL} alt={tourism.mapAlt} />
        <figcaption>{tourism.mapCaption}</figcaption>
      </figure>

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

      <section className="shiro-yado__tourism-detail" aria-live="polite">
        <div className="shiro-yado__tourism-concierge" aria-label={tourism.conciergeLabel}><ConciergeModel speaking={isSpeaking} hairColor={localeMeta.hairColor} /></div>
        <div className="shiro-yado__tourism-copy">
          <p className="shiro-yado__eyebrow">SPOT {selected.number}</p>
          <h3>{selected.name}</h3>
          <p>{selected.summary}</p>
          <dl>
            <div><dt>{tourism.fromHotel}</dt><dd>{selected.access}</dd></div>
            <div><dt>{tourism.recommended}</dt><dd>{selected.bestTime}</dd></div>
          </dl>
          <div className="shiro-yado__speech-actions">
            <button type="button" onClick={() => speak(tourism.speech(selected))}>{message ? tourism.listenAgain : tourism.listen}</button>
            {isSpeaking ? <button type="button" onClick={stop}>{tourism.stop}</button> : null}
          </div>
          {!isSupported ? <small>{tourism.unsupported}</small> : null}
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
