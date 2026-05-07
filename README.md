# React Laboratory

React のさまざまなパターンやライブラリを試す実験場です。各実験は独立したコンポーネントとして実装されており、GitHub Pages で公開されています。

## 実験一覧

| 実験 | 説明 |
|------|------|
| **カウンター** | `useState` の基本的な使い方を確認するシンプルなカウンター |
| **Date Picker Laboratory** | ネイティブ `date` input で単一・複数・期間の日付取得を試す実験室 |
| **Dialog Laboratory** | 各種ダイアログの開閉・確認パターンを試す実験室 |
| **Paginated List Laboratory** | 固定サイズ・ページサイズ切り替え・検索＆ソート付きのページング一覧表 |
| **Toggle Shape Drawing** | Radix UI Toggle Group で丸・三角・四角を選んでキャンバスに描画する実験 |
| **FX Chart Lab** | Recharts で FX ダミーデータをローソク足 / ライン切り替え、3カラーテーマ対応で描画する実験 |
| **Timer Progress Toast** | Radix UI Progress でプログレスバー付きタイマーを表示し、終了を Toast で通知する実験 |
| **Toast Notifications** | 登録フォームの成功・入力エラー・通信エラーに加え、お知らせや警告など代表的なトースト通知を試す実験 |
| **SMA WASM Benchmark** | JavaScript 版と Rust/WASM 版で SMA（単純移動平均）の計算速度を比較する CPU 集約処理ベンチマーク |

## 技術スタック

- **React 19** + **TypeScript 6**
- **Vite 8** — 開発サーバー・バンドラー
- **React Router v7** — クライアントサイドルーティング（HashRouter）
- **Radix UI** — アクセシブルな UI プリミティブ（Dialog / Progress / Toast / Toggle Group）
- **Recharts** — コンポーザブルなチャートライブラリ

## クイックスタート

```bash
# 前提: Node.js 20 以上、npm 10 以上

npm install
npm run dev      # http://localhost:5173/react-laboratory/ で起動
```

## スクリプト

| コマンド | 説明 |
|---------|------|
| `npm run dev` | Vite 開発サーバーを起動 |
| `npm run build` | 型チェック（`tsc -b`）後にプロダクションビルド |
| `npm run lint` | ESLint によるコード検査 |
| `npm run preview` | ビルド成果物をローカルでプレビュー |
| `npm run build:wasm` | `wasm/sma-benchmark` クレートを `wasm32-unknown-unknown` 向けにビルドし、`wasm-bindgen` で `src/experiments/sma-wasm-benchmark/wasm-pkg/` を再生成（SMA WASM Benchmark 用） |
| `npm run build:wasm:check` | Rust 側だけ `cargo check` で型・借用検査（高速） |

## ディレクトリ構成

```
react-laboratory/
├── .github/workflows/deploy.yml   # GitHub Pages への自動デプロイ
├── docs/                          # プロジェクトドキュメント
│   ├── architecture.md            # アーキテクチャ解説
│   ├── experiment-guide.md        # 実験作成ガイド
│   └── getting-started.md        # セットアップ手順
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── ExperimentCard.tsx     # ホーム画面の実験カード
│   ├── experiments/
│   │   ├── registry.ts            # 実験の一覧（唯一の情報源）
│   │   ├── counter/
│   │   ├── daypicker-laboratory/
│   │   ├── dialog-laboratory/
│   │   ├── fx-chart-lab/
│   │   ├── paginated-list-laboratory/
│   │   ├── timer-progress-toast/
│   │   ├── toast-notifications/
│   │   └── toggle-shape-drawing/
│   ├── pages/
│   │   ├── HomePage.tsx           # 実験一覧ページ
│   │   └── ExperimentPage.tsx     # 実験表示ページ（Suspense でラップ）
│   ├── App.tsx                    # ルーティング定義
│   ├── index.css                  # グローバルスタイル・CSS カスタムプロパティ
│   └── main.tsx                   # エントリーポイント
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 新しい実験を追加する

1. `src/experiments/<kebab-case-name>/index.tsx` をデフォルトエクスポートで作成する
2. スタイルが必要なら同階層に `styles.css` を追加する
3. `src/experiments/registry.ts` にエントリを追加する

```ts
{
  id: 'my-experiment',
  title: 'My Experiment',
  description: '何を試す実験か',
  component: lazy(() => import('./my-experiment')),
}
```

ホームページへの表示・ルーティングは自動で反映されます。詳細は [docs/experiment-guide.md](docs/experiment-guide.md) を参照してください。

## デプロイ

`main` ブランチへの push をトリガーに GitHub Actions が自動でビルド・デプロイします。
Vite の `base` は `/react-laboratory/` に設定されているため、GitHub Pages のサブパスで正しく動作します。
