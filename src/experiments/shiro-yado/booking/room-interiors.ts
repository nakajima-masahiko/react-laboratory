import type { Locale } from '../i18n';
import { localizePlace } from '../place-i18n';
import type { BookableRoomId } from './model';
import { INTERIOR } from './interior-copy';

const LEADS: Record<Exclude<BookableRoomId, 'room-204'>, Record<Locale, string>> = {
  'room-201': {
    ja: '庭の緑を感じる窓と、白いツインベッド。淡い木のデスクで旅の手帳を開いたら、ふたりそれぞれのペースで、穏やかなひと休みを。',
    en: 'Garden greenery, white twin beds and a pale oak desk for your travel journal. A gentle pause, each at your own pace.',
    fr: 'La verdure du jardin, deux lits blancs et un bureau en chêne clair pour votre carnet de voyage. Une pause paisible, chacun à son rythme.',
    es: 'Verde de jardín, dos camas blancas y un escritorio de roble claro para tu diario de viaje. Un descanso tranquilo, cada uno a su ritmo.',
    zh: '窗外庭园绿意、白色双床与浅木书桌。翻开旅行手帐，两个人各按自己的节奏，享受安静的休息。',
    ko: '정원의 초록빛, 하얀 트윈 침대와 밝은 나무 책상. 여행 수첩을 펼치고 각자의 속도로 편안히 쉬어 보세요.',
  },
  'room-202': {
    ja: '柔らかな光に包まれる白いダブルベッド。丸みのあるヘッドボードと窓辺のお茶が、ふたりで過ごす静かな時間を温かく彩ります。',
    en: 'A white double bed in soft light. A gently curved headboard and tea by the window make quiet time together feel warm and intimate.',
    fr: 'Un lit double blanc baigné de lumière douce. Une tête de lit arrondie et un thé près de la fenêtre pour savourer un moment intime à deux.',
    es: 'Una cama doble blanca bañada en luz suave. Un cabecero curvo y té junto a la ventana para disfrutar de un momento íntimo en pareja.',
    zh: '柔光中的白色双人床，圆润的床头与窗边的茶，为两个人的安静时光增添温暖。',
    ko: '부드러운 빛에 감싸인 하얀 더블 침대. 둥근 헤드보드와 창가의 차가 둘만의 조용한 시간을 따뜻하게 채웁니다.',
  },
  'room-203': {
    ja: '白いツインベッドに、窓辺のソファと広いデスク。読書にも、旅先でのひと仕事にも。休む時間と考える時間を、心地よく行き来できるお部屋です。',
    en: 'White twin beds, a sofa by the window and a generous desk. Read, write or finish a little work, with room to move comfortably between focus and rest.',
    fr: 'Deux lits blancs, un canapé près de la fenêtre et un grand bureau. Lire, écrire ou travailler un peu, puis retrouver le plaisir du repos.',
    es: 'Dos camas blancas, un sofá junto a la ventana y un escritorio amplio. Lee, escribe o trabaja un rato y vuelve a descansar con comodidad.',
    zh: '白色双床、窗边沙发与宽敞书桌。无论读书还是旅途中处理工作，都能在专注与休息之间自在切换。',
    ko: '하얀 트윈 침대, 창가 소파와 넓은 책상. 독서와 간단한 업무를 즐기고, 생각하는 시간과 쉬는 시간을 편안하게 오가세요.',
  },
  'room-205': {
    ja: '白いツインベッドと、昼はくつろげるソファベッド。丸いテーブルを家族で囲み、お茶を飲んだり、旅の思い出を話したり。みんなで過ごす時間が主役のお部屋です。',
    en: 'White twin beds, a convertible sofa for daytime lounging and a round family table. Share tea, stories and the small joys of your trip together.',
    fr: 'Deux lits blancs, un canapé convertible pour se détendre et une table ronde familiale. Partagez un thé, vos récits et les petits bonheurs du voyage.',
    es: 'Dos camas blancas, un sofá cama para relajarse y una mesa redonda familiar. Compartid té, historias y los pequeños placeres del viaje.',
    zh: '白色双床、白天可休憩的沙发床与家庭圆桌。围坐品茶、聊聊旅途回忆，让相聚成为客房里的主角。',
    ko: '하얀 트윈 침대, 낮에는 편안히 앉는 소파베드와 가족용 원탁. 차를 마시며 여행 이야기를 나누는 시간이 중심이 되는 객실입니다.',
  },
};
const CAPTION: Record<Locale, string> = {
  ja: '客室デザイン案（AI生成・イメージ）', en: 'AI-generated interior design concept', fr: 'Projet d’intérieur généré par IA', es: 'Concepto de interior generado por IA', zh: 'AI生成的客房设计示意', ko: 'AI로 생성한 인테리어 디자인 이미지',
};
export function getRoomInterior(locale: Locale, roomId: BookableRoomId) {
  if (roomId === 'room-204') return { src: 'room-204-morning.webp', ...INTERIOR[locale] };
  const name = localizePlace(locale, roomId).name;
  const lead = LEADS[roomId][locale];
  return { src: `${roomId}-interior.webp`, lead, alt: `${name} — ${lead}`, caption: `${name}｜${CAPTION[locale]}` };
}
