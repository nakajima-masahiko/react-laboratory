# Getting Started

## 前提条件

- Node.js 20 以上
- npm 10 以上

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

## 新しい実験の追加方法

1. `src/experiments/` 配下に新しいフォルダを作成する（例: `src/experiments/my-experiment/`）
2. フォルダ内に `index.tsx` を作成し、デフォルトエクスポートでコンポーネントを定義する
3. `src/experiments/registry.ts` に実験を登録する
4. 開発サーバーを起動し、ホーム画面から実験を選択して動作確認する

## ディレクトリ構成

```
react-laboratory/
├── arc/                  # アーキテクチャドキュメント
├── docs/                 # プロジェクトドキュメント
├── public/               # 静的ファイル
├── src/
│   ├── experiments/      # 各実験のコンポーネント
│   ├── components/       # 共通コンポーネント
│   ├── App.tsx           # メインアプリ（ルーティング）
│   └── main.tsx          # エントリーポイント
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## スクリプト

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバーを起動 |
| `npm run build` | プロダクションビルド |
| `npm run lint` | ESLint によるコード検査 |
| `npm run preview` | ビルド結果のプレビュー |
