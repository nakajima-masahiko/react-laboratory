import type { Locale } from './i18n';

export type TourismSpot = {
  id: string;
  number: number;
  name: string;
  area: string;
  summary: string;
  access: string;
  bestTime: string;
};

type TourismCourse = { title: string; duration: string; route: string };

export type TourismContent = {
  linkTitle: string;
  linkSubtitle: string;
  title: string;
  lead: string;
  mapAlt: string;
  mapCaption: string;
  spotsTitle: string;
  spotsHint: string;
  conciergeLabel: string;
  fromHotel: string;
  recommended: string;
  listen: string;
  listenAgain: string;
  stop: string;
  unsupported: string;
  coursesTitle: string;
  serviceEyebrow: string;
  serviceTitle: string;
  serviceBody: string;
  spots: readonly TourismSpot[];
  courses: readonly TourismCourse[];
  speech: (spot: TourismSpot) => string;
};

const jaSpots: readonly TourismSpot[] = [
  { id: 'shiro-yado', number: 1, name: '白の宿', area: '南東の入り江', summary: '白い外壁と海を望むテラスが印象的な、島めぐりの起点となる小さなホテルです。', access: '島内各所へ送迎車とレンタサイクルを用意', bestTime: '朝のテラス、夕暮れのラウンジ' },
  { id: 'tsukimori-lighthouse', number: 2, name: '月守灯台', area: '北東の岬', summary: '島の航路を百年以上見守る白い灯台。草原から水平線と島の輪郭を一望できます。', access: '車18分、自転車35分、駐車場から徒歩5分', bestTime: '午前の青い海、満月前後の夕刻' },
  { id: 'ruri-coral-cove', number: 3, name: '瑠璃珊瑚の入り江', area: '東海岸', summary: '瑠璃色から翡翠色へ変わる小さな湾。干潮時には珊瑚礁の縁と潮だまりが現れます。', access: '車10分、徒歩25分', bestTime: '干潮の前後2時間、晴れた午前' },
  { id: 'yunagi-cape', number: 4, name: '夕凪岬', area: '西海岸', summary: '西へ張り出した岩礁の岬。風がやむ夕刻、海面に一本の光の道が伸びます。', access: '車20分、自転車40分、展望台まで徒歩8分', bestTime: '日没40分前から日没後20分' },
  { id: 'shiomori-shrine', number: 5, name: '潮守神社', area: '北西の岩場', summary: '漁の安全と旅人の帰還を祈ってきた小社。赤い鳥居の向こうに荒々しい北の海が広がります。', access: '車22分、石段を徒歩10分', bestTime: '朝、椿の咲く2月から3月' },
  { id: 'hoshisuna-beach', number: 6, name: '星砂浜', area: '南西海岸', summary: '貝殻と珊瑚片が混じる淡い砂浜。波が穏やかな日は足元まで透明です。', access: '車15分、自転車25分', bestTime: '午前、春から初秋' },
  { id: 'tsubakigumo-forest', number: 7, name: '椿雲の森', area: '中央丘陵', summary: '島の中央を覆う照葉樹と椿の森。木漏れ日の道の先に、港と灯台を同時に望む展望地があります。', access: '登山口まで車12分、周回徒歩60分から90分', bestTime: '午前、椿の季節、雨上がり' },
  { id: 'shiomi-harbor', number: 8, name: '汐見港町と朝市', area: '南の港', summary: '漁船が帰る港を中心に木造の店と食堂が並ぶ島の玄関。朝市には鮮魚、海藻、柑橘が並びます。', access: '車8分、徒歩30分', bestTime: '朝7時から10時、漁のある日' },
];

