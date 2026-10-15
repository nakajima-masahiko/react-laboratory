import type { Locale } from '../i18n';

type InteriorCopy = { alt: string; caption: string; lead: string };
export const INTERIOR: Record<Locale, InteriorCopy> = {
  ja: { alt: '朝の光が入る二面窓、白いツインベッドと淡い木の家具、窓辺の椅子とお茶のある204号室のデザイン案', caption: '204 コーナーツイン｜客室デザイン案（AI生成・イメージ）', lead: '白いリネンに、淡いオークの温もり。二面窓から差し込む朝の光を感じながら、窓辺でお茶と読書を。予定を詰め込まず、ゆっくり過ごしたくなる一室です。' },
  en: { alt: 'Room 204 design concept: sunlit corner windows, white twin beds, pale oak furniture and a window-side chair with tea', caption: '204 Corner Twin · AI-generated interior design concept', lead: 'White linens and the warmth of pale oak. Enjoy morning light through corner windows, tea and a book by the window. A room for taking your time.' },
  fr: { alt: 'Projet de chambre 204 : fenêtres d’angle ensoleillées, lits jumeaux blancs, chêne clair et fauteuil près de la fenêtre avec du thé', caption: '204 Twin d’angle · Projet d’intérieur généré par IA', lead: 'Du linge blanc et la chaleur du chêne clair. La lumière matinale entre par les fenêtres d’angle ; un thé et un livre vous attendent près de la fenêtre. Prenez votre temps.' },
  es: { alt: 'Concepto de habitación 204: ventanales de esquina, dos camas blancas, roble claro y un sillón junto a la ventana con té', caption: '204 Twin de esquina · Concepto de interior generado por IA', lead: 'Ropa de cama blanca y la calidez del roble claro. Luz de mañana, un té y un libro junto a los ventanales de esquina. Una habitación para disfrutar sin prisas.' },
  zh: { alt: '204号客房设计：晨光中的转角双面窗、白色双床、浅橡木家具和窗边配有茶具的座椅', caption: '204 转角双床房｜AI生成的客房设计示意', lead: '白色床品与浅橡木的温暖相融。晨光透过双面窗洒入，在窗边品茶、读书，不必排满行程，慢慢享受休息时光。' },
  ko: { alt: '204호 객실 디자인: 아침 햇살이 들어오는 모서리 창, 흰 트윈 침대, 밝은 오크 가구와 차가 놓인 창가 의자', caption: '204 코너 트윈 · AI로 생성한 인테리어 디자인 이미지', lead: '하얀 침구와 밝은 오크의 온기. 두 면의 창으로 드는 아침 햇살을 느끼며 창가에서 차와 독서를 즐겨 보세요. 서두르지 않고 머물고 싶은 객실입니다.' },
};
