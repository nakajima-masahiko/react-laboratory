# dnd ライブラリ導入記録（更新: 2026-04-29）

## 経緯
- 当初は npm の egress 制限で `@dnd-kit/*` などの追加が `E403 Forbidden` で失敗していた。
- 切り分け調査（後述）で「npm 全体ではなく registry API のメタデータ取得が広範囲にブロックされている」と判定。
- レジストリアクセスの制限が緩和されたタイミングで再試行したところインストールに成功したため、
  `sortable-dialog-lab` をネイティブ Pointer Events 実装から `@dnd-kit` ベースに置き換えた。

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

## 過去に行った npm 403 切り分け（参考）
インストール失敗時に行った調査の記録。レジストリアクセス制限が緩和された後は再現しないが、
将来同様の事象が起きた場合の手がかりとして残す。

| コマンド | 成否 | 対象パッケージ | 403 URL |
| --- | --- | --- | --- |
| `npm config get registry` | ✅ 成功 | - | - |
| `npm config list` | ✅ 成功 | - | - |
| `npm view @radix-ui/react-dialog version` | ❌ 失敗 (E403) | `@radix-ui/react-dialog` | `https://registry.npmjs.org/@radix-ui%2freact-dialog` |
| `npm view @dnd-kit/core version` | ❌ 失敗 (E403) | `@dnd-kit/core` | `https://registry.npmjs.org/@dnd-kit%2fcore` |
| `npm view @dnd-kit/sortable version` | ❌ 失敗 (E403) | `@dnd-kit/sortable` | `https://registry.npmjs.org/@dnd-kit%2fsortable` |
| `npm view @dnd-kit/utilities version` | ❌ 失敗 (E403) | `@dnd-kit/utilities` | `https://registry.npmjs.org/@dnd-kit%2futilities` |
| `npm view sortablejs version` | ❌ 失敗 (E403) | `sortablejs` | `https://registry.npmjs.org/sortablejs` |
| `npm view react-sortablejs version` | ❌ 失敗 (E403) | `react-sortablejs` | `https://registry.npmjs.org/react-sortablejs` |

切り分け結論:
- 完全拒否ではない（`npm config` 系は成功）。
- `@dnd-kit/*` 固有ではなく、`@radix-ui/react-dialog` や非 scope の `sortablejs` も 403。
- 失敗はすべて registry の metadata 取得（GET）段階で、tarball 取得には到達していなかった。
- → 当時はレジストリアクセス制御 / プロキシ / セキュリティポリシー側で複数パッケージが
  ブロックされている状態。`package.json` を変更してはいけない、と判断していた。

## iPad で DragOverlay の表示位置がずれる問題（2026-04-29）

### 症状
- iPad（iOS Safari）で並び替えダイアログを開きハンドルをドラッグすると、
  `DragOverlay` のプレビューが指の位置から大きくずれた場所に表示される。

### 原因
- Radix Dialog の `Dialog.Content` に `transform: translate(-50%, -50%)` を当てて中央寄せしている。
- `transform` を持つ要素は CSS 仕様上「fixed 配置の包含ブロック」になる。
- `@dnd-kit/core` の `DragOverlay` は内部で `position: fixed` + `transform: translate3d(...)` で
  位置決めしているため、JSX 上の親（= 変換された Dialog.Content）の座標系を基準にしてしまう。
- 結果として「Dialog の左上を原点とし、さらに `translate(-50%, -50%)` を重ね掛けした位置」に
  プレビューが描画される。
- 仕様としてはどのブラウザでも同様にずれるはずだが、iPad は触る指との距離で違和感が顕著に出る。

### 対処
- `DragOverlay` を `react-dom` の `createPortal` で `document.body` に逃がす。
- `createPortal` は React のコンテキストを保持するため、`DndContext` 配下である必要がある
  `DragOverlay` の動作要件は満たしたまま、DOM 上の親だけを `<body>` 直下に移動できる。
- これで `position: fixed` の包含ブロックがビューポートになり、位置計算が正しくなる。

### 代替案として検討したが採用しなかったもの
- Dialog.Content の中央寄せから `transform` を排除する: CSS の独立した `translate` プロパティも
  包含ブロックを生成するため不可。`inset` だけでは自要素サイズ分の中央寄せが書けない。
- DragOverlay 自体を Dialog の外に出す: `useSortable` から `DragOverlay` への内部アクセスを
  保つため、同じ `DndContext` 配下に置く必要があり、ツリーを大きく書き換える羽目になる。

## 今後の改善余地
- モディファイア（`@dnd-kit/modifiers`）を入れると、ドラッグ軸を縦に固定したり
  リスト境界を超えたドラッグを抑制できる。挙動を厳密にしたくなったら追加する。
- `announcements` をカスタマイズすればスクリーンリーダー読み上げを日本語化できる。
