import * as Checkbox from '@radix-ui/react-checkbox';
import { CheckIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import './styles.css';

interface CheckItem {
  id: string;
  label: string;
}

interface Category {
  title: string;
  items: CheckItem[];
}

const CATEGORIES: Category[] = [
  {
    title: 'Tomcat 基本設定',
    items: [
      { id: 'tc-01', label: 'server.xml のポート番号が適切に設定されている' },
      { id: 'tc-02', label: 'URIEncoding="UTF-8" が Connector に設定されている' },
      { id: 'tc-03', label: 'maxThreads が本番負荷に合わせて調整されている' },
      { id: 'tc-04', label: 'connectionTimeout が適切に設定されている' },
      { id: 'tc-05', label: '不要なデフォルト Web アプリ（examples / manager / host-manager）が削除されている' },
      { id: 'tc-06', label: 'セッションタイムアウトが web.xml で適切に設定されている' },
    ],
  },
  {
    title: 'React ビルド・フロントエンド設定',
    items: [
      { id: 'fe-01', label: 'npm run build でプロダクションビルドが正常に完了する' },
      { id: 'fe-02', label: '環境変数（VITE_* / REACT_APP_*）が本番用に設定されている' },
      { id: 'fe-03', label: 'API のベース URL が本番環境に正しく設定されている' },
      { id: 'fe-04', label: 'ソースマップが本番ビルドでは無効化されている' },
      { id: 'fe-05', label: 'コード分割・Tree Shaking によりバンドルサイズが最適化されている' },
      { id: 'fe-06', label: '依存ライブラリに既知の脆弱性がないか npm audit で確認済み' },
    ],
  },
  {
    title: 'デプロイ・配信設定',
    items: [
      { id: 'dp-01', label: 'React ビルド成果物が Tomcat の webapps 以下に正しく配置されている' },
      { id: 'dp-02', label: 'web.xml に SPA ルーティング対応の URL リライト設定がある' },
      { id: 'dp-03', label: 'JS / CSS 静的ファイルに長期キャッシュ（Cache-Control: max-age）が設定されている' },
      { id: 'dp-04', label: 'index.html のキャッシュが無効化されている（Cache-Control: no-cache）' },
      { id: 'dp-05', label: 'Tomcat の GZip 圧縮（compression="on"）が有効になっている' },
      { id: 'dp-06', label: 'カスタムエラーページ（404 / 500）が設定されている' },
    ],
  },
  {
    title: 'CORS・API 連携設定',
    items: [
      { id: 'api-01', label: 'Tomcat の CorsFilter が web.xml に正しく設定されている' },
      { id: 'api-02', label: '許可オリジン（allowedOrigins）が本番ドメインのみに限定されている' },
      { id: 'api-03', label: 'リバースプロキシ（Apache / nginx）のプロキシヘッダーが正しく転送されている' },
      { id: 'api-04', label: 'HTTP → HTTPS リダイレクトが設定されている' },
    ],
  },
  {
    title: 'セキュリティ設定',
    items: [
      { id: 'sec-01', label: 'SSL/TLS 証明書が正しくインストール・設定されている' },
      { id: 'sec-02', label: 'セキュリティヘッダー（X-Frame-Options / CSP / HSTS）が設定されている' },
      { id: 'sec-03', label: 'Tomcat のバージョン情報が HTTP レスポンスに露出していない' },
      { id: 'sec-04', label: 'クロスサイトスクリプティング（XSS）対策ヘッダーが設定されている' },
      { id: 'sec-05', label: 'CSRF 対策が API・フォームで実装されている' },
    ],
  },
  {
    title: 'パフォーマンス・監視設定',
    items: [
      { id: 'perf-01', label: 'JVM ヒープサイズ（-Xms / -Xmx）が本番環境に合わせて設定されている' },
      { id: 'perf-02', label: 'Tomcat アクセスログ（AccessLogValve）が有効になっている' },
      { id: 'perf-03', label: 'アプリケーションログのローテーション設定が構成されている' },
      { id: 'perf-04', label: 'ヘルスチェックエンドポイントが設定・疎通確認済み' },
      { id: 'perf-05', label: 'JVM ガベージコレクションの設定が検討・最適化されている' },
    ],
  },
];

const ALL_IDS = CATEGORIES.flatMap((cat) => cat.items.map((item) => item.id));
const TOTAL = ALL_IDS.length;

function ReactTomcatChecklist() {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string, value: boolean) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (value) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleAll = () => {
    setChecked(checked.size === TOTAL ? new Set() : new Set(ALL_IDS));
  };

  const reset = () => setChecked(new Set());

  const done = checked.size;
  const progress = Math.round((done / TOTAL) * 100);

  return (
    <div className="rtc-lab">
      <h2>React + Tomcat 構成確認チェックリスト</h2>
      <p className="rtc-subtitle">本番デプロイ前に確認すべき 30 項目を網羅したチェックリストです。</p>

      <div className="rtc-summary">
        <div className="rtc-progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="rtc-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="rtc-progress-label">
          {done} / {TOTAL} 完了 ({progress}%)
        </span>
        <div className="rtc-actions">
          <button className="rtc-btn" onClick={toggleAll}>
            {checked.size === TOTAL ? 'すべて解除' : 'すべてチェック'}
          </button>
          <button className="rtc-btn rtc-btn-reset" onClick={reset} disabled={done === 0}>
            リセット
          </button>
        </div>
      </div>

      {CATEGORIES.map((cat) => {
        const catIds = cat.items.map((i) => i.id);
        const catDone = catIds.filter((id) => checked.has(id)).length;
        return (
          <section key={cat.title} className="rtc-category">
            <h3 className="rtc-category-title">
              {cat.title}
              <span className="rtc-cat-badge">{catDone}/{cat.items.length}</span>
            </h3>
            <ul className="rtc-list">
              {cat.items.map((item) => (
                <li key={item.id} className={`rtc-item ${checked.has(item.id) ? 'rtc-item--checked' : ''}`}>
                  <Checkbox.Root
                    id={item.id}
                    className="rtc-checkbox"
                    checked={checked.has(item.id)}
                    onCheckedChange={(val) => toggle(item.id, val === true)}
                  >
                    <Checkbox.Indicator className="rtc-indicator">
                      <CheckIcon />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                  <label htmlFor={item.id} className="rtc-label">
                    {item.label}
                  </label>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {done === TOTAL && (
        <div className="rtc-complete" role="alert">
          すべての確認項目が完了しました。デプロイの準備ができています！
        </div>
      )}
    </div>
  );
}

export default ReactTomcatChecklist;
