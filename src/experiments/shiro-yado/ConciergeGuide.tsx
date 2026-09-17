import { useEffect, useRef, useState } from 'react';
import {
  getConciergeCopy,
  getConciergeSpeech,
  getLocaleMeta,
  type ConciergeTopic,
} from './i18n';
import type { PlaceId } from './hotel-data';
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
  const fromFloor = useHotelStore((state) => state.fromFloor);
  const fromPlaceId = useHotelStore((state) => state.fromPlaceId);
  const myRoomId = useHotelStore((state) => state.myRoomId);
  const locale = useHotelStore((state) => state.locale);
  const [topic, setTopic] = useState<ConciergeTopic | null>(null);
  const [roomId, setRoomId] = useState<PlaceId | null>(myRoomId);
  const [mode, setMode] = useState<ConciergeMode>('auto');
  const hasGreeted = useRef(false);
  const greetedLocale = useRef(locale);
  const meta = getLocaleMeta(locale);
  const copy = getConciergeCopy(locale);
  const { isSpeaking, isSupported, message, speak, stop } = useConciergeSpeech(meta.speechLang);

  useEffect(() => {
    if (hasGreeted.current && greetedLocale.current === locale) return;
    hasGreeted.current = true;
    greetedLocale.current = locale;
    const timer = window.setTimeout(() => {
      speak(copy.greeting);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [speak, locale, copy.greeting]);

  const selectTopic = (nextTopic: ConciergeTopic) => {
    setTopic(nextTopic);
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
    setMode((prev) => {
      if (prev === 'auto' || prev === '3d') return 'photo';
      return '3d';
    });
  };

  const modeLabel = mode === 'photo' ? '写真' : '3D';
  const nextModeLabel = mode === 'photo' ? '3D' : '写真';

  const topics = (Object.keys(copy.topics) as ConciergeTopic[]).map((id) => ({
    id,
    ...copy.topics[id],
  }));

  return (
    <section className="shiro-yado__concierge" aria-labelledby="concierge-title">
      <div
        className="shiro-yado__concierge-stage"
        aria-label="Hotel concierge 3D model"
        style={{
          backgroundImage: `linear-gradient(180deg, rgb(251 249 245 / 0.42) 0%, rgb(243 240 234 / 0.55) 45%, rgb(236 230 220 / 0.7) 100%), url(${EXTERIOR_SRC})`,
        }}
      >
        <ConciergeModel speaking={isSpeaking} hairColor={meta.hairColor} mode={mode} />
        <span className={isSpeaking ? 'shiro-yado__speaking is-active' : 'shiro-yado__speaking'}>
          {isSpeaking ? copy.speaking : copy.waiting}
        </span>

        {/* 3D / 写真 切り替えボタン */}
        <button
          type="button"
          className="shiro-yado__mode-toggle"
          onClick={toggleMode}
          aria-label={`表示を${nextModeLabel}に切り替え`}
          title={`現在: ${modeLabel} → ${nextModeLabel}に切り替え`}
        >
          {mode === 'photo' ? '🖼 写真' : '🧊 3D'}
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

        <div className="shiro-yado__speech" aria-live="polite">
          <p>{message || copy.greeting}</p>
          <div className="shiro-yado__speech-actions">
            <button type="button" onClick={() => speak(message || copy.greeting)}>
              {copy.listenAgain}
            </button>
            {isSpeaking ? (
              <button type="button" onClick={stop}>
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
