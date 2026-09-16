import { useEffect, useState } from 'react';
import type { Locale } from './i18n';
import { useHotelStore } from './store';

type Promo = { title: string; body: string };

const PROMOS: Record<Locale, Promo[]> = {
  ja: [
    { title: '白と木の静けさ', body: '白壁と淡い木目が織りなす、小さな3階建ての宿。日常をそっと置いていけます。' },
    { title: '3階のしろみゆ', body: '湯けむりの先に、白を基調にした浴場。旅の疲れをゆっくりほどいてください。' },
    { title: '白の間で集う', body: '3階宴会場「白の間」。会合も、お祝いも、静かな光の中で。' },
    { title: '5つの客室', body: '201〜205号室。ツインからファミリーまで、旅のスタイルに合わせて。' },
    { title: '迷わない案内', body: 'コンシェルジュが音声でご案内。ロビーから宴会場・浴場・お部屋まで。' },
  ],
  en: [
    { title: 'Quiet white & wood', body: 'A small three-story inn of white walls and soft timber—leave the everyday behind.' },
    { title: 'Shiromiyu baths', body: 'On the 3rd floor, a pale bathhouse invites you to unwind after your journey.' },
    { title: 'Gather in White Hall', body: 'The 3F banquet room “White Hall”—meetings and celebrations in soft light.' },
    { title: 'Five guest rooms', body: 'Rooms 201–205, from twins to a family room—fit to how you travel.' },
    { title: 'Guidance without worry', body: 'Our concierge speaks directions aloud—from lobby to hall, baths, and your room.' },
  ],
  fr: [
    { title: 'Blanc et bois en silence', body: 'Un petit hôtel de trois étages, murs blancs et bois clair—posez le quotidien.' },
    { title: 'Bains Shiromiyu', body: 'Au 3e étage, des bains clairs pour dénouer la fatigue du voyage.' },
    { title: 'La Salle Blanche', body: 'Salle de banquet au 3e—“Salle Blanche” pour réunions et fêtes en lumière douce.' },
    { title: 'Cinq chambres', body: 'Chambres 201 à 205, du twin à la familiale—selon votre voyage.' },
    { title: 'Se repérer sans peine', body: 'La concierge guide à voix haute—du lobby à la salle, aux bains, à votre chambre.' },
  ],
  es: [
    { title: 'Blanco y madera en calma', body: 'Un pequeño hotel de tres plantas, muros blancos y madera clara—deje atrás lo cotidiano.' },
    { title: 'Baños Shiromiyu', body: 'En la 3.ª planta, baños claros para soltar el cansancio del viaje.' },
    { title: 'Sala Blanca', body: 'Salón en 3F—“Sala Blanca” para reuniones y celebraciones con luz suave.' },
    { title: 'Cinco habitaciones', body: 'Hab. 201–205, del twin a la familiar—según cómo viaje.' },
    { title: 'Orientación sin prisa', body: 'La conserje indica en voz alta—del lobby al salón, baños y su habitación.' },
  ],
  zh: [
    { title: '白与木的静谧', body: '白墙与浅木色的三层小宿，让日常暂且放下。' },
    { title: '三楼白水浴场', body: '淡色浴场在三楼，慢慢卸下旅途的疲意。' },
    { title: '白之间相聚', body: '三楼宴会厅「白之间」——会议与庆典，都在柔光里。' },
    { title: '五间客房', body: '201至205号房，从双床到家庭房，随您的旅程。' },
    { title: '不迷路的案内', body: '礼宾以语音指引——从大堂到宴会厅、浴场与客房。' },
  ],
  ko: [
    { title: '하양과 나무의 고요', body: '흰 벽과 옅은 나무의 작은 3층 여관. 일상을 잠시 내려놓으세요.' },
    { title: '3층 시로미유', body: '옅은 색 목욕탕이 3층에. 여행의 피로를 천천히 풀어 보세요.' },
    { title: '하얀 방에서 모이다', body: '3층 연회장 「하얀 방」. 모임과 축하를 부드러운 빛 속에서.' },
    { title: '객실 다섯', body: '201–205호. 트윈부터 패밀리까지, 여행 방식에 맞게.' },
    { title: '헤매지 않는 안내', body: '컨시어지가 음성으로 안내. 로비에서 연회장·목욕탕·객실까지.' },
  ],
};

export function PromoSlider() {
  const locale = useHotelStore((s) => s.locale);
  const slides = PROMOS[locale] ?? PROMOS.ja;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setIndex(0);
  }, [locale]);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, [paused, slides.length]);

  const go = (dir: -1 | 1) => {
    setIndex((i) => (i + dir + slides.length) % slides.length);
  };

  const current = slides[index] ?? slides[0];

  return (
    <section
      className="shiro-yado__promo"
      aria-roledescription="carousel"
      aria-label="Shiro no Yado highlights"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setPaused(false);
      }}
    >
      <div className="shiro-yado__promo-track">
        <button
          type="button"
          className="shiro-yado__promo-nav shiro-yado__promo-nav--prev"
          aria-label="Previous"
          onClick={() => go(-1)}
        >
          ‹
        </button>

        <div className="shiro-yado__promo-slide" key={`${locale}-${index}`}>
          <p className="shiro-yado__promo-eyebrow">SHIRO NO YADO</p>
          <h3 className="shiro-yado__promo-title">{current.title}</h3>
          <p className="shiro-yado__promo-body">{current.body}</p>
        </div>

        <button
          type="button"
          className="shiro-yado__promo-nav shiro-yado__promo-nav--next"
          aria-label="Next"
          onClick={() => go(1)}
        >
          ›
        </button>
      </div>

      <div className="shiro-yado__promo-dots" role="tablist" aria-label="Slides">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === index}
            className={i === index ? 'is-active' : undefined}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </section>
  );
}
