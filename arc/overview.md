# アーキテクチャ概要

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| UI ライブラリ | React 19 |
| 言語 | TypeScript |
| ビルドツール | Vite |
| ルーティング | React Router v7 |
| リンター | ESLint |

## 設計方針

### 1. 実験の独立性

各実験は `src/experiments/<experiment-name>/` 配下に独立して配置し、実験間の依存関係を持たせない。これにより、実験の追加・削除が他の実験に影響を与えない。

### 2. 遅延読み込み（Lazy Loading）

各実験コンポーネントは `React.lazy()` で遅延読み込みする。実験が増えてもバンドルサイズの増加を最小限に抑える。

### 3. レジストリパターン

実験の一覧は `src/experiments/registry.ts` で一元管理する。新しい実験を追加する際は、このファイルにエントリを追加するだけでホーム画面に表示される。

## コンポーネント構成図

```
App
├── HomePage (実験一覧)
│   └── ExperimentCard × N
└── ExperimentPage (個別実験の表示)
    └── <Suspense>
        └── LazyLoadedExperiment
```

## ルーティング

| パス | コンポーネント | 説明 |
|------|--------------|------|
| `/` | HomePage | 実験一覧を表示 |
| `/experiments/:id` | ExperimentPage | 個別の実験を表示 |
