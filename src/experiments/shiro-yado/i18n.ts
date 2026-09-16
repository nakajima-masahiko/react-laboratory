export type Locale = 'ja' | 'en' | 'fr' | 'es' | 'zh' | 'ko';

export const LOCALES: ReadonlyArray<{
  id: Locale;
  label: string;
  short: string;
  speechLang: string;
  hairColor: string;
}> = [
  { id: 'ja', label: '日本語', short: 'JA', speechLang: 'ja-JP', hairColor: '#5c4033' },
  { id: 'en', label: 'English', short: 'EN', speechLang: 'en-US', hairColor: '#c4a35a' },
  { id: 'fr', label: 'Français', short: 'FR', speechLang: 'fr-FR', hairColor: '#6b3a2a' },
  { id: 'es', label: 'Español', short: 'ES', speechLang: 'es-ES', hairColor: '#2a1f18' },
  { id: 'zh', label: '中文', short: '中', speechLang: 'zh-CN', hairColor: '#1a1210' },
  { id: 'ko', label: '한국어', short: '한', speechLang: 'ko-KR', hairColor: '#3d2b1f' },
];

export function getLocaleMeta(locale: Locale) {
  return LOCALES.find((item) => item.id === locale) ?? LOCALES[0];
}

export type ConciergeTopic = 'hotel' | 'banquet' | 'rooms' | 'bath' | 'restroom';

type ConciergeCopy = {
  greeting: string;
  title: string;
  copy: string;
  speaking: string;
  waiting: string;
  listenAgain: string;
  stop: string;
  unsupported: string;
  topics: Record<ConciergeTopic, { label: string; description: string }>;
  hotelSpeech: string;
  pickRoom: string;
  roomLabels: Record<string, string>;
  routeIntro: (name: string) => string;
  routeLobbyTo: (dest: string, floor: number, side: string) => string;
  routeSameFloor: (dest: string, side: string) => string;
  routeElevator: (from: number, to: number, dest: string, side: string) => string;
  sideLeft: string;
  sideRight: string;
  sideCenter: string;
};

type UiCopy = {
  homeEyebrow: string;
  homeLead: string;
  chooseDest: string;
  chooseFloor: string;
  quickTitle: string;
  quickSub: string;
  toBanquet: string;
  toBath: string;
  toRestroom: string;
  toRoom: string;
  setRoom: string;
  stayTitle: string;
  stayUnset: string;
  staySetHint: string;
  stayUnsetHint: string;
  changeRoom: string;
  checkIn: string;
  floors: string;
  rooms: string;
};

const sideKey = (side: string, c: ConciergeCopy) =>
  side === 'left' ? c.sideLeft : side === 'right' ? c.sideRight : c.sideCenter;

