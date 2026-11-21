# Playwright試験の共通Skill（APM）

原本: nakajima-masahiko/ai-dev-playbook の packages/playwright-testing。導入版は同梱パッケージのapm.ymlとapm.lock.yamlに記録されています。APM CLI 0.36.1でローカル依存の展開を確認しました。

## 使い方

Python 3.11以上を用意し、リポジトリのルートで実行します。

```powershell
python -m pip install apm-cli==0.36.1
apm install --frozen
apm audit --ci
```

Copilotへの依頼例:

> playwright-testing Skillを使って、既存のAI規約と試験設定を確認し、変更画面の試験を設計・実行してください。受入条件との対応、実行結果、未実行の条件、証跡を報告してください。

- [同梱した配布原本](../vendor/agent-packages/playwright-testing/README.md)
- [APMで展開したSkill](../.agents/skills/playwright-testing/SKILL.md)
- [証跡テンプレート](../.agents/skills/playwright-testing/references/evidence-template.md)

既存のdocs/ai-rules.md、playwright.config.ts、tests/browserを優先してください。preview実行前のビルドなど、既存の準備手順も確認します。

## 更新

ai-dev-playbookの原本を変更しversionを上げた後、同リポジトリのルートから実行します。

```powershell
python scripts/sync-playwright-skill.py --source packages/playwright-testing --consumer ../react-laboratory
```

利用側のルートに戻って、`apm install`、`apm install --frozen`、`apm audit --ci`を実行します。vendor・lock・展開ファイルを一緒にレビューしてコミットしてください。展開先だけを編集するとauditで差分を検出します。

APMは同梱原本を参照する試行構成です。原本リポジトリの最新版へ自動追従しません。Git依存へ切り替える場合は、原本リポジトリのdocs/tools/apm/README.mdの認証と移行手順を確認してください。

## 検証範囲

2026-11-21、Linux/Python 3.12/APM 0.36.1で、v0.1.0→v0.1.1の更新、空フォルダーへのfrozen復元、原本との一致、audit成功、展開後の改変に対するaudit失敗と復旧を確認しました。アプリのE2E試験、CopilotによるSkillの自動選択、Windows、Git遠隔依存、組織ポリシーは未検証です。

GitHub Actionsは取得内容と展開済みSkillの整合性を検査します。最初のauditを復元より前に行い、書き換えられた展開先を復元で隠さない構成です。CIの実行結果はPRのChecksで確認してください。
