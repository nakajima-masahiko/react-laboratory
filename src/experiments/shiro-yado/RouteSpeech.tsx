import { useEffect } from 'react';
import type { Guide } from './guide';
import { getLocaleMeta } from './i18n';
import { INSIDE } from './inside-copy';
import { useHotelStore } from './store';
import { useConciergeSpeech } from './use-concierge-speech';

export function RouteSpeech({ guide }: { guide: Guide }) {
  const locale = useHotelStore((s) => s.locale);
  const enabled = useHotelStore((s) => s.speechEnabled);
  const copy = INSIDE[locale];
  const { playback, phase, requestId, isBusy, isSupported, speak, stop } = useConciergeSpeech(getLocaleMeta(locale).speechLang);
  const text = [guide.summary, ...guide.steps.map((step) => `${step.title}。${step.body}`)].join(' ');

  useEffect(() => {
    // No portrait is mounted on this page, so there is no bow to await.
    if (phase === 'bowing') playback.completeBow(requestId);
  }, [phase, playback, requestId]);
  useEffect(() => () => stop(), [text, stop]);

  return <div className="shiro-yado__route-speech">
    <button type="button" className="shiro-yado__btn shiro-yado__btn--outline"
      disabled={!enabled || !isSupported} onClick={() => speak(text)}>{copy.listen}</button>
    {isBusy && <button type="button" className="shiro-yado__btn shiro-yado__btn--ghost" onClick={stop}>{copy.stop}</button>}
    <p className="shiro-yado__muted" role="status">
      {!isSupported ? copy.unsupported : !enabled ? copy.muted : phase === 'error' ? copy.speechError : ''}
    </p>
  </div>;
}
