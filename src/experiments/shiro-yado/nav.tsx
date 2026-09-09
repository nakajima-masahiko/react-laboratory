import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { FloorId, PlaceId } from './hotel-data';

export type ViewId = 'home' | 'floors' | 'floor' | 'place' | 'guide' | 'checkin' | 'dest';

export type View = {
  v: ViewId;
  f?: FloorId;
  p?: PlaceId;
};

type NavValue = {
  view: View;
  go: (next: View) => void;
};

const NavContext = createContext<NavValue | null>(null);

export function NavProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>({ v: 'home' });
  const value = useMemo(() => ({ view, go: setView }), [view]);
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) {
    throw new Error('useNav must be used inside NavProvider');
  }
  return ctx;
}
