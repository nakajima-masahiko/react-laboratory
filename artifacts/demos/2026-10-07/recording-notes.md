# 撮影環境・再撮影時の注意

- 撮影日: 2026-10-07（日本時間）。JSONの `recordedAt` はUTC。
- アプリのコミット: `8d253a33581d454300dbe0048b8885a6ebf73c43`。
- Playwright 1.51.1 / Chromium Headless Shell 134.0.6998.35。
- 1280×900、deviceScaleFactor 1、ja-JP、日本語フォント Noto Sans CJK JP。
- Playwright標準の `recordVideo` によるVP8/WebM。音声、チャプター、操作注釈は含まない。
- SwiftShaderによるソフトウェア描画。録画コンテナは25fpsだが、3Dアプリの実際の描画速度はそれより低い。GPU搭載端末での滑らかさや性能を測定したものではない。
- 個別のUI確認のみ実施。全実験、スマートフォン、全テーマの回帰テストは未実施。
- アプリ本体のコード、依存関係、lockfileは変更していない。

## 起動と依存関係

通常の `npm run dev` は `predev` でprivateのCandleCoreを同期・ビルドする。
今回の3実験はCandleCoreを利用しないため、`npm ci` の後にViteを直接起動した。
これは対象3実験の撮影用起動であり、CandleCoreや全体ビルドの成功を示すものではない。

```bash
npx --no-install vite --host 127.0.0.1 --port 5173
```

Viteの初回依存最適化はページを再読み込みすることがある。
録画前に対象画面を一度開いて依存最適化を済ませる。
白の宿では `@react-three/drei` の最適化後に撮り直した。
同画面の3Dモデル準備は `data-testid="concierge-model"` の
`data-model="ready"` で確認できる。
ルーティングはHashRouterなのでURLは `/react-laboratory/#/experiments/<id>` とする。

## ブラウザ準備で確認した問題

この実行環境ではPlaywright 1.62.1 / 1.58.2用のChrome取得先がZIPではない応答を返し、
展開に失敗した。Playwright 1.51.1のインストーラーでは、標準CDNの失敗後に
Microsoftの代替配布先からChromium 134とffmpegを取得できた。
これはこの環境での観測であり、各バージョン一般の不具合を意味しない。
また通常のChromeバイナリは実行環境のソケット制約で起動せず、標準のHeadless Shellを使用した。

## 録画の検証

動画のサイズ・時間・解像度を `ffprobe` で調べ、`ffmpeg` で全体をデコードする。
さらに序盤・中盤・終盤のフレームを抽出し、実際の描画と画面変化を目視確認する。
状態確認の詳細とコンソール・ネットワーク結果は各JSONを参照。

再撮影後のJSONが成功でも、モデルの表示や映像の見やすさは目視確認すること。
白の宿の音声合成・口パク同期、海中レースのゴールやAIロジック全体は今回の確認対象外。
