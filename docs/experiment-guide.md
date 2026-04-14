# 実験作成ガイド

## 実験の構成

各実験は `src/experiments/` 配下に独立したフォルダとして配置します。

```
src/experiments/
├── registry.ts              # 実験の登録情報
├── counter/                 # 実験例: カウンター
│   └── index.tsx
└── my-new-experiment/       # 新しい実験
    ├── index.tsx            # メインコンポーネント（必須）
    ├── components/          # 実験固有のコンポーネント（任意）
    └── hooks/               # 実験固有のフック（任意）
```

## 実験コンポーネントの作成

```tsx
// src/experiments/my-experiment/index.tsx

function MyExperiment() {
  return (
    <div>
      <h2>My Experiment</h2>
      <p>実験の内容をここに記述します。</p>
    </div>
  );
}

export default MyExperiment;
```

## 実験の登録

`src/experiments/registry.ts` に実験情報を追加します。

```ts
import { lazy } from 'react';

export interface ExperimentEntry {
  id: string;
  title: string;
  description: string;
  component: React.LazyExoticComponent<React.ComponentType>;
}

export const experiments: ExperimentEntry[] = [
  {
    id: 'my-experiment',
    title: 'My Experiment',
    description: '実験の説明',
    component: lazy(() => import('./my-experiment')),
  },
];
```

## ベストプラクティス

- 各実験は互いに独立させ、副作用が他の実験に影響しないようにする
- 共通で使いたいコンポーネントは `src/components/` に配置する
- 実験固有のスタイルはCSS Modulesまたはインラインスタイルで管理する
