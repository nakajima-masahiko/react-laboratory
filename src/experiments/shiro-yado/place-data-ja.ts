import type { PlaceId } from './hotel-data';

type PlaceText = {
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

export const PLACE_JA: Record<PlaceId, PlaceText> = {
  lobby: {
    name: 'フロント・ロビー',
    shortName: 'ロビー',
    typeLabel: '1階',
    size: '約 48㎡',
    capacity: '待合 8名',
    amenities: ['フロントデスク', '待合ソファ', 'エレベーターホール'],
    description: '白い壁と淡い木のカウンターが迎える、チェックイン・アウトの場所です。正面奥がエレベーターホールです。',
    summary: '1階の中央、エントランスを入ってすぐです',
    fromElevator: 'エレベーターを降りると正面がロビー、左手がフロントです。',
    toElevator: 'ソファの奥、正面右手のエレベーターホールへ進みます。',
    hours: 'フロント 7:00–22:00',
  },
  'room-201': {
    name: '201 スタンダードツイン',
    shortName: '201',
    typeLabel: 'スタンダードツイン',
    size: '24㎡',
    capacity: '2名',
    amenities: ['シングルベッド×2', 'ユニットバス', 'デスク', '32インチテレビ'],
    description: '白い壁に淡い木のヘッドボード。二人でゆったり休める標準のツインです。',
    summary: '2階廊下の左手、最初の部屋です',
    fromElevator: '2階で降り、廊下を左手に進んだ最初の扉です。',
    toElevator: '部屋を出て右へ。廊下のつきあたりがエレベーターです。',
  },
  'room-202': {
    name: '202 スタンダードダブル',
    shortName: '202',
    typeLabel: 'スタンダードダブル',
    size: '24㎡',
    capacity: '2名',
    amenities: ['ダブルベッド', 'ユニットバス', 'デスク', '32インチテレビ'],
    description: '幅160cmのダブルベッドを中心にした、静かな二人部屋。白のリネンが印象です。',
    summary: '2階廊下の左手、2つ目の部屋です',
    fromElevator: '2階で降り、廊下を左手に進んだ2つ目の扉です。',
    toElevator: '部屋を出て右へ。すぐ先がエレベーターホールです。',
  },
  'room-203': {
    name: '203 デラックスツイン',
    shortName: '203',
    typeLabel: 'デラックスツイン',
    size: '32㎡',
    capacity: '2名',
    amenities: ['セミダブル×2', 'ソファ', '広めデスク', '40インチテレビ'],
    description: 'ソファとデスクを設けた広めのツイン。滞在中の作業や、少し長い休みにも向きます。',
    summary: '2階廊下の中央です',
    fromElevator: '2階で降り、廊下を左手へ。中央の扉が203号室です。',
    toElevator: '部屋を出て右へ、廊下の中央からホールへ戻ります。',
  },
  'room-204': {
    name: '204 コーナーツイン',
    shortName: '204',
    typeLabel: 'コーナーツイン',
    size: '36㎡',
    capacity: '2名',
    amenities: ['セミダブル×2', '二面窓', 'ラウンジチェア', '40インチテレビ'],
    description: '角部屋ならではの大きな二面窓。朝の光と、街の眺めをゆっくり味わえます。',
    summary: '2階廊下の奥、角の部屋です',
    fromElevator: '2階で降り、廊下を左手いっぱいに進んだ突きあたりです。',
    toElevator: '部屋を出て右へ、廊下をエレベーターまで戻ります。',
  },
  'room-205': {
    name: '205 ファミリールーム',
    shortName: '205',
    typeLabel: 'ファミリールーム',
    size: '42㎡',
    capacity: '4名',
    amenities: ['シングル×2', 'ソファベッド', 'ダイニングテーブル', 'バスタブ'],
    description: '家族やグループのための広い一室。テーブルを囲んで、部屋でも過ごせます。',
    summary: '2階廊下の右手、エレベーター横です',
    fromElevator: '2階で降りて右手すぐ。エレベーター横の扉です。',
    toElevator: '部屋を出て左へ、すぐエレベーターホールです。',
  },
  banquet: {
    name: '宴会場 白の間',
    shortName: '宴会場',
    typeLabel: '宴会場',
    size: '80㎡',
    capacity: '着席 40名',
    amenities: ['長テーブル', 'スクリーン', '控室隣接', 'バリアフリー'],
    description: '白い壁と木の床が続く、小さな宴会場。会食、会合、少人数の祝い事に使われます。',
    summary: '3階の右側です',
    fromElevator: '3階で降り、右手の大きな扉が「白の間」です。',
    toElevator: '扉を出て左へ。すぐエレベーターホールです。',
    hours: '10:00–22:00（要予約）',
  },
  bath: {
    name: '浴場 しろみゆ',
    shortName: '浴場',
    typeLabel: '大浴場',
    size: '36㎡',
    capacity: '同時 8名',
    amenities: ['内湯', '洗い場', '休憩ベンチ', 'アメニティ'],
    description: '白い石と木格子の内湯。小さなホテルの、静かな湯処です。',
    summary: '3階の左側です',
    fromElevator: '3階で降り、左手の暖簾が浴場「しろみゆ」です。',
    toElevator: '入口を出て右へ。正面がエレベーターです。',
    hours: '15:00–24:00 / 6:00–10:00',
  },
  restroom: {
    name: 'お手洗い',
    shortName: 'トイレ',
    typeLabel: '男女別・多目的',
    size: '12㎡',
    capacity: '男女別 + 多目的',
    amenities: ['男性用', '女性用', '多目的トイレ', '洗面'],
    description: '3階エレベーターホールの正面。男女別と、車いす対応の多目的トイレがあります。',
    summary: '3階の中央、エレベーター前です',
    fromElevator: '3階で降りて正面すぐ。左手が女性、右手が男性、中央が多目的です。',
    toElevator: '扉を出て数歩でエレベーターホールです。',
    hours: '24時間',
  },
};
