import type { Bar, Config, Quote, ScreenId } from './market';

export const CHANNEL = 'fx-screen-switch-v1';
export type Theme = 'light' | 'dark';
export type Snapshot = {
  config: Config;
  configs: Record<ScreenId, Config>;
  bars: Bar[];
  quotes: Quote[];
  clock: number;
  ticks: number;
  running: boolean;
  speed: number;
  theme: Theme;
  active: boolean;
};
export type Request =
  | { type: 'ready' }
  | { type: 'configure'; target: ScreenId; config: Config }
  | { type: 'navigate'; target: ScreenId };
export type Envelope = { channel: typeof CHANNEL; session: string; screen: ScreenId } & Request;
export function frameUrl(screen: ScreenId, session: string) {
  return `${import.meta.env.BASE_URL}#/fx-screen/${screen}?session=${encodeURIComponent(session)}`;
}
