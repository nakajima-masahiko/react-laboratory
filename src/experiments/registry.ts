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
    id: 'fx-chart-lab',
    title: 'FX Chart Lab',
    description: 'Recharts で FX ダミーデータをローソク足 / ライン切り替え、3カラーテーマ対応で描画する実験',
    component: lazy(() => import('./fx-chart-lab')),
  },
  {
    id: 'timer-progress-toast',
    title: 'Timer Progress Toast',
    description: 'Radix UI Progress でプログレスバー付きタイマーを表示し、終了を Toast で通知する実験',
    component: lazy(() => import('./timer-progress-toast')),
  },
  {
    id: 'toast-notifications',
    title: 'Toast Notifications',
    description: '登録フォームの成功・入力エラー・通信エラーに加え、お知らせや警告など代表的なトースト通知を試す実験',
    component: lazy(() => import('./toast-notifications')),
  },
  {
    id: 'theme-switching',
    title: 'Theme Switching',
    description: 'CSS カスタムプロパティで Light / Dark / Ocean / Forest / Sunset の5テーマをリアルタイム切り替えする実験',
    component: lazy(() => import('./theme-switching')),
  },
  {
    id: 'notification-switch-laboratory',
    title: 'Notification Switch Laboratory',
    description: '通知方式を Toast / Dialog で切り替え、notifySuccess() という抽象APIを通じて保存完了通知を発火する実験',
    component: lazy(() => import('./notification-switch-laboratory')),
  },

  {
    id: 'currency-chart-window-lab',
    title: 'Currency Chart Window Lab',
    description: '36カ月分の通貨別保有量を積み上げ棒グラフで表示し、Toggle Groupで表示月数を切り替えつつドラッグ移動を試す実験',
    component: lazy(() => import('./currency-chart-window-lab')),
  },
  {
    id: 'currency-chart',
    title: 'Currency Chart',
    description: 'Recharts の積み上げ棒グラフで12カ月分の通貨別保有量を可視化する実験',
    component: lazy(() => import('./currency-chart')),
  },
];
