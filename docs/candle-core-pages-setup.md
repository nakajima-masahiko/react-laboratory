# CandleCore Lab を GitHub Pages で動かす設定

## エラー: `Write access to repository not granted` / 403

これは **write 権限が足りない** という意味ではなく、
**トークンがその private リポジトリを読めない** ときに出るメッセージです。

## 手順 A（推奨）: PAT を正しく作る

### 1. Fine-grained token を作成

1. https://github.com/settings/personal-access-tokens/new
2. Token name: `candle-core-read-pages`
3. Resource owner: **あなたのユーザー**（`nakajima-masahiko`）
4. Repository access: **Only select repositories** → **`candle-core` だけ**
5. Repository permissions:
   - **Contents**: **Read-only**
6. Generate token → 値をコピー

### 2. Secret に登録

1. https://github.com/nakajima-masahiko/react-laboratory/settings/secrets/actions
2. **New repository secret**
3. Name: `CANDLE_CORE_READ_TOKEN`（完全一致）
4. Secret: コピーしたトークン
5. Add secret

### 3. 再デプロイ

https://github.com/nakajima-masahiko/react-laboratory/actions
→ **Deploy to GitHub Pages** → **Run workflow**

## 手順 B: candle-core を Public にする

PAT が難しい場合:

1. https://github.com/nakajima-masahiko/candle-core/settings
2. 一番下 **Danger Zone** → **Change repository visibility** → **Public**
3. その後、Deploy workflow を再実行

Public にすれば `CANDLE_CORE_READ_TOKEN` なしでも clone できます
（このリポジトリの workflow は現状 secret 必須なので、Public 化後は workflow から token を外す変更も可能です）。

## 確認 URL

https://nakajima-masahiko.github.io/react-laboratory/#/experiment/candle-core-lab
