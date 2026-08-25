import { AnimatePresence, motion } from 'motion/react';
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Howl } from 'howler';
import './styles.css';

const AquariumCanvas = lazy(() => import('./AquariumCanvas'));

const zones = [
  { name: '水面', en: 'SURFACE', depth: '02 M', line: '海の中へ。' },
  { name: 'サンゴ礁', en: 'REEF', depth: '12 M', line: 'それぞれ違い、同じ方向へ。', question: 'なぜ群れる？', answer: '近づきすぎず、離れすぎず、隣の動きに合わせる。その小さな規則だけで、誰も命令しない群れが生まれます。' },
  { name: '大水槽', en: 'OPEN OCEAN', depth: '32 M', line: '大きさは、音を立てない。', question: '何が、向こうにいる？' },
  { name: 'クラゲ', en: 'JELLYFISH', depth: '58 M', line: '水が、形を持つ。', question: 'なぜ透明なのか？', answer: '身体の大半を水が占め、光を反射する境界が少ないため、水の中へ溶けるように見えます。' },
  { name: '深海', en: 'DEEP SEA', depth: '900 M', line: '光の外にも、世界はある。', question: 'なぜ光る？', answer: '仲間への合図、獲物への誘い、そして自分の輪郭を消すためにも、深海の光は使われます。' },
] as const;

function makeAmbientWav() {
  const rate = 8000;
  const samples = rate * 4;
  const buffer = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buffer);
  const ascii = (offset: number, text: string) => [...text].forEach((char, index) => view.setUint8(offset + index, char.charCodeAt(0)));
  ascii(0, 'RIFF'); view.setUint32(4, 36 + samples * 2, true); ascii(8, 'WAVEfmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, rate, true); view.setUint32(28, rate * 2, true); view.setUint16(32, 2, true);
  view.setUint16(34, 16, true); ascii(36, 'data'); view.setUint32(40, samples * 2, true);
  for (let i = 0; i < samples; i += 1) {
    const t = i / rate;
    const sample = Math.sin(Math.PI * 2 * 37 * t) * 0.1 + Math.sin(Math.PI * 2 * 61 * t) * 0.025;
    view.setInt16(44 + i * 2, sample * 32767, true);
  }
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return `data:audio/wav;base64,${btoa(binary)}`;
}

export default function AquariumUxLab() {
  const trackRef = useRef<HTMLDivElement>(null);
  const soundRef = useRef<Howl | null>(null);
  const [depth, setDepth] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const [discovered, setDiscovered] = useState(false);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const zone = Math.min(4, Math.floor(depth * 5));
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const travel = Math.max(1, track.offsetHeight - innerHeight);
      setDepth(Math.max(0, Math.min(1, -rect.top / travel)));
    };
    const requestUpdate = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    addEventListener('scroll', requestUpdate, { passive: true });
    addEventListener('resize', requestUpdate);
    return () => {
      removeEventListener('scroll', requestUpdate);
      removeEventListener('resize', requestUpdate);
      if (raf) cancelAnimationFrame(raf);
      soundRef.current?.unload();
    };
  }, []);

  const toggleSound = () => {
    if (!soundRef.current) soundRef.current = new Howl({ src: [makeAmbientWav()], format: ['wav'], loop: true, volume: 0.09 });
    if (soundOn) soundRef.current.pause(); else soundRef.current.play();
    setSoundOn((value) => !value);
  };

  const jumpTo = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const travel = track.offsetHeight - innerHeight;
    scrollTo({ top: track.offsetTop + travel * ((index + 0.5) / 5), behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  const onDiscover = useCallback(() => setDiscovered(true), []);
  const current = zones[zone];

  return (
    <div ref={trackRef} className="aquarium-lab-track">
      <section className={`aquarium-lab zone-${zone}`} aria-label="水面から深海へ潜るインタラクティブ水槽">
        <Suspense fallback={<div className="aquarium-loading" />}>
          <AquariumCanvas depth={depth} reducedMotion={reducedMotion} onDiscover={onDiscover} />
        </Suspense>

        <header className="aquarium-header">
          <div><small>A QUIET LIFE WORLD</small><h2>AQUARIUM</h2></div>
          <button type="button" className="sound-control" aria-pressed={soundOn} onClick={toggleSound}>SOUND {soundOn ? 'ON' : 'OFF'}</button>
        </header>

        <AnimatePresence mode="wait">
          <motion.div key={zone} className={`zone-copy zone-copy-${zone}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0.1 : 1.1 }}>
            <small>0{zone + 1} / {current.en}</small>
            <h3>{current.line}</h3>
            {'question' in current && current.question && (
              <button type="button" className="question-button" disabled={!('answer' in current)} onClick={() => setAnswers((value) => ({ ...value, [zone]: true }))}>{current.question}</button>
            )}
            {'answer' in current && answers[zone] && <motion.p className="zone-answer" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{current.answer}</motion.p>}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {discovered && zone === 2 && (
            <motion.aside className="discovery-plate" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <small>A DISTANT PRESENCE</small>
              <p>なぜ、この巨大な身体は<br />これほど静かに動けるのでしょう。</p>
            </motion.aside>
          )}
        </AnimatePresence>

        {depth > 0.955 && <motion.div className="final-thought" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reducedMotion ? 0.1 : 3.2 }}>私たちが知っている海は、<br />まだ、その一部にすぎない。</motion.div>}

        <nav className="aquarium-zone-nav" aria-label="海域">
          {zones.map((item, index) => <button key={item.en} type="button" className={index === zone ? 'active' : ''} onClick={() => jumpTo(index)}><span>0{index + 1}</span><span>{item.name}</span></button>)}
        </nav>

        <footer className="aquarium-footer"><span>SCROLL TO DESCEND</span><span>DEPTH&nbsp;&nbsp;{current.depth}</span></footer>
      </section>
    </div>
  );
}