const CONCIERGE: Record<Locale, ConciergeCopy> = {
  ja: {
    greeting:
      '本日は白の宿へお越しいただき、誠にありがとうございます。館内のご案内は、私にお申し付けくださいませ。',
    title: '私がご案内いたします',
    copy: 'お知りになりたい項目をお選びください。現在地からの行き方を音声でお伝えします。',
    speaking: 'ご案内中',
    waiting: '笑顔でお待ちしています',
    listenAgain: 'もう一度聞く',
    stop: '停止',
    unsupported: 'このブラウザでは音声再生に対応していません。',
    topics: {
      hotel: { label: 'ホテルの説明', description: '白の宿について' },
      banquet: { label: '宴会場の行き方', description: '3階・白の間' },
      rooms: { label: '各客室の行き方', description: '201号室〜205号室' },
      bath: { label: '浴場の案内', description: '3階・しろみゆ' },
      restroom: { label: 'トイレの案内', description: '3階・エレベーター正面' },
    },
    hotelSpeech:
      '白の宿は、白と淡い木を基調にした小さな3階建てのホテルです。1階にフロントとロビー、2階に5つの客室、3階に宴会場、浴場、お手洗いがございます。どうぞごゆっくりお過ごしくださいませ。',
    pickRoom: 'ご案内する客室を、201号室から205号室の中からお選びください。',
    roomLabels: {
      'room-201': '201 スタンダードツイン',
      'room-202': '202 スタンダードダブル',
      'room-203': '203 デラックスツイン',
      'room-204': '204 コーナーツイン',
      'room-205': '205 ファミリールーム',
    },
    routeIntro: (name) => `${name}へのご案内です。`,
    routeLobbyTo: (dest, floor, side) =>
      `1階ロビーからエレベーターで${floor}階へお進みください。降りましたら${side}が${dest}です。`,
    routeSameFloor: (dest, side) => `同じ階です。${side}へお進みください。${dest}がございます。`,
    routeElevator: (from, to, dest, side) =>
      `いまは${from}階です。エレベーターで${to}階へ。降りましたら${side}が${dest}です。`,
    sideLeft: '左手',
    sideRight: '右手',
    sideCenter: '正面',
  },
  en: {
    greeting:
      'Welcome to Shiro no Yado. Thank you for staying with us. Please ask me anything about the hotel.',
    title: 'I will guide you',
    copy: 'Choose a topic. I will explain how to get there from your current location.',
    speaking: 'Guiding…',
    waiting: 'Ready to help',
    listenAgain: 'Listen again',
    stop: 'Stop',
    unsupported: 'Speech is not supported in this browser.',
    topics: {
      hotel: { label: 'About the hotel', description: 'Shiro no Yado' },
      banquet: { label: 'Banquet hall', description: '3F · White Hall' },
      rooms: { label: 'Guest rooms', description: 'Rooms 201–205' },
      bath: { label: 'Bathhouse', description: '3F · Shiromiyu' },
      restroom: { label: 'Restrooms', description: '3F · by the elevators' },
    },
    hotelSpeech:
      'Shiro no Yado is a small three-story hotel with white walls and light wood. The lobby is on the 1st floor, five guest rooms on the 2nd, and the banquet hall, bathhouse, and restrooms on the 3rd. Please enjoy your stay.',
    pickRoom: 'Please choose a room from 201 to 205.',
    roomLabels: {
      'room-201': '201 Standard Twin',
      'room-202': '202 Standard Double',
      'room-203': '203 Deluxe Twin',
      'room-204': '204 Corner Twin',
      'room-205': '205 Family Room',
    },
    routeIntro: (name) => `Directions to ${name}.`,
    routeLobbyTo: (dest, floor, side) =>
      `From the 1st-floor lobby, take the elevator to floor ${floor}. When you exit, ${dest} is on your ${side}.`,
    routeSameFloor: (dest, side) => `You are already on the same floor. Head ${side} to reach ${dest}.`,
    routeElevator: (from, to, dest, side) =>
      `You are on floor ${from}. Take the elevator to floor ${to}. When you exit, ${dest} is on your ${side}.`,
    sideLeft: 'left',
    sideRight: 'right',
    sideCenter: 'straight ahead',
  },
  fr: {
    greeting:
      'Bienvenue au Shiro no Yado. Merci de votre visite. Je suis à votre disposition pour vous guider.',
    title: 'Je vous guide',
    copy: 'Choisissez un sujet. Je vous indiquerai le chemin depuis votre position actuelle.',
    speaking: 'En train de guider…',
    waiting: 'À votre service',
    listenAgain: 'Écouter encore',
    stop: 'Arrêter',
    unsupported: 'La synthèse vocale n’est pas prise en charge.',
    topics: {
      hotel: { label: 'L’hôtel', description: 'Shiro no Yado' },
      banquet: { label: 'Salle de banquet', description: '3e · Salle Blanche' },
      rooms: { label: 'Chambres', description: 'Chambres 201–205' },
      bath: { label: 'Bains', description: '3e · Shiromiyu' },
      restroom: { label: 'Toilettes', description: '3e · face aux ascenseurs' },
    },
    hotelSpeech:
      'Shiro no Yado est un petit hôtel de trois étages, aux murs blancs et au bois clair. Le lobby est au 1er étage, cinq chambres au 2e, et la salle de banquet, les bains et les toilettes au 3e. Bon séjour.',
    pickRoom: 'Veuillez choisir une chambre de 201 à 205.',
    roomLabels: {
      'room-201': '201 Twin standard',
      'room-202': '202 Double standard',
      'room-203': '203 Twin deluxe',
      'room-204': '204 Twin d’angle',
      'room-205': '205 Chambre familiale',
    },
    routeIntro: (name) => `Itinéraire vers ${name}.`,
    routeLobbyTo: (dest, floor, side) =>
      `Depuis le lobby au 1er étage, prenez l’ascenseur jusqu’au ${floor}e. En sortant, ${dest} se trouve ${side}.`,
    routeSameFloor: (dest, side) => `Vous êtes déjà au même étage. Allez ${side} pour ${dest}.`,
    routeElevator: (from, to, dest, side) =>
      `Vous êtes au ${from}e étage. Prenez l’ascenseur jusqu’au ${to}e. En sortant, ${dest} se trouve ${side}.`,
    sideLeft: 'à gauche',
    sideRight: 'à droite',
    sideCenter: 'en face',
  },
  es: {
    greeting:
      'Bienvenido a Shiro no Yado. Gracias por su visita. Puedo guiarle por el hotel.',
    title: 'Le guiaré',
    copy: 'Elija un tema. Le indicaré cómo llegar desde su ubicación actual.',
    speaking: 'Guiando…',
    waiting: 'Lista para ayudar',
    listenAgain: 'Escuchar de nuevo',
    stop: 'Detener',
    unsupported: 'Este navegador no admite voz.',
    topics: {
      hotel: { label: 'Sobre el hotel', description: 'Shiro no Yado' },
      banquet: { label: 'Salón de banquetes', description: '3F · Sala Blanca' },
      rooms: { label: 'Habitaciones', description: 'Hab. 201–205' },
      bath: { label: 'Baños', description: '3F · Shiromiyu' },
      restroom: { label: 'Aseos', description: '3F · frente al ascensor' },
    },
    hotelSpeech:
      'Shiro no Yado es un pequeño hotel de tres plantas, con paredes blancas y madera clara. El lobby está en la 1.ª planta, cinco habitaciones en la 2.ª, y el salón, los baños y los aseos en la 3.ª. Que disfrute su estancia.',
    pickRoom: 'Elija una habitación del 201 al 205.',
    roomLabels: {
      'room-201': '201 Twin estándar',
      'room-202': '202 Doble estándar',
      'room-203': '203 Twin deluxe',
      'room-204': '204 Twin de esquina',
      'room-205': '205 Familiar',
    },
    routeIntro: (name) => `Cómo llegar a ${name}.`,
    routeLobbyTo: (dest, floor, side) =>
      `Desde el lobby de la 1.ª planta, tome el ascensor hasta la planta ${floor}. Al salir, ${dest} queda a su ${side}.`,
    routeSameFloor: (dest, side) => `Ya está en la misma planta. Vaya hacia ${side} para ${dest}.`,
    routeElevator: (from, to, dest, side) =>
      `Está en la planta ${from}. Tome el ascensor a la planta ${to}. Al salir, ${dest} queda a su ${side}.`,
    sideLeft: 'izquierda',
    sideRight: 'derecha',
    sideCenter: 'frente',
  },
  zh: {
    greeting: '欢迎光临白之宿。感谢您的到来。馆内导览请随时吩咐我。',
    title: '由我为您案内',
    copy: '请选择需要了解的项目。我会用语音说明从当前位置的走法。',
    speaking: '案内中…',
    waiting: '随时为您服务',
    listenAgain: '再听一次',
    stop: '停止',
    unsupported: '此浏览器不支持语音播放。',
    topics: {
      hotel: { label: '酒店介绍', description: '关于白之宿' },
      banquet: { label: '宴会厅', description: '3楼·白之间' },
      rooms: { label: '客房', description: '201–205号房' },
      bath: { label: '浴场', description: '3楼·白水' },
      restroom: { label: '卫生间', description: '3楼·电梯正面' },
    },
    hotelSpeech:
      '白之宿是一家以白色与浅木色为主的三层小酒店。一楼为前台与大堂，二楼有五间客房，三楼有宴会厅、浴场与卫生间。请慢用。',
    pickRoom: '请从201至205号房中选择要案内的客房。',
    roomLabels: {
      'room-201': '201 标准双床房',
      'room-202': '202 标准大床房',
      'room-203': '203 豪华双床房',
      'room-204': '204 转角双床房',
      'room-205': '205 家庭房',
    },
    routeIntro: (name) => `前往${name}的案内。`,
    routeLobbyTo: (dest, floor, side) =>
      `请从一楼大堂乘电梯到${floor}楼。出电梯后，${side}即是${dest}。`,
    routeSameFloor: (dest, side) => `您已在同一楼层。请向${side}前往${dest}。`,
    routeElevator: (from, to, dest, side) =>
      `您现在在${from}楼。请乘电梯到${to}楼。出电梯后，${side}即是${dest}。`,
    sideLeft: '左侧',
    sideRight: '右侧',
    sideCenter: '正前方',
  },
  ko: {
    greeting: '시로노야도에 오신 것을 환영합니다. 관내 안내는 저에게 말씀해 주세요.',
    title: '제가 안내해 드리겠습니다',
    copy: '원하시는 항목을 선택해 주세요. 현재 위치에서 가는 길을 음성으로 안내합니다.',
    speaking: '안내 중…',
    waiting: '기다리고 있습니다',
    listenAgain: '다시 듣기',
    stop: '중지',
    unsupported: '이 브라우저에서는 음성을 지원하지 않습니다.',
    topics: {
      hotel: { label: '호텔 소개', description: '시로노야도' },
      banquet: { label: '연회장', description: '3층 · 하얀 방' },
      rooms: { label: '객실', description: '201–205호' },
      bath: { label: '목욕탕', description: '3층 · 시로미유' },
      restroom: { label: '화장실', description: '3층 · 엘리베이터 앞' },
    },
    hotelSpeech:
      '시로노야도는 흰색과 옅은 나무를 기조로 한 작은 3층 호텔입니다. 1층에 프론트와 로비, 2층에 객실 5실, 3층에 연회장·목욕탕·화장실이 있습니다. 편안하게 머물러 주세요.',
    pickRoom: '안내할 객실을 201호부터 205호 중에서 선택해 주세요.',
    roomLabels: {
      'room-201': '201 스탠다드 트윈',
      'room-202': '202 스탠다드 더블',
      'room-203': '203 디럭스 트윈',
      'room-204': '204 코너 트윈',
      'room-205': '205 패밀리룸',
    },
    routeIntro: (name) => `${name}으로 가는 안내입니다.`,
    routeLobbyTo: (dest, floor, side) =>
      `1층 로비에서 엘리베이터로 ${floor}층에 가 주세요. 내리시면 ${side}에 ${dest}이 있습니다.`,
    routeSameFloor: (dest, side) => `같은 층입니다. ${side}으로 가시면 ${dest}입니다.`,
    routeElevator: (from, to, dest, side) =>
      `지금은 ${from}층입니다. 엘리베이터로 ${to}층에 가 주세요. 내리시면 ${side}에 ${dest}이 있습니다.`,
    sideLeft: '왼쪽',
    sideRight: '오른쪽',
    sideCenter: '정면',
  },
};

