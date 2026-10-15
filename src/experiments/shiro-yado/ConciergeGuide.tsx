import { DINING } from './dining/copy';
import { useState } from 'react';
import {
  getConciergeCopy,
  getConciergeSpeech,
  getLocaleMeta,
  type ConciergeTopic,
} from './i18n';
import type { PlaceId } from './hotel-data';
import { getUi } from './ui-extra';
import { WELCOME } from './welcome-copy';
import { useNav } from './nav-state';
import { ConciergeModel, type ConciergeMode } from './scene/ConciergeModel';
import { useHotelStore } from './store';
import { useConciergeSpeech } from './use-concierge-speech';

const ROOM_IDS: PlaceId[] = [
  'room-201',
  'room-202',
  'room-203',
  'room-204',
  'room-205',
];

const EXTERIOR_SRC = `${import.meta.env.BASE_URL}shiro-yado/exterior.svg`;

export function ConciergeGuide() {
  const { go } = useNav();
  const fromFloor = useHotelStore((state) => state.fromFloor);
  const fromPlaceId = useHotelStore((state) => state.fromPlaceId);
  const myRoomId = useHotelStore((state) => state.myRoomId);
  const locale = useHotelStore((state) => state.locale);
  const [topic, setTopic] = useState<ConciergeTopic | 'dining' | null>(null);
  const [roomId, setRoomId] = useState<PlaceId | null>(myRoomId);
  const [mode, setMode] = useState<ConciergeMode>('3d');
  const meta = getLocaleMeta(locale);
  const copy = getConciergeCopy(locale);
  const { isSpeaking, isBusy, phase, isSupported, message, playback, speak, stop } = useConciergeSpeech(meta.speechLang);

  const selectTopic = (nextTopic: ConciergeTopic | 'dining') => {
    setTopic(nextTopic);
    if (nextTopic === 'dining') { speak(DINING[locale].speech); return; }
    if (nextTopic === 'rooms') {
      const nextRoom = roomId ?? myRoomId;
      if (nextRoom) {
        setRoomId(nextRoom);
        speak(getConciergeSpeech(locale, nextTopic, fromFloor, fromPlaceId, nextRoom));
      } else {
        speak(getConciergeSpeech(locale, nextTopic, fromFloor, fromPlaceId));
      }
      return;
    }
    speak(getConciergeSpeech(locale, nextTopic, fromFloor, fromPlaceId));
  };

  const selectRoom = (nextRoomId: PlaceId) => {
    setTopic('rooms');
    setRoomId(nextRoomId);
    speak(getConciergeSpeech(locale, 'rooms', fromFloor, fromPlaceId, nextRoomId));
  };

  const toggleMode = () => {
    setMode((current) => current === 'photo' ? '3d' : 'photo');
  };

  const nextModeLabel = mode === 'photo' ? '3D' : WELCOME[locale].photo;

  const topics: { id: ConciergeTopic | 'dining'; label: string; description: string }[] = (Object.keys(copy.topics) as ConciergeTopic[]).map((id) => ({
    id,
    ...copy.topics[id],
  }));

  topics.push({ id: 'dining', label: DINING[locale].title, description: DINING[locale].venue });

  return (
    <section
      className="shiro-yado__concierge"
      aria-labelledby="concierge-title"
    >
      <div
        className="shiro-yado__concierge-stage"
        aria-label="Hotel concierge 3D model"
        style={{
          backgroundImage: `linear-gradient(180deg, rgb(251 249 245 / 0.08) 0%, rgb(243 240 234 / 0.12) 45%, rgb(236 230 220 / 0.18) 100%), url(${EXTERIOR_SRC})`,
        }}
      >
        <div className="shiro-yado__concierge-view">
          <ConciergeModel playback={playback} mode={mode} />
        </div>

        <span className={isSpeaking ? 'shiro-yado__speaking is-active' : 'shiro-yado__speaking'}>
          {isBusy ? copy.speaking : phase === 'error' ? copy.listenAgain : copy.waiting}
        </span>

        {/* 3D / 写真 切り替えボタン */}
        <button
          type="button"
          className="shiro-yado__mode-toggle"
          onClick={toggleMode}
          aria-label={WELCOME[locale].mode(nextModeLabel)}
          aria-pressed={mode === 'photo'}
        >
          {mode === 'photo' ? WELCOME[locale].photo : '3D'}
        </button>
      </div>

      <div className="shiro-yado__concierge-content">
        <p className="shiro-yado__eyebrow">CONCIERGE</p>
        <h3 id="concierge-title">{copy.title}</h3>
        <p className="shiro-yado__concierge-copy">{copy.copy}</p>

        <div className="shiro-yado__concierge-menu" aria-label="Concierge menu">
          {topics.map((item) => (
            <button
              key={item.id}
              type="button"
              className={topic === item.id ? 'is-active' : undefined}
              aria-pressed={topic === item.id}
              onClick={() => selectTopic(item.id)}
            >
              <strong>{item.label}</strong>
              <small>{item.description}</small>
            </button>
          ))}
        </div>

        {topic === 'rooms' ? (
          <div className="shiro-yado__room-menu" aria-label="Select room">
            {ROOM_IDS.map((id) => (
              <button
                key={id}
                type="button"
                className={roomId === id ? 'is-active' : undefined}
                aria-pressed={roomId === id}
                onClick={() => selectRoom(id)}
              >
                {copy.roomLabels[id] ?? id}
              </button>
            ))}
          </div>
        ) : null}

        {topic === 'dining' && <button type="button" className="shiro-yado__btn shiro-yado__btn--accent" onClick={() => { stop(); go({ v: 'dining' }); }}>{DINING[locale].entry}</button>}

        {topic === 'bath' ? (
          <button
            type="button"
            className="shiro-yado__btn shiro-yado__btn--accent"
            onClick={() => { stop(); go({ v: 'place', p: 'bath' }); }}
          >
            {copy.bathAction}
          </button>
        ) : null}

        {(topic === 'banquet' || topic === 'restroom' || (topic === 'rooms' && roomId)) && (
          <button type="button" className="shiro-yado__btn shiro-yado__btn--accent"
            onClick={() => { stop(); go({ v: 'guide', p: topic === 'rooms' ? roomId! : topic }); }}>
            {getUi(locale).startGuide}
          </button>
        )}

        {topic === 'nearby' ? (
          <button
            type="button"
            className="shiro-yado__btn shiro-yado__btn--accent"
            onClick={() => { stop(); go({ v: 'nearby' }); }}
          >
            {copy.nearbyAction}
          </button>
        ) : null}

        <div className="shiro-yado__speech" aria-live="polite">
          <p>{message || copy.greeting}</p>
          <div className="shiro-yado__speech-actions">
            <button type="button" onClick={() => { speak(message || copy.greeting); }}>
              {copy.listenAgain}
            </button>
            {isBusy ? (
              <button type="button" onClick={() => { stop(); }}>
                {copy.stop}
              </button>
            ) : null}
          </div>
          {!isSupported ? <small>{copy.unsupported}</small> : null}
        </div>
      </div>
    </section>
  );
}
