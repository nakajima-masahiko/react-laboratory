import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import './styles.css';

function DialogLaboratory() {
  const basicDialogRef = useRef<HTMLDialogElement>(null);
  const alertDialogRef = useRef<HTMLDialogElement>(null);
  const [isControlledOpen, setIsControlledOpen] = useState(false);

  useEffect(() => {
    const dialog = basicDialogRef.current;
    if (!dialog) {
      return;
    }

    const handler = () => {
      if (dialog.returnValue === 'confirm') {
        alert('保存処理をシミュレートしました。');
      }
    };

    dialog.addEventListener('close', handler);
    return () => dialog.removeEventListener('close', handler);
  }, []);

  const handleDelete = (event: FormEvent) => {
    event.preventDefault();
    alert('削除処理をシミュレートしました。');
    alertDialogRef.current?.close();
  };

  return (
    <div className="dialog-lab">
      <h2>Dialog Laboratory</h2>
      <p>
        Radix UIでよく使うダイアログパターンを模した実験室です。現在の環境制約により、
        実装はネイティブの <code>&lt;dialog&gt;</code> を使っています。
      </p>

      <section className="dialog-section">
        <h3>1. ベーシックダイアログ</h3>
        <p>モーダルを開いて、フォーム入力と保存/キャンセル操作を試せます。</p>
        <button onClick={() => basicDialogRef.current?.showModal()}>基本ダイアログを開く</button>

        <dialog ref={basicDialogRef} className="dialog-panel">
          <form method="dialog" className="dialog-content">
            <h4>プロフィール編集</h4>
            <label>
              表示名
              <input type="text" placeholder="Tanaka Taro" />
            </label>
            <label>
              自己紹介
              <textarea rows={4} placeholder="React と UI 実験が好きです" />
            </label>
            <div className="dialog-actions">
              <button value="cancel">キャンセル</button>
              <button value="confirm">保存</button>
            </div>
          </form>
        </dialog>
      </section>

      <section className="dialog-section">
        <h3>2. コントロールドダイアログ</h3>
        <p>状態管理で開閉をコントロールするパターンです。</p>
        <button onClick={() => setIsControlledOpen(true)}>開く</button>

        {isControlledOpen && (
          <div className="inline-modal-backdrop" role="presentation" onClick={() => setIsControlledOpen(false)}>
            <div
              className="inline-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="controlled-title"
              onClick={(e) => e.stopPropagation()}
            >
              <h4 id="controlled-title">設定変更</h4>
              <p>コンポーネントの外側クリックで閉じる、ESCで閉じる挙動を追加しやすい構成です。</p>
              <div className="dialog-actions">
                <button onClick={() => setIsControlledOpen(false)}>閉じる</button>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="dialog-section">
        <h3>3. アラートダイアログ</h3>
        <p>破壊的操作を確認するパターンです。</p>
        <button onClick={() => alertDialogRef.current?.showModal()}>削除確認を開く</button>

        <dialog ref={alertDialogRef} className="dialog-panel alert-panel">
          <form onSubmit={handleDelete} className="dialog-content">
            <h4>本当に削除しますか？</h4>
            <p>この操作は取り消せません。対象データが完全に削除されます。</p>
            <div className="dialog-actions">
              <button type="button" onClick={() => alertDialogRef.current?.close()}>
                戻る
              </button>
              <button type="submit">削除する</button>
            </div>
          </form>
        </dialog>
      </section>
    </div>
  );
}

export default DialogLaboratory;
