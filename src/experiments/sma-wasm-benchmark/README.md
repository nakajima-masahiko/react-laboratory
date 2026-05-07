# SMA WASM Benchmark

JavaScript 版と Rust/WebAssembly 版でテクニカル指標の計算速度を比較する実験です。

現在は 2 つのベンチマークが入っています。

1. **単一 SMA ベンチ** — 単一の単純移動平均 (SMA) を計算して比較する従来のベンチ。
2. **複数インジケータ一括計算ベンチ** — 同じ価格配列に対して 13 系列の指標を 1 回の WASM 呼び出しでまとめて計算する新ベンチ。

## 目的

- React アプリケーションで WebAssembly を使う「ご利益」を、実測ベースで確かめること。
- 比較対象は **CPU 集約的な数値計算**そのもの。React の描画速度や state 更新の比較ではありません。
- 単一 SMA と複数インジケータの 2 ベンチを並べることで、「どんな処理形状なら WASM が効くのか」を体感する。

## 実行方法

1. 依存をインストール: `npm install`
2. WASM をビルド: `npm run build:wasm` （Rust 1.78 以降と `wasm32-unknown-unknown` ターゲット、`wasm-bindgen-cli` 0.2.99 が必要）
3. 開発サーバ: `npm run dev`
4. ブラウザで `http://localhost:5173/react-laboratory/#/experiments/sma-wasm-benchmark` を開く

`build:wasm` が出力する `src/experiments/sma-wasm-benchmark/wasm-pkg/` 配下（`sma_benchmark.js` と `sma_benchmark_bg.wasm`）はリポジトリにコミットしているので、Rust 環境が無くても **ブラウザで動作確認だけはできます**。再ビルドが必要なのは Rust 側 (`wasm/sma-benchmark`) を変更したときだけです。

## 計算する 13 系列（マルチインジケータ版）

| Idx | 指標 | 期間 |
|-----|------|------|
| 0 | SMA | 5 |
| 1 | SMA | 25 |
| 2 | SMA | 75 |
| 3 | SMA | 200 |
| 4 | EMA | 5 |
| 5 | EMA | 25 |
| 6 | EMA | 75 |
| 7 | RSI (Wilder) | 14 |
| 8 | Bollinger 中央 (= SMA) | 20 |
| 9 | Bollinger 上 (+2σ) | 20 |
| 10 | Bollinger 下 (-2σ) | 20 |
| 11 | Rolling min | 100 |
| 12 | Rolling max | 100 |

WASM 側は単一の `multi_indicators_f64(prices)` 関数を 1 回だけ呼び出し、長さ `n × 13` の `Float64Array` を 1 本返します。JS 側はそれを `subarray()` で 13 本のビューに分割するだけで、**追加コピーは発生しません**。

## SMA rolling sum 単体では JS が速い／同等になりやすい理由

V8 / SpiderMonkey などの JS エンジンは、`Float64Array` に対する単純な加算・減算ループを **ネイティブに極めて近い水準まで** 最適化します。SMA の rolling sum は次の特徴を持っているため、JIT 側にとって理想的な形です。

- 分岐がほぼ無い（境界外の NaN 埋めと初期ウィンドウ計算くらい）。
- 連続したメモリアクセスのみ（`prices[i]` と `prices[i - w]`）。
- 命令はすべて f64 加減算と乗算で、SIMD 化に準じる最適化が掛かりやすい。

つまり「SMA で WASM が遅い」のではなく、「SMA は JS でも限界近くまで高速になる」のが実態です。これに WASM 側の境界コストが乗ると、トータルで JS と差が付きにくく、場合によっては JS の方が速くなります。

## WASM が有利になる条件

- **計算が重い** — ループ回数 × 算術演算数が大きいほど、境界コストの相対比率が下がる。
- **複数の指標／処理を 1 回でまとめる** — 入力 1 回・出力 1 回しかコピーしないので、計算量が増えても境界コストは増えない。
- **メモリ局所性の良いデータ構造** — 連続したリニアメモリ、固定サイズの配列。Rust の `Vec<f64>` は理想的。
- **整数演算・ビット演算が多い** — JS の Number は f64 で表現されるため整数特化のコードでは WASM が有利。
- **複雑な制御フロー** — `if` / 内部状態 / 早期 return が混ざる処理は JIT より AOT の方が安定して速い。

