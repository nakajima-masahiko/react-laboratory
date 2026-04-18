import { useCallback, useRef, useState } from 'react';
import * as Toast from '@radix-ui/react-toast';
import './styles.css';

type ToastVariant = 'success' | 'error' | 'network' | 'info' | 'warning' | 'loading';

interface ToastItem {
  id: number;
  variant: ToastVariant;
  title: string;
  description: string;
  duration?: number;
}

type SubmitResult = 'success' | 'validation' | 'network';

const VARIANT_ICON: Record<ToastVariant, string> = {
  success: '✓',
  error: '✕',
  network: '⚡',
  info: 'i',
  warning: '!',
  loading: '⟳',
};

const VARIANT_LABEL: Record<ToastVariant, string> = {
  success: '成功',
  error: 'エラー',
  network: '通信エラー',
  info: 'お知らせ',
  warning: '警告',
  loading: '処理中',
};

function ToastNotifications() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nextResult, setNextResult] = useState<SubmitResult>('success');
  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const pushToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { id, ...toast }]);
    return id;
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (nextResult === 'validation' || !name.trim() || !email.trim()) {
      pushToast({
        variant: 'error',
        title: '登録に失敗しました',
        description: name.trim() && email.trim()
          ? 'メールアドレスの形式が正しくありません。'
          : '名前とメールアドレスを入力してください。',
      });
      return;
    }

    setSubmitting(true);
    const loadingId = pushToast({
      variant: 'loading',
      title: '送信中…',
      description: 'サーバーに登録リクエストを送っています。',
      duration: 1000000,
    });

    await new Promise((resolve) => setTimeout(resolve, 1200));
    removeToast(loadingId);

    if (nextResult === 'network') {
      pushToast({
        variant: 'network',
        title: '通信エラーが発生しました',
        description: 'サーバーに接続できません。ネットワーク接続を確認してください。',
      });
    } else {
      pushToast({
        variant: 'success',
        title: '登録が完了しました',
        description: `${name} さんのアカウントを作成しました。`,
      });
      setName('');
      setEmail('');
    }
    setSubmitting(false);
  };

  const handleInfo = () => {
    pushToast({
      variant: 'info',
      title: 'メンテナンス予定',
      description: '4/20 2:00〜4:00 にシステムメンテナンスを行います。',
    });
  };

  const handleWarning = () => {
    pushToast({
      variant: 'warning',
      title: 'パスワードの有効期限が近づいています',
      description: '残り7日でパスワードの有効期限が切れます。',
    });
  };

  return (
    <Toast.Provider swipeDirection="right" duration={5000}>
      <div className="tn-lab">
        <h2>Toast Notifications</h2>
        <p>
          Radix UI Toast を使った、登録フォームの成功・入力エラー・通信エラー通知と、
          情報・警告などの代表的なトーストパターンの実験室です。
        </p>

        <section className="tn-section">
          <h3>1. 登録フォーム</h3>
          <p>
            「次の送信結果」で挙動を切り替えられます。送信中はローディングトーストを表示し、
            結果に応じて成功・エラー・通信エラーの各トーストに差し替わります。
          </p>

          <form className="tn-form" onSubmit={handleRegister}>
            <label className="tn-field">
              <span>名前</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="山田 太郎"
                disabled={submitting}
              />
            </label>
            <label className="tn-field">
              <span>メールアドレス</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="taro@example.com"
                disabled={submitting}
              />
            </label>

            <fieldset className="tn-result-picker" disabled={submitting}>
              <legend>次の送信結果</legend>
              {(['success', 'validation', 'network'] as const).map((value) => (
                <label key={value} className="tn-radio">
                  <input
                    type="radio"
                    name="nextResult"
                    value={value}
                    checked={nextResult === value}
                    onChange={() => setNextResult(value)}
                  />
                  <span>
                    {value === 'success' && '成功'}
                    {value === 'validation' && '入力エラー'}
                    {value === 'network' && '通信エラー'}
                  </span>
                </label>
              ))}
            </fieldset>

            <button type="submit" className="tn-submit" disabled={submitting}>
              {submitting ? '送信中…' : '登録する'}
            </button>
          </form>
        </section>

        <section className="tn-section">
          <h3>2. その他の代表的なトースト</h3>
          <div className="tn-button-row">
            <button type="button" onClick={handleInfo} className="tn-btn tn-btn-info">
              お知らせトースト
            </button>
            <button type="button" onClick={handleWarning} className="tn-btn tn-btn-warning">
              警告トースト
            </button>
          </div>
        </section>

        {toasts.map((toast) => (
          <Toast.Root
            key={toast.id}
            className={`tn-toast tn-toast-${toast.variant}`}
            duration={toast.duration}
            onOpenChange={(open) => {
              if (!open) removeToast(toast.id);
            }}
          >
            <div className={`tn-toast-icon tn-toast-icon-${toast.variant}`} aria-hidden>
              {VARIANT_ICON[toast.variant]}
            </div>
            <div className="tn-toast-body">
              <Toast.Title className="tn-toast-title">
                <span className="tn-toast-badge">{VARIANT_LABEL[toast.variant]}</span>
                {toast.title}
              </Toast.Title>
              <Toast.Description className="tn-toast-desc">
                {toast.description}
              </Toast.Description>
            </div>
            <Toast.Close className="tn-toast-close" aria-label="閉じる">
              ×
            </Toast.Close>
          </Toast.Root>
        ))}

        <Toast.Viewport className="tn-toast-viewport" />
      </div>
    </Toast.Provider>
  );
}

export default ToastNotifications;
