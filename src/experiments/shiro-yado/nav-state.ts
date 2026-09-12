import { createContext, useContext } from 'react';
import { getPlace, type FloorId, type PlaceId } from './hotel-data';

export type ViewId = 'home' | 'floors' | 'floor' | 'place' | 'guide' | 'checkin' | 'dest';

export type View = {
  v: ViewId;
  f?: FloorId;
  p?: PlaceId;
};

export type NavValue = {
  view: View;
  go: (next: View) => void;
};

export const NavContext = createContext<NavValue | null>(null);

export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) {
    throw new Error('useNav must be used inside NavProvider');
  }
  return ctx;
}

export function backView(current: View): View | null {
  if (current.v === 'home') return null;
  if (current.v === 'guide' && current.p) return { v: 'place', p: current.p };
  if (current.v === 'place') {
    const place = getPlace(current.p);
    if (place?.kind === 'room') return { v: 'floor', f: 2 };
    if (place?.kind === 'facility') return { v: 'floor', f: 3 };
    if (place?.floor === 1) return { v: 'floor', f: 1 };
    return { v: 'dest' };
  }
  if (current.v === 'floor') return { v: 'floors' };
  return { v: 'home' };
}