const enSpots: readonly TourismSpot[] = [
  { id: 'shiro-yado', number: 1, name: 'Shiro Yado', area: 'Southeast Cove', summary: 'A small seaside hotel with white walls and ocean terraces, and the ideal starting point for exploring the island.', access: 'Hotel shuttle and rental bicycles are available', bestTime: 'The terrace in the morning or lounge at sunset' },
  { id: 'tsukimori-lighthouse', number: 2, name: 'Tsukimori Lighthouse', area: 'Northeast Cape', summary: 'A white lighthouse that has watched over island shipping for more than a century, with sweeping views from the grassland.', access: '18 min by car, 35 min by bicycle, then a 5 min walk', bestTime: 'Blue seas in the morning or evenings near the full moon' },
  { id: 'ruri-coral-cove', number: 3, name: 'Ruri Coral Cove', area: 'East Coast', summary: 'A quiet cove whose water shifts from lapis blue to emerald. Coral shelves and tide pools appear at low tide.', access: '10 min by car or 25 min on foot', bestTime: 'Within two hours of low tide on a clear morning' },
  { id: 'yunagi-cape', number: 4, name: 'Yunagi Cape', area: 'West Coast', summary: 'A rocky cape reaching westward. When the wind settles at dusk, a path of light stretches across the sea.', access: '20 min by car or 40 min by bicycle, then an 8 min walk', bestTime: 'From 40 min before until 20 min after sunset' },
  { id: 'shiomori-shrine', number: 5, name: 'Shiomori Shrine', area: 'Northwest Cliffs', summary: 'A small shrine devoted to safe fishing and travelers returning home, facing the northern sea beyond its red gate.', access: '22 min by car, then a 10 min stairway walk', bestTime: 'Morning, especially during camellia season in February and March' },
  { id: 'hoshisuna-beach', number: 6, name: 'Hoshisuna Beach', area: 'Southwest Coast', summary: 'A pale beach mixed with shells and coral fragments. On calm days the water is clear right to your feet.', access: '15 min by car or 25 min by bicycle', bestTime: 'Morning, from spring to early autumn' },
  { id: 'tsubakigumo-forest', number: 7, name: 'Tsubakigumo Forest', area: 'Central Hills', summary: 'An evergreen and camellia forest with a shaded trail leading to views of both the harbor and lighthouse.', access: '12 min by car to the trailhead, then a 60–90 min loop', bestTime: 'Morning, camellia season, or just after rain' },
  { id: 'shiomi-harbor', number: 8, name: 'Shiomi Harbor & Morning Market', area: 'South Harbor', summary: 'The island gateway, lined with wooden shops and eateries. The market offers fresh fish, seaweed, and citrus.', access: '8 min by car or 30 min on foot', bestTime: '7–10 a.m. on fishing days' },
];

