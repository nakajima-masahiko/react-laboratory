import { useMemo, useState } from 'react';
import { DayPicker, type DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import './styles.css';

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
  const [singleDate, setSingleDate] = useState<Date | undefined>(new Date());
  const [multipleDates, setMultipleDates] = useState<Date[] | undefined>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const selectedCount = useMemo(() => multipleDates?.length ?? 0, [multipleDates]);

  return (
    <div className="daypicker-lab">
      <h2>DayPicker Laboratory</h2>
      <p>React DayPicker を使って、単一日付・複数日付・期間選択の挙動をまとめて試せる実験室です。</p>

      <section className="picker-section">
        <h3>1. 単一日付の取得</h3>
        <DayPicker mode="single" selected={singleDate} onSelect={setSingleDate} />
        <p>選択した日付: {formatDate(singleDate)}</p>
      </section>

      <section className="picker-section">
        <h3>2. 複数日付の取得</h3>
        <DayPicker mode="multiple" selected={multipleDates} onSelect={(value: Date[] | undefined) => setMultipleDates(value ?? [])} />
        <p>選択した件数: {selectedCount} 件</p>
      </section>

      <section className="picker-section">
        <h3>3. 期間の取得（Range）</h3>
        <DayPicker mode="range" numberOfMonths={2} selected={dateRange} onSelect={setDateRange} />
        <p>開始日: {formatDate(dateRange?.from)}</p>
        <p>終了日: {formatDate(dateRange?.to)}</p>
      </section>
    </div>
  );
}

export default DayPickerLaboratory;
