# React Laboratory

Reactの様々な実験を行うリポジトリです。

## セットアップ

```bash
npm install
npm run dev
```

## ディレクトリ構成

```
react-laboratory/
├── arc/                  # アーキテクチャドキュメント
├── docs/                 # プロジェクトドキュメント
├── src/
│   ├── components/       # 共通コンポーネント
│   ├── experiments/      # 各実験のコンポーネント
│   ├── pages/            # ページコンポーネント
│   ├── App.tsx           # ルーティング定義
│   └── main.tsx          # エントリーポイント
├── index.html
├── package.json
└── vite.config.ts
```

## 新しい実験の追加

1. `src/experiments/` に新しいフォルダを作成
2. `index.tsx` でデフォルトエクスポートのコンポーネントを定義
3. `src/experiments/registry.ts` にエントリを追加

詳しくは [docs/experiment-guide.md](docs/experiment-guide.md) を参照してください。

## スクリプト

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバーを起動 |
| `npm run build` | プロダクションビルド |
| `npm run lint` | ESLint によるコード検査 |
| `npm run preview` | ビルド結果のプレビュー |

## 技術スタック

- React 19 + TypeScript
- Vite
- React Router v7
