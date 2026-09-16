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
  walkHall2: string;
  toDest: (name: string) => string;
  hallRight: string;
  hallLeft: string;
  hallCenter: string;
  moveFrom: (floorWalk: string) => string;
  floorWalk: Record<FloorId, string>;
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
    walkHall2: '2階の廊下を進む',
    toDest: (name) => `${name}へ`,
    hallRight: 'ホールから右手へ進みます。',
    hallLeft: 'ホールから左手へ進みます。',
    hallCenter: 'ホールの正面へ進みます。',
    moveFrom: (fw) => `${fw}移動します。`,
    floorWalk: { 1: '1階ロビーから', 2: '2階の廊下から', 3: '3階のホールから' },
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
    walkHall2: 'Walk the 2nd-floor corridor',
    toDest: (name) => `To ${name}`,
    hallRight: 'From the hall, go right.',
    hallLeft: 'From the hall, go left.',
    hallCenter: 'Head straight ahead in the hall.',
    moveFrom: (fw) => `Move ${fw}.`,
    floorWalk: { 1: 'from the 1st-floor lobby', 2: 'from the 2nd-floor corridor', 3: 'from the 3rd-floor hall' },
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
    walkHall2: 'Avancer dans le couloir du 2e',
    toDest: (name) => `Vers ${name}`,
    hallRight: 'Depuis le hall, allez à droite.',
    hallLeft: 'Depuis le hall, allez à gauche.',
    hallCenter: 'Allez tout droit dans le hall.',
    moveFrom: (fw) => `Déplacez-vous ${fw}.`,
    floorWalk: { 1: 'depuis le lobby du 1er', 2: 'depuis le couloir du 2e', 3: 'depuis le hall du 3e' },
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
    walkHall2: 'Avance por el pasillo de la 2.ª',
    toDest: (name) => `Hacia ${name}`,
    hallRight: 'Desde el hall, vaya a la derecha.',
    hallLeft: 'Desde el hall, vaya a la izquierda.',
    hallCenter: 'Siga recto en el hall.',
    moveFrom: (fw) => `Muévase ${fw}.`,
    floorWalk: { 1: 'desde el lobby de la 1.ª', 2: 'desde el pasillo de la 2.ª', 3: 'desde el hall de la 3.ª' },
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
    walkHall2: '沿二楼走廊前进',
    toDest: (name) => `前往${name}`,
    hallRight: '从大厅向右走。',
    hallLeft: '从大厅向左走。',
    hallCenter: '沿大厅正前方走。',
    moveFrom: (fw) => `从${fw}移动。`,
    floorWalk: { 1: '一楼大堂', 2: '二楼走廊', 3: '三楼大厅' },
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
    walkHall2: '2층 복도를 따라가기',
    toDest: (name) => `${name}(으)로`,
    hallRight: '홀에서 오른쪽으로 가세요.',
    hallLeft: '홀에서 왼쪽으로 가세요.',
    hallCenter: '홀 정면으로 가세요.',
    moveFrom: (fw) => `${fw} 이동합니다.`,
    floorWalk: { 1: '1층 로비에서', 2: '2층 복도에서', 3: '3층 홀에서' },
  },
};

function minutesBetween(from: Here, dest: Place, c: GuideCopy): string {
  if (from.placeId === dest.id) return c.arrived;
  if (from.floor === dest.floor) return c.walk1;
  const hops = Math.abs(from.floor - dest.floor);
  return hops === 1 ? c.walk2 : c.walk3;
}

function walkOnSameFloor(from: Place, dest: Place, c: GuideCopy): GuideStep {
  if (from.floor === 2 && dest.floor === 2) {
    return {
      title: c.walkHall2,
      body: dest.fromElevator
        .replace(/On 2F,?\s*/i, '')
        .replace(/Au 2e,?\s*/i, '')
        .replace(/En 2F,?\s*/i, '')
        .replace(/在二楼/g, '')
        .replace(/2층에서\s*/g, '')
        .replace(/2階で降り、?/g, '')
        .replace(/2階で降りて/g, ''),
    };
  }
  if (from.floor === 3 && dest.floor === 3) {
    const dir =
      dest.mapSide === 'right' ? c.hallRight : dest.mapSide === 'left' ? c.hallLeft : c.hallCenter;
    return {
      title: c.toDest(dest.shortName),
      body: `${dir}${dest.fromElevator
        .replace(/On 3F,?\s*/i, '')
        .replace(/Au 3e,?\s*/i, '')
        .replace(/En 3F,?\s*/i, '')
        .replace(/在三楼[，,]?/g, '')
        .replace(/3층에서\s*/g, '')
        .replace(/3階で降り、?/g, '')
        .replace(/3階で降りて/g, '')}`,
    };
  }
  return {
    title: c.toDest(dest.shortName),
    body: dest.fromElevator,
  };
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
    const elevHints = ['elevator', 'ascenseur', 'ascensor', 'エレベーター', '电梯', '엘리베이터'];
    const hasElev = elevHints.some((w) => origin.toElevator.toLowerCase().includes(w.toLowerCase()));
    return {
      dest,
      from: origin,
      summary: dest.summary,
      minutes: minutesBetween(from, dest, c),
      viaElevator: false,
      steps: [
        {
          title: c.leave(origin.shortName),
          body: hasElev
            ? origin.toElevator
            : `${c.leave(origin.name)}. ${c.moveFrom(c.floorWalk[from.floor])}`,
        },
        walkOnSameFloor(origin, dest, c),
        { title: c.arrive, body: dest.fromElevator },
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
    ],
  };
}
