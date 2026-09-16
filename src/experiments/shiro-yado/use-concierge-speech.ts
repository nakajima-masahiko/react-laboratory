import { useCallback, useEffect, useRef, useState } from 'react';

type SpeechState = {
  isSpeaking: boolean;
  isSupported: boolean;
  message: string;
};

function chooseJapaneseVoice(voices: SpeechSynthesisVoice[]) {
  return (
    voices.find((voice) => voice.lang === 'ja-JP' && voice.localService) ??
    voices.find((voice) => voice.lang.startsWith('ja')) ??
    null
  );
}

export function useConciergeSpeech() {
  const [state, setState] = useState<SpeechState>({
    isSpeaking: false,
    isSupported: typeof window !== 'undefined' && 'speechSynthesis' in window,
    message: '',
  });
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
    setState((current) => ({ ...current, isSpeaking: false }));
  }, []);

  const speak = useCallback((message: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setState({ isSpeaking: false, isSupported: false, message });
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.92;
    utterance.pitch = 1.05;
    utterance.volume = 1;
    utterance.voice = chooseJapaneseVoice(window.speechSynthesis.getVoices());
    utterance.onstart = () => {
      setState({ isSpeaking: true, isSupported: true, message });
    };
    utterance.onend = () => {
      utteranceRef.current = null;
      setState((current) => ({ ...current, isSpeaking: false }));
    };
    utterance.onerror = () => {
      utteranceRef.current = null;
      setState((current) => ({ ...current, isSpeaking: false }));
    };
    utteranceRef.current = utterance;
    setState({ isSpeaking: true, isSupported: true, message });
    window.speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => stop, [stop]);

  return { ...state, speak, stop };
}

