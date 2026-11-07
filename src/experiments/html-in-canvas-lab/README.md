# HTML in Canvas Lab

[デモを開く](https://nakajima-masahiko.github.io/react-laboratory/#/experiments/html-in-canvas-lab)

HTML-in-Canvas の現在のAPIを使う3つの実験。ReactがHTMLを管理し、Canvasが描画位置と合成順を管理します。API未対応環境では通常のDOM重ね合わせへ切り替え、実際の方式を画面上に表示します。

## サンプル

| サンプル | 試せること |
| --- | --- |
| ECharts × リアルタイムHTML | Canvasレンダラーの模擬USD/JPY、最新価格に追従するHTMLラベル、ポインターによる価格確認、HTML内の停止・再開ボタン、100 / 500 / 1,000 ms更新、60 / 90 / 180点表示 |
| 文字と座標変換 | 日本語・強調・折り返し、回転・拡大中の入力・ボタン操作、テキスト選択 |
| アニメーションと合成 | 背景粒子 → HTMLフォーム → 前景粒子の描画、速度・粒子数変更、一時停止 |

共通でライト／ダークテーマ、画面幅への追従、ネイティブ時のHTMLを含むPNG出力を提供します。描画方式の切り替え・サンプルの切り替えでは、そのサンプルの操作状態を初期化します。

## 対象APIと互換性

2026-11-08にChrome公式資料を確認。Chrome 157の `content="drawable"` / `drawable` / `paint` / `requestPaint()` / `drawElementImage()` を対象としています。旧Origin Trialの `layoutsubtree` や古いgeometry戻り値は使用しません。

UA文字列ではなく、`canvas.content` の反映と描画メソッドの存在を調べます。対応していても描画時に例外が発生した場合はDOMへ切り替え、理由を表示します。

| 動作 | ネイティブ | DOM重ね合わせ |
| --- | --- | --- |
| 入力・クリック | Canvas内の実際のHTMLを操作 | Canvasの上に配置した実際のHTMLを操作 |
| 座標変換 | CanvasのCTMと`drawElementImage()`によるgeometry同期 | CSSのtransform |
| 前景図形がHTMLより手前に出る | 可能 | HTMLがCanvasより手前に残る |
| HTMLを含むPNG保存 | 可能 | 無効化。HTMLを含まない画像を完全な合成画像として保存しない |

## EChartsとの統合

ECharts 6.1.0をnpmとlockfileで固定し、LineChart / GridComponent / CanvasRendererだけを登録しています。CDNの実行時読み込みはありません。

1. EChartsを専用の非表示Canvasに初期化する。
2. `setOption()`で模擬データを更新し、`rendered`イベントで表示側の再描画を予約する。
3. 表示用Canvasの`paint`内でEChartsのCanvasを`drawImage()`する。
4. `convertToPixel()`で取得した価格の位置を基準に、HTMLラベルを`drawElementImage()`で描画する。

EChartsが管理する描画面へ直接HTMLを後描きすると、次のECharts更新で消去されます。独立した合成用Canvasにより所有権を分離しています。表示用CanvasはEChartsのイベント受付面ではないため、標準tooltip / dataZoom等はそのまま動きません。この実験はポインター座標を`convertFromPixel()`で変換して独自の価格確認を行い、外部コントロールで表示範囲を変えます。

データは固定式で生成する**模擬値**です。市場データや売買APIへは接続しません。模擬時計は更新ごとに1秒進み、データ保持数は180点に制限します。実際の配信を接続する場合は`chart-data.ts`と`useRealtimeChart.ts`の供給部分を置き換えます。

## 描画とライフサイクル

- `CanvasStage.tsx`が再描画予約・ResizeObserver・HTML合成・PNG保存を管理。
- HTMLのスナップショットが更新される`paint`イベント内でのみネイティブ描画。requestAnimationFrame内から直接HTMLを描かない。
- DPRは2を上限とし、丸めたバッファサイズとCSSサイズの比をCTMに設定。`drawElementImage()`には明示的な描画幅・高さを渡し、二重拡大を避ける。
- DOM重ね合わせ時も同じ配置関数を使用。
- 粒子は画面外・タブ非表示時に描画を休止。`prefers-reduced-motion`では初期状態を停止にする。
- チャートのタイマーはタブ非表示中に更新を休止。サンプルを離れたらタイマー、RAF、Observer、EChartsインスタンスを破棄。
- フォームに意味的なHTMLを使い、Canvasに`role="img"`を設定して子孫の操作要素を隠さない。

## 検証記録（2026-11-08）

| 項目 | 結果 |
| --- | --- |
| TypeScriptとViteの本番ビルド | 成功。既存CandleCoreはローカルの構築済みパッケージを使用 |
| ブラウザでの模擬チャート | 更新、停止中のカウント不変、再開、100 msへの変更、180点表示、リセットを確認 |
| 回転カード | 入力した文字の反映、回転中の実クリック、カウント更新、正面へ戻す操作を確認 |
| 粒子パネル | 数量・速度変更と停止を確認 |
| ライト／ダーク | 両テーマをブラウザ確認 |
| 360 / 768 CSS px | 実際にその幅のiframeビューポートを用い、操作と横方向のはみ出しがないことを確認 |
| ネイティブAPIの実行 | **未検証**。検証用ブラウザでは現在のAPIを検出できず、フォールバックで動作。NativeのPNG出力・geometry同期・前後合成の実ブラウザ検証は残る |

Playwrightの再実行用シナリオは`tests/browser/html-in-canvas.spec.ts`。この作業では共有ブラウザでの操作検証を行い、Playwrightランナーでのテスト実行は行っていません。ネイティブケースはAPIがない場合に明示的にskipし、モックを使って成功扱いにはしません。

```bash
npm run build
npx playwright test tests/browser/html-in-canvas.spec.ts
```

ブラウザが現在のAPIを搭載していることを確認してネイティブケースを実行してください。テスト前のCandleCoreセットアップはリポジトリ既存手順に従います。

## 一次資料

- [Chrome公式：HTML-in-Canvas正式提供](https://developer.chrome.com/blog/html-in-canvas)
- [Chrome公式：技術的概念・座標単位・フォールバック](https://developer.chrome.com/docs/web-platform/html-in-canvas/concepts?hl=en)
- [Chrome公式：2D描画とgeometry同期](https://developer.chrome.com/docs/web-platform/html-in-canvas/2d?hl=en)
- [WICG Explainer](https://wicg.github.io/html-in-canvas/)
- [Apache ECharts：動的更新](https://echarts.apache.org/handbook/en/how-to/data/dynamic-data/)
