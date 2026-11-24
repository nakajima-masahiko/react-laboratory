import { IconArrow, IconBath, IconBed, IconIsland } from './icons';
import type { Locale } from './i18n';
import { useNav } from './nav-state';
import { useHotelStore } from './store';
import { WELCOME } from './welcome-copy';

const HOME_ACTIONS: Record<Locale, { preStay: string; browseRooms: string; duringStay: string; exploreInside: string; experiences: string; concierge: string }> = {
  ja: { preStay: 'これから訪れる方へ', browseRooms: 'お部屋と宿泊案内', duringStay: 'ご滞在中の方へ', exploreInside: '館内の道案内', experiences: 'この宿で過ごす時間', concierge: '館内のことは、コンシェルジュにお尋ねください。' },
  en: { preStay: 'Before your stay', browseRooms: 'Rooms and stays', duringStay: 'During your stay', exploreInside: 'Find your way inside', experiences: 'Enjoy your time here', concierge: 'Our concierge is here to help you find your way.' },
  fr: { preStay: 'Avant votre séjour', browseRooms: 'Chambres et séjour', duringStay: 'Pendant votre séjour', exploreInside: 'Se repérer dans l’hôtel', experiences: 'Profitez de votre séjour', concierge: 'Notre concierge vous aide à trouver votre chemin.' },
  es: { preStay: 'Antes de su estancia', browseRooms: 'Habitaciones y estancia', duringStay: 'Durante su estancia', exploreInside: 'Orientación en el hotel', experiences: 'Disfrute de su estancia', concierge: 'Nuestra conserje puede ayudarle a orientarse.' },
  zh: { preStay: '入住之前', browseRooms: '客房与住宿介绍', duringStay: '入住期间', exploreInside: '馆内路线指引', experiences: '在这里度过的时光', concierge: '礼宾可为您提供馆内路线指引。' },
  ko: { preStay: '숙박 전', browseRooms: '객실 및 숙박 안내', duringStay: '숙박 중', exploreInside: '관내 길 안내', experiences: '이곳에서 보내는 시간', concierge: '컨시어지가 관내 길을 안내해 드립니다.' },
};

export function WelcomeHome() {
  const { go } = useNav();
  const locale = useHotelStore((s) => s.locale);
  const room = useHotelStore((s) => s.myRoomId);
  const copy = WELCOME[locale];
  const actions = HOME_ACTIONS[locale];

  return (
    <section className="shiro-yado__welcome" aria-labelledby="welcome-title">
      <div className="shiro-yado__welcome-art">
        <img
          src={`${import.meta.env.BASE_URL}shiro-yado/shioshiro-island-map.webp`}
          alt=""
          width="1050"
          height="700"
          decoding="async"
          fetchPriority="high"
        />
        <span aria-hidden="true">SHIOSHIRO ISLAND</span>
      </div>
      <div className="shiro-yado__welcome-copy">
        <h2 id="welcome-title">{copy.title}</h2>
        <p>{copy.lead}</p>
      </div>

      <nav className="shiro-yado__welcome-actions" aria-label={copy.choose}>
        <button type="button" className="shiro-yado__welcome-action shiro-yado__welcome-action--primary" onClick={() => go({ v: 'rooms' })}>
          <span className="shiro-yado__welcome-action-copy">
            <small>{actions.preStay}</small>
            <strong>{actions.browseRooms}</strong>
          </span>
          <IconArrow />
        </button>
        <button type="button" className="shiro-yado__welcome-action shiro-yado__welcome-action--secondary" onClick={() => go({ v: 'dest' })}>
          <span className="shiro-yado__welcome-action-copy">
            <small>{actions.duringStay}</small>
            <strong>{actions.exploreInside}</strong>
          </span>
          <IconArrow />
        </button>
      </nav>

      <div className="shiro-yado__welcome-experience-header">
        <h3>{actions.experiences}</h3>
        <p>{copy.choose}</p>
      </div>
      <nav className="shiro-yado__experiences" aria-label={copy.choose}>
        <button type="button" onClick={() => go(room ? { v: 'place', p: room } : { v: 'checkin' })}>
          <IconBed /><strong>{copy.room}</strong><span>{copy.roomHint}</span><IconArrow />
        </button>
        <button type="button" onClick={() => go({ v: 'place', p: 'bath' })}>
          <IconBath /><strong>{copy.bath}</strong><span>{copy.bathHint}</span><IconArrow />
        </button>
        <button type="button" onClick={() => go({ v: 'tourism' })}>
          <IconIsland /><strong>{copy.island}</strong><span>{copy.islandHint}</span><IconArrow />
        </button>
      </nav>
      <p className="shiro-yado__welcome-concierge-hint">{actions.concierge}</p>
    </section>
  );
}
