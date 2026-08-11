# candle-core (vendor slot)

GitHub Pages / CI 用の完全な checkout と build の配置先です。

- CI: `.github/workflows/deploy.yml` が `nakajima-masahiko/candle-core` をここへ checkout します。
- ローカル: 次で取得してください。

```bash
# private の場合は GitHub 認証が必要です
rm -rf vendor/candle-core
git clone --depth 1 https://github.com/nakajima-masahiko/candle-core.git /tmp/candle-core-src
cp -R /tmp/candle-core-src vendor/candle-core
```

またはリポジトリ直下で:

```bash
npm run sync:candle-core
npm run build:candle-core
```

React Laboratory は `src/index.ts` を直接 alias しません。CandleCore 自身の
compiler 設定で build した JavaScript / declaration package exports を使用します。
Pages workflow は同期 SHA を記録してからこの build を実行します。
