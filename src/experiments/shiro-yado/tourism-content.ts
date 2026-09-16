export type TourismSpot = {
  id: string;
  number: number;
  name: string;
  area: string;
  summary: string;
  access: string;
  bestTime: string;
};

export const TOURISM_SPOTS: readonly TourismSpot[] = [
  {
    id: 'shiro-yado', number: 1, name: '白の宿', area: '南東の入り江',
    summary: '白い外壁と海を望むテラスが印象的な、島めぐりの起点となる小さなホテルです。',
    access: '島内各所へ送迎車とレンタサイクルを用意', bestTime: '朝のテラス、夕暮れのラウンジ',
  },
  {
    id: 'tsukimori-lighthouse', number: 2, name: '月守灯台', area: '北東の岬',
    summary: '島の航路を百年以上見守る白い灯台。草原から水平線と島の輪郭を一望できます。',
    access: '車18分、自転車35分、駐車場から徒歩5分', bestTime: '午前の青い海、満月前後の夕刻',
  },
  {
    id: 'ruri-coral-cove', number: 3, name: '瑠璃珊瑚の入り江', area: '東海岸',
    summary: '瑠璃色から翡翠色へ変わる小さな湾。干潮時には珊瑚礁の縁と潮だまりが現れます。',
    access: '車10分、徒歩25分', bestTime: '干潮の前後2時間、晴れた午前',
  },
  {
    id: 'yunagi-cape', number: 4, name: '夕凪岬', area: '西海岸',
    summary: '西へ張り出した岩礁の岬。風がやむ夕刻、海面に一本の光の道が伸びます。',
    access: '車20分、自転車40分、展望台まで徒歩8分', bestTime: '日没40分前から日没後20分',
  },
  {
    id: 'shiomori-shrine', number: 5, name: '潮守神社', area: '北西の岩場',
    summary: '漁の安全と旅人の帰還を祈ってきた小社。赤い鳥居の向こうに荒々しい北の海が広がります。',
    access: '車22分、石段を徒歩10分', bestTime: '朝、椿の咲く2月から3月',
  },
  {
    id: 'hoshisuna-beach', number: 6, name: '星砂浜', area: '南西海岸',
    summary: '貝殻と珊瑚片が混じる淡い砂浜。波が穏やかな日は足元まで透明です。',
    access: '車15分、自転車25分', bestTime: '午前、春から初秋',
  },
  {
    id: 'tsubakigumo-forest', number: 7, name: '椿雲の森', area: '中央丘陵',
    summary: '島の中央を覆う照葉樹と椿の森。木漏れ日の道の先に、港と灯台を同時に望む展望地があります。',
    access: '登山口まで車12分、周回徒歩60分から90分', bestTime: '午前、椿の季節、雨上がり',
  },
  {
    id: 'shiomi-harbor', number: 8, name: '汐見港町と朝市', area: '南の港',
    summary: '漁船が帰る港を中心に木造の店と食堂が並ぶ島の玄関。朝市には鮮魚、海藻、柑橘が並びます。',
    access: '車8分、徒歩30分', bestTime: '朝7時から10時、漁のある日',
  },
] as const;

export const TOURISM_COURSES = [
  { title: '半日 海の色を巡る', duration: '約4時間', route: '白の宿 → 瑠璃珊瑚の入り江 → 月守灯台 → 汐見港町で遅めの昼食 → 白の宿' },
  { title: '一日 島の八景を巡る', duration: '約8時間', route: '汐見港町の朝市 → 星砂浜 → 潮守神社 → 椿雲の森 → 月守灯台 → 瑠璃珊瑚の入り江 → 夕凪岬 → 白の宿' },
  { title: '雨の日 島の暮らしを知る', duration: '約3時間', route: '汐見港町の食堂と小店 → 潮守神社の社務所 → 白の宿のラウンジ' },
] as const;

export function buildTourismSpeech(spot: TourismSpot) {
  return `${spot.name}のご案内です。${spot.summary}。白の宿からは${spot.access}です。おすすめは${spot.bestTime}です。`;
}
