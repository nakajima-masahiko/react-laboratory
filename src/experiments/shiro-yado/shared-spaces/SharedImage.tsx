import { useHotelStore } from '../store';
import { SHARED } from './copy';

export function SharedImage({ scene }: { scene: 'floor-3' | 'banquet' }) {
  const copy = SHARED[useHotelStore(s => s.locale)];
  return <figure className="shiro-yado__shared-image">
    <img src={`${import.meta.env.BASE_URL}shiro-yado/${scene === 'floor-3' ? 'shared-floor-3' : 'banquet-white-hall'}.webp`} alt={scene === 'floor-3' ? copy.floorAlt : copy.hallAlt} width="1536" height="1024" decoding="async" />
    <figcaption>{copy.caption}</figcaption>
  </figure>;
}
