export type FloorId = 1 | 2 | 3;

export type PlaceId =
  | 'lobby'
  | 'room-201'
  | 'room-202'
  | 'room-203'
  | 'room-204'
  | 'room-205'
  | 'banquet'
  | 'bath'
  | 'restroom';

export type PlaceKind = 'lobby' | 'room' | 'facility';

export type MapSide = 'left' | 'center' | 'right';

export type Place = {
  id: PlaceId;
  floor: FloorId;
  kind: PlaceKind;
  number?: string;
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
  mapSide: MapSide;
};

export const HOTEL_NAME = '白の宿';
export const HOTEL_NAME_EN = 'SHIRO NO YADO';

export const PLACES: Record<PlaceId, Place> = {
  lobby: {
    id: 'lobby',
    floor: 1,
    kind: 'lobby',
    name: 'フロント・ロビー',
    shortName: 'ロビー',
    typeLabel: '1階',
    size: '約 48㎡',
    capacity: '待合 8名',
    amenities: ['フロントデスク', '待合ソファ', 'エレベーターホール'],
    description:
      '白い壁と淡い木のカウンターが迎える、チェックイン・アウトの場所です。正面奥がエレベーターホールです。',
    summary: '1階の中央、エントランスを入ってすぐです',
    fromElevator: 'エレベーターを降りると正面がロビー、左手がフロントです。',
    toElevator: 'ソファの奥、正面右手のエレベーターホールへ進みます。',
    hours: 'フロント 7:00–22:00',
    mapSide: 'center',
  },
  'room-201': {
    id: 'room-201',
    floor: 2,
    kind: 'room',
    number: '201',
    name: '201 スタンダードツイン',
    shortName: '201',
    typeLabel: 'スタンダードツイン',
    size: '24㎡',
    capacity: '2名',
    amenities: ['シングルベッド×2', 'ユニットバス', 'デスク', '32インチテレビ'],
    description:
      '白い壁に淡い木のヘッドボード。二人でゆったり休める標準のツインです。',
    summary: '2階廊下の左手、最初の部屋です',
    fromElevator: '2階で降り、廊下を左手に進んだ最初の扉です。',
    toElevator: '部屋を出て右へ。廊下のつきあたりがエレベーターです。',
    mapSide: 'left',
  },
  'room-202': {
    id: 'room-202',
    floor: 2,
    kind: 'room',
    number: '202',
    name: '202 スタンダードダブル',
    shortName: '202',
    typeLabel: 'スタンダードダブル',
    size: '24㎡',
    capacity: '2名',
    amenities: ['ダブルベッド', 'ユニットバス', 'デスク', '32インチテレビ'],
    description:
      '幅160cmのダブルベッドを中心にした、静かな二人部屋。白のリネンが印象です。',
    summary: '2階廊下の左手、2つ目の部屋です',
    fromElevator: '2階で降り、廊下を左手に進んだ2つ目の扉です。',
    toElevator: '部屋を出て右へ。すぐ先がエレベーターホールです。',
    mapSide: 'left',
  },
  'room-203': {
    id: 'room-203',
    floor: 2,
    kind: 'room',
    number: '203',
    name: '203 デラックスツイン',
    shortName: '203',
    typeLabel: 'デラックスツイン',
    size: '32㎡',
    capacity: '2名',
    amenities: ['セミダブル×2', 'ソファ', '広めデスク', '40インチテレビ'],
    description:
      'ソファとデスクを設けた広めのツイン。滞在中の作業や、少し長い休みにも向きます。',
    summary: '2階廊下の中央です',
    fromElevator: '2階で降り、廊下を左手へ。中央の扉が203号室です。',
    toElevator: '部屋を出て右へ、廊下の中央からホールへ戻ります。',
    mapSide: 'center',
  },
  'room-204': {
    id: 'room-204',
    floor: 2,
    kind: 'room',
    number: '204',
    name: '204 コーナーツイン',
    shortName: '204',
    typeLabel: 'コーナーツイン',
    size: '36㎡',
    capacity: '2名',
    amenities: ['セミダブル×2', '二面窓', 'ラウンジチェア', '40インチテレビ'],
    description:
      '角部屋ならではの大きな二面窓。朝の光と、街の眺めをゆっくり味わえます。',
    summary: '2階廊下の奥、角の部屋です',
    fromElevator: '2階で降り、廊下を左手いっぱいに進んだ突きあたりです。',
    toElevator: '部屋を出て右へ、廊下をエレベーターまで戻ります。',
    mapSide: 'right',
  },
  'room-205': {
    id: 'room-205',
    floor: 2,
    kind: 'room',
    number: '205',
    name: '205 ファミリールーム',
    shortName: '205',
    typeLabel: 'ファミリールーム',
    size: '42㎡',
    capacity: '4名',
    amenities: ['シングル×2', 'ソファベッド', 'ダイニングテーブル', 'バスタブ'],
    description:
      '家族やグループのための広い一室。テーブルを囲んで、部屋でも過ごせます。',
    summary: '2階廊下の右手、エレベーター横です',
    fromElevator: '2階で降りて右手すぐ。エレベーター横の扉です。',
    toElevator: '部屋を出て左へ、すぐエレベーターホールです。',
    mapSide: 'right',
  },
  banquet: {
    id: 'banquet',
    floor: 3,
    kind: 'facility',
    name: '宴会場 白の間',
    shortName: '宴会場',
    typeLabel: '宴会場',
    size: '80㎡',
    capacity: '着席 40名',
    amenities: ['長テーブル', 'スクリーン', '控室隣接', 'バリアフリー'],
    description:
      '白い壁と木の床が続く、小さな宴会場。会食、会合、少人数の祝い事に使われます。',
    summary: '3階の右側です',
    fromElevator: '3階で降り、右手の大きな扉が「白の間」です。',
    toElevator: '扉を出て左へ。すぐエレベーターホールです。',
    hours: '10:00–22:00（要予約）',
    mapSide: 'right',
  },
  bath: {
    id: 'bath',
    floor: 3,
    kind: 'facility',
    name: '浴場 しろみゆ',
    shortName: '浴場',
    typeLabel: '大浴場',
    size: '36㎡',
    capacity: '同時 8名',
    amenities: ['内湯', '洗い場', '休憩ベンチ', 'アメニティ'],
    description:
      '白い石と木格子の内湯。小さなホテルの、静かな湯処です。',
    summary: '3階の左側です',
    fromElevator: '3階で降り、左手の暖簾が浴場「しろみゆ」です。',
    toElevator: '入口を出て右へ。正面がエレベーターです。',
    hours: '15:00–24:00 / 6:00–10:00',
    mapSide: 'left',
  },
  restroom: {
    id: 'restroom',
    floor: 3,
    kind: 'facility',
    name: 'お手洗い',
    shortName: 'トイレ',
    typeLabel: '男女別・多目的',
    size: '12㎡',
    capacity: '男女別 + 多目的',
    amenities: ['男性用', '女性用', '多目的トイレ', '洗面'],
    description:
      '3階エレベーターホールの正面。男女別と、車いす対応の多目的トイレがあります。',
    summary: '3階の中央、エレベーター前です',
    fromElevator: '3階で降りて正面すぐ。左手が女性、右手が男性、中央が多目的です。',
    toElevator: '扉を出て数歩でエレベーターホールです。',
    hours: '24時間',
    mapSide: 'center',
  },
};

export const ROOM_IDS: PlaceId[] = [
  'room-201',
  'room-202',
  'room-203',
  'room-204',
  'room-205',
];

export const FACILITY_IDS: PlaceId[] = ['banquet', 'bath', 'restroom'];

export const FLOORS: {
  id: FloorId;
  label: string;
  name: string;
  blurb: string;
  places: PlaceId[];
}[] = [
  {
    id: 1,
    label: '1F',
    name: 'フロント・ロビー',
    blurb: 'チェックイン、待合、エレベーター',
    places: ['lobby'],
  },
  {
    id: 2,
    label: '2F',
    name: '客室',
    blurb: '5つの白い部屋',
    places: ROOM_IDS,
  },
  {
    id: 3,
    label: '3F',
    name: '共用施設',
    blurb: '宴会場・浴場・お手洗い',
    places: FACILITY_IDS,
  },
];

export function getPlace(id: string | undefined | null): Place | undefined {
  if (!id) return undefined;
  return PLACES[id as PlaceId];
}

export function isPlaceId(id: string): id is PlaceId {
  return id in PLACES;
}
