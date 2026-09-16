import { useCallback, useEffect, useRef, useState } from 'react';

type SpeechState = {
  isSpeaking: boolean;
  isSupported: boolean;
  message: string;
};

function chooseVoice(voices: SpeechSynthesisVoice[], lang: string) {
  const prefix = lang.slice(0, 2).toLowerCase();
  return (
    voices.find((voice) => voice.lang === lang && voice.localService) ??
    voices.find((voice) => voice.lang === lang) ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith(prefix) && voice.localService) ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith(prefix)) ??
    null
  );
}

export function useConciergeSpeech(speechLang = 'ja-JP') {
  const [state, setState] = useState<SpeechState>({
    isSpeaking: false,
    isSupported: typeof window !== 'undefined' && 'speechSynthesis' in window,
    message: '',
  });
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const langRef = useRef(speechLang);
  langRef.current = speechLang;

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
    const lang = langRef.current;
    utterance.lang = lang;
    utterance.rate = 0.92;
    utterance.pitch = 1.05;
    utterance.volume = 1;
    utterance.voice = chooseVoice(window.speechSynthesis.getVoices(), lang);
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
