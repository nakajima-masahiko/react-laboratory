import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getConciergeCopy,
  getConciergeSpeech,
  getLocaleMeta,
  type ConciergeTopic,
} from './i18n';
import type { PlaceId } from './hotel-data';
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

/** 操作していないと判断するまでの時間（ミリ秒） */
const IDLE_MS = 10000;
/** 自動切り替えの間隔（ミリ秒） */
const AUTO_SWITCH_INTERVAL_MS = 8000;

export function ConciergeGuide() {
  const { go } = useNav();
  const fromFloor = useHotelStore((state) => state.fromFloor);
  const fromPlaceId = useHotelStore((state) => state.fromPlaceId);
  const myRoomId = useHotelStore((state) => state.myRoomId);
  const locale = useHotelStore((state) => state.locale);
  const [topic, setTopic] = useState<ConciergeTopic | null>(null);
  const [roomId, setRoomId] = useState<PlaceId | null>(myRoomId);
  const [mode, setMode] = useState<ConciergeMode>('3d');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const hasGreeted = useRef(false);
  const greetedLocale = useRef(locale);
  const lastInteractRef = useRef(Date.now());
  const idleTimerRef = useRef<number | null>(null);
  const autoSwitchTimerRef = useRef<number | null>(null);
  const meta = getLocaleMeta(locale);
  const copy = getConciergeCopy(locale);
  const { isSpeaking, isSupported, message, speak, stop } = useConciergeSpeech(meta.speechLang);

  const markInteracted = useCallback(() => {
    lastInteractRef.current = Date.now();
    // 操作があったら自動切り替えを一旦止める
    if (autoSwitchTimerRef.current) {
      window.clearInterval(autoSwitchTimerRef.current);
      autoSwitchTimerRef.current = null;
    }
  }, []);

  // モード切り替え（フェードアニメ付き）
  const switchMode = useCallback((next?: ConciergeMode) => {
    setIsTransitioning(true);
    window.setTimeout(() => {
      setMode((prev) => {
        if (next) return next;
        return prev === 'photo' ? '3d' : 'photo';
      });
      setIsTransitioning(false);
    }, 320);
  }, []);

  // アイドル検知 → 一定時間操作がなければ自動切り替え開始
  useEffect(() => {
    const checkIdle = () => {
      const idle = Date.now() - lastInteractRef.current >= IDLE_MS;
      if (idle && !isSpeaking && !autoSwitchTimerRef.current) {
        // 最初の切り替え
        switchMode();
        // 以降は定期的に切り替え
        autoSwitchTimerRef.current = window.setInterval(() => {
          if (!isSpeaking) {
            switchMode();
          }
        }, AUTO_SWITCH_INTERVAL_MS);
      }
    };

    idleTimerRef.current = window.setInterval(checkIdle, 1500);

    return () => {
      if (idleTimerRef.current) window.clearInterval(idleTimerRef.current);
      if (autoSwitchTimerRef.current) window.clearInterval(autoSwitchTimerRef.current);
    };
  }, [isSpeaking, switchMode]);

  // 発話中は自動切り替えを止める
  useEffect(() => {
    if (isSpeaking) {
      markInteracted();
    }
  }, [isSpeaking, markInteracted]);

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
    markInteracted();
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
    markInteracted();
    setTopic('rooms');
    setRoomId(nextRoomId);
    speak(getConciergeSpeech(locale, 'rooms', fromFloor, fromPlaceId, nextRoomId));
  };

  const toggleMode = () => {
    markInteracted();
    switchMode();
  };

  const modeLabel = mode === 'photo' ? '写真' : '3D';
  const nextModeLabel = mode === 'photo' ? '3D' : '写真';

  const topics = (Object.keys(copy.topics) as ConciergeTopic[]).map((id) => ({
    id,
    ...copy.topics[id],
  }));

  return (
    <section
      className="shiro-yado__concierge"
      aria-labelledby="concierge-title"
      onPointerDown={markInteracted}
      onClick={markInteracted}
    >
      <div
        className="shiro-yado__concierge-stage"
        aria-label="Hotel concierge 3D model"
        style={{
          backgroundImage: `linear-gradient(180deg, rgb(251 249 245 / 0.42) 0%, rgb(243 240 234 / 0.55) 45%, rgb(236 230 220 / 0.7) 100%), url(${EXTERIOR_SRC})`,
        }}
      >
        <div
          className={
            isTransitioning
              ? 'shiro-yado__concierge-view is-fading'
              : 'shiro-yado__concierge-view'
          }
        >
          <ConciergeModel speaking={isSpeaking} hairColor={meta.hairColor} mode={mode} />
        </div>

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

        {topic === 'nearby' ? (
          <button
            type="button"
            className="shiro-yado__btn shiro-yado__btn--accent"
            onClick={() => { markInteracted(); stop(); go({ v: 'nearby' }); }}
          >
            {copy.nearbyAction}
          </button>
        ) : null}

        <div className="shiro-yado__speech" aria-live="polite">
          <p>{message || copy.greeting}</p>
          <div className="shiro-yado__speech-actions">
            <button type="button" onClick={() => { markInteracted(); speak(message || copy.greeting); }}>
              {copy.listenAgain}
            </button>
            {isSpeaking ? (
              <button type="button" onClick={() => { markInteracted(); stop(); }}>
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
