import { useHotelStore } from '../store';
import { SHARED } from './copy';

export function BanquetFeatures() {
  const copy = SHARED[useHotelStore(s => s.locale)];
  const features = [
    { title: copy.mealTitle, body: copy.mealBody },
    { title: copy.celebrationTitle, body: copy.celebrationBody },
    { title: copy.meetingTitle, body: copy.meetingBody },
  ];
  return <section className="shiro-yado__section" aria-labelledby="banquet-uses-title">
    <h3 id="banquet-uses-title">{copy.uses}</h3>
    <div className="shiro-yado__shared-cards">{features.map(feature => <article className="shiro-yado__card" key={feature.title}><h4>{feature.title}</h4><p>{feature.body}</p></article>)}</div>
  </section>;
}