const translateSpots = (locale: Exclude<Locale, 'ja' | 'en'>): readonly TourismSpot[] => {
  const text = {
    fr: [
      ['Shiro Yado', 'Crique sud-est', 'Un petit hôtel blanc avec terrasses sur la mer, point de départ idéal pour découvrir l’île.', 'Navette de l’hôtel et vélos de location disponibles', 'La terrasse le matin ou le salon au coucher du soleil'],
      ['Phare de Tsukimori', 'Cap nord-est', 'Un phare blanc veille sur les routes maritimes depuis plus d’un siècle et offre un vaste panorama.', '18 min en voiture, 35 min à vélo, puis 5 min à pied', 'La mer bleue le matin ou le soir près de la pleine lune'],
      ['Crique de corail Ruri', 'Côte est', 'Une petite baie passant du bleu lapis à l’émeraude, avec récifs et bassins visibles à marée basse.', '10 min en voiture ou 25 min à pied', 'Dans les deux heures autour de la marée basse, par matin clair'],
      ['Cap Yunagi', 'Côte ouest', 'Un cap rocheux où, au calme du soir, un chemin de lumière se dessine sur la mer.', '20 min en voiture, 40 min à vélo, puis 8 min à pied', 'De 40 min avant à 20 min après le coucher du soleil'],
      ['Sanctuaire Shiomori', 'Falaises nord-ouest', 'Un petit sanctuaire dédié à la sécurité des pêcheurs et au retour des voyageurs.', '22 min en voiture, puis 10 min par les marches', 'Le matin, surtout pendant les camélias en février et mars'],
      ['Plage Hoshisuna', 'Côte sud-ouest', 'Une plage claire mêlée de coquillages et de corail, baignée d’une eau transparente les jours calmes.', '15 min en voiture ou 25 min à vélo', 'Le matin, du printemps au début de l’automne'],
      ['Forêt Tsubakigumo', 'Collines centrales', 'Une forêt de camélias et d’arbres persistants, avec un sentier donnant sur le port et le phare.', '12 min en voiture, puis une boucle de 60 à 90 min', 'Le matin, pendant les camélias ou après la pluie'],
      ['Port de Shiomi et marché', 'Port sud', 'La porte de l’île, bordée de boutiques en bois. Le marché propose poissons frais, algues et agrumes.', '8 min en voiture ou 30 min à pied', 'De 7 h à 10 h les jours de pêche'],
    ],
    es: [
      ['Shiro Yado', 'Ensenada sureste', 'Un pequeño hotel blanco con terrazas al mar, punto de partida ideal para recorrer la isla.', 'Hay transporte del hotel y bicicletas de alquiler', 'La terraza por la mañana o el salón al atardecer'],
      ['Faro Tsukimori', 'Cabo noreste', 'Un faro blanco que protege las rutas de la isla desde hace más de un siglo y ofrece amplias vistas.', '18 min en coche, 35 min en bicicleta y 5 min a pie', 'El mar azul por la mañana o el atardecer cerca de luna llena'],
      ['Ensenada de coral Ruri', 'Costa este', 'Una pequeña bahía que cambia del azul lapislázuli al esmeralda, con arrecifes visibles en marea baja.', '10 min en coche o 25 min a pie', 'Dos horas antes o después de la marea baja, en una mañana despejada'],
      ['Cabo Yunagi', 'Costa oeste', 'Un cabo rocoso donde, al calmarse el viento, una senda de luz cruza el mar al atardecer.', '20 min en coche, 40 min en bicicleta y 8 min a pie', 'Desde 40 min antes hasta 20 min después del ocaso'],
      ['Santuario Shiomori', 'Acantilados noroeste', 'Un pequeño santuario dedicado a la pesca segura y al regreso de los viajeros.', '22 min en coche y 10 min subiendo escalones', 'Por la mañana, especialmente en febrero y marzo'],
      ['Playa Hoshisuna', 'Costa suroeste', 'Una playa clara de conchas y coral, con agua transparente en los días tranquilos.', '15 min en coche o 25 min en bicicleta', 'Por la mañana, de primavera a comienzos de otoño'],
      ['Bosque Tsubakigumo', 'Colinas centrales', 'Un bosque de camelias y árboles perennes con un sendero que domina el puerto y el faro.', '12 min en coche y un circuito a pie de 60–90 min', 'Por la mañana, en temporada de camelias o tras la lluvia'],
      ['Puerto Shiomi y mercado', 'Puerto sur', 'La entrada a la isla, con tiendas de madera y un mercado de pescado, algas y cítricos.', '8 min en coche o 30 min a pie', 'De 7 a 10 h en días de pesca'],
    ],
    zh: [
      ['白之宿', '东南海湾', '白墙与海景露台令人难忘，是环游小岛的理想起点。', '提供酒店接送车与自行车租赁', '清晨的露台或黄昏的休息厅'],
      ['月守灯塔', '东北海岬', '守望岛上航路百余年的白色灯塔，可从草原眺望海平线与全岛轮廓。', '驾车18分钟、骑行35分钟，再步行5分钟', '上午的碧海或满月前后的傍晚'],
      ['琉璃珊瑚湾', '东海岸', '海水由琉璃蓝渐变为翡翠绿，退潮时可见珊瑚礁边缘与潮池。', '驾车10分钟或步行25分钟', '退潮前后两小时的晴朗上午'],
      ['夕凪岬', '西海岸', '向西伸出的岩石海岬，傍晚风止时海面会出现一道金色光路。', '驾车20分钟、骑行40分钟，再步行8分钟', '日落前40分钟至日落后20分钟'],
      ['潮守神社', '西北礁岸', '祈愿渔业平安与旅人归来的小神社，红色鸟居外是壮阔的北海。', '驾车22分钟，再沿石阶步行10分钟', '清晨，尤其是二月至三月山茶花季'],
      ['星砂海滩', '西南海岸', '贝壳与珊瑚碎片交织成浅色沙滩，风平浪静时海水清澈见底。', '驾车15分钟或骑行25分钟', '上午，春季至初秋'],
      ['椿云森林', '中央丘陵', '常绿树与山茶花覆盖的森林，林荫步道尽头可同时眺望港口与灯塔。', '驾车12分钟到登山口，环线步行60至90分钟', '上午、山茶花季或雨后'],
      ['汐见港与早市', '南部港口', '木造商店与餐馆环绕渔港，是小岛门户；早市供应鲜鱼、海藻与柑橘。', '驾车8分钟或步行30分钟', '出海捕鱼日的上午7点至10点'],
    ],
    ko: [
      ['시로야도', '남동쪽 만', '흰 외벽과 바다 전망 테라스가 아름다운 작은 호텔로 섬 여행의 출발점입니다.', '호텔 셔틀과 대여 자전거를 이용할 수 있습니다', '아침 테라스 또는 해 질 녘 라운지'],
      ['쓰키모리 등대', '북동쪽 곶', '백 년 넘게 섬의 뱃길을 지켜 온 흰 등대로 초원에서 수평선과 섬을 조망할 수 있습니다.', '차로 18분, 자전거로 35분 후 도보 5분', '오전의 푸른 바다 또는 보름달 무렵 저녁'],
      ['루리 산호 만', '동해안', '유리빛에서 에메랄드빛으로 변하는 작은 만으로 썰물 때 산호초와 조수 웅덩이가 드러납니다.', '차로 10분 또는 도보 25분', '맑은 오전, 썰물 전후 두 시간'],
      ['유나기 곶', '서해안', '서쪽으로 뻗은 바위 곶으로 바람이 잦아드는 저녁이면 바다 위에 빛길이 생깁니다.', '차로 20분, 자전거로 40분 후 도보 8분', '일몰 40분 전부터 20분 후까지'],
      ['시오모리 신사', '북서쪽 암벽', '안전한 조업과 여행자의 귀환을 기원해 온 작은 신사로 붉은 도리이 너머 북쪽 바다가 펼쳐집니다.', '차로 22분 후 돌계단 도보 10분', '아침, 특히 2~3월 동백철'],
      ['호시스나 해변', '남서해안', '조개와 산호 조각이 섞인 밝은 모래사장으로 잔잔한 날에는 발밑까지 투명합니다.', '차로 15분 또는 자전거로 25분', '오전, 봄부터 초가을'],
      ['쓰바키구모 숲', '중앙 구릉', '상록수와 동백이 우거진 숲으로 산책로 끝에서 항구와 등대를 함께 볼 수 있습니다.', '등산로 입구까지 차로 12분, 순환 도보 60~90분', '오전, 동백철 또는 비 온 뒤'],
      ['시오미 항구와 아침 시장', '남쪽 항구', '목조 상점과 식당이 늘어선 섬의 관문으로 시장에는 생선, 해조류, 감귤이 나옵니다.', '차로 8분 또는 도보 30분', '조업이 있는 날 오전 7~10시'],
    ],
  }[locale];

  return jaSpots.map((spot, index) => ({
    ...spot,
    name: text[index][0], area: text[index][1], summary: text[index][2], access: text[index][3], bestTime: text[index][4],
  }));
};

