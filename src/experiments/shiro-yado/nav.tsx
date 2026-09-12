import { useMemo, useState, type ReactNode } from 'react';
import { NavContext, type View } from './nav-state';

export function NavProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>({ v: 'home' });
  const value = useMemo(() => ({ view, go: setView }), [view]);
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}
