import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import * as Dialog from '@radix-ui/react-dialog';
import {
  CheckIcon,
  Cross2Icon,
  DragHandleDots2Icon,
  ResetIcon,
  Pencil2Icon,
} from '@radix-ui/react-icons';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './styles.css';

type Item = {
  id: string;
  label: string;
  hint: string;
};

const INITIAL_ITEMS: Item[] = [
  { id: 'item-1', label: 'ユーザー管理', hint: 'メンバーと権限の制御' },
  { id: 'item-2', label: '売上レポート', hint: '日次・月次のサマリー' },
  { id: 'item-3', label: '請求処理', hint: '入金確認と請求書発行' },
  { id: 'item-4', label: '通知設定', hint: '配信チャネルとルール' },
  { id: 'item-5', label: 'アクセス監査', hint: '操作ログのレビュー' },
];

type SortableRowProps = {
  item: Item;
  index: number;
  isAnyDragging: boolean;
};

function SortableRow({ item, index, isAnyDragging }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      data-item-id={item.id}
      data-dragging={isDragging || undefined}
      data-drag-state={
        isDragging ? 'active' : isAnyDragging ? 'idle' : undefined
      }
      className="sdl-item"
    >
      <span className="sdl-index" aria-hidden>
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="sdl-text">
        <span className="sdl-label">{item.label}</span>
        <span className="sdl-hint">{item.hint}</span>
      </div>
      <button
        type="button"
        ref={setActivatorNodeRef}
        className="sdl-handle"
        aria-label={`${item.label} を並び替え`}
        {...attributes}
        {...listeners}
      >
        <DragHandleDots2Icon aria-hidden />
      </button>
    </li>
  );
}

type DragPreviewProps = {
  item: Item;
  index: number;
};

function DragPreview({ item, index }: DragPreviewProps) {
  return (
    <li
      className="sdl-item"
      data-dragging
      data-drag-overlay
      style={{ listStyle: 'none' }}
    >
      <span className="sdl-index" aria-hidden>
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="sdl-text">
        <span className="sdl-label">{item.label}</span>
        <span className="sdl-hint">{item.hint}</span>
      </div>
      <span className="sdl-handle" aria-hidden>
        <DragHandleDots2Icon aria-hidden />
      </span>
    </li>
  );
}

function SortableDialogLab() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const orderedLabels = useMemo(() => items.map((item) => item.label), [items]);
  const isDirty = useMemo(
    () => items.some((item, i) => item.id !== INITIAL_ITEMS[i].id),
    [items],
  );

  const itemIds = useMemo(() => items.map((item) => item.id), [items]);

  const activeItem = activeId
    ? items.find((item) => item.id === activeId) ?? null
    : null;
  const activeIndex = activeId
    ? items.findIndex((item) => item.id === activeId)
    : -1;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    setItems((current) => {
      const fromIndex = current.findIndex((item) => item.id === active.id);
      const toIndex = current.findIndex((item) => item.id === over.id);
      if (fromIndex < 0 || toIndex < 0) return current;
      return arrayMove(current, fromIndex, toIndex);
    });
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  return (
    <div className="sortable-dialog-lab">
      <header className="sdl-header">
        <h2>Sortable Dialog Lab</h2>
        <p>
          Radix UI Dialog 内で @dnd-kit を使ってハンドルをドラッグして並び替えます。
          キーボード（Space で掴んで ↑/↓、Enter で確定、Esc で取消）にも対応。
        </p>
      </header>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <button type="button" className="sdl-trigger">
            <Pencil2Icon aria-hidden />
            <span>表示順を編集</span>
          </button>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="sdl-overlay" />
          <Dialog.Content className="sdl-content" aria-describedby="sdl-description">
            <div className="sdl-content-head">
              <div>
                <Dialog.Title className="sdl-title">表示順を並び替え</Dialog.Title>
                <Dialog.Description id="sdl-description" className="sdl-description">
                  ハンドルをドラッグするか、ハンドルにフォーカス中に Space → ↑ / ↓ → Enter で順序を変更できます。
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button type="button" className="sdl-close" aria-label="閉じる">
                  <Cross2Icon aria-hidden />
                </button>
              </Dialog.Close>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <SortableContext
                items={itemIds}
                strategy={verticalListSortingStrategy}
              >
                <ul
                  className="sdl-list"
                  data-drag-active={activeId ? 'true' : undefined}
                  aria-label="並び替え対象リスト"
                >
                  {items.map((item, index) => (
                    <SortableRow
                      key={item.id}
                      item={item}
                      index={index}
                      isAnyDragging={activeId !== null}
                    />
                  ))}
                </ul>
              </SortableContext>

              {createPortal(
                <DragOverlay>
                  {activeItem ? (
                    <DragPreview item={activeItem} index={activeIndex} />
                  ) : null}
                </DragOverlay>,
                document.body,
              )}
            </DndContext>

            <footer className="sdl-actions">
              <button
                type="button"
                className="sdl-ghost"
                onClick={() => setItems(INITIAL_ITEMS)}
                disabled={!isDirty}
              >
                <ResetIcon aria-hidden />
                <span>初期化</span>
              </button>
              <Dialog.Close asChild>
                <button type="button" className="sdl-primary">
                  <CheckIcon aria-hidden />
                  <span>完了</span>
                </button>
              </Dialog.Close>
            </footer>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <section className="sdl-preview" aria-live="polite">
        <h3>現在の順序</h3>
        <ol className="sdl-preview-list">
          {orderedLabels.map((label, index) => (
            <li key={label} className="sdl-chip">
              <span className="sdl-chip-num">{index + 1}</span>
              <span>{label}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

export default SortableDialogLab;
