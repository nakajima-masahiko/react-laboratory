# dnd-kit 導入調査メモ（2026-04-26）

## 背景
Radix UI Dialog と dnd-kit を組み合わせる実験を追加するため、依存関係の導入を実施。

## 実行コマンド
```bash
npm i @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

## 結果
- `E403 403 Forbidden - GET https://registry.npmjs.org/@dnd-kit%2fcore` でインストール不可。
- セキュリティポリシーによりパッケージ取得が制限されている可能性が高い。

## 今回の対応
- Dialog は `@radix-ui/react-dialog` で実装。
- 並び替えはネイティブ Drag and Drop API で代替実装。
- `初期化（リセット）` ボタンを追加。

## 次回の再調査ポイント
1. npm レジストリアクセス許可ポリシーの確認（`@dnd-kit/*` の allowlist 追加可否）。
2. 許可後、ネイティブ DnD 実装を dnd-kit 実装へ差し替え。
3. キーボード操作・スクリーンリーダー向け改善（dnd-kit の sensor / accessibility API を利用）。
