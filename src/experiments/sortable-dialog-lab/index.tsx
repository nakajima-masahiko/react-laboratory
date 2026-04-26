import { useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { DragHandleDots2Icon, Cross2Icon } from '@radix-ui/react-icons';
import './styles.css';

type Item = {
  id: string;
  label: string;
};

const INITIAL_ITEMS: Item[] = [
  { id: 'item-1', label: 'ユーザー管理' },
  { id: 'item-2', label: '売上レポート' },
  { id: 'item-3', label: '請求処理' },
  { id: 'item-4', label: '通知設定' },
  { id: 'item-5', label: 'アクセス監査' },
];

function moveItem(items: Item[], fromId: string, toId: string): Item[] {
  const fromIndex = items.findIndex((item) => item.id === fromId);
  const toIndex = items.findIndex((item) => item.id === toId);

  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
    return items;
  }

  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

function SortableDialogLab() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const orderedLabels = useMemo(() => items.map((item) => item.label).join(' → '), [items]);

  return (
    <div className="sortable-dialog-lab">
      <h2>Sortable Dialog Lab</h2>
      <p>Radix UI Dialog 内で、ハンドルをつかんで項目の並び替えを試せます。</p>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <button type="button">並び替えダイアログを開く</button>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="sdl-overlay" />
          <Dialog.Content className="sdl-content" aria-describedby="sdl-description">
            <Dialog.Title className="sdl-title">表示順を並び替え</Dialog.Title>
            <Dialog.Description id="sdl-description" className="sdl-description">
              左のハンドルからドラッグして、項目の表示順を変更できます。
            </Dialog.Description>

            <ul className="sdl-list" aria-label="並び替え対象リスト">
              {items.map((item) => (
                <li
                  key={item.id}
                  className={`sdl-item ${draggingId === item.id ? 'is-dragging' : ''}`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    if (draggingId && draggingId !== item.id) {
                      setItems((current) => moveItem(current, draggingId, item.id));
                    }
                  }}
                  onDrop={(event) => event.preventDefault()}
                >
                  <button
                    type="button"
                    className="sdl-handle"
                    draggable
                    aria-label={`${item.label} をドラッグして並び替え`}
                    onDragStart={() => setDraggingId(item.id)}
                    onDragEnd={() => setDraggingId(null)}
                  >
                    <DragHandleDots2Icon />
                  </button>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>

            <div className="sdl-actions">
              <button type="button" onClick={() => setItems(INITIAL_ITEMS)}>
                初期化（リセット）
              </button>
              <Dialog.Close asChild>
                <button type="button" className="sdl-primary">
                  完了
                </button>
              </Dialog.Close>
            </div>

            <Dialog.Close asChild>
              <button type="button" className="sdl-close" aria-label="閉じる">
                <Cross2Icon />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <section className="sdl-preview">
        <h3>現在の順序</h3>
        <p>{orderedLabels}</p>
      </section>
    </div>
  );
}

export default SortableDialogLab;
