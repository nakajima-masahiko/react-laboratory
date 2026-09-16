import { buildGuide } from './guide';
import {
  HOTEL_NAME,
  PLACES,
  ROOM_IDS,
  type FloorId,
  type PlaceId,
} from './hotel-data';

export type ConciergeTopic =
  | 'hotel'
  | 'banquet'
  | 'rooms'
  | 'bath'
  | 'restroom';

export const CONCIERGE_GREETING =
  `本日は${HOTEL_NAME}へお越しいただき、誠にありがとうございます。館内のご案内は、私にお申し付けくださいませ。`;

export const CONCIERGE_TOPICS: ReadonlyArray<{
  id: ConciergeTopic;
  label: string;
  description: string;
}> = [
  { id: 'hotel', label: 'ホテルの説明', description: '白の宿について' },
  { id: 'banquet', label: '宴会場の行き方', description: '3階・白の間' },
  { id: 'rooms', label: '各客室の行き方', description: '201号室〜205号室' },
  { id: 'bath', label: '浴場の案内', description: '3階・しろみゆ' },
  { id: 'restroom', label: 'トイレの案内', description: '3階・エレベーター正面' },
];

export const CONCIERGE_ROOMS = ROOM_IDS.map((id) => ({
  id,
  label: `${PLACES[id].number} ${PLACES[id].typeLabel}`,
}));

function routeSpeech(fromFloor: FloorId, fromPlaceId: PlaceId, destId: PlaceId) {
  const guide = buildGuide({ floor: fromFloor, placeId: fromPlaceId }, destId);
  if (!guide) return '申し訳ございません。ご案内を準備できませんでした。';

  const steps = guide.steps.map((step) => `${step.title}。${step.body}`).join(' ');
  return `${guide.dest.name}へのご案内です。${guide.summary}。${steps}`;
}

export function getConciergeSpeech(
  topic: ConciergeTopic,
  fromFloor: FloorId,
  fromPlaceId: PlaceId,
  roomId?: PlaceId,
) {
  if (topic === 'hotel') {
    return `${HOTEL_NAME}は、白と淡い木を基調にした小さな3階建てのホテルです。1階にフロントとロビー、2階に5つの客室、3階に宴会場、浴場、お手洗いがございます。どうぞごゆっくりお過ごしくださいませ。`;
  }
  if (topic === 'rooms') {
    if (!roomId) return 'ご案内する客室を、201号室から205号室の中からお選びください。';
    return routeSpeech(fromFloor, fromPlaceId, roomId);
  }
  return routeSpeech(fromFloor, fromPlaceId, topic);
}

