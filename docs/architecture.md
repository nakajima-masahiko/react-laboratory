# アーキテクチャ

## 概要

React Laboratory は、React パターンを個別に試せる実験場です。各実験は完全に独立したコンポーネントとして実装され、レジストリパターンで一元管理されています。

---

## 主要な設計判断

### HashRouter を使う理由

`BrowserRouter` の代わりに `HashRouter` を使用しています。

GitHub Pages はサブディレクトリ（`/react-laboratory/`）からサービスされるため、サーバーサイドでのルーティングが行えません。`HashRouter` は URL の `#` 以降でルートを管理するため、静的ホスティング環境でもクライアントサイドルーティングが正しく機能します。

```
https://nakajima-masahiko.github.io/react-laboratory/#/experiments/counter
                                                      ^
                                                      ハッシュ以降がルート
```

### レジストリパターン

`src/experiments/registry.ts` が全実験の唯一の情報源（Single Source of Truth）です。

```ts
export const experiments: ExperimentEntry[] = [
  {
    id: 'counter',
    title: 'カウンター',
    description: 'useStateの基本的な使い方を確認するシンプルなカウンター',
    component: lazy(() => import('./counter')),
  },
  // ...
];
```

新しい実験をここに追加するだけで、ホームページへの表示とルーティングが自動的に反映されます。`HomePage.tsx` や `App.tsx` を変更する必要はありません。

### 遅延読み込み（Lazy Loading）

すべての実験コンポーネントは `React.lazy()` で動的インポートされ、`ExperimentPage` 内の `<Suspense>` でラップされます。

```tsx
// ExperimentPage.tsx
<Suspense fallback={<div>Loading...</div>}>
  <experiment.component />
</Suspense>
```

これにより初期バンドルを小さく保ち、実験が増えてもパフォーマンスが劣化しません。各実験のコードはそのページを初めて訪れたときにのみダウンロードされます。

---

## コンポーネント階層

```
main.tsx
└── App.tsx  (HashRouter)
    ├── / → HomePage
    │   └── ExperimentCard × n  (registry の各エントリ)
    └── /experiments/:id → ExperimentPage
        └── <Suspense>
            └── <experiment.component>  (lazy import)
```

### ルーティングテーブル

| パス | コンポーネント | 役割 |
|------|--------------|------|
| `/` | `HomePage` | 全実験のカード一覧を表示 |
| `/experiments/:id` | `ExperimentPage` | `id` でレジストリを検索し該当実験を描画 |

---

## スタイリング

### CSS カスタムプロパティによるテーマ

グローバルテーマは `src/index.css` で CSS カスタムプロパティとして定義され、ダークモードは `prefers-color-scheme` メディアクエリで切り替わります。

```css
:root {
  --text:         #333;
  --text-h:       #111;
  --bg:           #fff;
  --border:       #e0e0e0;
  --accent:       #646cff;
  --accent-light: rgba(100, 108, 255, 0.1);
}

@media (prefers-color-scheme: dark) {
  :root {
    --text:         #b0b0b0;
    --text-h:       #f0f0f0;
    --bg:           #1a1a2e;
    --border:       #333;
    --accent:       #818cf8;
    --accent-light: rgba(129, 140, 248, 0.15);
  }
}
```

各実験のローカルスタイルは `styles.css` を同階層に配置します（CSS Modules は使用しません）。

---

## TypeScript 設定

`tsconfig.app.json` で以下の厳格オプションが有効になっています。

| オプション | 効果 |
|-----------|------|
| `noUnusedLocals` | 使われていないローカル変数をエラーにする |
| `noUnusedParameters` | 使われていない関数引数をエラーにする |
| `erasableSyntaxOnly` | 型注釈以外の TypeScript 固有構文を禁止 |
| `noFallthroughCasesInSwitch` | switch の意図しないフォールスルーをエラーにする |
| `verbatimModuleSyntax` | `import type` を強制し、正しいツリーシェイキングを保証 |

TypeScript はバンドル出力を生成しません（`noEmit: true`）。型チェックのみを担い、JavaScript への変換は Vite が行います。

---

## ビルドとデプロイ

```
push to main
    │
    ▼
GitHub Actions (.github/workflows/deploy.yml)
    │
    ├─ npm ci
    ├─ npm run build   (tsc -b && vite build)
    └─ dist/ を GitHub Pages へデプロイ
```

Vite の `base: '/react-laboratory/'` 設定により、すべてのアセットパスがサブディレクトリに対応した形で生成されます。

---

## 実験の独立性ルール

- 実験同士は互いにインポートしてはいけません
- 実験間で共有したいユーティリティやコンポーネントは `src/components/` に置きます
- 実験固有の状態・副作用が他の実験に漏れないよう、コンポーネントのスコープ内に閉じます
