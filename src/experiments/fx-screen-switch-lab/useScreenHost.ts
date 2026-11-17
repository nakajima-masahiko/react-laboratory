import { useCallback, useEffect, useRef, useState } from 'react';
import { createMarket, INITIAL, isConfig, isScreen, SCREENS } from './market';
import type { Config, ScreenId } from './market';
import { CHANNEL } from './protocol';
import type { Envelope, Snapshot, Theme } from './protocol';

export function useScreenHost() {
  const [session] = useState(() => crypto.randomUUID());
  const [navigation, setNavigation] = useState<{ active: ScreenId; previous: ScreenId }>({ active: 'main', previous: 'main' });
  const { active, previous } = navigation;
  const setActive = useCallback((target: ScreenId) => {
    setNavigation(old => old.active === target ? old : { active: target, previous: old.active });
  }, []);
  const [configs, setConfigs] = useState(INITIAL);
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(15);
  const [theme, setTheme] = useState<Theme>('dark');
  const [ready, setReady] = useState<ScreenId[]>([]);
  const [ticks, setTicks] = useState(0);
  const frames = useRef<Partial<Record<ScreenId, HTMLIFrameElement>>>({});
  const market = useRef<ReturnType<typeof createMarket> | null>(null);
  const latest = useRef({ active, configs, running, speed, theme });

  useEffect(() => {
    latest.current = { active, configs, running, speed, theme };
    const send = (id: ScreenId) => {
      if (!market.current) return;
      const state = latest.current;
      const payload: Snapshot = {
        ...state, config: state.configs[id], active: state.active === id,
        bars: state.active === id ? market.current.bars(state.configs[id]) : [],
        quotes: market.current.quotes(), clock: market.current.clock, ticks: market.current.ticks,
      };
      frames.current[id]?.contentWindow?.postMessage({ channel: CHANNEL, session, type: 'snapshot', payload }, location.origin);
    };
    SCREENS.forEach(send);
  }, [active, configs, running, speed, theme, session]);

  useEffect(() => {
    market.current = createMarket();
    const send = (id: ScreenId) => {
      const state = latest.current;
      const source = market.current!;
      const payload: Snapshot = { ...state, config: state.configs[id], active: state.active === id,
        bars: source.bars(state.configs[id]), quotes: source.quotes(), clock: source.clock, ticks: source.ticks };
      frames.current[id]?.contentWindow?.postMessage({ channel: CHANNEL, session, type: 'snapshot', payload }, location.origin);
    };
    const receive = (event: MessageEvent<Envelope>) => {
      const message = event.data;
      if (event.origin !== location.origin || !message || message.channel !== CHANNEL ||
        message.session !== session || !isScreen(message.screen) ||
        event.source !== frames.current[message.screen]?.contentWindow) return;
      if (message.type === 'ready') {
        setReady(old => old.includes(message.screen) ? old : [...old, message.screen]);
        send(message.screen);
      } else if (message.type === 'configure' && isScreen(message.target) && isConfig(message.config)) {
        // Children may edit themselves; the main screen may edit every pane.
        if (message.screen !== 'main' && message.target !== message.screen) return;
        setConfigs(old => ({ ...old, [message.target]: message.config as Config }));
      } else if (message.type === 'navigate' && isScreen(message.target)) setActive(message.target);
    };
    window.addEventListener('message', receive);
    const timer = window.setInterval(() => {
      if (!latest.current.running || document.hidden) return;
      market.current!.tick(latest.current.speed);
      setTicks(market.current!.ticks);
      send(latest.current.active);
    }, 1000);
    const resume = () => { if (!document.hidden) send(latest.current.active); };
    document.addEventListener('visibilitychange', resume);
    return () => {
      clearInterval(timer);
      window.removeEventListener('message', receive);
      document.removeEventListener('visibilitychange', resume);
      market.current = null;
    };
  }, [session, setActive]);

  return { session, active, previous, setActive, configs, running, setRunning, speed, setSpeed, theme, setTheme, ready, ticks, frames };
}
