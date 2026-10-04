export type ConciergePhase = 'idle' | 'bowing' | 'loading' | 'speaking' | 'paused' | 'finished' | 'error';

export type ConciergePlaybackState = {
  phase: ConciergePhase;
  requestId: number;
  message: string;
  isSupported: boolean;
};

type Options = {
  synth?: SpeechSynthesis;
  Utterance?: typeof SpeechSynthesisUtterance;
  onChange: (state: ConciergePlaybackState) => void;
  language: string;
  enabled: boolean;
};

function chooseVoice(voices: SpeechSynthesisVoice[], lang: string) {
  const matches = voices.filter((voice) => voice.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()));
  return matches.find((voice) => /kyoko|nanami|haruka|mizuki|ayumi/i.test(voice.name))
    ?? matches.find((voice) => voice.lang === lang && voice.localService)
    ?? matches.find((voice) => voice.lang === lang)
    ?? matches[0] ?? null;
}

/** One owner for bow → speech → farewell. Canceled utterances cannot finish a newer request. */
export function createConciergePlayback({ synth, Utterance, onChange, language, enabled }: Options) {
  let state: ConciergePlaybackState = { phase: 'idle', requestId: 0, message: '', isSupported: Boolean(synth && Utterance) };
  let hasBowed = false;
  let current: SpeechSynthesisUtterance | null = null;
  let startupTimer: ReturnType<typeof setTimeout> | undefined;
  let boundaryAt = -Infinity;

  const publish = (phase: ConciergePhase) => {
    state = { ...state, phase };
    onChange(state);
  };
  const clearTimer = () => { clearTimeout(startupTimer); startupTimer = undefined; };
  const cancel = () => {
    state = { ...state, requestId: state.requestId + 1 };
    clearTimer();
    current = null;
    boundaryAt = -Infinity;
    synth?.cancel();
  };
  const stop = () => { cancel(); publish('idle'); };

  const startSpeech = () => {
    if (!enabled || !synth || !Utterance || !state.message.trim()) { publish('idle'); return; }
    const id = state.requestId;
    const utterance = new Utterance(state.message);
    current = utterance;
    const isCurrent = () => state.requestId === id && current === utterance;
    utterance.lang = language;
    utterance.rate = 0.92;
    utterance.pitch = 1.04;
    utterance.volume = 1;
    utterance.voice = chooseVoice(synth.getVoices(), language);
    utterance.onstart = () => { if (isCurrent()) { clearTimer(); publish('speaking'); } };
    utterance.onboundary = () => { if (isCurrent()) boundaryAt = performance.now(); };
    utterance.onpause = () => { if (isCurrent()) publish('paused'); };
    utterance.onresume = () => { if (isCurrent()) publish('speaking'); };
    utterance.onend = () => {
      if (!isCurrent()) return;
      clearTimer(); current = null; publish('finished');
    };
    utterance.onerror = (event) => {
      if (!isCurrent()) return;
      clearTimer(); current = null;
      publish(event.error === 'canceled' || event.error === 'interrupted' ? 'idle' : 'error');
    };
    publish('loading');
    startupTimer = setTimeout(() => {
      if (!isCurrent()) return;
      cancel(); publish('error');
    }, 12000);
    try { synth.speak(utterance); } catch { clearTimer(); current = null; publish('error'); }
  };

  return {
    get state() { return state; },
    getBoundaryTime: () => boundaryAt,
    speak(message: string) {
      cancel();
      state = { ...state, message };
      // Bow on the first greeting. Later topic/replay clicks start speech in
      // the user gesture, including after the browser has refused autoplay.
      if (!hasBowed && message.trim()) publish('bowing');
      else startSpeech();
    },
    completeBow(id: number) {
      if (state.phase !== 'bowing' || id !== state.requestId) return;
      hasBowed = true;
      startSpeech();
    },
    configure(nextLanguage: string, nextEnabled: boolean) {
      const changedLanguage = language !== nextLanguage;
      if (changedLanguage || (enabled && !nextEnabled)) stop();
      if (changedLanguage) hasBowed = false;
      language = nextLanguage; enabled = nextEnabled;
    },
    stop,
    dispose() { cancel(); state = { ...state, phase: 'idle' }; },
  };
}

export type ConciergePlayback = ReturnType<typeof createConciergePlayback>;
