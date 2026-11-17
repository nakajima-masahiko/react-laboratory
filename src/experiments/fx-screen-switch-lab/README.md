# FX Screen Switch — メイン画面と子画面の滑らかな切替

更新日：2026-11-17。ECharts 6.1.0（既存依存）を使用。

## 試し方

実験一覧の「FX Screen Switch — 画面切替ラボ」を開く。

- メイン画面と子画面3つを下部のバーで切り替える。チャートの横ドラッグは画面切替に使わない。
- 各画面で通貨ペア（USD/JPY・EUR/JPY・GBP/JPY・EUR/USD）、時間足（1分・5分・15分・1時間）、表示本数（60・120・240）を変更する。
- メイン画面の「子画面の設定」から、3つの子画面の条件を変更できる。子画面での変更もここに反映される。
- チャート下部のスライダー、ドラッグ・ピンチ操作で表示範囲を変更し、切替後も維持されることを確認する。通貨・時間足・本数の変更時は範囲を初期化する。
- 「一時停止」「配信再開」で模擬配信を制御する。「デモ時計」は等速・15倍速・60倍速。初期値15倍速では1分足が約4秒で進む。
- ライト／ダーク表示、矢印・Home・Endキーによるタブ選択、OSの動きを減らす設定に対応。

## 構成

外枠がメイン画面＋3チャートのiframeを保持する。切替時は既存iframeを包むパネルにCSS transformを適用する。外枠のヘッダーと切替バーは動かさない。切替に伴うiframeの再読み込みやEChartsの再生成は行わない。

中間の画面を経由せず、切替元と切替先だけを約260msでスライドする。連打時は最後の選択へ移行する。非選択画面にはinertとaria-hiddenを設定する。動きを減らす設定ではtransitionを無効にし、完了イベントに依存せず状態を確定する。

| ファイル | 責務 |
| --- | --- |
| index.tsx | 外枠・iframeの保持・切替・配信操作 |
| useScreenHost.ts | 共有模擬市場、設定の正本、画面間通知、タイマーの終了処理 |
| FrameScreen.tsx | 同じソースによる各iframeの表示、メインから子画面への設定操作 |
| FxChart.tsx | EChartsの生成・更新・サイズ調整・破棄 |
| market.ts | シード固定の分足生成、tick更新、各時間足のOHLC集計 |
| protocol.ts | 通信の型とフレームURL |
| Controls.tsx | 共通の条件選択 |
| styles.css | 実験内のテーマトークンとアニメーション |

同一オリジンのpostMessageで、origin・登録済みiframeのsource・セッションID・画面ID・操作内容を検証する。子画面は自分の条件だけ、メインは全画面の条件を変更できる。READY通知は受信リスナー登録後に送り、親の準備が間に合わなければ再試行する。

外枠が同じ模擬市場を保持するため、同じ通貨の価格は各時間足で一致する。時間足は共通の分足履歴から集計し、EChartsのローソク足には[open, close, low, high]の順で渡す。履歴の長さは上限を設ける。

非表示のiframeにはtickごとの描画データを送らず、再表示時に最新の履歴を同期する。EChartsインスタンスとdataZoomは保持する。ページ全体が非表示の間はデモ時計も止め、復帰時に最新の保持データを再送する。

## このサンプルの範囲

- すべて架空のレート。外部相場API、注文、認証、ユーザーデータ保存は利用しない。
- この実験はPCでもページ内切替を体験する。UAによる自動分岐・PCの別ウィンドウ方式・TradingViewの組込みは含まない。
- 3子画面は初めから生成済み。枠の追加・終了は対象外。
- メインのメニューはReact内の表示切替。既存業務ページへのURL遷移を実装したものではない。ただし、メインiframe自体を再読み込みしても子画面は残り、READYで再同期できる構造。
- リロードすると模擬市場と設定は初期化する。実サービスのWebSocket再接続・欠落補完やOS破棄後の永続復元を保証するものではない。
- postMessageを送受信できる同一オリジンの自社画面を想定。外部ライブラリの任意制御を意味しない。

## 検証方法

既存プロジェクトの準備（vendor/candle-coreのビルドを含む）後に実行する。

```sh
npm run build
npx eslint src/experiments/fx-screen-switch-lab src/App.tsx src/experiments/registry.ts tests/browser/fx-screen-switch.spec.ts
node --test scripts/test-fx-screen-market.mjs
npx playwright test tests/browser/fx-screen-switch.spec.ts
```

市場モデル試験の直接TypeScript読込みはNode 24で確認する想定。ブラウザ試験は既存playwright.config.tsのプレビューサーバーを利用し、1280px／390px幅で画面保持、双方向設定反映、ライブ更新、メインiframe再読込み、テーマ、動きを減らす設定、連打とキーボード操作を確認する。

検証結果はこの資料の末尾に記録する。iPhone／Android実機の描画性能やOSによる停止・復帰は別途確認が必要。

## 参照

- [ECharts：Chart Container](https://echarts.apache.org/handbook/en/concepts/chart-size/) — 初期化サイズ、resize、dispose。
- [事例の設計資料](https://github.com/nakajima-masahiko/ai-dev-playbook/tree/main/case-studies/2026-11-12-mobile-chart-screen-persistence)。

## 検証記録

- npm run build：成功（既存のチャンクサイズ警告あり）。
- 変更対象のESLint：成功。
- 市場モデル：3件成功。全通貨・全時間足・全本数のOHLC整合、tickと時間足の価格一致、シード再現性を確認。
- ブラウザ操作試験：3件成功（1280px幅、390px幅、連打・キーボード・不正送信元の拒否）。ビルド済み成果物をChromium Headless Shellで確認。iframe／EChartsインスタンス保持、双方向設定、ライブtick、メインiframe再読込み、ライト表示、動きを減らす設定、横はみ出しの有無を検証。
- 実行環境の通常Chromiumはプロセス起動時のsocket制約で起動できず、Playwright指定ブラウザのダウンロードも不完全だったため、検証用にnpmの@sparticuz/chromiumをリポジトリ外へ導入。Headless Shellの単一プロセスではブラウザ再利用時に終了する制約があったため、3試験をそれぞれ独立したブラウザプロセスで実行した。検証用の依存・設定はコミットしない。
- スマホ実機のタッチ操作・描画性能・OSによる停止／破棄：未実施。390px幅の検証は端末実機の検証を代替しない。
