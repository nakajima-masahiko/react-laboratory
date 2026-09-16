import type { Locale } from './i18n';
import type { Place, PlaceId } from './hotel-data';
import { PLACES } from './hotel-data';
import { PLACE_JA } from './place-data-ja';
import { PLACE_EN } from './place-data-en';

export type PlaceText = {
  name: string;
  shortName: string;
  typeLabel: string;
  size: string;
  capacity: string;
  amenities: string[];
  description: string;
  summary: string;
  fromElevator: string;
  toElevator: string;
  hours?: string;
};

export type FloorText = { name: string; blurb: string };
export type PlanLabels = {
  front: string;
  lobby: string;
  corridor: string;
  bath: string;
  restroom: string;
  banquet: string;
};

const PLACE_TEXT: Record<Locale, Record<PlaceId, PlaceText>> = {
  ja: PLACE_JA,
  en: PLACE_EN,
  fr: PLACE_EN,
  es: PLACE_EN,
  zh: PLACE_EN,
  ko: PLACE_EN,
};

export function getPlaceText(locale: Locale, id: PlaceId): PlaceText {
  return PLACE_TEXT[locale]?.[id] ?? PLACE_TEXT.ja[id];
}

export function localizePlace(locale: Locale, id: PlaceId): Place {
  const base = PLACES[id];
  const t = getPlaceText(locale, id);
  return { ...base, ...t };
}

const FLOOR_TEXT: Record<Locale, Record<1 | 2 | 3, FloorText>> = {
  ja: {
    1: { name: 'フロント・ロビー', blurb: 'チェックイン、待合、エレベーター' },
    2: { name: '客室', blurb: '5つの白い部屋' },
    3: { name: '共用施設', blurb: '宴会場・浴場・お手洗い' },
  },
  en: {
    1: { name: 'Front desk & lobby', blurb: 'Check-in, lounge, elevators' },
    2: { name: 'Guest rooms', blurb: 'Five white rooms' },
    3: { name: 'Shared facilities', blurb: 'Banquet, baths, restrooms' },
  },
  fr: {
    1: { name: 'Réception & lobby', blurb: 'Enregistrement, attente, ascenseurs' },
    2: { name: 'Chambres', blurb: 'Cinq chambres blanches' },
    3: { name: 'Espaces partagés', blurb: 'Banquet, bains, toilettes' },
  },
  es: {
    1: { name: 'Recepción y lobby', blurb: 'Check-in, espera, ascensores' },
    2: { name: 'Habitaciones', blurb: 'Cinco habitaciones blancas' },
    3: { name: 'Instalaciones', blurb: 'Salón, baños, aseos' },
  },
  zh: {
    1: { name: '前台与大堂', blurb: '入住、等候、电梯' },
    2: { name: '客房', blurb: '五间白色客房' },
    3: { name: '共用设施', blurb: '宴会厅·浴场·卫生间' },
  },
  ko: {
    1: { name: '프론트·로비', blurb: '체크인, 대기, 엘리베이터' },
    2: { name: '객실', blurb: '다섯 개의 하얀 방' },
    3: { name: '공용 시설', blurb: '연회장·목욕탕·화장실' },
  },
};

export function getFloorText(locale: Locale, floor: 1 | 2 | 3): FloorText {
  return FLOOR_TEXT[locale]?.[floor] ?? FLOOR_TEXT.ja[floor];
}

const PLAN_LABELS: Record<Locale, PlanLabels> = {
  ja: { front: 'フロント', lobby: 'ロビー', corridor: '廊下 / EV', bath: '浴場', restroom: 'トイレ', banquet: '宴会場' },
  en: { front: 'Front', lobby: 'Lobby', corridor: 'Hall / EV', bath: 'Baths', restroom: 'WC', banquet: 'Banquet' },
  fr: { front: 'Réception', lobby: 'Lobby', corridor: 'Couloir / EV', bath: 'Bains', restroom: 'WC', banquet: 'Banquet' },
  es: { front: 'Recepción', lobby: 'Lobby', corridor: 'Pasillo / EV', bath: 'Baños', restroom: 'WC', banquet: 'Salón' },
  zh: { front: '前台', lobby: '大堂', corridor: '走廊 / EV', bath: '浴场', restroom: '卫生间', banquet: '宴会厅' },
  ko: { front: '프론트', lobby: '로비', corridor: '복도 / EV', bath: '목욕탕', restroom: '화장실', banquet: '연회장' },
};

export function getPlanLabels(locale: Locale): PlanLabels {
  return PLAN_LABELS[locale] ?? PLAN_LABELS.ja;
}