const DEST_NAMES: Record<Locale, Record<string, string>> = {
  ja: {
    lobby: 'ロビー',
    banquet: '宴会場',
    bath: '浴場',
    restroom: 'お手洗い',
    'room-201': '201号室',
    'room-202': '202号室',
    'room-203': '203号室',
    'room-204': '204号室',
    'room-205': '205号室',
  },
  en: {
    lobby: 'the lobby',
    banquet: 'the banquet hall',
    bath: 'the bathhouse',
    restroom: 'the restrooms',
    'room-201': 'room 201',
    'room-202': 'room 202',
    'room-203': 'room 203',
    'room-204': 'room 204',
    'room-205': 'room 205',
  },
  fr: {
    lobby: 'le lobby',
    banquet: 'la salle de banquet',
    bath: 'les bains',
    restroom: 'les toilettes',
    'room-201': 'la chambre 201',
    'room-202': 'la chambre 202',
    'room-203': 'la chambre 203',
    'room-204': 'la chambre 204',
    'room-205': 'la chambre 205',
  },
  es: {
    lobby: 'el lobby',
    banquet: 'el salón de banquetes',
    bath: 'los baños',
    restroom: 'los aseos',
    'room-201': 'la habitación 201',
    'room-202': 'la habitación 202',
    'room-203': 'la habitación 203',
    'room-204': 'la habitación 204',
    'room-205': 'la habitación 205',
  },
  zh: {
    lobby: '大堂',
    banquet: '宴会厅',
    bath: '浴场',
    restroom: '卫生间',
    'room-201': '201号房',
    'room-202': '202号房',
    'room-203': '203号房',
    'room-204': '204号房',
    'room-205': '205号房',
  },
  ko: {
    lobby: '로비',
    banquet: '연회장',
    bath: '목욕탕',
    restroom: '화장실',
    'room-201': '201호',
    'room-202': '202호',
    'room-203': '203호',
    'room-204': '204호',
    'room-205': '205호',
  },
};

