import { useEffect, useRef, useState } from 'react';
import * as Progress from '@radix-ui/react-progress';
import * as Toast from '@radix-ui/react-toast';
import './styles.css';

function TimerProgressToast() {
  const [duration, setDuration] = useState(10);
  const [remaining, setRemaining] = useState(10);
  const [running, setRunning] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const percentage = duration > 0 ? ((duration - remaining) / duration) * 100 : 0;

  useEffect(() => {
    if (!running) return;

    intervalRef.current = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setRunning(false);
          setToastOpen(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    };
  }, [running]);

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(1, Math.min(3600, parseInt(e.target.value) || 1));
    setDuration(val);
    setRemaining(val);
  };

  const handleStart = () => setRunning(true);
  const handlePause = () => setRunning(false);
  const handleReset = () => {
    setRunning(false);
    setRemaining(duration);
  };

  const isFinished = remaining === 0;
  const isIdle = !running && remaining === duration;

  return (
    <Toast.Provider swipeDirection="up" duration={6000}>
      <div className="tpt-lab">
        <h2>Timer Progress Toast</h2>
        <p>秒数を入力してタイマーをスタート。終了するとトーストで通知します。</p>

        <div className="tpt-input-row">
          <label htmlFor="tpt-duration">秒数</label>
          <input
            id="tpt-duration"
            type="number"
            min={1}
            max={3600}
            value={duration}
            onChange={handleDurationChange}
            disabled={running}
            className="tpt-number-input"
          />
          <span className="tpt-unit-label">秒</span>
        </div>

        <div className="tpt-timer-display">
          <span className="tpt-remaining">{remaining}</span>
          <span className="tpt-timer-unit">秒</span>
        </div>

        <Progress.Root value={percentage} max={100} className="tpt-progress-root">
          <Progress.Indicator
            className="tpt-progress-indicator"
            style={{ transform: `translateX(-${100 - percentage}%)` }}
          />
        </Progress.Root>

        <div className="tpt-controls">
          {running ? (
            <button onClick={handlePause} className="tpt-btn tpt-btn-pause">
              一時停止
            </button>
          ) : (
            <button
              onClick={handleStart}
              disabled={isFinished}
              className="tpt-btn tpt-btn-start"
            >
              {isIdle ? 'スタート' : isFinished ? '終了' : '再開'}
            </button>
          )}
          <button
            onClick={handleReset}
            disabled={isIdle}
            className="tpt-btn tpt-btn-reset"
          >
            リセット
          </button>
        </div>
      </div>

      <Toast.Root open={toastOpen} onOpenChange={setToastOpen} className="tpt-toast">
        <div className="tpt-toast-body">
          <Toast.Title className="tpt-toast-title">タイマー終了</Toast.Title>
          <Toast.Description className="tpt-toast-desc">
            {duration}秒のタイマーが終了しました！
          </Toast.Description>
        </div>
        <Toast.Close className="tpt-toast-close">閉じる</Toast.Close>
      </Toast.Root>

      <Toast.Viewport className="tpt-toast-viewport" />
    </Toast.Provider>
  );
}

export default TimerProgressToast;
