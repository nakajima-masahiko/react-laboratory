import { useNav } from '../nav-state';
import { useHotelStore } from '../store';
import { DINING } from './copy';

const MEALS = [
  { id: 'breakfast', hours: '7:00–9:00', lastEntry: '8:30', price: 1800 },
  { id: 'dinner', hours: '18:00–20:00', lastEntry: '19:00', price: 4800 },
] as const;

export function DiningView() {
  const { go } = useNav();
  const locale = useHotelStore(s => s.locale);
  const copy = DINING[locale];
  const yen = new Intl.NumberFormat(locale, { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 });
  const showMeal = (id: string) => {
    const title = document.getElementById(`dining-${id}-title`);
    title?.focus({ preventScroll: true });
    title?.scrollIntoView({ block: 'start', behavior: 'auto' });
  };
  return <div className="shiro-yado__stack" data-testid="dining-page">
    <header className="shiro-yado__hero">
      <p className="shiro-yado__booking-badge">{copy.demo}</p>
      <h2>{copy.title}</h2><p className="shiro-yado__lead">{copy.lead}</p>
    </header>
    <aside className="shiro-yado__dining-notice">{copy.notice}</aside>
    <div className="shiro-yado__card shiro-yado__dining-venue">
      <strong>{copy.venue}</strong>
      <button type="button" className="shiro-yado__btn shiro-yado__btn--outline" onClick={() => go({ v: 'guide', p: 'banquet' })}>{copy.directions}</button>
    </div>
    <nav className="shiro-yado__booking-actions" aria-label={copy.title}>
      {MEALS.map(meal => <button key={meal.id} type="button" className="shiro-yado__btn shiro-yado__btn--outline" onClick={() => showMeal(meal.id)}>{copy[meal.id].title}</button>)}
    </nav>
    {MEALS.map(meal => <section className="shiro-yado__dining-meal" key={meal.id} aria-labelledby={`dining-${meal.id}-title`}>
      <figure>
        <img src={`${import.meta.env.BASE_URL}shiro-yado/dining-${meal.id}.webp`} alt={copy[meal.id].alt} width="1536" height="1024" loading={meal.id === 'breakfast' ? 'eager' : 'lazy'} decoding="async" />
        <figcaption>{copy.imageNote}</figcaption>
      </figure>
      <div className="shiro-yado__dining-meal-copy">
        <h3 tabIndex={-1} id={`dining-${meal.id}-title`}>{copy[meal.id].title}</h3>
        <p>{copy[meal.id].lead}</p>
        <dl className="shiro-yado__booking-facts">
          <div><dt>{copy.hours}</dt><dd>{meal.hours}</dd><dd className="shiro-yado__dining-sub">{copy.lastEntry} {meal.lastEntry}</dd></div>
          <div><dt>{copy.price}</dt><dd>{yen.format(meal.price)}</dd><dd className="shiro-yado__dining-sub">{copy.priceNote}</dd></div>
        </dl>
        <h4>{copy.menu}</h4><ul>{copy[meal.id].menu.map(dish => <li key={dish}>{dish}</li>)}</ul>
      </div>
    </section>)}
    <section className="shiro-yado__section" aria-labelledby="dining-info-title">
      <h3 id="dining-info-title">{copy.practical}</h3>
      <div className="shiro-yado__dining-info">
        <article className="shiro-yado__card"><h4>{copy.children}</h4><p>{copy.childrenBody}</p></article>
        <article className="shiro-yado__card"><h4>{copy.allergy}</h4><p>{copy.allergyBody}</p></article>
      </div>
      <p className="shiro-yado__muted">{copy.seasonal}</p>
    </section>
    <button type="button" className="shiro-yado__btn shiro-yado__btn--accent" onClick={() => go({ v: 'guide', p: 'banquet' })}>{copy.directions}</button>
  </div>;
}
