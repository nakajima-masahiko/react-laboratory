# dnd ライブラリ導入調査メモ（更新: 2026-04-29）

## 目的
`src/experiments/sortable-dialog-lab` で `@dnd-kit/core` への移行が失敗する原因を、npm レベルで切り分ける。

## 実行コマンドと結果

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

## npm 設定で確認できた事実
- registry は `https://registry.npmjs.org/`。
- `http-proxy` / `https-proxy` が `http://proxy:8080` に設定されている。
- `npm warn Unknown env config "http-proxy"` が毎回表示されるが、`npm config` 系コマンド自体は成功している。

## 切り分け結果
1. **npm 全体が拒否されているか**
   - **いいえ（完全拒否ではない）**。`npm config get registry` と `npm config list` は成功。
2. **特定パッケージだけ拒否されているか**
   - **いいえ（より広範囲）**。`@dnd-kit/*` だけでなく `@radix-ui/react-dialog` と非 scope の `sortablejs` / `react-sortablejs` も `npm view` で 403。
3. **scoped package の registry 解決問題か**
   - **可能性は低い**。非 scope パッケージ (`sortablejs`, `react-sortablejs`) も同様に 403 のため、scope 固有の解決失敗とは整合しない。
4. **依存先 tarball 取得で失敗しているか**
   - **今回の観測だけでは該当しない**。失敗はすべて `npm view` の metadata 取得（registry API への GET）段階で発生しており、tarball ダウンロードまで到達していない。

## 暫定結論
- 問題は `@dnd-kit` 固有ではなく、現在の npm レジストリアクセス制御（またはプロキシ/セキュリティポリシー）により、複数パッケージの metadata 取得が 403 で拒否されている状態。
- `package.json` は変更せず、レジストリアクセス許可の見直しが必要。
