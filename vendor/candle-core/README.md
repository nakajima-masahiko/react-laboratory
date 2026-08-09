# candle-core (vendor slot)

GitHub Pages / CI 用の配置先です。

- CI: `.github/workflows/deploy.yml` が `nakajima-masahiko/candle-core` をここへ checkout します。
- ローカル: 次で取得してください。

```bash
# private の場合は GitHub 認証が必要です
rm -rf vendor/candle-core/src
git clone --depth 1 https://github.com/nakajima-masahiko/candle-core.git /tmp/candle-core-src
cp -R /tmp/candle-core-src/src vendor/candle-core/src
```

またはリポジトリ直下で:

```bash
npm run sync:candle-core
```
