# FinancialChart レビュー（仕様 vs 実装）

対象: `src/features/financial-chart` の設計仕様 (`DESIGN.md`) と実装。

## 優先度 High

1. **X 軸ラベル仕様の不一致を解消する**
   - 仕様では「固定フォーマット `YYYY/MM/DD HH:mm:ss`」の明記がある。
   - 実装は `timeframeMs` に応じて日付省略や時刻のみ表示を行っており、同日ラベルを空文字にもしている。
   - 改善案: 仕様を実装に合わせて更新するか、実装を固定フォーマットへ統一する。

2. **DPR 変動追従を確実化する**
   - 仕様は「DPR 変更に追従」を目的にしているが、実装は `window.devicePixelRatio` を dependency に持たず、`resize` 等の契機がないと再描画されない。
   - 改善案: `matchMedia('(resolution: Xdppx)')` または `resize` リスナー＋ state 化で DPR 変化時に再描画する。

3. **テーマ注入の一貫性を高める（Tooltip の色ハードコード排除）**
   - 仕様は「テーマを外部から完全に注入可能」としている。
   - 実装の Tooltip DOM は背景色・文字色・shadow が固定値で、テーマから制御できない。
   - 改善案: `ChartTheme` に tooltip 用トークンを追加し、Tooltip 表示にも適用する。

## 優先度 Medium

4. **入力データの並び順前提を明示／防御する**
   - `createScales` は先頭・末尾をそのまま X domain に使っており、データ未ソート時に表示が崩れる可能性がある。
   - 改善案: `time` 昇順を API 契約として明記する、または内部で copy + sort して安全性を上げる。

5. **Tooltip の左右はみ出し制御を改善する**
   - 現在は `left: min(width - 180, x + 14)` のため、狭い幅では負値になり得る。
   - 改善案: `clamp(8, x + 14, width - tooltipWidth - 8)` のように上下限を両方持つ。

6. **マウス移動時の再レンダー頻度を抑制する**
   - `onMouseMove` で毎回 state 更新するため、データ量が大きい画面で負荷増の恐れがある。
   - 改善案: `requestAnimationFrame` で更新間引き、もしくは index 変化時のみ state 更新する。

## 優先度 Low

7. **アクセシビリティ補強**
   - Canvas 主体 UI のため、最低限 `role="img"` と `aria-label` の付与、あるいはデータサマリーの SR 向けテキストを検討する。

8. **仕様ドキュメントに検証条件を追加する**
   - 将来の回帰防止のため、
     - 未ソートデータ
     - 同値価格のみ
     - 超狭幅（< 180px）
     - DPR 変更
     などの期待挙動を `DESIGN.md` かテスト仕様に明記するとレビュー効率が上がる。
