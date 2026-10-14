import {
  getPlace,
  type FloorId,
  type Place,
  type PlaceId,
} from './hotel-data';
import type { Locale } from './i18n';
import { localizePlace } from './place-i18n';

export type Here = {
  floor: FloorId;
  placeId: PlaceId;
};

export type GuideStep = {
  title: string;
  body: string;
};

export type Guide = {
  dest: Place;
  from: Place;
  summary: string;
  minutes: string;
  steps: GuideStep[];
  viaElevator: boolean;
};

type GuideCopy = {
  arrived: string;
  walk1: string;
  walk2: string;
  walk3: string;
  leave: (name: string) => string;
  arrive: string;
  elevator: string;
  goFloor: (floor: number) => string;
  exitFloor: (floor: number) => string;
  rideUp: (floor: number) => string;
  rideDown: (floor: number) => string;
  youAreHere: string;
  toDest: (name: string) => string;
};

const GUIDE: Record<Locale, GuideCopy> = {
  ja: {
    arrived: '到着済み',
    walk1: '徒歩 約1分',
    walk2: '徒歩 約2分',
    walk3: '徒歩 約3分',
    leave: (name) => `${name}を出る`,
    arrive: '到着',
    elevator: 'エレベーターへ',
    goFloor: (floor) => `${floor}階へ`,
    exitFloor: (floor) => `${floor}階で降りる`,
    rideUp: (floor) => `${floor}階のボタンを押して上がります。`,
    rideDown: (floor) => `${floor}階のボタンを押して降ります。`,
    youAreHere: 'いまいる場所です',
    toDest: (name) => `${name}へ`,
  },
  en: {
    arrived: 'Arrived',
    walk1: 'About 1 min on foot',
    walk2: 'About 2 min on foot',
    walk3: 'About 3 min on foot',
    leave: (name) => `Leave ${name}`,
    arrive: 'Arrival',
    elevator: 'To the elevators',
    goFloor: (floor) => `To floor ${floor}`,
    exitFloor: (floor) => `Exit on floor ${floor}`,
    rideUp: (floor) => `Press the button for floor ${floor} and go up.`,
    rideDown: (floor) => `Press the button for floor ${floor} and go down.`,
    youAreHere: 'You are already here',
    toDest: (name) => `To ${name}`,
  },
  fr: {
    arrived: 'Arrivé',
    walk1: 'Environ 1 min à pied',
    walk2: 'Environ 2 min à pied',
    walk3: 'Environ 3 min à pied',
    leave: (name) => `Quitter ${name}`,
    arrive: 'Arrivée',
    elevator: 'Vers les ascenseurs',
    goFloor: (floor) => `Vers le ${floor}e`,
    exitFloor: (floor) => `Sortir au ${floor}e`,
    rideUp: (floor) => `Appuyez sur ${floor} et montez.`,
    rideDown: (floor) => `Appuyez sur ${floor} et descendez.`,
    youAreHere: 'Vous y êtes déjà',
    toDest: (name) => `Vers ${name}`,
  },
  es: {
    arrived: 'Llegado',
    walk1: 'Aprox. 1 min a pie',
    walk2: 'Aprox. 2 min a pie',
    walk3: 'Aprox. 3 min a pie',
    leave: (name) => `Salir de ${name}`,
    arrive: 'Llegada',
    elevator: 'Hacia los ascensores',
    goFloor: (floor) => `A la planta ${floor}`,
    exitFloor: (floor) => `Bajar en planta ${floor}`,
    rideUp: (floor) => `Pulse el botón de la planta ${floor} y suba.`,
    rideDown: (floor) => `Pulse el botón de la planta ${floor} y baje.`,
    youAreHere: 'Ya está aquí',
    toDest: (name) => `Hacia ${name}`,
  },
  zh: {
    arrived: '已到达',
    walk1: '步行约1分钟',
    walk2: '步行约2分钟',
    walk3: '步行约3分钟',
    leave: (name) => `离开${name}`,
    arrive: '到达',
    elevator: '前往电梯',
    goFloor: (floor) => `前往${floor}楼`,
    exitFloor: (floor) => `在${floor}楼下车`,
    rideUp: (floor) => `按下${floor}楼按钮上行。`,
    rideDown: (floor) => `按下${floor}楼按钮下行。`,
    youAreHere: '您已在此处',
    toDest: (name) => `前往${name}`,
  },
  ko: {
    arrived: '도착함',
    walk1: '도보 약 1분',
    walk2: '도보 약 2분',
    walk3: '도보 약 3분',
    leave: (name) => `${name}을(를) 나가기`,
    arrive: '도착',
    elevator: '엘리베이터로',
    goFloor: (floor) => `${floor}층으로`,
    exitFloor: (floor) => `${floor}층에서 내리기`,
    rideUp: (floor) => `${floor}층 버튼을 누르고 올라갑니다.`,
    rideDown: (floor) => `${floor}층 버튼을 누르고 내려갑니다.`,
    youAreHere: '지금 있는 곳입니다',
    toDest: (name) => `${name}(으)로`,
  },
};

function minutesBetween(from: Here, dest: Place, c: GuideCopy): string {
  if (from.placeId === dest.id) return c.arrived;
  if (from.floor === dest.floor) return c.walk1;
  const hops = Math.abs(from.floor - dest.floor);
  return hops === 1 ? c.walk2 : c.walk3;
}

export function buildGuide(from: Here, destId: PlaceId, locale: Locale = 'ja'): Guide | null {
  const c = GUIDE[locale] ?? GUIDE.ja;
  const dest = localizePlace(locale, destId);
  const originBase = getPlace(from.placeId);
  if (!originBase) return null;
  const origin = localizePlace(locale, from.placeId);

  if (from.placeId === dest.id) {
    return {
      dest,
      from: origin,
      summary: c.youAreHere,
      minutes: c.arrived,
      viaElevator: false,
      steps: [{ title: dest.name, body: dest.description }],
    };
  }

  if (from.floor === dest.floor) {
    return {
      dest,
      from: origin,
      summary: dest.summary,
      minutes: minutesBetween(from, dest, c),
      viaElevator: false,
      steps: [
        {
          title: c.leave(origin.shortName),
          body: origin.toElevator,
        },
        { title: c.toDest(dest.shortName), body: dest.fromElevator },
        { title: c.arrive, body: dest.name },
      ],
    };
  }

  const ride = dest.floor > from.floor ? c.rideUp(dest.floor) : c.rideDown(dest.floor);

  return {
    dest,
    from: origin,
    summary: dest.summary,
    minutes: minutesBetween(from, dest, c),
    viaElevator: true,
    steps: [
      { title: c.elevator, body: origin.toElevator },
      { title: c.goFloor(dest.floor), body: ride },
      { title: c.exitFloor(dest.floor), body: dest.fromElevator },
      { title: c.arrive, body: dest.name },
    ],
  };
}
