import type { RefObject } from 'react';
import type { CandleChart } from 'candle-core';
import {
  DATASET_SIZES,
  INDICATORS,
  type DatasetSize,
  type IndicatorKey,
  type IndicatorPreset,
  type IndicatorVisibility,
  type InteractionMode,
  type RangePreset,
  type RealtimeMode,
  formatDatasetSize,
} from './config';

interface LabControlsProps {
  appendCandle: () => void;
  chartRef: RefObject<CandleChart | null>;
  datasetSize: DatasetSize;
  isBusy: boolean;
  interactionMode: InteractionMode;
  loadDataset: (size: DatasetSize, fit?: boolean) => Promise<void>;
  realtimeMode: RealtimeMode;
  navigator: { visible: boolean; height: number; maxOverviewPoints: number };
  reseed: () => void;
  runBurst: () => void;
  sendTick: (newBucket?: boolean) => void;
  setDatasetSize: (size: DatasetSize) => void;
  setPreset: (preset: IndicatorPreset) => void;
  setRealtimeMode: (mode: RealtimeMode) => void;
  setInteractionMode: (mode: InteractionMode) => void;
  setNavigatorHeight: (height: number) => void;
  setNavigatorMaxOverviewPoints: (value: number) => void;
  setNavigatorVisible: (visible: boolean) => void;
  showRangePreset: (preset: RangePreset) => void;
  toggleIndicator: (key: IndicatorKey) => void;
  visible: IndicatorVisibility;
}

export function LabControls(props: LabControlsProps) {
  return (
    <div className="ccl-console-grid">
      <section className="ccl-panel" aria-labelledby="ccl-dataset-heading">
        <h3 id="ccl-dataset-heading">Dataset</h3>
        <label className="ccl-field">
          <span>Size</span>
          <select value={props.datasetSize} onChange={event => props.setDatasetSize(Number(event.target.value) as DatasetSize)}>
            {DATASET_SIZES.map(size => <option key={size} value={size}>{formatDatasetSize(size)}</option>)}
          </select>
        </label>
        <button type="button" onClick={() => void props.loadDataset(props.datasetSize)} disabled={props.isBusy}>Load dataset</button>
        <button type="button" onClick={props.reseed} disabled={props.isBusy}>Reseed + load</button>
      </section>

      <section className="ccl-panel" aria-labelledby="ccl-realtime-heading">
        <h3 id="ccl-realtime-heading">Realtime stress</h3>
        <label className="ccl-field">
          <span>Rate</span>
          <select value={props.realtimeMode} onChange={event => props.setRealtimeMode(event.target.value as RealtimeMode)}>
            <option value="off">Off</option><option value="1">1 tick/sec</option>
            <option value="10">10 ticks/sec</option><option value="60">60 ticks/sec</option>
          </select>
        </label>
        <button type="button" onClick={() => void props.runBurst()} disabled={props.isBusy}>Burst 1,000 ticks</button>
      </section>

      <section className="ccl-panel ccl-operations" aria-labelledby="ccl-operations-heading">
        <h3 id="ccl-operations-heading">Operations</h3>
        <button type="button" onClick={() => props.chartRef.current?.fitContent()}>Fit Content</button>
        <button type="button" onClick={() => props.chartRef.current?.scrollBy(-100)}>Scroll left</button>
        <button type="button" onClick={() => props.chartRef.current?.scrollBy(100)}>Scroll right</button>
        <button type="button" onClick={() => props.chartRef.current?.zoomIn()}>Zoom in</button>
        <button type="button" onClick={() => props.chartRef.current?.zoomOut()}>Zoom out</button>
        <button type="button" onClick={props.appendCandle}>Append one candle</button>
        <button type="button" onClick={() => props.sendTick(false)}>Same-bucket tick</button>
        <button type="button" onClick={() => props.sendTick(true)}>New-bucket tick</button>
        <span className="ccl-control-group" aria-label="Visible range presets">
          <button type="button" onClick={() => props.showRangePreset('first')}>First 10%</button>
          <button type="button" onClick={() => props.showRangePreset('middle')}>Middle 10%</button>
          <button type="button" onClick={() => props.showRangePreset('last')}>Last 10%</button>
        </span>
      </section>

      <section className="ccl-panel" aria-labelledby="ccl-interaction-heading">
        <h3 id="ccl-interaction-heading">Interaction mode</h3>
        <div className="ccl-button-row">
          {(['pan', 'inspect'] as const).map(mode => (
            <button key={mode} type="button" aria-pressed={props.interactionMode === mode}
              data-active={props.interactionMode === mode} onClick={() => props.setInteractionMode(mode)}>
              {mode === 'pan' ? 'Pan' : 'Inspect'}
            </button>
          ))}
        </div>
        <p className="ccl-guidance">In Inspect, press in the plot to pin the nearest candle, drag candle-by-candle, and release to keep it pinned. Press outside the plot to clear it.</p>
      </section>

      <section className="ccl-panel" aria-labelledby="ccl-navigator-heading">
        <h3 id="ccl-navigator-heading">Data View Navigator</h3>
        <button type="button" aria-pressed={props.navigator.visible} data-active={props.navigator.visible}
          onClick={() => props.setNavigatorVisible(!props.navigator.visible)}>
          {props.navigator.visible ? 'Visible' : 'Hidden'}
        </button>
        <label className="ccl-field"><span>Height</span><input type="number" min="48" max="160" step="4"
          value={props.navigator.height} onChange={event => props.setNavigatorHeight(event.currentTarget.valueAsNumber)} /></label>
        <label className="ccl-field"><span>Overview points</span><input type="number" min="200" max="5000" step="100"
          value={props.navigator.maxOverviewPoints} onChange={event => props.setNavigatorMaxOverviewPoints(event.currentTarget.valueAsNumber)} /></label>
      </section>

      <section className="ccl-panel ccl-indicators" aria-labelledby="ccl-indicators-heading">
        <h3 id="ccl-indicators-heading">Indicator visibility</h3>
        <div className="ccl-button-row" aria-label="Indicator presets">
          <button type="button" onClick={() => props.setPreset('base')}>Base only</button>
          <button type="button" onClick={() => props.setPreset('trend')}>Trend</button>
          <button type="button" onClick={() => props.setPreset('momentum')}>Momentum</button>
          <button type="button" onClick={() => props.setPreset('all')}>All visible</button>
        </div>
        <div className="ccl-button-row" aria-label="Individual indicators">
          {INDICATORS.map(indicator => (
            <button key={indicator.key} type="button" data-active={props.visible[indicator.key]}
              aria-pressed={props.visible[indicator.key]} onClick={() => props.toggleIndicator(indicator.key)}>
              {indicator.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
