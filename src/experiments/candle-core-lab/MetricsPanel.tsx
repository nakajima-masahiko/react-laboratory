import { INDICATORS, type IndicatorVisibility, formatDatasetSize, fpsTone } from './config';
import type { LabMetrics } from './useCandleCoreLab';

interface MetricsPanelProps {
  datasetSize: number;
  metrics: LabMetrics;
  visible: IndicatorVisibility;
}

const formatMetric = (value: number | null, digits = 1) => (value == null ? '—' : value.toFixed(digits));

export function MetricsPanel({ datasetSize, metrics, visible }: MetricsPanelProps) {
  const enabled = INDICATORS.filter(item => visible[item.key]).map(item => item.label);
  const renderStats = metrics.renderStats ? Object.entries(metrics.renderStats) : [];
  const range = metrics.visibleRange;
  const formatTime = (time: number | undefined) => (time == null ? '—' : new Date(time).toISOString());
  const visibleBars = range ? Math.max(1, Math.round((range.end - range.start) / 60_000) + 1) : null;
  const tone = fpsTone(metrics.fps);

  return (
    <>
      <section className="ccl-metrics" aria-label="Performance metrics">
        <Metric
          label="FPS (live)"
          value={String(metrics.fps)}
          tone={tone}
          emphasize
        />
        <Metric label="FPS min / avg" value={`${formatMetric(metrics.fpsMin, 0)} / ${formatMetric(metrics.fpsAvg, 0)}`} />
        <Metric label="Dataset size" value={formatDatasetSize(datasetSize)} />
        <Metric label="setData duration" value={`${metrics.setDataMs.toFixed(1)} ms`} />
        <Metric label="Data generation" value={`${metrics.generationMs.toFixed(1)} ms`} />
        <Metric label="Ticks sent" value={metrics.ticksSent.toLocaleString()} />
        <Metric label="Burst elapsed" value={`${formatMetric(metrics.burstElapsedMs)} ms`} />
        <Metric label="Effective ticks/sec" value={formatMetric(metrics.effectiveTicksPerSecond, 0)} />
        <Metric label="Bars in store" value={metrics.barCount.toLocaleString()} />
        <Metric label="Latest spread" value={formatMetric(metrics.spread, 4)} />
        <Metric label="Range start" value={formatTime(range?.start)} />
        <Metric label="Range end" value={formatTime(range?.end)} />
        <Metric label="Approx. visible bars" value={visibleBars?.toLocaleString() ?? '—'} />
      </section>
      <section className="ccl-diagnostics" aria-labelledby="ccl-diagnostics-heading">
        <div>
          <h3 id="ccl-diagnostics-heading">Public RenderStats</h3>
          {renderStats.length ? (
            <dl>
              {renderStats.map(([key, value]) => (
                <div key={key}>
                  <dt>{key}</dt>
                  <dd>{String(value)}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p>No render statistics reported yet.</p>
          )}
        </div>
        <div>
          <h3>Enabled indicators</h3>
          <p>{enabled.length ? enabled.join(', ') : 'Base only (none)'}</p>
        </div>
      </section>
    </>
  );
}

function Metric({
  label,
  value,
  tone,
  emphasize,
}: {
  label: string;
  value: string;
  tone?: 'good' | 'ok' | 'low';
  emphasize?: boolean;
}) {
  return (
    <div
      className={`ccl-metric${emphasize ? ' ccl-metric--emphasize' : ''}${tone ? ` ccl-metric--${tone}` : ''}`}
    >
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
