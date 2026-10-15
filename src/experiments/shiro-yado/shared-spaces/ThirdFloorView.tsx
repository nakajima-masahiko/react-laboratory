import { DiningEntry } from '../dining/DiningEntry';
import { FloorPlan } from '../floor-plan';
import { IconDoor } from '../icons';
import { useNav } from '../nav-state';
import { getFloorText, localizePlace } from '../place-i18n';
import { SceneDisclosure } from '../SceneDisclosure';
import { useHotelStore } from '../store';
import { getUi } from '../ui-extra';
import { SharedImage } from './SharedImage';
import { SHARED } from './copy';

export function ThirdFloorView() {
  const { go } = useNav();
  const locale = useHotelStore(s => s.locale);
  const here = useHotelStore(s => s.fromPlaceId);
  const copy = SHARED[locale];
  const ui = getUi(locale);
  return <div className="shiro-yado__stack" data-testid="third-floor-page">
    <header className="shiro-yado__hero"><p className="shiro-yado__eyebrow">3F</p><h2>{getFloorText(locale, 3).name}</h2><p className="shiro-yado__lead">{copy.floorLead}</p></header>
    <SharedImage scene="floor-3" />
    <section className="shiro-yado__section" aria-labelledby="third-floor-choose-title">
      <h3 id="third-floor-choose-title">{copy.choose}</h3>
      <div className="shiro-yado__shared-cards">
        {(['bath', 'banquet', 'restroom'] as const).map(id => {
          const place = localizePlace(locale, id);
          return <article className="shiro-yado__shared-facility shiro-yado__card" key={id} aria-label={place.name}>
            {id === 'restroom' ? <div className="shiro-yado__shared-symbol" aria-hidden="true"><IconDoor /></div> : <img className="shiro-yado__shared-thumb" src={`${import.meta.env.BASE_URL}shiro-yado/${id === 'bath' ? 'bath-fuji-mural.svg' : 'banquet-white-hall.webp'}`} alt="" width="1536" height="1024" loading="lazy" decoding="async" />}
            <h4>{place.name}</h4><p>{place.summary}</p>
            {id !== 'banquet' && <p className="shiro-yado__muted">{place.hours}</p>}
            <button type="button" className="shiro-yado__btn shiro-yado__btn--outline" onClick={() => go({ v: 'place', p: id })}>{copy.details}</button>
            <button type="button" className="shiro-yado__btn shiro-yado__btn--accent" onClick={() => go({ v: 'guide', p: id })}>{ui.directionsHere}</button>
          </article>;
        })}
      </div>
    </section>
    <DiningEntry />
    <section className="shiro-yado__section"><h3>{ui.layout}</h3><FloorPlan floor={3} here={here} /></section>
    <SceneDisclosure scene="floor-3" label={copy.floorScene} />
  </div>;
}
