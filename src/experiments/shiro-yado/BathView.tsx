import { FloorPlan } from './floor-plan';
import { INSIDE } from './inside-copy';
import { IconArrow, IconPin } from './icons';
import { useNav } from './nav-state';
import { localizePlace } from './place-i18n';
import { SceneDisclosure } from './SceneDisclosure';
import { useHotelStore } from './store';
import { getUi } from './ui-extra';

export function BathView() {
  const { go } = useNav();
  const locale = useHotelStore((s) => s.locale);
  const here = useHotelStore((s) => s.fromPlaceId);
  const setHere = useHotelStore((s) => s.setHere);
  const bath = localizePlace(locale, 'bath');
  const ui = getUi(locale);
  const copy = INSIDE[locale];
  const features = [
    { title: copy.mural, body: copy.muralBody },
    { title: copy.cypress, body: copy.cypressBody },
    { title: copy.washing, body: copy.washingBody },
  ];

  return <div className="shiro-yado__stack" data-testid="bath-page">
    <header className="shiro-yado__hero">
      <p className="shiro-yado__eyebrow">{bath.floor}F · {bath.typeLabel}</p>
      <h2>{bath.name}</h2>
      <p className="shiro-yado__lead">{copy.bathLead}</p>
    </header>
    <section className="shiro-yado__card shiro-yado__bath-essentials" aria-label={ui.hours}>
      <dl className="shiro-yado__facts">
        <div><dt>{ui.hours}</dt><dd>{bath.hours}</dd></div>
        <div><dt>{ui.location}</dt><dd>{bath.summary}</dd></div>
      </dl>
      <button type="button" className="shiro-yado__btn shiro-yado__btn--accent" onClick={() => go({ v: 'guide', p: 'bath' })}>
        {ui.directionsHere}<IconArrow />
      </button>
    </section>
    <figure className="shiro-yado__bath-mural">
      <img src={`${import.meta.env.BASE_URL}shiro-yado/bath-fuji-mural.svg`} alt={copy.mural} width="1600" height="900" />
      <figcaption>{copy.mural}</figcaption>
    </figure>
    <section className="shiro-yado__section" aria-labelledby="bath-features-title">
      <h3 id="bath-features-title">{copy.bathFeatures}</h3>
      <div className="shiro-yado__bath-features">
        {features.map((feature) => <article className="shiro-yado__card" key={feature.title}>
          <h4>{feature.title}</h4><p>{feature.body}</p>
        </article>)}
      </div>
    </section>
    <SceneDisclosure scene="bath" label={copy.bathScene} />
    <section className="shiro-yado__card">
      <h3>{copy.beforeBath}</h3>
      <p>{copy.beforeBathBody}</p>
      <dl className="shiro-yado__facts">
        <div><dt>{ui.size}</dt><dd>{bath.size}</dd></div>
        <div><dt>{ui.capacity}</dt><dd>{bath.capacity}</dd></div>
      </dl>
    </section>
    <section className="shiro-yado__section">
      <h3>{ui.location}</h3>
      <p className="shiro-yado__muted">{bath.summary}</p>
      <FloorPlan floor={bath.floor} highlight="bath" here={here} />
    </section>
    <button type="button" className="shiro-yado__btn shiro-yado__btn--outline" disabled={here === 'bath'} onClick={() => setHere(bath.floor, 'bath')}>
      <IconPin />{here === 'bath' ? ui.alreadyHere : ui.setHere}
    </button>
  </div>;
}
