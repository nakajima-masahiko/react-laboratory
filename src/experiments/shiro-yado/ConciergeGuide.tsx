import { useEffect, useRef, useState } from 'react';
import {
  CONCIERGE_GREETING,
  CONCIERGE_ROOMS,
  CONCIERGE_TOPICS,
  getConciergeSpeech,
  type ConciergeTopic,
} from './concierge-content';
import type { PlaceId } from './hotel-data';
import { ConciergeModel } from './scene/ConciergeModel';
import { useHotelStore } from './store';
import { useConciergeSpeech } from './use-concierge-speech';

export function ConciergeGuide() {
  const fromFloor = useHotelStore((state) => state.fromFloor);
  const fromPlaceId = useHotelStore((state) => state.fromPlaceId);
  const myRoomId = useHotelStore((state) => state.myRoomId);
  const [topic, setTopic] = useState<ConciergeTopic | null>(null);
  const [roomId, setRoomId] = useState<PlaceId | null>(myRoomId);
  const hasGreeted = useRef(false);
  const { isSpeaking, isSupported, message, speak, stop } = useConciergeSpeech();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (hasGreeted.current) return;
      hasGreeted.current = true;
      speak(CONCIERGE_GREETING);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [speak]);

  const selectTopic = (nextTopic: ConciergeTopic) => {
    setTopic(nextTopic);
    if (nextTopic === 'rooms') {
      const nextRoom = roomId ?? myRoomId;
      if (nextRoom) {
        setRoomId(nextRoom);
        speak(getConciergeSpeech(nextTopic, fromFloor, fromPlaceId, nextRoom));
      } else {
        speak(getConciergeSpeech(nextTopic, fromFloor, fromPlaceId));
      }
      return;
    }
    speak(getConciergeSpeech(nextTopic, fromFloor, fromPlaceId));
  };

  const selectRoom = (nextRoomId: PlaceId) => {
    setTopic('rooms');
    setRoomId(nextRoomId);
    speak(getConciergeSpeech('rooms', fromFloor, fromPlaceId, nextRoomId));
  };

  return (
    <section className="shiro-yado__concierge" aria-labelledby="concierge-title">
      <div className="shiro-yado__concierge-stage" aria-label="ホテルコンシェルジュの3Dモデル">
        <ConciergeModel speaking={isSpeaking} />
        <span className={isSpeaking ? 'shiro-yado__speaking is-active' : 'shiro-yado__speaking'}>
          {isSpeaking ? 'ご案内中' : '笑顔でお待ちしています'}
        </span>
      </div>

      <div className="shiro-yado__concierge-content">
        <p className="shiro-yado__eyebrow">CONCIERGE</p>
        <h3 id="concierge-title">私がご案内いたします</h3>
        <p className="shiro-yado__concierge-copy">
          お知りになりたい項目をお選びください。現在地からの行き方を音声でお伝えします。
        </p>

        <div className="shiro-yado__concierge-menu" aria-label="コンシェルジュ案内メニュー">
          {CONCIERGE_TOPICS.map((item) => (
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
          <div className="shiro-yado__room-menu" aria-label="客室を選択">
            {CONCIERGE_ROOMS.map((room) => (
              <button
                key={room.id}
                type="button"
                className={roomId === room.id ? 'is-active' : undefined}
                aria-pressed={roomId === room.id}
                onClick={() => selectRoom(room.id)}
              >
                {room.label}
              </button>
            ))}
          </div>
        ) : null}

        <div className="shiro-yado__speech" aria-live="polite">
          <p>{message || CONCIERGE_GREETING}</p>
          <div className="shiro-yado__speech-actions">
            <button type="button" onClick={() => speak(message || CONCIERGE_GREETING)}>
              もう一度聞く
            </button>
            {isSpeaking ? (
              <button type="button" onClick={stop}>停止</button>
            ) : null}
          </div>
          {!isSupported ? <small>このブラウザでは音声再生に対応していません。</small> : null}
        </div>
      </div>
    </section>
  );
}