const common = {
  ja: {
    linkTitle: '汐白島の観光案内', linkSubtitle: '白の宿から巡る八つの景色', title: '汐白島の観光案内', lead: '白の宿を起点に、海と森、祈りと港町の八つの景色を巡ります。', mapAlt: '汐白島の全景と八つの観光地を番号で示した鳥瞰地図', mapCaption: '地図の番号から、案内してほしい場所をお選びください。', spotsTitle: '島の八景', spotsHint: '押すと音声でご案内', conciergeLabel: '観光地を案内するコンシェルジュ', fromHotel: '白の宿から', recommended: 'おすすめ', listen: 'コンシェルジュの案内を聞く', listenAgain: 'もう一度聞く', stop: '停止', unsupported: 'このブラウザでは音声再生に対応していません。', coursesTitle: 'おすすめの過ごし方', serviceEyebrow: '白の宿の案内サービス', serviceTitle: '島内移動もお手伝いします', serviceBody: 'フロントで島内送迎車、レンタサイクル、徒歩用の簡易地図をご案内します。日の入り、干潮、朝市の開催は出発前にお尋ねください。',
  },
  en: {
    linkTitle: 'Shioshiro Island Guide', linkSubtitle: 'Eight island views from Shiro Yado', title: 'Shioshiro Island Guide', lead: 'Discover eight scenes of sea, forest, tradition, and harbor life from Shiro Yado.', mapAlt: 'Bird’s-eye map of Shioshiro Island marking eight attractions', mapCaption: 'Choose a numbered place on the map for a spoken guide.', spotsTitle: 'Eight Island Views', spotsHint: 'Select a place to hear the guide', conciergeLabel: 'Concierge presenting an island attraction', fromHotel: 'From Shiro Yado', recommended: 'Best time', listen: 'Hear the concierge guide', listenAgain: 'Listen again', stop: 'Stop', unsupported: 'Speech playback is not supported by this browser.', coursesTitle: 'Suggested Itineraries', serviceEyebrow: 'Shiro Yado guest service', serviceTitle: 'We can help you explore the island', serviceBody: 'Ask the front desk about the island shuttle, rental bicycles, and walking maps. Please check sunset, low-tide, and market times before departure.',
  },
  fr: {
    linkTitle: 'Guide de l’île Shioshiro', linkSubtitle: 'Huit paysages au départ de Shiro Yado', title: 'Guide de l’île Shioshiro', lead: 'Découvrez huit paysages de mer, de forêt, de traditions et de vie portuaire depuis Shiro Yado.', mapAlt: 'Carte aérienne de l’île Shioshiro indiquant huit sites', mapCaption: 'Choisissez un lieu numéroté pour écouter sa présentation.', spotsTitle: 'Les huit paysages', spotsHint: 'Sélectionnez un lieu pour l’écouter', conciergeLabel: 'Concierge présentant un site de l’île', fromHotel: 'Depuis Shiro Yado', recommended: 'Meilleur moment', listen: 'Écouter la concierge', listenAgain: 'Réécouter', stop: 'Arrêter', unsupported: 'Votre navigateur ne prend pas en charge la lecture vocale.', coursesTitle: 'Itinéraires conseillés', serviceEyebrow: 'Service de Shiro Yado', serviceTitle: 'Nous facilitons vos déplacements', serviceBody: 'La réception propose navette, vélos de location et cartes pédestres. Vérifiez les horaires du coucher du soleil, des marées et du marché avant de partir.',
  },
  es: {
    linkTitle: 'Guía de la isla Shioshiro', linkSubtitle: 'Ocho paisajes desde Shiro Yado', title: 'Guía de la isla Shioshiro', lead: 'Descubra ocho paisajes de mar, bosque, tradición y vida portuaria desde Shiro Yado.', mapAlt: 'Mapa aéreo de la isla Shioshiro con ocho lugares numerados', mapCaption: 'Elija un lugar numerado para escuchar la guía.', spotsTitle: 'Ocho paisajes de la isla', spotsHint: 'Seleccione un lugar para escucharlo', conciergeLabel: 'Conserje presentando un lugar de la isla', fromHotel: 'Desde Shiro Yado', recommended: 'Mejor momento', listen: 'Escuchar a la conserje', listenAgain: 'Escuchar de nuevo', stop: 'Detener', unsupported: 'Este navegador no admite la reproducción de voz.', coursesTitle: 'Itinerarios recomendados', serviceEyebrow: 'Servicio de Shiro Yado', serviceTitle: 'Le ayudamos a recorrer la isla', serviceBody: 'Consulte en recepción el transporte, las bicicletas y los mapas a pie. Confirme el atardecer, la marea baja y el mercado antes de salir.',
  },
  zh: {
    linkTitle: '汐白岛观光指南', linkSubtitle: '从白之宿出发的八处风景', title: '汐白岛观光指南', lead: '以白之宿为起点，探访海洋、森林、信仰与港町交织的八处风景。', mapAlt: '标有八处景点编号的汐白岛鸟瞰图', mapCaption: '请选择地图上的编号，聆听景点介绍。', spotsTitle: '岛上八景', spotsHint: '点击即可播放语音介绍', conciergeLabel: '介绍岛上景点的礼宾员', fromHotel: '从白之宿出发', recommended: '推荐时段', listen: '聆听礼宾员介绍', listenAgain: '再次播放', stop: '停止', unsupported: '此浏览器不支持语音播放。', coursesTitle: '推荐游览路线', serviceEyebrow: '白之宿导览服务', serviceTitle: '我们也可协助岛内出行', serviceBody: '前台可安排岛内接送、租赁自行车并提供步行地图。出发前请确认日落、退潮与早市时间。',
  },
  ko: {
    linkTitle: '시오시로섬 관광 안내', linkSubtitle: '시로야도에서 만나는 여덟 풍경', title: '시오시로섬 관광 안내', lead: '시로야도를 출발점으로 바다와 숲, 신앙과 항구 마을의 여덟 풍경을 둘러보세요.', mapAlt: '여덟 관광지를 번호로 표시한 시오시로섬 조감도', mapCaption: '지도 번호에서 안내받을 장소를 선택하세요.', spotsTitle: '섬의 여덟 풍경', spotsHint: '누르면 음성으로 안내합니다', conciergeLabel: '섬 관광지를 안내하는 컨시어지', fromHotel: '시로야도에서', recommended: '추천 시간', listen: '컨시어지 안내 듣기', listenAgain: '다시 듣기', stop: '정지', unsupported: '이 브라우저는 음성 재생을 지원하지 않습니다.', coursesTitle: '추천 일정', serviceEyebrow: '시로야도 안내 서비스', serviceTitle: '섬 이동도 도와드립니다', serviceBody: '프런트에서 섬 셔틀, 대여 자전거와 도보 지도를 안내합니다. 출발 전에 일몰, 썰물, 아침 시장 시간을 확인해 주세요.',
  },
} satisfies Record<Locale, Omit<TourismContent, 'spots' | 'courses' | 'speech'>>;