## JS↔WASM 境界コスト

`wasm-bindgen --target web` で生成される JS グルーは、`Float64Array` の引数を渡すたびに次の処理を行います。

1. `__wbindgen_malloc` を呼び、WASM のリニアメモリ上に `n * 8` バイトの領域を確保。
2. JS 側の `Float64Array` を `Float64Array(wasm.memory.buffer)` 経由で **memcpy** （= 1 回コピー）。
3. WASM 側の関数を呼ぶ。
4. 戻り値の `Vec<f64>` を `getArrayF64FromWasm0().slice()` で JS ヒープへ **memcpy** （= 1 回コピー）。
5. `__wbindgen_free` で WASM 側の領域を解放。

コピー回数は **入力 1 回 + 出力 1 回** で固定です。今回のマルチインジケータ実装では、

- 入力: `n` 要素 × 8 バイト（価格配列を WASM へ）。
- 出力: `n × 13` 要素 × 8 バイト（13 系列のフラット配列を JS へ）。
- 合計: **2 回のコピー** で済みます。指標を 13 個計算しても 13 倍にはなりません。

## 配列コピーコスト

`memcpy` 自体はハードウェア的に最速の処理ですが、配列が大きくなると無視できません。たとえば 5,000,000 要素の `Float64Array` は 40 MiB あり、L2/L3 キャッシュには入りません。これを 2 回コピーするだけで、最近の x86_64 でも 10〜20 ms 程度は掛かります。

そのため、**WASM の利得 = 計算時間の削減 − 余分なコピー時間** という構造になります。
計算時間の削減が小さい（= 単純な SMA）と、コピー時間の方が大きくなり、WASM の利得が消えます。

## 1 回の WASM 呼び出しで重い処理をまとめるべき理由

たとえば「SMA を 4 種類 + EMA を 3 種類 + RSI + Bollinger + min/max」を JS↔WASM の往復で 1 つずつ呼ぶと、入力配列を 13 回コピー、出力配列を 13 回コピーすることになります（合計 26 回のコピー）。

これを 1 回の `multi_indicators_f64` 呼び出しに集約すると、コピーは **2 回** だけになります。さらに WASM 側はループや分岐の中間状態を CPU レジスタに乗せたまま回し続けられるため、メモリアクセスとキャッシュ効率の点でも有利です。

つまり「WASM を使うなら、なるべく仕事をまとめて渡す」が鉄則です。今回のマルチインジケータ版はその実例として作っています。

## 今回の実験結果の解釈

ブラウザ上で実測すると、典型的に次のような傾向になります（数値は CPU・ブラウザ・ビルドフラグでブレます）。

- **単一 SMA**: JS と WASM はほぼ同等。データ件数を増やしても倍率は概ね 0.8〜1.3x の範囲。
- **複数インジケータ (13 系列)**: WASM が安定的に **1.5〜3x 速い**。特に Bollinger Bands の rolling sum-of-squares、RSI の状態を持った逐次計算、min/max のモノトニック deque など、JIT が苦手とする処理が混ざるほど差が広がる。
- **境界コスト推定**: マルチインジケータ版では「計算なし関数」も同時に計測しており、その時間が概ねデータコピーのコスト。これを差し引いた「純粋計算時間」では、WASM の優位性がさらにはっきり見えます。
- **結果一致**: 全 13 系列で `epsilon = 1e-9` 以内に収まります。最大絶対誤差は概ね 1e-12〜1e-9 のオーダーで、IEEE 754 の丸めに起因する許容範囲内です。

## 次の候補

このベンチを起点に、以下のテーマへ拡張する案があります。

- **tick → OHLC 集約ベンチ** — 大量の tick データを 1 分足/5 分足/1 時間足の OHLC バーに集約する処理。状態 (open/high/low/close/volume) を持つので JIT が苦手で、WASM の差が出やすい。
- **画像処理ベンチ** — RGBA `Uint8ClampedArray` への畳み込み（ガウシアンぼかし、ソーベル、グレースケール変換）。SIMD 命令と組み合わせるとさらに高速化が期待できる。
- **Web Worker 化** — メインスレッドの「画面が固まる」問題を解消するために、計算自体を Worker に移す。WASM モジュールも Worker 内で再 init すれば共有できる。
- **SharedArrayBuffer + Atomics** — 入力データを Worker と共有して、コピーをさらに削れないか試す。
- **SIMD (`wasm32-unknown-unknown` + `+simd128`)** — Rolling sum / variance / min/max を `f64x2` で並列化する。

