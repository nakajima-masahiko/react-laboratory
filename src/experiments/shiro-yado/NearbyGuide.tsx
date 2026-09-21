import { useMemo, useState } from 'react';
import type { Locale } from './i18n';
import { useHotelStore } from './store';

type Category = 'all' | 'restaurant' | 'izakaya' | 'convenience';

type Place = {
  id: string;
  category: Exclude<Category, 'all'>;
  name: Record<Locale, string>;
  note: Record<Locale, string>;
  walk: number;
  hours: string;
  x: number;
  y: number;
};

const COPY: Record<Locale, {
  eyebrow: string;
  title: string;
  lead: string;
  filters: Record<Category, string>;
  walk: string;
  hours: string;
  mapLabel: string;
  hotel: string;
  selected: string;
}> = {
  ja: { eyebrow: 'AROUND THE HOTEL', title: '白の宿 周辺マップ', lead: '徒歩で立ち寄れる食事処・居酒屋・コンビニをご案内します。', filters: { all: 'すべて', restaurant: '食事処', izakaya: '居酒屋', convenience: 'コンビニ' }, walk: '徒歩', hours: '営業時間', mapLabel: '白の宿周辺の概略地図', hotel: '白の宿', selected: '選択中' },
  en: { eyebrow: 'AROUND THE HOTEL', title: 'Around Shiro no Yado', lead: 'Restaurants, izakaya and convenience stores within walking distance.', filters: { all: 'All', restaurant: 'Dining', izakaya: 'Izakaya', convenience: 'Convenience' }, walk: 'Walk', hours: 'Hours', mapLabel: 'Illustrated map around Shiro no Yado', hotel: 'Shiro no Yado', selected: 'Selected' },
  fr: { eyebrow: 'AUTOUR DE L’HÔTEL', title: 'Autour de Shiro no Yado', lead: 'Restaurants, izakaya et supérettes accessibles à pied.', filters: { all: 'Tout', restaurant: 'Restaurants', izakaya: 'Izakaya', convenience: 'Supérettes' }, walk: 'À pied', hours: 'Horaires', mapLabel: 'Plan illustré autour de Shiro no Yado', hotel: 'Shiro no Yado', selected: 'Sélection' },
  es: { eyebrow: 'CERCA DEL HOTEL', title: 'Alrededores de Shiro no Yado', lead: 'Restaurantes, izakayas y tiendas a pocos minutos a pie.', filters: { all: 'Todo', restaurant: 'Restaurantes', izakaya: 'Izakaya', convenience: 'Tiendas' }, walk: 'A pie', hours: 'Horario', mapLabel: 'Mapa ilustrado de los alrededores', hotel: 'Shiro no Yado', selected: 'Seleccionado' },
  zh: { eyebrow: '酒店周边', title: '白之宿周边地图', lead: '介绍步行可达的餐厅、居酒屋和便利店。', filters: { all: '全部', restaurant: '餐厅', izakaya: '居酒屋', convenience: '便利店' }, walk: '步行', hours: '营业时间', mapLabel: '白之宿周边示意图', hotel: '白之宿', selected: '已选择' },
  ko: { eyebrow: '호텔 주변', title: '시로노야도 주변 지도', lead: '도보로 갈 수 있는 식당·이자카야·편의점을 안내합니다.', filters: { all: '전체', restaurant: '식당', izakaya: '이자카야', convenience: '편의점' }, walk: '도보', hours: '영업시간', mapLabel: '시로노야도 주변 약도', hotel: '시로노야도', selected: '선택됨' },
};

const PLACES: Place[] = [
  { id: 'shioshiro-diner', category: 'restaurant', name: { ja: '潮白食堂', en: 'Shioshiro Diner', fr: 'Restaurant Shioshiro', es: 'Restaurante Shioshiro', zh: '潮白食堂', ko: '시오시로 식당' }, note: { ja: '島魚の定食と朝ごはん', en: 'Island fish set meals and breakfast', fr: 'Poisson de l’île et petit-déjeuner', es: 'Pescado de la isla y desayunos', zh: '岛鱼套餐与早餐', ko: '섬 생선 정식과 아침 식사' }, walk: 4, hours: '7:00–14:00', x: 26, y: 30 },
  { id: 'umi-no-terrace', category: 'restaurant', name: { ja: '海のテラス', en: 'Sea Terrace', fr: 'Terrasse de la Mer', es: 'Terraza del Mar', zh: '海之露台', ko: '바다 테라스' }, note: { ja: '夕景を望む島野菜レストラン', en: 'Island vegetables with a sunset view', fr: 'Légumes locaux face au coucher du soleil', es: 'Verduras isleñas con vistas al atardecer', zh: '可赏夕阳的岛屿蔬菜餐厅', ko: '석양과 섬 채소 요리' }, walk: 9, hours: '11:30–21:00', x: 79, y: 24 },
  { id: 'umiakari', category: 'izakaya', name: { ja: '海灯り', en: 'Umiakari', fr: 'Umiakari', es: 'Umiakari', zh: '海灯', ko: '우미아카리' }, note: { ja: '地魚と島酒の小さな居酒屋', en: 'Local fish and island sake', fr: 'Poisson local et saké de l’île', es: 'Pescado local y sake de la isla', zh: '当地鱼鲜与岛酒', ko: '현지 생선과 섬 술' }, walk: 6, hours: '17:00–23:00', x: 70, y: 59 },
  { id: 'shiro-noren', category: 'izakaya', name: { ja: '白のれん', en: 'Shiro Noren', fr: 'Shiro Noren', es: 'Shiro Noren', zh: '白暖帘', ko: '시로 노렌' }, note: { ja: '炭火焼きと季節の小皿', en: 'Charcoal grill and seasonal plates', fr: 'Grillades au charbon et petits plats', es: 'Parrilla al carbón y platos de temporada', zh: '炭火烧烤与时令小菜', ko: '숯불구이와 제철 소접시' }, walk: 8, hours: '18:00–24:00', x: 33, y: 74 },
  { id: 'shima-mart', category: 'convenience', name: { ja: '島マート', en: 'Shima Mart', fr: 'Shima Mart', es: 'Shima Mart', zh: '岛屿便利店', ko: '시마 마트' }, note: { ja: '飲み物・軽食・日用品', en: 'Drinks, snacks and daily essentials', fr: 'Boissons, snacks et produits essentiels', es: 'Bebidas, aperitivos y artículos básicos', zh: '饮料、简餐与日用品', ko: '음료·간식·생활용품' }, walk: 3, hours: '6:00–23:00', x: 31, y: 51 },
  { id: 'port-store', category: 'convenience', name: { ja: 'みなと売店', en: 'Harbor Store', fr: 'Boutique du Port', es: 'Tienda del Puerto', zh: '港口商店', ko: '항구 매점' }, note: { ja: '船着場前・島のお土産も販売', en: 'By the pier, also selling island gifts', fr: 'Près de l’embarcadère, souvenirs locaux', es: 'Junto al muelle, también recuerdos', zh: '码头前，也售卖岛上特产', ko: '선착장 앞, 섬 기념품 판매' }, walk: 11, hours: '7:30–19:30', x: 85, y: 79 },
];

