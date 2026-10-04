import { useEffect, useState } from 'react';
import { createConciergePlayback, type ConciergePlaybackState } from './concierge-playback';
import { useHotelStore } from './store';

export function useConciergeSpeech(speechLang = 'ja-JP') {
  const speechEnabled = useHotelStore((state) => state.speechEnabled);
  const [state, setState] = useState<ConciergePlaybackState>({
    phase: 'idle', requestId: 0, message: '',
    isSupported: typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window,
  });
  const [playback] = useState(() => createConciergePlayback({
    synth: typeof window !== 'undefined' ? window.speechSynthesis : undefined,
    Utterance: typeof window !== 'undefined' ? window.SpeechSynthesisUtterance : undefined,
    language: speechLang, enabled: speechEnabled, onChange: setState,
  }));

  useEffect(() => { playback.configure(speechLang, speechEnabled); }, [playback, speechLang, speechEnabled]);
  useEffect(() => {
    const hidden = () => { if (document.hidden) playback.stop(); };
    document.addEventListener('visibilitychange', hidden);
    window.addEventListener('pagehide', playback.stop);
    return () => {
      document.removeEventListener('visibilitychange', hidden);
      window.removeEventListener('pagehide', playback.stop);
      playback.dispose();
    };
  }, [playback]);

  return {
    ...state, playback,
    isSpeaking: state.phase === 'speaking',
    isBusy: ['bowing', 'loading', 'speaking', 'paused'].includes(state.phase),
    speak: playback.speak, stop: playback.stop,
  };
}
