import { fpsTone } from './config';
import { LabControls } from './LabControls';
import { MetricsPanel } from './MetricsPanel';
import { useCandleCoreLab } from './useCandleCoreLab';
import './styles.css';

function CandleCoreLab() {
  const lab = useCandleCoreLab();
  const tone = fpsTone(lab.metrics.fps);

  return (
    <main className="ccl-lab">
      <header className="ccl-header">
        <div>
          <p className="ccl-eyebrow">Feature / performance verification console</p>
          <h2>CandleCore Lab</h2>
        </div>
        <div className="ccl-header-badges">
          <span className={`ccl-fps-badge ccl-fps-badge--${tone}`} title="Live FPS from CandleChart.getFPS()">
            FPS {lab.metrics.fps}
          </span>
          {lab.isBusy && (
            <span className="ccl-busy" role="status">
              Running…
            </span>
          )}
        </div>
      </header>

      <section className="ccl-scenarios" aria-labelledby="ccl-scenarios-heading">
        <h3 id="ccl-scenarios-heading">Scenario presets</h3>
        <div className="ccl-button-row">
          <button type="button" onClick={() => void lab.runScenario('a')} disabled={lab.isBusy}>
            A · 1M initial load
          </button>
          <button type="button" onClick={() => void lab.runScenario('b')} disabled={lab.isBusy}>
            B · 100k all indicators
          </button>
          <button type="button" onClick={() => void lab.runScenario('c')} disabled={lab.isBusy}>
            C · realtime stress
          </button>
          <button type="button" onClick={() => void lab.runScenario('d-base')} disabled={lab.isBusy}>
            D1 · Base only
          </button>
          <button type="button" onClick={() => void lab.runScenario('d-all')} disabled={lab.isBusy}>
            D2 · All visible
          </button>
          <button type="button" onClick={() => void lab.runScenario('e')} disabled={lab.isBusy}>
            E · 1M Navigator
          </button>
          <button type="button" onClick={() => void lab.runScenario('f')} disabled={lab.isBusy}>
            F · Inspect
          </button>
          <button type="button" onClick={() => void lab.runScenario('g')} disabled={lab.isBusy}>
            G · Range sync
          </button>
          <button type="button" onClick={() => void lab.runScenario('h')} disabled={lab.isBusy}>
            H · Perf stress 50k+60tps
          </button>
        </div>
        <p>{lab.scenarioNote}</p>
      </section>

      <LabControls {...lab} />
      <MetricsPanel datasetSize={lab.datasetSize} metrics={lab.metrics} visible={lab.visible} />

      <section className="ccl-chart-shell" aria-label="CandleCore chart">
        <div ref={lab.hostRef} className="ccl-chart" />
      </section>

      <aside className="ccl-note">
        <strong>Measurement boundary:</strong> data generation and synchronous <code>setData()</code> duration are
        shown separately; neither metric represents render completion. Metrics are sampled every 300 ms so React does
        not update on every tick. FPS min/avg use a rolling ~6 s window. Scenario H loads 50k + Trend overlays and keeps
        60 ticks/sec running for continuous stress observation.
      </aside>
    </main>
  );
}

export default CandleCoreLab;