const CATEGORY_ICON: Record<Exclude<Category, 'all'>, string> = {
  restaurant: '食',
  izakaya: '酒',
  convenience: '店',
};

export function NearbyGuide() {
  const locale = useHotelStore((state) => state.locale);
  const copy = COPY[locale] ?? COPY.ja;
  const [category, setCategory] = useState<Category>('all');
  const visible = useMemo(() => category === 'all' ? PLACES : PLACES.filter((place) => place.category === category), [category]);
  const [selectedId, setSelectedId] = useState(PLACES[0].id);
  const selected = PLACES.find((place) => place.id === selectedId) ?? PLACES[0];

  return (
    <div className="shiro-yado__stack">
      <header className="shiro-yado__hero">
        <p className="shiro-yado__eyebrow">{copy.eyebrow}</p>
        <h2>{copy.title}</h2>
        <p className="shiro-yado__muted">{copy.lead}</p>
      </header>

      <div className="shiro-yado__nearby-filters" role="group" aria-label={copy.title}>
        {(Object.keys(copy.filters) as Category[]).map((key) => (
          <button key={key} type="button" className={category === key ? 'is-active' : undefined} aria-pressed={category === key} onClick={() => setCategory(key)}>
            {copy.filters[key]}
          </button>
        ))}
      </div>

      <section className="shiro-yado__nearby-layout">
        <div className="shiro-yado__nearby-map" role="img" aria-label={copy.mapLabel}>
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <path className="shiro-yado__map-coast" d="M4 13C20 2 39 8 51 4c17-5 39 2 44 20 5 17-4 26 0 40 4 16-9 30-28 31-17 1-24-7-39-5C10 92 2 77 6 61 10 46-6 29 4 13Z" />
            <path className="shiro-yado__map-road" d="M17 49c20-2 31-17 47-12 12 4 13 18 26 21M45 13c2 18-4 30 2 45 5 13 17 21 30 25M14 76c18-8 27-8 39-3" />
          </svg>
          <div className="shiro-yado__hotel-pin" style={{ left: '48%', top: '47%' }}><span>宿</span><strong>{copy.hotel}</strong></div>
          {visible.map((place) => (
            <button key={place.id} type="button" className={place.id === selected.id ? `shiro-yado__place-pin is-active is-${place.category}` : `shiro-yado__place-pin is-${place.category}`} style={{ left: `${place.x}%`, top: `${place.y}%` }} aria-label={place.name[locale]} aria-pressed={place.id === selected.id} onClick={() => setSelectedId(place.id)}>
              <span>{CATEGORY_ICON[place.category]}</span>
            </button>
          ))}
        </div>

        <div className="shiro-yado__nearby-list">
          {visible.map((place) => (
            <button key={place.id} type="button" className={place.id === selected.id ? 'shiro-yado__nearby-card is-active' : 'shiro-yado__nearby-card'} onClick={() => setSelectedId(place.id)}>
              <span className={`shiro-yado__category-dot is-${place.category}`}>{CATEGORY_ICON[place.category]}</span>
              <span>
                <strong>{place.name[locale]}</strong>
                <small>{place.note[locale]}</small>
                <em>{copy.walk} {place.walk} min · {copy.hours} {place.hours}</em>
              </span>
              {place.id === selected.id ? <b>{copy.selected}</b> : null}
            </button>
          ))}
        </div>
      </section>

      <article className="shiro-yado__nearby-selected" aria-live="polite">
        <span className={`shiro-yado__category-dot is-${selected.category}`}>{CATEGORY_ICON[selected.category]}</span>
        <div><p className="shiro-yado__eyebrow">{copy.filters[selected.category]}</p><h3>{selected.name[locale]}</h3><p>{selected.note[locale]}</p></div>
        <dl><div><dt>{copy.walk}</dt><dd>{selected.walk} min</dd></div><div><dt>{copy.hours}</dt><dd>{selected.hours}</dd></div></dl>
      </article>
    </div>
  );
}
