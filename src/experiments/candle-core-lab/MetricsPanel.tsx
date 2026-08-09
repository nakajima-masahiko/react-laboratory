import { INDICATORS, type IndicatorVisibility, formatDatasetSize } from './config';
import type { LabMetrics } from './useCandleCoreLab';

interface MetricsPanelProps {
  datasetSize: number;
  metrics: LabMetrics;
  visible: IndicatorVisibility;
}

const formatMetric = (value: number | null, digits = 1) => value == null ? '—' : value.toFixed(digits);

export function MetricsPanel({ datasetSize, metrics, visible }: MetricsPanelProps) {
  const enabled = INDICATORS.filter(item => visible[item.key]).map(item => item.label);
  const renderStats = metrics.renderStats ? Object.entries(metrics.renderStats) : [];
  const range = metrics.visibleRange;
  const formatTime = (time: number | undefined) => time == null ? '—' : new Date(time).toISOString();
  const visibleBars = range ? Math.max(1, Math.round((range.to - range.from) / 60_000) + 1) : null;
  return (
    <>
      <section className="ccl-metrics" aria-label="Performance metrics">
        <Metric label="Dataset size" value={formatDatasetSize(datasetSize)} />
        <Metric label="setData duration" value={`${metrics.setDataMs.toFixed(1)} ms`} />
        <Metric label="Data generation" value={`${metrics.generationMs.toFixed(1)} ms`} />
        <Metric label="FPS" value={String(metrics.fps)} />
        <Metric label="Ticks sent" value={metrics.ticksSent.toLocaleString()} />
        <Metric label="Burst elapsed" value={`${formatMetric(metrics.burstElapsedMs)} ms`} />
        <Metric label="Effective ticks/sec" value={formatMetric(metrics.effectiveTicksPerSecond, 0)} />
        <Metric label="Bars" value={metrics.barCount.toLocaleString()} />
        <Metric label="Latest spread" value={formatMetric(metrics.spread, 4)} />
        <Metric label="Range start" value={formatTime(range?.from)} />
        <Metric label="Range end" value={formatTime(range?.to)} />
        <Metric label="Approx. visible bars" value={visibleBars?.toLocaleString() ?? '—'} />
      </section>
      <section className="ccl-diagnostics" aria-labelledby="ccl-diagnostics-heading">
        <div>
          <h3 id="ccl-diagnostics-heading">Public RenderStats</h3>
          {renderStats.length ? (
            <dl>{renderStats.map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{String(value)}</dd></div>)}</dl>
          ) : <p>No render statistics reported yet.</p>}
        </div>
        <div>
          <h3>Enabled indicators</h3>
          <p>{enabled.length ? enabled.join(', ') : 'Base only (none)'}</p>
        </div>
      </section>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="ccl-metric"><span>{label}</span><strong>{value}</strong></div>;
}
