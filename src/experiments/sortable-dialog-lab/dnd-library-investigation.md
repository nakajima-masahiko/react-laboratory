# dnd ライブラリ導入調査メモ（更新: 2026-04-26）

## ユーザー課題
`src/experiments/sortable-dialog-lab` の並び替え UI を、より滑らかなドラッグ体験に改善したい。

## 再調査で実行したコマンド
```bash
npm i @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm i sortablejs react-sortablejs
```

## 調査結果
- 両コマンドとも `E403 403 Forbidden - GET https://registry.npmjs.org/...` で失敗。
- 現在の環境では、新規 npm パッケージ追加自体がセキュリティポリシーで制限されている可能性が高い。
- したがって、**現時点ではライブラリ導入によるドラッグ体験改善は実行不可**。

## いま取れる改善方針（Plan）
1. 既存のネイティブ Pointer Events 実装を維持したまま、操作感を改善。
   - `requestAnimationFrame` を使って並び替え計算を間引きし、ガタつきを減らす。
   - ドラッグ中のプレビュー表現（透明度・影・スケール）を調整して「掴んでいる感」を強化。
2. レンダリング負荷の低減。
   - `findItemIdAt` の呼び出し頻度を制御し、不要な `setItems` を抑制。
3. ライブラリ導入の再開条件を明文化。
   - npm allowlist/egress policy が更新され次第、`dnd-kit` を第一候補として再検証。

## ライブラリ導入再開時の具体ステップ
1. `npm i @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities` を再実行。
2. `PointerSensor` + `KeyboardSensor` + `sortableKeyboardCoordinates` を構成。
3. `DragOverlay` を使ってドラッグ中の視覚追従を改善。
4. 現行のキーボード並び替え（↑/↓）を dnd-kit のアクセシビリティ API に統合。

## 補足
過去の調査時点でも dnd-kit の導入は失敗しており、今回も同様の制約が継続している。
