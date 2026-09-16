import { useEffect } from 'react';
import { getPlace, HOTEL_NAME, HOTEL_NAME_EN } from './hotel-data';
import { IconBack, IconBath, IconBed, IconDoor, IconHall, IconHome } from './icons';
import { LOCALES, type Locale } from './i18n';
import { NavProvider } from './nav';
import { backView, useNav, type View } from './nav-state';
import { useHotelStore } from './store';
import {
  CheckinView,
  DestView,
  FloorView,
  FloorsView,
  GuideView,
  HomeView,
  PlaceView,
} from './views';
import './styles.css';

const TITLE_SRC = `${import.meta.env.BASE_URL}shiro-yado/title.svg`;

function QuickNav({ current }: { current: View }) {
  const { go } = useNav();
  const myRoomId = useHotelStore((s) => s.myRoomId);
  const locale = useHotelStore((s) => s.locale);
  const short: Record<string, Record<Locale, string>> = {
    home: { ja: 'ホーム', en: 'Home', fr: 'Accueil', es: 'Inicio', zh: '首页', ko: '홈' },
    banquet: { ja: '宴会場', en: 'Banquet', fr: 'Banquet', es: 'Salón', zh: '宴会厅', ko: '연회장' },
    bath: { ja: '浴場', en: 'Bath', fr: 'Bains', es: 'Baños', zh: '浴场', ko: '목욕탕' },
    restroom: { ja: 'トイレ', en: 'WC', fr: 'WC', es: 'Aseos', zh: '卫生间', ko: '화장실' },
    room: { ja: 'お部屋', en: 'Room', fr: 'Chambre', es: 'Hab.', zh: '客房', ko: '객실' },
  };
  const items = [
    { key: 'home', label: short.home[locale] ?? 'Home', view: { v: 'home' as const }, icon: <IconHome /> },
    { key: 'banquet', label: short.banquet[locale] ?? 'Banquet', view: { v: 'guide' as const, p: 'banquet' as const }, icon: <IconHall /> },
    { key: 'bath', label: short.bath[locale] ?? 'Bath', view: { v: 'guide' as const, p: 'bath' as const }, icon: <IconBath /> },
    { key: 'restroom', label: short.restroom[locale] ?? 'WC', view: { v: 'guide' as const, p: 'restroom' as const }, icon: <IconDoor /> },
    {
      key: 'room',
      label: short.room[locale] ?? 'Room',
      view: myRoomId ? { v: 'guide' as const, p: myRoomId } : { v: 'checkin' as const },
      icon: <IconBed />,
    },
  ];

  return (
    <nav className="shiro-yado__quick" aria-label="Quick navigation">
      {items.map((item) => {
        const active =
          item.key === 'home'
            ? current.v === 'home'
            : current.v === 'guide' &&
              ((item.key === 'room' && current.p === myRoomId) || current.p === item.key);
        return (
          <button
            key={item.key}
            type="button"
            className={active ? 'is-active' : undefined}
            aria-current={active ? 'page' : undefined}
            onClick={() => go(item.view)}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

function LangSwitcher() {
  const locale = useHotelStore((s) => s.locale);
  const setLocale = useHotelStore((s) => s.setLocale);

  return (
    <div className="shiro-yado__lang" role="group" aria-label="Language">
      {LOCALES.map((item) => (
        <button
          key={item.id}
          type="button"
          className={locale === item.id ? 'is-active' : undefined}
          aria-pressed={locale === item.id}
          aria-label={item.label}
          title={item.label}
          onClick={() => setLocale(item.id)}
        >
          <span className="shiro-yado__lang-flag" aria-hidden>
            {item.flag}
          </span>
          <span className="shiro-yado__lang-label">{item.short}</span>
        </button>
      ))}
    </div>
  );
}

function Shell() {
  const { view, go } = useNav();
  const fromPlaceId = useHotelStore((s) => s.fromPlaceId);
  const here = getPlace(fromPlaceId);
  const back = backView(view);

  useEffect(() => {
    void useHotelStore.persist.rehydrate();
  }, []);

  let content = <HomeView />;
  if (view.v === 'floors') content = <FloorsView />;
  else if (view.v === 'floor') content = <FloorView floor={view.f ?? 1} />;
  else if (view.v === 'place') {
    const place = getPlace(view.p);
    content = place ? <PlaceView place={place} /> : <DestView />;
  } else if (view.v === 'guide') {
    content = view.p ? <GuideView destId={view.p} /> : <DestView />;
  } else if (view.v === 'checkin') content = <CheckinView />;
  else if (view.v === 'dest') content = <DestView />;

  return (
    <div className="shiro-yado">
      <header className="shiro-yado__header">
        {back ? (
          <button type="button" className="shiro-yado__icon-btn" aria-label="Back" onClick={() => go(back)}>
            <IconBack />
          </button>
        ) : (
          <span className="shiro-yado__icon-btn" aria-hidden />
        )}
        <button type="button" className="shiro-yado__brand" onClick={() => go({ v: 'home' })}>
          <img
            className="shiro-yado__title-board"
            src={TITLE_SRC}
            alt={HOTEL_NAME}
            width={160}
            height={40}
            decoding="async"
          />
          <span className="shiro-yado__brand-en">{HOTEL_NAME_EN}</span>
        </button>
        <div className="shiro-yado__header-right">
          <LangSwitcher />
          <span className="shiro-yado__here" title={here ? here.name : undefined}>
            {here ? `${here.floor}F` : ''}
          </span>
        </div>
      </header>
      <div className="shiro-yado__body">{content}</div>
      <QuickNav current={view} />
    </div>
  );
}

export default function ShiroYadoLab() {
  return (
    <NavProvider>
      <Shell />
    </NavProvider>
  );
}
