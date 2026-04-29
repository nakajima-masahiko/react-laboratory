import type { StackedDataPoint, StackedSeries } from '../types';

const warned = new Set<string>();

function warnOnce(message: string, payload: unknown) {
  if (!import.meta.env.DEV || warned.has(message)) return;
  warned.add(message);
  console.warn(message, payload);
}

export function sanitizeStackedValue(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  if (value < 0) {
    warnOnce('[StackedBarWindowChart] 負値は未対応のため 0 として処理しました。', { value });
    return 0;
  }
  return value;
}

export function sanitizeChartData<Key extends string>(
  data: StackedDataPoint<Key>[],
  series: ReadonlyArray<StackedSeries<Key>>,
): StackedDataPoint<Key>[] {
  return data.map((row) => {
    const sanitizedValues = {} as Record<Key, number>;
    for (const item of series) {
      const raw = row.values[item.key];
      if (raw == null) {
        warnOnce('[StackedBarWindowChart] 欠損値(null/undefined)は 0 として処理しました。', { key: item.key });
      }
      sanitizedValues[item.key] = sanitizeStackedValue(raw);
    }
    return { ...row, values: sanitizedValues };
  });
}
