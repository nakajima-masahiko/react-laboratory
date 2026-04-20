import { useCallback, useEffect, useRef, useState } from 'react';
import * as RadixToast from '@radix-ui/react-toast';
import './styles.css';

// ---- Types ----

type NotificationMode = 'toast' | 'dialog';

interface NotifyOptions {
  title: string;
  message: string;
}

// ---- useNotifier ----
// 呼び出し側は notifySuccess() を呼ぶだけ。
// toast か dialog かの切り替えはこのフックが内部で吸収する。

function useNotifier(mode: NotificationMode) {
  const [content, setContent] = useState<NotifyOptions>({ title: '', message: '' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastKey, setToastKey] = useState(0);

  const notifySuccess = useCallback(
    (opts: NotifyOptions) => {
      setContent(opts);
      if (mode === 'dialog') {
        setDialogOpen(true);
      } else {
        // key を変えて SuccessToast を再マウントし、連続呼び出しでも新しいトーストを出す
        setToastKey((k) => k + 1);
        setToastOpen(true);
      }
    },
    [mode],
  );

  return { notifySuccess, content, dialogOpen, setDialogOpen, toastOpen, setToastOpen, toastKey };
}

// ---- ResultDialog ----
// 保存完了などの結果を通知するモーダルダイアログ。
// ネイティブ <dialog> で実装し、open prop の変化を useEffect で同期する。

interface ResultDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

function ResultDialog({ open, onClose, title, message }: ResultDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog ref={ref} className="nsw-dialog" onClose={onClose}>
      <div className="nsw-dialog-content">
        <div className="nsw-dialog-icon" aria-hidden="true">
          ✓
        </div>
        <h4 className="nsw-dialog-title">{title}</h4>
        <p className="nsw-dialog-message">{message}</p>
        <div className="nsw-dialog-actions">
          <button className="nsw-btn-primary" onClick={onClose}>
            閉じる
          </button>
        </div>
      </div>
    </dialog>
  );
}

// ---- SuccessToast ----
// 成功通知を右下に数秒表示するトースト。
// 親から key を変えて渡すことで、連続呼び出し時も新しいトーストが出る。

interface SuccessToastProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
}

function SuccessToast({ open, onOpenChange, title, message }: SuccessToastProps) {
  return (
    <RadixToast.Root
      className="nsw-toast"
      open={open}
      onOpenChange={onOpenChange}
      duration={3000}
    >
      <div className="nsw-toast-icon" aria-hidden="true">
        ✓
      </div>
      <div className="nsw-toast-body">
        <RadixToast.Title className="nsw-toast-title">{title}</RadixToast.Title>
        <RadixToast.Description className="nsw-toast-desc">{message}</RadixToast.Description>
      </div>
      <RadixToast.Close className="nsw-toast-close" aria-label="閉じる">
        ×
      </RadixToast.Close>
    </RadixToast.Root>
  );
}

// ---- NotificationSwitchLaboratory ----

function NotificationSwitchLaboratory() {
  const [mode, setMode] = useState<NotificationMode>('toast');
  const { notifySuccess, content, dialogOpen, setDialogOpen, toastOpen, setToastOpen, toastKey } =
    useNotifier(mode);

  const handleSave = () => {
    notifySuccess({ title: '保存完了', message: '保存しました。' });
  };

  return (
    <RadixToast.Provider swipeDirection="right">
      <div className="nsw-root">
        <h2>Notification Switch Laboratory</h2>
        <p className="nsw-lead">
          通知方式を <strong>Toast</strong> / <strong>Dialog</strong>{' '}
          で切り替えられる実験室です。画面は <code>notifySuccess()</code>{' '}
          を呼ぶだけで、表示方式の切替は <code>useNotifier</code> が内部で吸収します。
        </p>

        <section className="nsw-section">
          <h3>通知方式</h3>
          <div className="nsw-mode-toggle" role="group" aria-label="通知方式の選択">
            {(['toast', 'dialog'] as const).map((m) => (
              <label
                key={m}
                className={`nsw-mode-label${mode === m ? ' nsw-mode-label--active' : ''}`}
              >
                <input
                  type="radio"
                  name="notificationMode"
                  value={m}
                  checked={mode === m}
                  onChange={() => setMode(m)}
                  className="nsw-mode-radio"
                />
                {m === 'toast' ? 'Toast（画面端・数秒で消える）' : 'Dialog（モーダルで確認）'}
              </label>
            ))}
          </div>
        </section>

        <section className="nsw-section">
          <h3>通知を発火する</h3>
          <p className="nsw-current-mode">
            現在のモード：
            <strong className="nsw-mode-badge">{mode === 'toast' ? 'Toast' : 'Dialog'}</strong>
          </p>
          <button className="nsw-btn-primary" onClick={handleSave}>
            保存成功通知を表示
          </button>
        </section>

        {/* 通知の出口 — 開閉状態は useNotifier が管理する */}
        <ResultDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title={content.title}
          message={content.message}
        />

        <SuccessToast
          key={toastKey}
          open={toastOpen}
          onOpenChange={setToastOpen}
          title={content.title}
          message={content.message}
        />

        <RadixToast.Viewport className="nsw-toast-viewport" />
      </div>
    </RadixToast.Provider>
  );
}

export default NotificationSwitchLaboratory;
