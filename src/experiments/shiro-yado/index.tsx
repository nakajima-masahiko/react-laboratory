import { useEffect } from 'react';
import { getPlace, HOTEL_NAME, HOTEL_NAME_EN } from './hotel-data';
import { IconBack, IconBed, IconHome, IconIsland, IconMap, IconVolume } from './icons';
import { LOCALES, type Locale } from './i18n';
import { NavProvider } from './nav';
import { backView, useNav, type View } from './nav-state';
import { useHotelStore } from './store';
import { TourismGuide } from './TourismGuide';
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
    guide: { ja: '館内案内', en: 'Guide', fr: 'Guide', es: 'Guía', zh: '馆内', ko: '관내' },
    tourism: { ja: '観光案内', en: 'Explore', fr: 'Visites', es: 'Turismo', zh: '观光', ko: '관광' },
    room: { ja: 'お部屋', en: 'Room', fr: 'Chambre', es: 'Hab.', zh: '客房', ko: '객실' },
    floors: { ja: '館内図', en: 'Map', fr: 'Plan', es: 'Mapa', zh: '地图', ko: '지도' },
  };
  const items = [
    { key: 'home', label: short.home[locale] ?? 'Home', view: { v: 'home' as const }, icon: <IconHome /> },
    { key: 'guide', label: short.guide[locale] ?? 'Guide', view: { v: 'dest' as const }, icon: <IconHome /> },
    { key: 'tourism', label: short.tourism[locale] ?? 'Explore', view: { v: 'tourism' as const }, icon: <IconIsland /> },
    {
      key: 'room',
      label: short.room[locale] ?? 'Room',
      view: myRoomId ? { v: 'guide' as const, p: myRoomId } : { v: 'checkin' as const },
      icon: <IconBed />,
    },
    { key: 'floors', label: short.floors[locale] ?? 'Map', view: { v: 'floors' as const }, icon: <IconMap /> },
  ];

  return (
    <nav className="shiro-yado__quick" aria-label="Quick navigation">
      {items.map((item) => {
        const active =
          item.key === 'home'
            ? current.v === 'home'
            : item.key === 'guide'
              ? ['dest', 'guide', 'place'].includes(current.v) && !(current.v === 'guide' && current.p === myRoomId)
              : item.key === 'room'
                ? current.v === 'checkin' || (['guide', 'place'].includes(current.v) && current.p === myRoomId)
                : current.v === item.key;
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

  const current = LOCALES.find((item) => item.id === locale) ?? LOCALES[0];
  return (
    <label className="shiro-yado__lang">
      <span aria-hidden>{current.flag}</span>
      <span className="shiro-yado__sr-only">Language</span>
      <select value={locale} aria-label="Language" onChange={(event) => setLocale(event.target.value as Locale)}>
        {LOCALES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
      </select>
    </label>
  );
}

function Shell() {
  const { view, go } = useNav();
  const fromPlaceId = useHotelStore((s) => s.fromPlaceId);
  const here = getPlace(fromPlaceId);
  const locale = useHotelStore((s) => s.locale);
  const speechEnabled = useHotelStore((s) => s.speechEnabled);
  const setSpeechEnabled = useHotelStore((s) => s.setSpeechEnabled);
  const back = backView(view);

  const toggleSpeech = () => {
    if (speechEnabled && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    setSpeechEnabled(!speechEnabled);
  };

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
  else if (view.v === 'tourism') content = <TourismGuide />;

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
          <button type="button" className="shiro-yado__sound" aria-pressed={!speechEnabled} aria-label={speechEnabled ? 'Mute speech' : 'Enable speech'} onClick={toggleSpeech}>
            <IconVolume muted={!speechEnabled} />
          </button>
          <span className="shiro-yado__here" title={here ? here.name : undefined}>{here ? `${locale === 'ja' ? '現在地 ' : ''}${here.floor}F` : ''}</span>
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