## JavaScript 版と WASM 版の比較観点

- **アルゴリズム**: JS と Rust で同一の式 / 同一の seed 規則 / 同一の rolling 構造を採用。バイト一致は無理でも、`epsilon = 1e-9` 内で必ず一致するように揃えています。
- **入力データ**: 固定 seed の mulberry32 PRNG で生成した同じ `Float64Array` を両者に渡します。
- **境界コスト**: 入力 1 回 + 出力 1 回のコピーのみ（マルチインジケータ版でも同じ）。要素単位で WASM 関数を呼ぶ実装は避けています。
- **計測**: ウォームアップ 1 回 + 計測 3 回の平均を表示します。`performance.now()` を使用。
- **結果一致**: NaN 同士は一致扱い。それ以外は絶対誤差 `epsilon = 1e-9` 以内で判定し、最大絶対誤差を表示します。

## WASM 初期化コストと計算時間を分ける理由

WASM の初回利用には次のコストが含まれます。

1. `.wasm` ファイルのフェッチ
2. ブラウザによるコンパイル（ストリーミングコンパイル）
3. wasm-bindgen による JS グルーのインスタンス化

これらは **アプリ全体で 1 回だけ** 発生するコストで、計算自体の速さとは無関係です。同じ画面で大量に計算を回すユースケースでは、初回コストはすぐに償却されます。実体を見やすくするため、init コストと「2 回目以降の計算時間」を別カラムで表示しています。

## 結果の読み方

- **平均処理時間**: 純粋な計算のみの時間。WASM は init コストを含みません。
- **個別計測**: 計測 3 回の生値。GC や JIT の影響でブレます。
- **WASM init コスト**: 初回ロード時のみ反映。リロードしないと再計測されません。
- **データ受け渡し時間 (overhead)**: マルチインジケータ版のみ。同じ入出力サイズで「計算しない」WASM 関数を呼んだ時間。≒ 境界コスト。
- **純粋計算時間**: WASM 平均 − overhead。WASM 内部での計算に近い値です（オーバーヘッドの内訳を完璧に分けることはできないので近似値）。
- **速度倍率 (JS ÷ WASM)**: 1.0x なら同等、2.0x なら WASM が 2 倍速い。
- **最大絶対誤差**: 計算順序の差で 1e-12〜1e-9 程度のズレが出ることがあります。`epsilon = 1e-9` 以内なら一致扱い。

## ファイル構成

```
src/experiments/sma-wasm-benchmark/
├── index.tsx                      # 実験本体 (default export)
├── README.md                      # このファイル
├── benchmark.ts                   # 単一 SMA ベンチの計測ランナー
├── compare.ts                     # 単一 SMA の結果一致チェック
├── data-generator.ts              # mulberry32 を使った再現可能な疑似価格生成
├── multi-benchmark.ts             # マルチインジケータベンチの計測ランナー + 比較
├── multi-indicators.ts            # 共有: INDICATOR_KEYS / NUM_SERIES / ラベル
├── multi-indicators-js.ts         # JS リファレンス実装 (13 系列まとめて)
├── multi-indicators-wasm.ts       # WASM 呼び出しの薄いアダプタ (subarray で分割)
├── sma-js.ts                      # 単一 SMA の JS リファレンス実装
├── styles.css                     # ローカルスタイル
├── types.ts                       # 共有型
├── wasm-loader.ts                 # wasm-bindgen 初期化のキャッシュ + エラー扱い
└── wasm-pkg/                      # `npm run build:wasm` の生成物
    ├── sma_benchmark.js
    ├── sma_benchmark.d.ts (手書き)
    └── sma_benchmark_bg.wasm

wasm/sma-benchmark/
├── Cargo.toml
└── src/lib.rs                     # Rust 実装 (sma_f64, multi_indicators_f64, multi_indicators_overhead_f64)
```
