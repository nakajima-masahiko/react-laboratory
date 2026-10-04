# ライブラリ調査メモ

期待通りに動作しないなどの理由でライブラリを調査した際に、同様の再調査を避けるための記録を残す。

## Recharts

各実験固有の Recharts 設定の詳細は、その実験フォルダ内の `recharts.md` にまとめている。

- [currency-chart-window-lab](../src/experiments/currency-chart-window-lab/recharts.md)

### `XAxis` の `tickFormatter` と `Brush` の組み合わせ

`XAxis` の `tickFormatter` は `(value, index) => string` の形で呼び出されるが、`Brush` で表示範囲を変更した場合の `index` はデータ配列全体における絶対インデックスではなく、表示中のスライス内での相対位置になる。

そのため `tickFormatter={(_, index) => data[index]?.label}` のように `index` で元データ配列を参照すると、ブラシを左右にドラッグしても目盛りのラベルが常に先頭から数えた位置のものになってしまい、表示位置に連動しない。

**対策:** `dataKey` に指定したユニークキー（`value` 側）で元データを引く。

```tsx
const monthLabelByKey = useMemo(
  () => new Map(data.map((row) => [row.key, row.monthLabel])),
  [data],
);

<XAxis
  dataKey="key"
  tickFormatter={(value: string) => monthLabelByKey.get(value) ?? ''}
/>
```

参考: `src/experiments/currency-chart-window-lab/index.tsx`

### `Brush` の幅を固定する

`Brush` の左右のハンドル（traveller）は標準でドラッグによるリサイズが可能。外部から `startIndex` / `endIndex` を渡して制御していても、`getDerivedStateFromProps` が同値検知でしか再同期しないため、`onChange` でプロパティ値を変えなければブラシ内部状態のリサイズ結果が視覚的に残る。

**対策:** `onChange` で「どのハンドルが動いたか」を現在のインデックスと比較して判定し、常に幅（`visibleMonths`）が保たれる `startIndex` を計算して state を更新する。右ハンドルが動いたと判定したときは `nextStart = endIndex - visibleMonths + 1` とすることで、`startIndex` / `endIndex` プロパティがどちらも新しい値になり Brush が再同期する。

```tsx
onChange={(range) => {
  if (typeof range.startIndex !== 'number' || typeof range.endIndex !== 'number') {
    return;
  }
  const rightEdgeMoved =
    range.startIndex === safeStartIndex && range.endIndex !== endIndex;
  const nextStart = rightEdgeMoved
    ? range.endIndex - visibleMonths + 1
    : range.startIndex;
  setStartIndex(Math.max(0, Math.min(nextStart, maxStartIndex)));
}}
```

この方式では、両端のハンドルとボディのいずれをドラッグしてもウィンドウの幅は固定され、移動のみが反映される。

参考: `src/experiments/currency-chart-window-lab/index.tsx`

## Three.js / React Three Fiber（白の宿）

`src/experiments/shiro-yado` でホテル案内の軽量3Dに使用。

- React 19 向けに `@react-three/fiber` は **9.4.2 に固定**する。9.5 以降は peer が `react: >=19 <19.3` となり、このラボの React 19.3 と衝突する。
- `@react-three/drei` v10 を併用する。
- 初回フレームが黒く残ることがあるため、`frameloop="always"` と `gl.setClearColor("#f3f0ea", 1)` を併用する。
- 館内の基本形状は箱・平面・マテリアル色が中心。館内ビューでは OrbitControls で回転・ズームし、コンシェルジュはテクスチャ付きGLBを正面固定で表示する。
- 3D 本体は `HotelStage` を動的 import し、実験一覧の初期表示を重くしない。

## ABYSS RUSH のブラウザ検証（2026-10-01）

- ゲーム本体は既存の Three.js を直接利用する。ルール・コース計算はDOMから分離し、Node上で全車の3周完走まで再現する。
- 制限付き検証環境では標準のPlaywright Chromiumダウンロードが不完全なZIPになったため、検証専用の `@sparticuz/chromium` を使用した。これはアプリ依存には追加していない。
- 同パッケージの展開で `chown /tmp/fonts` が失敗する環境では、同梱BrotliをNodeのzlibで展開し、tarを所有者変更なしで展開すると起動できる。日本語のスクリーンショットには日本語フォントとfontconfig設定も必要。
- サーバーレス向け `--single-process` は、Playwrightが最初のBrowserContextを閉じた後にブラウザ自体も終了させる場合がある。複数ケースの検証ではこの起動引数を除外する。
- ソフトウェアWebGLによるヘッドレス検証のFPSを、実機iPad/PCの性能として扱わない。実機Safariの性能確認は別途必要。

## 白の宿のGLBコンシェルジュ（2026-10-04）

- スキン付きGLBの複製には `SkeletonUtils.clone` を使う。キャッシュした原本の顔メッシュやスケルトンを直接変形すると、写真切り替えや再マウントで状態が共有される。口の変形用geometryと口内メッシュは各インスタンスが所有し、共有するGLBのテクスチャ・geometryは破棄しない。
- アニメーションミキサーの後に首の傾きを加算する場合、次のフレームのミキサー更新前に元のクォータニオンへ戻す。戻さないと回転が蓄積する。
- Web Speechの終了と中断は区別する。request IDと現在のutteranceを照合して、`cancel()` 後の古いイベントを無視する。初回の自動音声が拒否されても、再生ボタンではお辞儀を繰り返さず、クリック中に `speak()` を呼べるようにする。
- 検証環境の標準Playwrightブラウザ取得URLは不完全なZIPを返した。検証専用のPlaywright 1.56.1ではMicrosoft配信先へのフォールバックでChromiumを取得できた。アプリ依存関係には追加していない。
