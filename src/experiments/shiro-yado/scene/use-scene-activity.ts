import { useEffect, useRef, useState } from 'react';

export function useSceneActivity() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const motion = () => setReduced(media.matches);
    let intersecting = true;
    const update = () => setVisible(intersecting && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { intersecting = entry.isIntersecting; update(); });
    if (ref.current) observer.observe(ref.current);
    document.addEventListener('visibilitychange', update);
    media.addEventListener('change', motion);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update); media.removeEventListener('change', motion); };
  }, []);
  return { ref, visible, reduced };
}