const courses: Record<Locale, readonly TourismCourse[]> = {
  ja: [
    { title: '半日 海の色を巡る', duration: '約4時間', route: '白の宿 → 瑠璃珊瑚の入り江 → 月守灯台 → 汐見港町で遅めの昼食 → 白の宿' },
    { title: '一日 島の八景を巡る', duration: '約8時間', route: '汐見港町の朝市 → 星砂浜 → 潮守神社 → 椿雲の森 → 月守灯台 → 瑠璃珊瑚の入り江 → 夕凪岬 → 白の宿' },
    { title: '雨の日 島の暮らしを知る', duration: '約3時間', route: '汐見港町の食堂と小店 → 潮守神社の社務所 → 白の宿のラウンジ' },
  ],
  en: [
    { title: 'Half-day Colors of the Sea', duration: 'About 4 hours', route: 'Shiro Yado → Ruri Coral Cove → Tsukimori Lighthouse → Late lunch at Shiomi Harbor → Shiro Yado' },
    { title: 'Full-day Eight Island Views', duration: 'About 8 hours', route: 'Shiomi Market → Hoshisuna Beach → Shiomori Shrine → Tsubakigumo Forest → Lighthouse → Coral Cove → Yunagi Cape → Shiro Yado' },
    { title: 'Rainy-day Island Life', duration: 'About 3 hours', route: 'Shiomi eateries and shops → Shiomori Shrine office → Shiro Yado lounge' },
  ],
  fr: [
    { title: 'Demi-journée aux couleurs de la mer', duration: 'Environ 4 h', route: 'Shiro Yado → Crique Ruri → Phare Tsukimori → Déjeuner tardif à Shiomi → Shiro Yado' },
    { title: 'Journée des huit paysages', duration: 'Environ 8 h', route: 'Marché de Shiomi → Plage Hoshisuna → Sanctuaire Shiomori → Forêt → Phare → Crique → Cap Yunagi → Shiro Yado' },
    { title: 'Vie insulaire sous la pluie', duration: 'Environ 3 h', route: 'Restaurants et boutiques de Shiomi → Sanctuaire Shiomori → Salon de Shiro Yado' },
  ],
  es: [
    { title: 'Medio día: colores del mar', duration: 'Unas 4 horas', route: 'Shiro Yado → Ensenada Ruri → Faro Tsukimori → Almuerzo tardío en Shiomi → Shiro Yado' },
    { title: 'Día completo: ocho paisajes', duration: 'Unas 8 horas', route: 'Mercado Shiomi → Playa Hoshisuna → Santuario Shiomori → Bosque → Faro → Ensenada → Cabo Yunagi → Shiro Yado' },
    { title: 'Vida isleña en un día de lluvia', duration: 'Unas 3 horas', route: 'Locales de Shiomi → Santuario Shiomori → Salón de Shiro Yado' },
  ],
  zh: [
    { title: '半日 海色之旅', duration: '约4小时', route: '白之宿 → 琉璃珊瑚湾 → 月守灯塔 → 汐见港迟午餐 → 白之宿' },
    { title: '一日 环游岛上八景', duration: '约8小时', route: '汐见早市 → 星砂海滩 → 潮守神社 → 椿云森林 → 灯塔 → 珊瑚湾 → 夕凪岬 → 白之宿' },
    { title: '雨天 感受岛上生活', duration: '约3小时', route: '汐见港餐馆与商店 → 潮守神社 → 白之宿休息厅' },
  ],
  ko: [
    { title: '반나절 바다색 여행', duration: '약 4시간', route: '시로야도 → 루리 산호 만 → 쓰키모리 등대 → 시오미 항구 늦은 점심 → 시로야도' },
    { title: '하루 섬 여덟 풍경 여행', duration: '약 8시간', route: '시오미 시장 → 호시스나 해변 → 시오모리 신사 → 숲 → 등대 → 산호 만 → 유나기 곶 → 시로야도' },
    { title: '비 오는 날의 섬 생활', duration: '약 3시간', route: '시오미 항구 식당과 상점 → 시오모리 신사 → 시로야도 라운지' },
  ],
};

