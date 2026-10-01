import { useState } from "react";
import type { Difficulty } from "./engine";
import { useRace } from "./use-race";
import { RaceHud } from "./RaceHud";
import { RaceMenus, StartScreen } from "./RaceMenus";
import "./styles.css";
export default function AbyssRush() {
  const {
    host,
    race,
    view,
    error,
    light,
    setLight,
    audio,
    auto,
    setAuto,
    press,
    release,
    toggleAudio,
    retry,
    dismissError,
  } = useRace();
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [help, setHelp] = useState(false);
  const active = race.phase === "racing" || race.phase === "countdown";
  const start = () => {
    release();
    race.start(difficulty);
  };
  return (
    <main
      className="abyss-rush"
      data-testid="abyss-rush"
      data-phase={race.phase}
      onKeyDownCapture={(e) => {
        if (e.key === "Escape" && help) {
          e.preventDefault();
          e.stopPropagation();
          setHelp(false);
          release();
          race.resume();
        }
        if (e.key === "Tab") {
          const dialog = e.currentTarget.querySelector('[role="dialog"]');
          const buttons = dialog?.querySelectorAll<HTMLButtonElement>(
            "button:not(:disabled)",
          );
          if (buttons?.length) {
            const first = buttons[0],
              last = buttons[buttons.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      }}
    >
      <div className="abyss-canvas" ref={host} />
      <div className="abyss-vignette" />
      <header className="abyss-topbar">
        <a className="abyss-wordmark" href="#/" aria-label="実験一覧へ戻る">
          A<span className="abyss-wordmark-wave">≋</span>R{" "}
          <small>ABYSS RUSH</small>
        </a>
        <div className="abyss-location">
          <span className="abyss-live-dot" /> UNDERWATER GRAND PRIX{" "}
          <b>DEPTH −80M</b>
        </div>
        <div className="abyss-tools">
          <button
            aria-label={audio ? "音をOFFにする" : "音をONにする"}
            onClick={() => void toggleAudio()}
          >
            音 {audio ? "ON" : "OFF"}
          </button>
          <button aria-pressed={light} onClick={() => setLight(!light)}>
            軽量{light ? " ON" : ""}
          </button>
          <button
            aria-label="操作方法"
            onClick={() => {
              race.pause();
              release();
              setHelp(true);
            }}
          >
            ?
          </button>
          {active && (
            <button
              aria-label="一時停止"
              onClick={() => {
                race.pause();
                release();
              }}
            >
              Ⅱ
            </button>
          )}
        </div>
      </header>
      {race.phase === "ready" && (
        <StartScreen
          race={race}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          auto={auto}
          setAuto={setAuto}
          start={start}
        />
      )}
      {race.phase !== "ready" && (
        <RaceHud race={race} auto={auto} press={press} />
      )}
      <footer className="abyss-footer">
        <span>ABYSS MARINE RACING / ORIGINAL CIRCUIT</span>
        <span>
          {view.fps} FPS <i /> LOCAL AI
        </span>
      </footer>
      <RaceMenus
        race={race}
        help={help}
        setHelp={setHelp}
        release={release}
        start={start}
      />
      {error && (
        <div className="abyss-modal-backdrop">
          <section className="abyss-modal" role="alert">
            <h2>ひと休みしましょう</h2>
            <p>{error}</p>
            <button className="abyss-primary" onClick={retry}>
              軽量表示で再試行
            </button>
            {error.startsWith("音声") && (
              <button onClick={dismissError}>音をOFFにして続行</button>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
