---
name: performance-engineering
description: react-laboratory で性能課題を、計測→ボトルネック特定→不要処理除去→計算量改善→データ表現改善→低レイヤー高速化の順で解くための skill。特に chart / Canvas / large dataset / realtime update / React rerender / benchmark / Wasm / Worker / TypedArray 検討時に使用する。
---

# Performance Engineering

この skill は、性能改善で特定の技術を先に選ばず、**最小の複雑性で最大の実利用性能を得る**ための判断規律を定義します。

`docs/ai-rules.md` の React architecture / chart rendering rules と併用してください。特に React 側では、ライブラリ本体の性能と Lab 自身の rerender / state update / DOM 更新コストを混同しないことが重要です。

## 最重要原則

### 1. No optimization without measurement

性能問題を推測だけで修正しないでください。まず再現シナリオを固定し、baseline を作ります。

最低限、必要に応じて次を観測します。

- median / p95 / max
- dataset size
- visible item count
- update frequency
- FPS / frame time
- React render count または state 更新頻度
- allocation / memory trend（取得できる範囲）

100k / 500k / 1M のように入力規模を変え、時間の増え方から計算量も推定します。

### 2. Lab 自身が benchmark を汚染しないようにする

React state に巨大配列を保持しないでください。性能検証対象の一時データや realtime state は `useRef` 等で保持し、UI に必要な集約値だけを低頻度で state へ反映します。

避けること:

- tick ごとの React state 更新
- 1M 件のデータを JSX / DOM に展開
- chart instance の不要な再生成
- benchmark 中の不要な console 出力
- 低頻度でよい metrics の毎 frame 更新

性能表示 UI は原則 throttle / sample します。

### 3. 最適化技術より「不要な仕事」を先に探す

最初に次を確認してください。

- 非表示 / 未使用の feature を計算していないか。
- visible range よりはるかに多いデータを処理していないか。
- realtime update で全履歴を再計算していないか。
- 毎回同じ配列を copy / filter / map / sort していないか。
- renderer 用の短命 object を大量生成していないか。
- React の再レンダーが chart engine の処理より多く発生していないか。

高速な処理に置換する前に、その処理自体を消せないか判断します。

### 4. 計算量を先に落とす

CPU 命令を速くする前にアルゴリズムの計算量を改善します。

```text
O(n) full recompute
      ↓
O(1) / O(period) incremental update
```

```text
O(n) linear scan
      ↓
O(log n) boundary search + O(k) visible/result work
```

Wasm で O(n) を数倍速くするより、正しい state によって O(1) にできるなら後者を優先します。

### 5. correctness reference と fallback を残す

incremental / optimized path を導入するときは、可能なら単純な canonical path を correctness reference として残します。

次のようなケースでは full fallback を検討してください。

- history replacement
- option change
- data shrink
- 複数件 append
- previous committed item の変更
- state identity を証明できない場合

最適化より正しさを優先します。

### 6. 次に allocation と data representation を見る

計算量改善後も大量データで時間が残る場合、次を調べます。

- object allocation
- reference array copy
- temporary arrays
- Map / Set
- renderer model conversion
- TypedArray / columnar representation

ただし全面移行はしません。まず狭い内部境界で prototype し、同一 process / 同一 browser 条件で比較して効果を証明します。

### 7. 並列化・Wasm・GPU は最後に評価する

Worker / OffscreenCanvas / Wasm / WebGL / WebGPU を最初の解決策にしないでください。

採用前に確認すること:

1. CPU-bound な処理が本当に支配的か。
2. 不要処理や O(n) 再計算を既に除去したか。
3. JS ↔ Worker / Wasm の転送コストを含めても改善するか。
4. 初期化、bundle size、fallback、browser support の複雑性に見合うか。

要求性能を既存アーキテクチャで満たしているなら `DEFER` / `REJECT` も正しい判断です。

## React / CandleCore Lab 固有の規律

CandleCore の性能を確認するとき、次を分離して測定します。

```text
データ生成時間
chart.setData() 時間
chart.updateTick() 時間
render / FPS
React UI 更新時間
```

`setData()` benchmark にデータ生成時間を混ぜないでください。大規模 dataset は事前生成または生成時間を別 metric として記録します。

Realtime stress では、少なくとも次を分けます。

- same-bucket update
- new-bucket append
- hidden indicators
- visible heavy indicators
- burst update

## 採否ループ

性能改善は次の順で進めます。

```text
baseline
   ↓
instrumentation
   ↓
hot-path decomposition
   ↓
one dominant hypothesis
   ↓
small scoped implementation
   ↓
correctness test
   ↓
same-boundary benchmark
   ↓
ADOPT / REWORK / DEFER
```

一度に複数の高速化を入れないでください。改善後に最大 hot path は移動するため、必ず再計測して次を決めます。

## 報告形式

性能変更後は少なくとも次を報告します。

- 変更前 / 変更後の同じ境界の数値
- sample 数と環境
- median / p95
- correctness 確認方法
- trade-off / regression
- 次の最大 hot path
- 次に採用する案、または止める理由

「速くなった」だけでは完了にしません。
