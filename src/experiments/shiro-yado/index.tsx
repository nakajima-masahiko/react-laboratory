import { useEffect } from 'react';
import { getPlace, HOTEL_NAME, HOTEL_NAME_EN } from './hotel-data';
import { IconBack, IconBath, IconBed, IconDoor, IconHall } from './icons';
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

function QuickNav({ current }: { current: View }) {
  const { go } = useNav();
  const myRoomId = useHotelStore((s) => s.myRoomId);
  const items = [
    { key: 'banquet', label: '宴会場', view: { v: 'guide' as const, p: 'banquet' as const }, icon: <IconHall /> },
    { key: 'bath', label: '浴場', view: { v: 'guide' as const, p: 'bath' as const }, icon: <IconBath /> },
    { key: 'restroom', label: 'トイレ', view: { v: 'guide' as const, p: 'restroom' as const }, icon: <IconDoor /> },
    {
      key: 'room',
      label: 'お部屋',
      view: myRoomId ? { v: 'guide' as const, p: myRoomId } : { v: 'checkin' as const },
      icon: <IconBed />,
    },
  ];

  return (
    <nav className="shiro-yado__quick" aria-label="クイック案内">
      {items.map((item) => {
        const active =
          current.v === 'guide' &&
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
          <button type="button" className="shiro-yado__icon-btn" aria-label="戻る" onClick={() => go(back)}>
            <IconBack />
          </button>
        ) : (
          <span className="shiro-yado__icon-btn" aria-hidden />
        )}
        <button type="button" className="shiro-yado__brand" onClick={() => go({ v: 'home' })}>
          <strong>{HOTEL_NAME}</strong>
          <span>{HOTEL_NAME_EN}</span>
        </button>
        <span className="shiro-yado__here" title={here ? `現在地 ${here.name}` : undefined}>
          {here ? `${here.floor}F` : ''}
        </span>
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
