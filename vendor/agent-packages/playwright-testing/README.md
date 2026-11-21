# Playwright試験の共通Skill

APM用パッケージ。AIが既存の規約・Playwright設定に合わせて画面調査、試験設計、回帰試験、証跡の報告を進める手順です。Playwright本体、ブラウザ、MCPサーバー、テストケースは含みません。

- 原本: `.apm/skills/playwright-testing/SKILL.md`
- 報告形式: `.apm/skills/playwright-testing/references/evidence-template.md`
- 版: `apm.yml` のversionで管理します。
- 利用・更新・検証記録: 原本リポジトリの `docs/tools/apm/README.md`。

利用側にはこのディレクトリを `vendor/agent-packages/playwright-testing` として同梱し、ルートのapm.ymlからローカル依存で参照します。APM 0.36.1で展開を確認する試行構成です。
