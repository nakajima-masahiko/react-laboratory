# SMA WASM Benchmark

JavaScript 版と Rust/WebAssembly 版の SMA（単純移動平均）計算速度を React 上で比較する実験です。

## 目的

- React アプリケーションで WebAssembly を使う「ご利益」を、実測ベースで確かめること。
- 比較対象は **CPU 集約的な数値計算**そのもの。React の描画速度や state 更新の比較ではありません。
- 同一の疑似価格配列に対して JS / WASM の SMA カーネルを走らせ、処理時間・結果一致・速度倍率を表示します。

## 実行方法

1. 依存をインストール: `npm install`
2. WASM をビルド: `npm run build:wasm` （Rust 1.78 以降と `wasm32-unknown-unknown` ターゲット、`wasm-bindgen-cli` 0.2.99 が必要）
3. 開発サーバ: `npm run dev`
4. ブラウザで `http://localhost:5173/react-laboratory/#/experiments/sma-wasm-benchmark` を開く

`build:wasm` が出力する `src/experiments/sma-wasm-benchmark/wasm-pkg/` 配下（`sma_benchmark.js` と `sma_benchmark_bg.wasm`）はリポジトリにコミットしているので、Rust 環境が無くても **ブラウザで動作確認だけはできます**。再ビルドが必要なのは Rust 側 (`wasm/sma-benchmark`) を変更したときだけです。

## JavaScript 版と WASM 版の比較観点

- **アルゴリズム**: どちらも O(n) の rolling-sum SMA で揃えています。先頭 `window - 1` 件は NaN です。
- **入力データ**: 固定 seed の mulberry32 PRNG で生成した同じ `Float64Array` を両者に渡します。
- **境界コスト**: `Float64Array` を一括で WASM 側へ渡し、結果も `Float64Array` として一括で受け取っています。要素単位で WASM 関数を呼び出す形にすると境界コストが支配的になり、WASM の優位性が消えるため避けています。
- **計測**: ウォームアップ 1 回 + 計測 3 回の平均を表示します。`performance.now()` を使用。
- **結果一致**: NaN 同士は一致扱い。それ以外は絶対誤差 `epsilon = 1e-9` 以内で判定し、最大絶対誤差を表示します。

## WASM 初期化コストと計算時間を分ける理由

WASM の初回利用には次のコストが含まれます。

1. `.wasm` ファイルのフェッチ
2. ブラウザによるコンパイル（ストリーミングコンパイル）
3. wasm-bindgen による JS グルーのインスタンス化

これらは **アプリ全体で 1 回だけ** 発生するコストで、計算自体の速さとは無関係です。同じ画面で大量に SMA を回すユースケースでは、初回コストはすぐに償却されます。実体を見やすくするため、init コストと「2 回目以降の計算時間」を別カラムで表示しています。

## JS↔WASM 境界コストの注意

WASM の真価は「JS から WASM へ大きな配列を渡し、WASM 側でループを回し、結果配列を返す」型のワークロードで現れます。1 件ずつ JS 側からループを回して `wasm.sma_one_step(price)` のように呼ぶ設計にすると、関数呼び出しと型変換のオーバーヘッドが支配的になり、JS と差が付かない（場合によっては JS の方が速い）ことがあります。本実験ではこの落とし穴を避け、必ず配列を一括で渡しています。

## 結果の読み方

- **平均処理時間**: 純粋な SMA 計算のみの時間。WASM は init コストを含みません。
- **個別計測**: 計測 3 回の生値。GC や JIT の影響でブレます。
- **WASM init コスト**: 初回ロード時のみ反映。リロードしないと再計測されません。
- **速度倍率 (JS ÷ WASM)**: 1.0x なら同等、2.0x なら WASM が 2 倍速い。
- **最大絶対誤差**: 計算順序の差で 1e-12 程度のズレが出ることがあります。`epsilon = 1e-9` 以内なら一致扱い。

## 将来の拡張案

- **Web Worker 化**: カーネル呼び出し部分を Worker に移し、メインスレッドの固まりを完全に解消する。`benchmark.ts` のカーネルはすでに pure-data なので移植は容易。
- **OffscreenCanvas 連携**: 計算結果をそのまま OffscreenCanvas でチャート描画し、UI スレッドを開放する。
- **PixiJS / 高速チャート描画との接続**: 100 万件オーダーの SMA を毎フレーム描画するパイプラインに組み込む。
- **指標の追加**: EMA / RSI / ボリンジャーバンドなど、状態を持つ指標で同じ比較を行う（WASM の方が有利になりやすい）。
- **SIMD 対応**: `wasm32-unknown-unknown` の SIMD ターゲット（`+simd128`）でビルドして f64x2 ロード/ストアの効果を測る。

## ファイル構成

```
src/experiments/sma-wasm-benchmark/
├── index.tsx              # 実験本体 (default export)
├── README.md              # このファイル
├── benchmark.ts           # 計測ランナー (warmup + measurement)
├── compare.ts             # 結果一致チェック
├── data-generator.ts      # mulberry32 を使った再現可能な疑似価格生成
├── sma-js.ts              # JS リファレンス実装 (rolling-sum O(n))
├── styles.css             # ローカルスタイル
├── types.ts               # 共有型
├── wasm-loader.ts         # wasm-bindgen 初期化のキャッシュ + エラー扱い
└── wasm-pkg/              # `npm run build:wasm` の生成物
    ├── sma_benchmark.js
    ├── sma_benchmark.d.ts (手書き)
    └── sma_benchmark_bg.wasm

wasm/sma-benchmark/
├── Cargo.toml
└── src/lib.rs             # Rust 実装 (rolling-sum O(n))
```