const DEST_FLOOR: Record<string, number> = {
  lobby: 1,
  banquet: 3,
  bath: 3,
  restroom: 3,
  'room-201': 2,
  'room-202': 2,
  'room-203': 2,
  'room-204': 2,
  'room-205': 2,
};

const DEST_SIDE: Record<string, string> = {
  lobby: 'center',
  banquet: 'right',
  bath: 'left',
  restroom: 'center',
  'room-201': 'left',
  'room-202': 'left',
  'room-203': 'center',
  'room-204': 'right',
  'room-205': 'right',
};

export function getConciergeCopy(locale: Locale) {
  return CONCIERGE[locale] ?? CONCIERGE.ja;
}

export function getConciergeSpeech(
  locale: Locale,
  topic: ConciergeTopic,
  fromFloor: number,
  fromPlaceId: string,
  roomId?: string,
) {
  const c = getConciergeCopy(locale);
  if (topic === 'hotel') return c.hotelSpeech;
  if (topic === 'rooms') {
    if (!roomId) return c.pickRoom;
    return buildRouteSpeech(locale, fromFloor, fromPlaceId, roomId);
  }
  return buildRouteSpeech(locale, fromFloor, fromPlaceId, topic);
}

function buildRouteSpeech(
  locale: Locale,
  fromFloor: number,
  fromPlaceId: string,
  destId: string,
) {
  const c = getConciergeCopy(locale);
  const names = DEST_NAMES[locale] ?? DEST_NAMES.ja;
  const destName = names[destId] ?? destId;
  const toFloor = DEST_FLOOR[destId] ?? 1;
  const side = sideKey(DEST_SIDE[destId] ?? 'center', c);
  const intro = c.routeIntro(destName);

  if (fromPlaceId === 'lobby' || fromFloor === 1) {
    if (toFloor === 1) return `${intro} ${c.routeSameFloor(destName, side)}`;
    return `${intro} ${c.routeLobbyTo(destName, toFloor, side)}`;
  }
  if (fromFloor === toFloor) {
    return `${intro} ${c.routeSameFloor(destName, side)}`;
  }
  return `${intro} ${c.routeElevator(fromFloor, toFloor, destName, side)}`;
}

