import { useMemo, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getPlace, type FloorId } from './hotel-data';
import { NavContext, type View } from './nav-state';

const BASE_PATH = '/experiments/shiro-yado';

function viewFromPath(pathname: string): View {
  const parts = pathname.slice(BASE_PATH.length).split('/').filter(Boolean);
  const [view, value] = parts;
  if (view === 'tourism') return { v: 'tourism' };
  if (view === 'floors') return { v: 'floors' };
  if (view === 'floor' && ['1', '2', '3'].includes(value)) return { v: 'floor', f: Number(value) as FloorId };
  if ((view === 'place' || view === 'guide') && getPlace(value)) return { v: view, p: value as View['p'] };
  if (view === 'checkin') return { v: 'checkin' };
  if (view === 'dest') return { v: 'dest' };
  return { v: 'home' };
}

function pathFromView(view: View) {
  if (view.v === 'home') return BASE_PATH;
  if (view.v === 'floor') return `${BASE_PATH}/floor/${view.f ?? 1}`;
  if ((view.v === 'place' || view.v === 'guide') && view.p) return `${BASE_PATH}/${view.v}/${view.p}`;
  return `${BASE_PATH}/${view.v}`;
}

export function NavProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const view = useMemo(() => viewFromPath(location.pathname), [location.pathname]);
  const value = useMemo(() => ({ view, go: (next: View) => navigate(pathFromView(next)) }), [navigate, view]);
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}
