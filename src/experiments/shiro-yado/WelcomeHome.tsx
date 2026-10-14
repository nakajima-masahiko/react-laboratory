import { IconArrow, IconBath, IconBed, IconIsland } from './icons';
import { useNav } from './nav-state';
import { useHotelStore } from './store';
import { WELCOME } from './welcome-copy';

export function WelcomeHome() {
  const { go } = useNav();
  const locale = useHotelStore((s) => s.locale);
  const room = useHotelStore((s) => s.myRoomId);
  const copy = WELCOME[locale];
  return <section className="shiro-yado__welcome" aria-labelledby="welcome-title">
    <div className="shiro-yado__welcome-art" aria-hidden="true">
      <img src={`${import.meta.env.BASE_URL}shiro-yado/shioshiro-island-map.webp`} alt="" width="1050" height="700" />
      <span>SHIOSHIRO ISLAND · 白の宿</span>
    </div>
    <div className="shiro-yado__welcome-copy">
      <p className="shiro-yado__eyebrow">WELCOME TO SHIRO NO YADO</p>
      <h2 id="welcome-title">{copy.title}</h2>
      <p>{copy.lead}</p>
    </div>
    <h3>{copy.choose}</h3>
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
  </section>;
}
