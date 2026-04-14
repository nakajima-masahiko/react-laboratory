import { lazy } from 'react';

export interface ExperimentEntry {
  id: string;
  title: string;
  description: string;
  component: React.LazyExoticComponent<React.ComponentType>;
}

export const experiments: ExperimentEntry[] = [
  {
    id: 'counter',
    title: 'カウンター',
    description: 'useStateの基本的な使い方を確認するシンプルなカウンター',
    component: lazy(() => import('./counter')),
  },
  {
    id: 'dialog-laboratory',
    title: 'Dialog Laboratory',
    description: '各種ダイアログの開閉・確認パターンを試す実験室',
    component: lazy(() => import('./dialog-laboratory')),
  },
];
