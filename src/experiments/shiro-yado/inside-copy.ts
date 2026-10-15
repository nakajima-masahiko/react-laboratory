import type { Locale } from './i18n';

type InsideCopy = {
  steps: string; listen: string; stop: string; muted: string; unsupported: string; speechError: string;
  preview: string; imageMode: string; mapMode: string;
  bathLead: string; bathFeatures: string; mural: string; cypress: string; washing: string;
  muralBody: string; cypressBody: string; washingBody: string; bathScene: string;
  beforeBath: string; beforeBathBody: string;
};
export const INSIDE: Record<Locale, InsideCopy> = {
  ja: {
    steps: 'こちらの順にお進みください', listen: 'この行き方を音声で聞く', stop: '音声を止める', muted: '音声はオフです。上部の音声ボタンからオンにできます。', unsupported: '画面の手順に沿ってお進みください。このブラウザでは音声案内をご利用いただけません。', speechError: '音声を再生できませんでした。もう一度お試しいただくか、画面の手順をご覧ください。',
    preview: '到着する場所を3Dで見る', imageMode: '浴場の壁画をご覧いただけます', mapMode: '館内図で場所をご確認いただけます',
    bathLead: '富士山を眺めて、ひと息。白御影石と檜に囲まれた、しろみゆの湯時間をどうぞ。', bathFeatures: 'しろみゆの楽しみ', mural: '富士山と松の壁画', cypress: '白御影石と檜の内湯', washing: '洗い場と休憩ベンチ',
    muralBody: '朝焼けの富士山と黒松を描いた壁画を、湯船からゆっくり眺められます。', cypressBody: '白い石と檜の縁、やわらかな灯りに包まれた内湯です。', washingBody: '個別の洗い場と、湯上がりにひと休みできるベンチを備えています。', bathScene: '浴場の中を3Dで見る',
    beforeBath: 'ご利用の前に', beforeBathBody: 'タオルのご用意や利用上のご不明点は、1階フロントでお尋ねください。',
  },
  en: {
    steps: 'Follow these steps', listen: 'Hear these directions', stop: 'Stop audio', muted: 'Audio is off. Turn it on using the sound button above.', unsupported: 'Please follow the steps on screen. Voice guidance is unavailable in this browser.', speechError: 'Audio could not play. Try again or follow the steps on screen.',
    preview: 'Preview your destination in 3D', imageMode: 'Enjoy the bathhouse mural', mapMode: 'Find your destination on the floor plan',
    bathLead: 'Take a breath beneath Mount Fuji. Enjoy a quiet soak surrounded by white granite and hinoki cypress.', bathFeatures: 'Enjoy Shiromiyu', mural: 'Mount Fuji and pine mural', cypress: 'White granite and hinoki bath', washing: 'Washing areas and rest benches',
    muralBody: 'Gaze at Mount Fuji at dawn and black pines from the bath.', cypressBody: 'An indoor bath of white stone, a hinoki rim and gentle lighting.', washingBody: 'Individual washing areas and benches for a restful pause after your bath.', bathScene: 'Explore the bathhouse in 3D',
    beforeBath: 'Before your visit', beforeBathBody: 'Ask the 1F front desk about towels and any questions about using the bath.',
  },
  fr: {
    steps: 'Suivez ces étapes', listen: 'Écouter cet itinéraire', stop: 'Arrêter la voix', muted: 'Le son est coupé. Activez-le avec le bouton en haut.', unsupported: 'Suivez les étapes affichées. La voix est indisponible dans ce navigateur.', speechError: 'La lecture a échoué. Réessayez ou suivez les étapes affichées.',
    preview: 'Voir la destination en 3D', imageMode: 'Découvrez la fresque des bains', mapMode: 'Repérez la destination sur le plan',
    bathLead: 'Une pause face au mont Fuji, dans un bain de granit blanc et de cyprès hinoki.', bathFeatures: 'Profiter de Shiromiyu', mural: 'Le mont Fuji et les pins', cypress: 'Granit blanc et cyprès hinoki', washing: 'Douches et bancs de repos',
    muralBody: 'Contemplez la fresque du mont Fuji à l’aube et des pins noirs depuis le bain.', cypressBody: 'Un bain intérieur aux pierres blanches, bordé de cyprès et éclairé en douceur.', washingBody: 'Des espaces de lavage individuels et des bancs pour se reposer après le bain.', bathScene: 'Explorer les bains en 3D',
    beforeBath: 'Avant votre visite', beforeBathBody: 'Renseignez-vous à la réception du 1er étage pour les serviettes et l’utilisation des bains.',
  },
  es: {
    steps: 'Siga estos pasos', listen: 'Escuchar estas indicaciones', stop: 'Detener el audio', muted: 'El audio está desactivado. Actívelo con el botón superior.', unsupported: 'Siga los pasos de la pantalla. Este navegador no ofrece guía de voz.', speechError: 'No se pudo reproducir el audio. Reinténtelo o siga los pasos de la pantalla.',
    preview: 'Ver el destino en 3D', imageMode: 'Disfrute del mural de los baños', mapMode: 'Encuentre el destino en el plano',
    bathLead: 'Una pausa frente al monte Fuji, entre granito blanco y ciprés hinoki.', bathFeatures: 'Disfrutar de Shiromiyu', mural: 'El monte Fuji y los pinos', cypress: 'Granito blanco y ciprés hinoki', washing: 'Duchas y bancos de descanso',
    muralBody: 'Contemple el monte Fuji al amanecer y los pinos negros desde el baño.', cypressBody: 'Un baño interior de piedra blanca, borde de ciprés e iluminación suave.', washingBody: 'Zonas de lavado individuales y bancos para descansar después del baño.', bathScene: 'Explorar los baños en 3D',
    beforeBath: 'Antes de su visita', beforeBathBody: 'Consulte en recepción, en la primera planta, sobre las toallas y el uso de los baños.',
  },
  zh: {
    steps: '请按以下步骤前往', listen: '收听这条路线', stop: '停止语音', muted: '语音已关闭，可通过上方声音按钮开启。', unsupported: '请按屏幕上的步骤前往，此浏览器不支持语音导航。', speechError: '语音无法播放，请重试或查看屏幕上的步骤。',
    preview: '用3D查看目的地', imageMode: '欣赏浴场壁画', mapMode: '请在楼层图上确认位置',
    bathLead: '眺望富士山，歇一歇。在白色花岗岩与桧木环绕的白御汤，享受悠闲泡汤时光。', bathFeatures: '白御汤的魅力', mural: '富士山与松树壁画', cypress: '白色花岗岩与桧木内汤', washing: '洗浴区与休息长椅',
    muralBody: '在浴池中悠闲欣赏描绘朝霞中的富士山与黑松的壁画。', cypressBody: '白色石材、桧木池边与柔和灯光营造舒适的内汤。', washingBody: '设有独立洗浴区与泡汤后可休息的长椅。', bathScene: '用3D参观浴场',
    beforeBath: '使用前须知', beforeBathBody: '有关毛巾准备及浴场使用的问题，请咨询一楼前台。',
  },
  ko: {
    steps: '다음 순서로 이동하세요', listen: '이 길 안내 듣기', stop: '음성 멈추기', muted: '음성이 꺼져 있습니다. 위쪽 소리 버튼으로 켤 수 있습니다.', unsupported: '화면의 순서대로 이동하세요. 이 브라우저에서는 음성 안내를 이용할 수 없습니다.', speechError: '음성을 재생하지 못했습니다. 다시 시도하거나 화면의 안내를 확인하세요.',
    preview: '도착 장소를 3D로 보기', imageMode: '목욕탕의 벽화를 감상하세요', mapMode: '층별 안내도에서 위치를 확인하세요',
    bathLead: '후지산을 바라보며 잠시 쉬어 가세요. 백색 화강암과 편백에 둘러싸인 시로미유의 따뜻한 시간입니다.', bathFeatures: '시로미유의 즐거움', mural: '후지산과 소나무 벽화', cypress: '백색 화강암과 편백의 실내탕', washing: '세정 공간과 휴식 벤치',
    muralBody: '탕에서 아침노을의 후지산과 소나무를 그린 벽화를 감상할 수 있습니다.', cypressBody: '하얀 돌과 편백 테두리, 부드러운 조명의 실내탕입니다.', washingBody: '개별 세정 공간과 목욕 후 쉬어 갈 수 있는 벤치가 있습니다.', bathScene: '목욕탕 내부를 3D로 보기',
    beforeBath: '이용 전에', beforeBathBody: '수건 준비와 이용에 관한 궁금한 점은 1층 프런트에 문의하세요.',
  },
};
