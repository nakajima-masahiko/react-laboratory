import { useEffect, useMemo, useState } from 'react';
import type { ComponentType } from 'react';
import './styles.css';

type DateRange = {
  from?: Date;
  to?: Date;
};

type DayPickerProps = {
  mode?: 'single' | 'multiple' | 'range';
  selected?: Date | Date[] | DateRange;
  onSelect?: (value: Date | Date[] | DateRange | undefined) => void;
  numberOfMonths?: number;
};

type DayPickerModule = {
  DayPicker: ComponentType<DayPickerProps>;
};

const DAY_PICKER_JS_URL = 'https://esm.sh/react-day-picker@9.11.1?bundle';
const DAY_PICKER_CSS_URL = 'https://esm.sh/react-day-picker@9.11.1/style.css';

function loadDayPickerCss() {
  if (document.querySelector('link[data-daypicker="true"]')) {
    return;
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = DAY_PICKER_CSS_URL;
  link.dataset.daypicker = 'true';
  document.head.appendChild(link);
}

function formatDate(value?: Date) {
  if (!value) {
    return '未選択';
  }

  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).format(value);
}

function DayPickerLaboratory() {
  const [module, setModule] = useState<DayPickerModule | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [singleDate, setSingleDate] = useState<Date | undefined>(new Date());
  const [multipleDates, setMultipleDates] = useState<Date[] | undefined>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  useEffect(() => {
    loadDayPickerCss();

    void import(/* @vite-ignore */ DAY_PICKER_JS_URL)
      .then((mod) => {
        setModule({ DayPicker: mod.DayPicker as ComponentType<DayPickerProps> });
      })
      .catch((importError: unknown) => {
        setError(importError instanceof Error ? importError.message : '読み込みに失敗しました');
      });
  }, []);

  const selectedCount = useMemo(() => multipleDates?.length ?? 0, [multipleDates]);

  if (error) {
    return (
      <div className="daypicker-lab">
        <h2>DayPicker Laboratory</h2>
        <p>React DayPicker の読み込みに失敗しました。</p>
        <pre>{error}</pre>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="daypicker-lab">
        <h2>DayPicker Laboratory</h2>
        <p>React DayPicker を読み込み中です...</p>
      </div>
    );
  }

  const { DayPicker } = module;

  return (
    <div className="daypicker-lab">
      <h2>DayPicker Laboratory</h2>
      <p>React DayPicker を使って、単一日付・複数日付・期間選択の挙動をまとめて試せる実験室です。</p>

      <section className="picker-section">
        <h3>1. 単一日付の取得</h3>
        <DayPicker mode="single" selected={singleDate} onSelect={(value) => setSingleDate(value as Date | undefined)} />
        <p>選択した日付: {formatDate(singleDate)}</p>
      </section>

      <section className="picker-section">
        <h3>2. 複数日付の取得</h3>
        <DayPicker
          mode="multiple"
          selected={multipleDates}
          onSelect={(value) => setMultipleDates((value as Date[] | undefined) ?? [])}
        />
        <p>選択した件数: {selectedCount} 件</p>
      </section>

      <section className="picker-section">
        <h3>3. 期間の取得（Range）</h3>
        <DayPicker
          mode="range"
          numberOfMonths={2}
          selected={dateRange}
          onSelect={(value) => setDateRange(value as DateRange | undefined)}
        />
        <p>開始日: {formatDate(dateRange?.from)}</p>
        <p>終了日: {formatDate(dateRange?.to)}</p>
      </section>
    </div>
  );
}

export default DayPickerLaboratory;
