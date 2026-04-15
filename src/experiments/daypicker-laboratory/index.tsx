import { useMemo, useState } from 'react';
import './styles.css';

function formatDateString(value?: string) {
  if (!value) {
    return '未選択';
  }

  const parsed = new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).format(parsed);
}

function DayPickerLaboratory() {
  const [singleDate, setSingleDate] = useState<string>('');
  const [multipleDates, setMultipleDates] = useState<string[]>([]);
  const [rangeFrom, setRangeFrom] = useState<string>('');
  const [rangeTo, setRangeTo] = useState<string>('');

  const selectedCount = useMemo(() => multipleDates.length, [multipleDates]);

  const toggleMultipleDate = (value: string) => {
    if (!value) {
      return;
    }

    setMultipleDates((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      }

      return [...prev, value].sort();
    });
  };

  return (
    <div className="daypicker-lab">
      <h2>Date Picker Laboratory</h2>
      <p>ネイティブの date input を使って、単一日付・複数日付・期間選択の挙動を試せる実験室です。</p>

      <section className="picker-section">
        <h3>1. 単一日付の取得</h3>
        <input type="date" value={singleDate} onChange={(event) => setSingleDate(event.target.value)} />
        <p>選択した日付: {formatDateString(singleDate)}</p>
      </section>

      <section className="picker-section">
        <h3>2. 複数日付の取得</h3>
        <div className="multiple-input-row">
          <input type="date" onChange={(event) => toggleMultipleDate(event.target.value)} />
          <p className="helper-text">同じ日付を再度選ぶと解除されます。</p>
        </div>
        <p>選択した件数: {selectedCount} 件</p>
        <ul className="selected-list">
          {multipleDates.map((date) => (
            <li key={date}>{formatDateString(date)}</li>
          ))}
        </ul>
      </section>

      <section className="picker-section">
        <h3>3. 期間の取得（Range）</h3>
        <div className="range-inputs">
          <label>
            開始日
            <input type="date" value={rangeFrom} onChange={(event) => setRangeFrom(event.target.value)} />
          </label>
          <label>
            終了日
            <input type="date" value={rangeTo} min={rangeFrom || undefined} onChange={(event) => setRangeTo(event.target.value)} />
          </label>
        </div>
        <p>開始日: {formatDateString(rangeFrom)}</p>
        <p>終了日: {formatDateString(rangeTo)}</p>
      </section>
    </div>
  );
}

export default DayPickerLaboratory;
