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
    id: 'daypicker-laboratory',
    title: 'Date Picker Laboratory',
    description: 'ネイティブ date input で単一・複数・期間の日付取得を試す実験室',
    component: lazy(() => import('./daypicker-laboratory')),
  },
  {
    id: 'dialog-laboratory',
    title: 'Dialog Laboratory',
    description: '各種ダイアログの開閉・確認パターンを試す実験室',
    component: lazy(() => import('./dialog-laboratory')),
  },
  {
    id: 'paginated-list-laboratory',
    title: 'Paginated List Laboratory',
    description: '固定サイズ・ページサイズ切り替え・検索＆ソート付きのページング一覧表を試す実験室',
    component: lazy(() => import('./paginated-list-laboratory')),
  },
  {
    id: 'toggle-shape-drawing',
    title: 'Toggle Shape Drawing',
    description: 'Radix UI Toggle Group で丸・三角・四角を選んでキャンバスに描画する実験',
    component: lazy(() => import('./toggle-shape-drawing')),
  },
  {
    id: 'timer-progress-toast',
    title: 'Timer Progress Toast',
    description: 'Radix UI Progress でプログレスバー付きタイマーを表示し、終了を Toast で通知する実験',
    component: lazy(() => import('./timer-progress-toast')),
  },
];
