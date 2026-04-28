import * as Slider from '@radix-ui/react-slider';

interface WindowSliderProps {
  startIndex: number;
  maxStartIndex: number;
  rangeLabel?: string;
  onStartIndexChange: (next: number) => void;
  ariaLabels: {
    slider: string;
    prevButton: string;
    nextButton: string;
    windowControls: string;
  };
}

export function WindowSlider({
  startIndex,
  maxStartIndex,
  rangeLabel,
  onStartIndexChange,
  ariaLabels,
}: WindowSliderProps) {
  const clampedStart = Math.min(Math.max(startIndex, 0), Math.max(0, maxStartIndex));
  return (
    <div className="sbwc-controls" role="group" aria-label={ariaLabels.windowControls}>
      <button
        type="button"
        className="sbwc-nav-button"
        onClick={() => onStartIndexChange(Math.max(0, clampedStart - 1))}
        disabled={clampedStart <= 0}
        aria-label={ariaLabels.prevButton}
      >
        ‹
      </button>

      <div className="sbwc-slider-wrap">
        {rangeLabel ? <span className="sbwc-slider-label">{rangeLabel}</span> : null}
        <Slider.Root
          className="sbwc-slider-root"
          value={[clampedStart]}
          min={0}
          max={maxStartIndex}
          step={1}
          onValueChange={(values) => {
            const next = values[0];
            if (typeof next === 'number') {
              onStartIndexChange(next);
            }
          }}
          aria-label={ariaLabels.slider}
          aria-valuetext={rangeLabel}
        >
          <Slider.Track className="sbwc-slider-track">
            <Slider.Range className="sbwc-slider-range" />
          </Slider.Track>
          <Slider.Thumb className="sbwc-slider-thumb" />
        </Slider.Root>
      </div>

      <button
        type="button"
        className="sbwc-nav-button"
        onClick={() => onStartIndexChange(Math.min(maxStartIndex, clampedStart + 1))}
        disabled={clampedStart >= maxStartIndex}
        aria-label={ariaLabels.nextButton}
      >
        ›
      </button>
    </div>
  );
}
