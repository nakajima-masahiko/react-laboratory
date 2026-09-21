import type { Locale } from './i18n';
import { UI as BASE_UI } from './i18n';

type ExtraUi = {
  floorsTitle: string;
  floorsLead: string;
  layout: string;
  spaces: string;
  facilities: string;
  size: string;
  capacity: string;
  hours: string;
  location: string;
  directionsHere: string;
  setHere: string;
  alreadyHere: string;
  guideEyebrow: string;
  destSceneHint: string;
  sameFloorMove: string;
  arrived: string;
  updateHereOnArrive: string;
  seeDetails: string;
  guideUnavailable: string;
  checkinTitle: string;
  checkinLead: string;
  startGuide: string;
  clearRoom: string;
  destTitle: string;
  destLead: string;
  facilities3f: string;
  rooms2f: string;
  lobbyReturn: string;
  lobbyReturnSub: string;
  dragHint: string;
  loadingScene: string;
  sceneFailed: string;
  retryScene: string;
  hotelName: string;
  guideTo: (name: string) => string;
  fromOrigin: (floor: number, name: string, minutes: string) => string;
  floorPosition: (floor: number) => string;
  nowOnFloor: (from: number, to: number) => string;
};

const EXTRA: Record<Locale, ExtraUi> = {
  ja: {
    floorsTitle: "フロアを選ぶ",
    floorsLead: "白い俯瞰で、いまいる階の雰囲気を確かめられます。",
    layout: "配置",
    spaces: "スペース",
    facilities: "施設",
    size: "広さ",
    capacity: "定員",
    hours: "時間",
    location: "位置",
    directionsHere: "ここへの行き方",
    setHere: "ここを現在地にする",
    alreadyHere: "現在地に設定済み",
    guideEyebrow: "ご案内",
    destSceneHint: "行き先の雰囲気",
    sameFloorMove: "同じ階の移動です。",
    arrived: "到着しています",
    updateHereOnArrive: "到着したので現在地を更新",
    seeDetails: "空間の詳細を見る",
    guideUnavailable: "案内を準備できませんでした。",
    checkinTitle: "ご滞在の部屋",
    checkinLead: "部屋を設定すると、案内の起点が1階ロビーになり、お部屋への行き方が使えます。",
    startGuide: "案内を始める",
    clearRoom: "設定を解除",
    destTitle: "目的地を選ぶ",
    destLead: "行きたい場所を選ぶと、いまの位置からの行き方をご案内します。",
    facilities3f: "共用施設 · 3階",
    rooms2f: "客室 · 2階",
    lobbyReturn: "フロント・ロビー",
    lobbyReturnSub: "1階 · チェックインの場所へ戻る",
    dragHint: "ドラッグで回転・ピンチで拡大",
    loadingScene: "空間を読み込み中",
    sceneFailed: "3Dを表示できません",
    retryScene: "3D表示を再試行",
    hotelName: "白の宿",
    guideTo: (name) => `${name}へ`,
    fromOrigin: (floor, name, minutes) => `${floor}F ${name}から · ${minutes}`,
    floorPosition: (floor) => `${floor}階の位置`,
    nowOnFloor: (from, to) => `いまは${from}階です。エレベーターで${to}階へ。`,
  },
  en: {
    floorsTitle: "Choose a floor",
    floorsLead: "See the feel of each floor in a soft overview.",
    layout: "Layout",
    spaces: "Spaces",
    facilities: "Facilities",
    size: "Size",
    capacity: "Capacity",
    hours: "Hours",
    location: "Location",
    directionsHere: "Directions here",
    setHere: "Set as current location",
    alreadyHere: "Already set as here",
    guideEyebrow: "Directions",
    destSceneHint: "Atmosphere of your destination",
    sameFloorMove: "You are already on the same floor.",
    arrived: "You have arrived",
    updateHereOnArrive: "I have arrived — update location",
    seeDetails: "See space details",
    guideUnavailable: "Could not prepare directions.",
    checkinTitle: "Your room",
    checkinLead: "Setting a room makes the 1st-floor lobby your start point and unlocks room directions.",
    startGuide: "Start guiding",
    clearRoom: "Clear room",
    destTitle: "Choose a destination",
    destLead: "Pick where you want to go for directions from your current location.",
    facilities3f: "Shared facilities · 3F",
    rooms2f: "Guest rooms · 2F",
    lobbyReturn: "Front desk & lobby",
    lobbyReturnSub: "1F · Return to check-in",
    dragHint: "Drag to rotate · pinch to zoom",
    loadingScene: "Loading space…",
    sceneFailed: "Unable to show 3D",
    retryScene: "Retry 3D",
    hotelName: "Shiro no Yado",
    guideTo: (name) => `To ${name}`,
    fromOrigin: (floor, name, minutes) => `From ${floor}F ${name} · ${minutes}`,
    floorPosition: (floor) => `Position on floor ${floor}`,
    nowOnFloor: (from, to) => `You are on floor ${from}. Take the elevator to floor ${to}.`,
  },
  fr: {
    floorsTitle: "Choisir l’étage",
    floorsLead: "Aperçu doux de l’ambiance de chaque étage.",
    layout: "Plan",
    spaces: "Espaces",
    facilities: "Installations",
    size: "Surface",
    capacity: "Capacité",
    hours: "Horaires",
    location: "Emplacement",
    directionsHere: "Itinéraire jusqu’ici",
    setHere: "Définir comme position actuelle",
    alreadyHere: "Déjà défini ici",
    guideEyebrow: "Itinéraire",
    destSceneHint: "Ambiance de la destination",
    sameFloorMove: "Vous êtes déjà au même étage.",
    arrived: "Vous êtes arrivé",
    updateHereOnArrive: "Arrivé — mettre à jour la position",
    seeDetails: "Voir les détails",
    guideUnavailable: "Impossible de préparer l’itinéraire.",
    checkinTitle: "Votre chambre",
    checkinLead: "Définir une chambre fixe le lobby du 1er comme point de départ et active les itinéraires chambre.",
    startGuide: "Commencer le guide",
    clearRoom: "Effacer la chambre",
    destTitle: "Choisir une destination",
    destLead: "Choisissez où aller pour un itinéraire depuis votre position.",
    facilities3f: "Espaces partagés · 3e",
    rooms2f: "Chambres · 2e",
    lobbyReturn: "Réception & lobby",
    lobbyReturnSub: "1er · Retour à l’enregistrement",
    dragHint: "Glisser pour tourner · pincer pour zoomer",
    loadingScene: "Chargement de l’espace…",
    sceneFailed: "3D indisponible",
    retryScene: "Réessayer la 3D",
    hotelName: "Shiro no Yado",
    guideTo: (name) => `Vers ${name}`,
    fromOrigin: (floor, name, minutes) => `Depuis ${floor}e ${name} · ${minutes}`,
    floorPosition: (floor) => `Position au ${floor}e étage`,
    nowOnFloor: (from, to) => `Vous êtes au ${from}e. Prenez l’ascenseur jusqu’au ${to}e.`,
  },
  es: {
    floorsTitle: "Elegir planta",
    floorsLead: "Vea el ambiente de cada planta en un resumen suave.",
    layout: "Plano",
    spaces: "Espacios",
    facilities: "Instalaciones",
    size: "Tamaño",
    capacity: "Capacidad",
    hours: "Horario",
    location: "Ubicación",
    directionsHere: "Cómo llegar aquí",
    setHere: "Fijar como ubicación actual",
    alreadyHere: "Ya está aquí",
    guideEyebrow: "Indicaciones",
    destSceneHint: "Ambiente del destino",
    sameFloorMove: "Ya está en la misma planta.",
    arrived: "Ha llegado",
    updateHereOnArrive: "He llegado — actualizar ubicación",
    seeDetails: "Ver detalles del espacio",
    guideUnavailable: "No se pudieron preparar las indicaciones.",
    checkinTitle: "Su habitación",
    checkinLead: "Al configurar la habitación, el lobby de la 1.ª planta será el punto de partida.",
    startGuide: "Empezar la guía",
    clearRoom: "Quitar habitación",
    destTitle: "Elegir destino",
    destLead: "Elija a dónde ir para recibir indicaciones desde su ubicación.",
    facilities3f: "Instalaciones · 3.ª",
    rooms2f: "Habitaciones · 2.ª",
    lobbyReturn: "Recepción y lobby",
    lobbyReturnSub: "1.ª · Volver al check-in",
    dragHint: "Arrastre para girar · pellizque para ampliar",
    loadingScene: "Cargando el espacio…",
    sceneFailed: "No se puede mostrar 3D",
    retryScene: "Reintentar 3D",
    hotelName: "Shiro no Yado",
    guideTo: (name) => `Hacia ${name}`,
    fromOrigin: (floor, name, minutes) => `Desde ${floor}ª ${name} · ${minutes}`,
    floorPosition: (floor) => `Posición en planta ${floor}`,
    nowOnFloor: (from, to) => `Está en la planta ${from}. Tome el ascensor a la ${to}.`,
  },
  zh: {
    floorsTitle: "选择楼层",
    floorsLead: "以柔和俯瞰确认各层氛围。",
    layout: "布局",
    spaces: "空间",
    facilities: "设施",
    size: "面积",
    capacity: "定员",
    hours: "时间",
    location: "位置",
    directionsHere: "前往此处",
    setHere: "设为当前位置",
    alreadyHere: "已设为当前位置",
    guideEyebrow: "案内",
    destSceneHint: "目的地氛围",
    sameFloorMove: "同一楼层内移动。",
    arrived: "已到达",
    updateHereOnArrive: "已到达，更新当前位置",
    seeDetails: "查看空间详情",
    guideUnavailable: "无法准备案内。",
    checkinTitle: "入住房间",
    checkinLead: "设置房间后，案内起点为一楼大堂，并可使用客房路线。",
    startGuide: "开始案内",
    clearRoom: "清除设置",
    destTitle: "选择目的地",
    destLead: "选择想去的地方，将从当前位置为您案内。",
    facilities3f: "共用设施 · 3楼",
    rooms2f: "客房 · 2楼",
    lobbyReturn: "前台与大堂",
    lobbyReturnSub: "1楼 · 返回入住处",
    dragHint: "拖动旋转 · 双指缩放",
    loadingScene: "正在加载空间…",
    sceneFailed: "无法显示 3D",
    retryScene: "重试3D",
    hotelName: "白之宿",
    guideTo: (name) => `前往${name}`,
    fromOrigin: (floor, name, minutes) => `从${floor}楼 ${name} · ${minutes}`,
    floorPosition: (floor) => `${floor}楼位置`,
    nowOnFloor: (from, to) => `您现在在${from}楼。请乘电梯到${to}楼。`,
  },
  ko: {
    floorsTitle: "층 선택",
    floorsLead: "부드러운 조감으로 각 층의 분위기를 확인하세요.",
    layout: "배치",
    spaces: "공간",
    facilities: "시설",
    size: "넓이",
    capacity: "정원",
    hours: "시간",
    location: "위치",
    directionsHere: "여기로 가는 길",
    setHere: "현재 위치로 설정",
    alreadyHere: "이미 현재 위치",
    guideEyebrow: "안내",
    destSceneHint: "목적지 분위기",
    sameFloorMove: "같은 층 이동입니다.",
    arrived: "도착했습니다",
    updateHereOnArrive: "도착했으니 현재 위치 갱신",
    seeDetails: "공간 상세 보기",
    guideUnavailable: "안내를 준비할 수 없습니다.",
    checkinTitle: "투숙 객실",
    checkinLead: "객실을 설정하면 안내 출발점이 1층 로비가 되고 객실 안내를 쓸 수 있습니다.",
    startGuide: "안내 시작",
    clearRoom: "설정 해제",
    destTitle: "목적지 선택",
    destLead: "가고 싶은 곳을 고르면 현재 위치에서 가는 길을 안내합니다.",
    facilities3f: "공용 시설 · 3층",
    rooms2f: "객실 · 2층",
    lobbyReturn: "프론트·로비",
    lobbyReturnSub: "1층 · 체크인 장소로",
    dragHint: "드래그로 회전 · 핀치로 확대",
    loadingScene: "공간 불러오는 중…",
    sceneFailed: "3D를 표시할 수 없습니다",
    retryScene: "3D 다시 시도",
    hotelName: "시로노야도",
    guideTo: (name) => `${name}(으)로`,
    fromOrigin: (floor, name, minutes) => `${floor}층 ${name}에서 · ${minutes}`,
    floorPosition: (floor) => `${floor}층 위치`,
    nowOnFloor: (from, to) => `지금은 ${from}층입니다. 엘리베이터로 ${to}층에 가 주세요.`,
  },
};

export function getUi(locale: Locale) {
  const base = BASE_UI[locale] ?? BASE_UI.ja;
  const extra = EXTRA[locale] ?? EXTRA.ja;
  return { ...base, ...extra };
}
