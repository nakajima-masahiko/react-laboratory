---
name: playwright-testing
description: Use when exploring a web UI, designing integration scenarios, generating or reviewing Playwright tests, or collecting browser test evidence. Follow the repository's existing test configuration.
---

# Playwright試験の共通手順

## 適用前の確認

1. 対象リポジトリのAGENTS.md、AI向けルール、package.json、Playwright設定、既存試験を読む。共通手順を理由に既存規約を置換しない。
2. 起動方法、baseURL、パスの接頭辞、認証、対象ブラウザを実ファイルから確認する。設定がなければ導入案と未確認事項を示す。
3. 本番への更新、注文、送信などを伴う操作にはダミーデータ・試験用環境を使う。資格情報や認証stateをコミットしない。

## 仕様の探索と試験設計

- 画面とAPI、ソースから「入力→処理→保存→別画面で照会」の関係を確認する。観測・仕様・推測を区別する。
- 各シナリオに前提、操作、期待結果、後始末、根拠を付ける。正常系に加え境界値、失敗、再操作、状態保持を選ぶ。
- 画面探索には利用可能なPlaywright CLIまたはMCPを使い、反復実行する回帰試験はPlaywright Testへ残す。接続ツールがない場合に観測結果を創作しない。

## 実装とレビュー

- 既存のテスト配置とfixtureを優先し、getByRoleやgetByLabel、安定したgetByTestIdを使う。
- 自動再試行するexpectを使い、固定sleep、脆いnth-child、アニメーション終了時刻への依存を避ける。
- 試験データとcontextを分離する。実通信とmockのどちらを使ったか明記する。
- 対象要件に応じてモバイル幅、テーマ、キーボード操作を確認する。未対応ブラウザを対応済みとしない。
- CanvasやチャートはDOMの存在だけで表示の正しさを保証しない。周辺UI・データ状態・必要な画像比較を組み合わせる。
- 失敗時は製品、試験、環境の問題を切り分ける。assertionの削除やskipで成功に見せない。

## 実行と証跡

- 変更に対応する最小限の試験を実行し、失敗の原因を確認する。
- 実行コマンド、実行環境、成功/失敗/未実行、trace・画像の場所、残課題を報告する。
- trace、画像、通信ログから秘密や個人情報を除き、承認された範囲だけを共有する。
- 試験実行をしていない場合は「生成済み・未実行」とする。Skill導入の成功を製品のE2E成功と混同しない。

詳細な報告形式は [証跡テンプレート](references/evidence-template.md) を参照する。
