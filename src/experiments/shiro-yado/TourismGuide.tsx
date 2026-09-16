import { useState } from 'react';
import { ConciergeModel } from './scene/ConciergeModel';
import { TOURISM_COURSES, TOURISM_SPOTS, buildTourismSpeech } from './tourism-content';
import { useConciergeSpeech } from './use-concierge-speech';

const MAP_URL = `${import.meta.env.BASE_URL}shiro-yado/shioshiro-island-map.webp`;

export function TourismGuide() {
  const [selectedId, setSelectedId] = useState(TOURISM_SPOTS[0].id);
  const selected = TOURISM_SPOTS.find((spot) => spot.id === selectedId) ?? TOURISM_SPOTS[0];
  const { isSpeaking, isSupported, message, speak, stop } = useConciergeSpeech();

  const selectSpot = (spotId: string) => {
    setSelectedId(spotId);
    const spot = TOURISM_SPOTS.find((item) => item.id === spotId);
    if (spot) speak(buildTourismSpeech(spot));
  };

  return (
    <div className="shiro-yado__stack">
      <header className="shiro-yado__hero">
        <p className="shiro-yado__eyebrow">SHIOSHIRO ISLAND</p>
        <h2>汐白島の観光案内</h2>
        <p className="shiro-yado__muted">白の宿を起点に、海と森、祈りと港町の八つの景色を巡ります。</p>
      </header>

      <figure className="shiro-yado__island-map">
        <img src={MAP_URL} alt="汐白島の全景と八つの観光地を番号で示した鳥瞰地図" />
        <figcaption>地図の番号から、案内してほしい場所をお選びください。</figcaption>
      </figure>

      <section className="shiro-yado__section" aria-labelledby="tourism-spots-title">
        <div className="shiro-yado__section-head">
          <h3 id="tourism-spots-title">島の八景</h3>
          <p>押すと音声でご案内</p>
        </div>
        <div className="shiro-yado__spot-grid">
          {TOURISM_SPOTS.map((spot) => (
            <button key={spot.id} type="button" className={spot.id === selected.id ? 'shiro-yado__spot is-active' : 'shiro-yado__spot'} aria-pressed={spot.id === selected.id} onClick={() => selectSpot(spot.id)}>
              <span className="shiro-yado__spot-number">{spot.number}</span>
              <span><strong>{spot.name}</strong><small>{spot.area}</small></span>
            </button>
          ))}
        </div>
      </section>

      <section className="shiro-yado__tourism-detail" aria-live="polite">
        <div className="shiro-yado__tourism-concierge" aria-label="観光地を案内するコンシェルジュ"><ConciergeModel speaking={isSpeaking} /></div>
        <div className="shiro-yado__tourism-copy">
          <p className="shiro-yado__eyebrow">SPOT {selected.number}</p>
          <h3>{selected.name}</h3>
          <p>{selected.summary}</p>
          <dl>
            <div><dt>白の宿から</dt><dd>{selected.access}</dd></div>
            <div><dt>おすすめ</dt><dd>{selected.bestTime}</dd></div>
          </dl>
          <div className="shiro-yado__speech-actions">
            <button type="button" onClick={() => speak(buildTourismSpeech(selected))}>{message ? 'もう一度聞く' : 'コンシェルジュの案内を聞く'}</button>
            {isSpeaking ? <button type="button" onClick={stop}>停止</button> : null}
          </div>
          {!isSupported ? <small>このブラウザでは音声再生に対応していません。</small> : null}
        </div>
      </section>

      <section className="shiro-yado__section">
        <h3>おすすめの過ごし方</h3>
        <div className="shiro-yado__course-list">
          {TOURISM_COURSES.map((course) => (
            <article key={course.title}><div><strong>{course.title}</strong><span>{course.duration}</span></div><p>{course.route}</p></article>
          ))}
        </div>
      </section>

      <section className="shiro-yado__card">
        <p className="shiro-yado__eyebrow">白の宿の案内サービス</p>
        <h3>島内移動もお手伝いします</h3>
        <p className="shiro-yado__muted">フロントで島内送迎車、レンタサイクル、徒歩用の簡易地図をご案内します。日の入り、干潮、朝市の開催は出発前にお尋ねください。</p>
      </section>
    </div>
  );
}
