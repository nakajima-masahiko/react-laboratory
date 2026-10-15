import { useNav } from '../nav-state';
import { useHotelStore } from '../store';
import { DINING } from './copy';

export function DiningEntry() {
  const { go } = useNav();
  const copy = DINING[useHotelStore(s => s.locale)];
  return <section className="shiro-yado__dining-entry" aria-label={copy.title}>
    <img src={`${import.meta.env.BASE_URL}shiro-yado/dining-breakfast.webp`} alt="" width="1536" height="1024" loading="lazy" decoding="async" />
    <div><h3>{copy.title}</h3><p>{copy.lead}</p>
      <button type="button" className="shiro-yado__btn shiro-yado__btn--accent" onClick={() => go({ v: 'dining' })}>{copy.entry}</button>
    </div>
  </section>;
}