export const UI: Record<Locale, UiCopy> = {
  ja: {
    homeEyebrow: '小さなホテルの案内',
    homeLead: 'チェックインのあと、宴会場・浴場・お手洗いまで迷わないための案内です。',
    chooseDest: '目的地を選ぶ',
    chooseFloor: 'フロアを選ぶ',
    quickTitle: 'すぐに案内',
    quickSub: 'チェックイン後はこちら',
    toBanquet: '宴会場へ',
    toBath: '浴場へ',
    toRestroom: 'トイレへ',
    toRoom: '自分の部屋へ',
    setRoom: '部屋を設定',
    stayTitle: 'ご滞在の部屋',
    stayUnset: 'まだ設定されていません',
    staySetHint: '案内の起点は1階ロビーです。到着したら現在地を更新できます。',
    stayUnsetHint: '部屋番号を設定すると、お部屋への案内が使えます。',
    changeRoom: '部屋を変更する',
    checkIn: 'チェックインする',
    floors: 'フロア',
    rooms: '客室',
  },
  en: {
    homeEyebrow: 'A small hotel guide',
    homeLead: 'Find the banquet hall, bathhouse, and restrooms after check-in.',
    chooseDest: 'Choose destination',
    chooseFloor: 'Choose floor',
    quickTitle: 'Quick links',
    quickSub: 'After check-in',
    toBanquet: 'Banquet hall',
    toBath: 'Bathhouse',
    toRestroom: 'Restrooms',
    toRoom: 'My room',
    setRoom: 'Set room',
    stayTitle: 'Your room',
    stayUnset: 'Not set yet',
    staySetHint: 'Guidance starts from the 1st-floor lobby. Update your location when you arrive.',
    stayUnsetHint: 'Set your room number to unlock room directions.',
    changeRoom: 'Change room',
    checkIn: 'Check in',
    floors: 'Floors',
    rooms: 'Rooms',
  },
  fr: {
    homeEyebrow: 'Guide du petit hôtel',
    homeLead: 'Trouvez la salle de banquet, les bains et les toilettes après l’enregistrement.',
    chooseDest: 'Choisir la destination',
    chooseFloor: 'Choisir l’étage',
    quickTitle: 'Accès rapide',
    quickSub: 'Après l’enregistrement',
    toBanquet: 'Salle de banquet',
    toBath: 'Bains',
    toRestroom: 'Toilettes',
    toRoom: 'Ma chambre',
    setRoom: 'Définir la chambre',
    stayTitle: 'Votre chambre',
    stayUnset: 'Pas encore définie',
    staySetHint: 'Le point de départ est le lobby du 1er étage. Mettez à jour votre position à l’arrivée.',
    stayUnsetHint: 'Définissez le numéro de chambre pour les itinéraires.',
    changeRoom: 'Changer de chambre',
    checkIn: 'S’enregistrer',
    floors: 'Étages',
    rooms: 'Chambres',
  },
  es: {
    homeEyebrow: 'Guía del pequeño hotel',
    homeLead: 'Encuentre el salón, los baños y los aseos tras el check-in.',
    chooseDest: 'Elegir destino',
    chooseFloor: 'Elegir planta',
    quickTitle: 'Accesos rápidos',
    quickSub: 'Tras el check-in',
    toBanquet: 'Salón de banquetes',
    toBath: 'Baños',
    toRestroom: 'Aseos',
    toRoom: 'Mi habitación',
    setRoom: 'Configurar habitación',
    stayTitle: 'Su habitación',
    stayUnset: 'Aún no configurada',
    staySetHint: 'La guía parte del lobby de la 1.ª planta. Actualice su ubicación al llegar.',
    stayUnsetHint: 'Configure el número de habitación para las indicaciones.',
    changeRoom: 'Cambiar habitación',
    checkIn: 'Check-in',
    floors: 'Plantas',
    rooms: 'Habitaciones',
  },
  zh: {
    homeEyebrow: '小型酒店案内',
    homeLead: '入住后前往宴会厅、浴场与卫生间的指引。',
    chooseDest: '选择目的地',
    chooseFloor: '选择楼层',
    quickTitle: '快捷案内',
    quickSub: '入住后请点这里',
    toBanquet: '宴会厅',
    toBath: '浴场',
    toRestroom: '卫生间',
    toRoom: '我的房间',
    setRoom: '设置房间',
    stayTitle: '入住房间',
    stayUnset: '尚未设置',
    staySetHint: '案内起点为一楼大堂。到达后可更新当前位置。',
    stayUnsetHint: '设置房号后即可使用客房案内。',
    changeRoom: '更改房间',
    checkIn: '办理入住',
    floors: '楼层',
    rooms: '客房',
  },
  ko: {
    homeEyebrow: '작은 호텔 안내',
    homeLead: '체크인 후 연회장·목욕탕·화장실까지 헤매지 않도록 안내합니다.',
    chooseDest: '목적지 선택',
    chooseFloor: '층 선택',
    quickTitle: '바로 안내',
    quickSub: '체크인 후',
    toBanquet: '연회장',
    toBath: '목욕탕',
    toRestroom: '화장실',
    toRoom: '내 객실',
    setRoom: '객실 설정',
    stayTitle: '투숙 객실',
    stayUnset: '아직 설정되지 않음',
    staySetHint: '안내 출발점은 1층 로비입니다. 도착하면 현재 위치를 갱신할 수 있습니다.',
    stayUnsetHint: '객실 번호를 설정하면 객실 안내를 이용할 수 있습니다.',
    changeRoom: '객실 변경',
    checkIn: '체크인',
    floors: '층',
    rooms: '객실',
  },
};

export function getUi(locale: Locale) {
  return UI[locale] ?? UI.ja;
}
