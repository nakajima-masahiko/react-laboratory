# dnd ライブラリ導入記録（更新: 2026-04-29）

## 経緯
- 当初は npm の egress 制限で `@dnd-kit/*` の追加が `E403 Forbidden` で失敗していた。
- 2026-04-29 時点で再試行したところインストール可能になっていたため、`sortable-dialog-lab`
  をネイティブ Pointer Events 実装から `@dnd-kit` ベースの実装に置き換えた。

## 採用パッケージ
```bash
npm i @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```
- `@dnd-kit/core`: `DndContext` / `DragOverlay` / `PointerSensor` / `KeyboardSensor`
- `@dnd-kit/sortable`: `SortableContext` / `useSortable` / `arrayMove` /
  `verticalListSortingStrategy` / `sortableKeyboardCoordinates`
- `@dnd-kit/utilities`: `CSS.Transform.toString` でインライン transform を生成

## 設計上のポイント
1. **センサー構成**
   - `PointerSensor` には `activationConstraint: { distance: 4 }` を指定。
     ハンドルがボタンとしてフォーカス可能なまま、4px 以上のドラッグでだけ並び替えが開始される。
   - `KeyboardSensor` に `sortableKeyboardCoordinates` を渡すことで、
     `Space` で掴む → `↑/↓` で移動 → `Enter` で確定 / `Esc` で取消 のフローを得る。
2. **レイアウト**
   - 各行の transform は `useSortable` の戻り値からインラインで適用するため、
     旧実装の手書き FLIP（`--sdl-flip-y` / `requestAnimationFrame`）は撤去。
   - `transition` も `useSortable` から提供されるため CSS 側では transform 系を持たない。
3. **DragOverlay**
   - ドラッグ中のプレビューは `DragOverlay` で描画し、元の行は半透明＋破線で「掴まれている穴」を表現。
   - プレビュー側は `data-drag-overlay` 属性で別系統のスタイルを当てる。
4. **アクセシビリティ**
   - `useSortable` の `attributes` / `listeners` をハンドル `<button>` に展開しているので、
     `aria-roledescription` 等の必要属性は dnd-kit が付与する。

## 旧実装からの差分メモ
- 削除した手書きロジック
  - `findSwapTargetByMidline` / `processDragFrame` などの中央線判定
  - `useLayoutEffect` ベースの FLIP アニメーション
  - `pointer capture` 周りの手動管理
  - `swapByOffset` を使った `↑/↓` キーハンドラ（`KeyboardSensor` で代替）
- 残した責務
  - Radix Dialog 内に閉じ込めた UI 構造
  - 「現在の順序」プレビューと初期化ボタン

## 今後の改善余地
- モディファイア（`@dnd-kit/modifiers`）を入れると、ドラッグ軸を縦に固定したり
  リスト境界を超えたドラッグを抑制できる。挙動を厳密にしたくなったら追加する。
- `announcements` をカスタマイズすればスクリーンリーダー読み上げを日本語化できる。