const spots: Record<Locale, readonly TourismSpot[]> = {
  ja: jaSpots,
  en: enSpots,
  fr: translateSpots('fr'),
  es: translateSpots('es'),
  zh: translateSpots('zh'),
  ko: translateSpots('ko'),
};

const speechBuilders: Record<Locale, (spot: TourismSpot) => string> = {
  ja: (spot) => `${spot.name}のご案内です。${spot.summary} 白の宿からは${spot.access}です。おすすめは${spot.bestTime}です。`,
  en: (spot) => `Here is your guide to ${spot.name}. ${spot.summary} From Shiro Yado, ${spot.access}. The best time to visit is ${spot.bestTime}.`,
  fr: (spot) => `Voici ${spot.name}. ${spot.summary} Depuis Shiro Yado : ${spot.access}. Le meilleur moment est ${spot.bestTime}.`,
  es: (spot) => `Le presentamos ${spot.name}. ${spot.summary} Desde Shiro Yado: ${spot.access}. El mejor momento es ${spot.bestTime}.`,
  zh: (spot) => `为您介绍${spot.name}。${spot.summary} 从白之宿出发，${spot.access}。推荐时段是${spot.bestTime}。`,
  ko: (spot) => `${spot.name} 안내입니다. ${spot.summary} 시로야도에서는 ${spot.access}. 추천 시간은 ${spot.bestTime}입니다.`,
};

export function getTourism(locale: Locale): TourismContent {
  return { ...common[locale], spots: spots[locale], courses: courses[locale], speech: speechBuilders[locale] };
}
