import type { Locale } from './i18n';
import type { Place } from './hotel-data';

// Directions are relative to facing the corridor from the elevator, as in the floor plans.
const COPY = {
  ja: { left: '左手', center: '正面', right: '右手', to: '入口を出て、エレベーターホールへ戻ります。', walk: (side: string, name: string) => `エレベーターホールから${side}の「${name}」へ進みます。扉の表示をご確認ください。` },
  en: { left: 'on the left', center: 'straight ahead', right: 'on the right', to: 'Leave through the entrance and return to the elevator hall.', walk: (side: string, name: string) => `From the elevator hall, head to ${name}, ${side}. Check the sign on the door.` },
  fr: { left: 'à gauche', center: 'tout droit', right: 'à droite', to: 'Sortez et rejoignez le hall des ascenseurs.', walk: (side: string, name: string) => `Depuis le hall des ascenseurs, allez ${side} vers ${name}. Vérifiez la plaque sur la porte.` },
  es: { left: 'a la izquierda', center: 'recto', right: 'a la derecha', to: 'Salga y vuelva al vestíbulo de los ascensores.', walk: (side: string, name: string) => `Desde los ascensores, vaya ${side} hacia ${name}. Compruebe el letrero de la puerta.` },
  zh: { left: '左侧', center: '正前方', right: '右侧', to: '离开入口，返回电梯厅。', walk: (side: string, name: string) => `从电梯厅前往${side}的“${name}”，请确认门上的标识。` },
  ko: { left: '왼쪽', center: '정면', right: '오른쪽', to: '입구로 나와 엘리베이터 홀로 돌아갑니다.', walk: (side: string, name: string) => `엘리베이터 홀에서 ${side}의 ${name}(으)로 이동하세요. 문에 표시된 이름을 확인하세요.` },
};

export function getRouteText(locale: Locale, place: Pick<Place, 'name' | 'mapSide'>) {
  const copy = COPY[locale];
  return { fromElevator: copy.walk(copy[place.mapSide], place.name), toElevator: copy.to };
}
