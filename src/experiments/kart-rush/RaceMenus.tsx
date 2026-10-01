import { clock, type Difficulty, type Race } from "./engine";
import { SECTIONS } from "./track";
import { MiniMap } from "./RaceHud";
export function StartScreen({
  race,
  difficulty,
  setDifficulty,
  auto,
  setAuto,
  start,
}: {
  race: Race;
  difficulty: Difficulty;
  setDifficulty: (v: Difficulty) => void;
  auto: boolean;
  setAuto: (v: boolean) => void;
  start: () => void;
}) {
  return (
    <section className="abyss-intro" aria-label="レース設定">
      <div className="abyss-intro-copy">
        <p className="abyss-eyebrow">DIVE DEEP. DRIVE FAST.</p>
        <h1>
          ABYSS
          <br />
          <em>RUSH.</em>
        </h1>
        <p className="abyss-subtitle">海底グランプリ</p>
        <p className="abyss-description">
          光のトンネルを抜け、巨影の海へ。
          <br />
          6台のカートが、静寂を駆け抜ける。
        </p>
        <div className="abyss-race-facts">
          <span>
            <b>06</b> RACERS
          </span>
          <span>
            <b>03</b> LAPS
          </span>
          <span>
            <b>01</b> OCEAN
          </span>
        </div>
        <div className="abyss-settings">
          <label>
            難易度
            <select
              aria-label="難易度"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            >
              <option value="easy">やさしい</option>
              <option value="normal">ふつう</option>
              <option value="hard">むずかしい</option>
            </select>
          </label>
          <label className="abyss-auto">
            <input
              type="checkbox"
              checked={auto}
              onChange={(e) => setAuto(e.target.checked)}
            />
            自動アクセル
          </label>
        </div>
        <button className="abyss-primary" onClick={start}>
          レースをはじめる <span>↗</span>
        </button>
        <p className="abyss-control-hint">
          ← → ハンドル · SPACE ドリフト · E アイテム
          <br />
          タッチ操作対応 · 横画面がおすすめ
        </p>
      </div>
      <aside className="abyss-course-card">
        <span className="abyss-eyebrow">EXPEDITION / 001</span>
        <MiniMap race={race} large />
        <div className="abyss-course-stops">
          {SECTIONS.map((name, i) => (
            <span key={name}>
              <b>{String(i + 1).padStart(2, "0")}</b>
              {name}
            </span>
          ))}
        </div>
        <p>透明なトンネルの先に、6つの海。</p>
      </aside>
    </section>
  );
}
export function RaceMenus({
  race,
  help,
  setHelp,
  release,
  start,
}: {
  race: Race;
  help: boolean;
  setHelp: (v: boolean) => void;
  release: () => void;
  start: () => void;
}) {
  const player = race.cars[0],
    rank = race.order().findIndex((c) => c.id === 0) + 1;
  return (
    <>
      {(race.phase === "paused" || help) && (
        <div className="abyss-modal-backdrop">
          <section
            className="abyss-modal"
            aria-label={help ? "操作ガイド" : "一時停止"}
            role="dialog"
            aria-modal="true"
          >
            <p className="abyss-eyebrow">TAKE A BREATH</p>
            <h2>{help ? "海底レースの走り方" : "PAUSED"}</h2>
            <p>
              カーブでドリフトを続け、ゲージがたまったら
              <br />
              ボタンを離してブースト。
            </p>
            <dl>
              <dt>ハンドル</dt>
              <dd>← → / A D / 画面の左右ボタン</dd>
              <dt>アクセル・ブレーキ</dt>
              <dd>↑ ↓ / W S（自動アクセルONが標準）</dd>
              <dt>ドリフト</dt>
              <dd>SPACE / SHIFT / DRIFT</dd>
              <dt>アイテム</dt>
              <dd>E / アイテム欄をタップ</dd>
              <dt>一時停止</dt>
              <dd>ESC / Ⅱ</dd>
            </dl>
            <p className="abyss-small">
              金色のゲートでアイテムを獲得。相手のすぐ後ろではスリップストリームで速度アップ。
            </p>
            <button
              className="abyss-primary"
              autoFocus
              onClick={() => {
                setHelp(false);
                release();
                race.resume();
              }}
            >
              {race.phase === "ready" ? "閉じる" : "レースに戻る"}
            </button>
            {race.phase === "paused" && (
              <button
                className="abyss-secondary"
                onClick={() => {
                  setHelp(false);
                  release();
                  race.reset();
                }}
              >
                スタート画面へ
              </button>
            )}
          </section>
        </div>
      )}
      {race.phase === "finished" && (
        <div className="abyss-modal-backdrop">
          <section
            className="abyss-modal abyss-results"
            role="dialog"
            aria-modal="true"
            aria-label="レース結果"
          >
            <p className="abyss-eyebrow">EXPEDITION COMPLETE</p>
            <h2>
              FINISH<span>!</span>
            </h2>
            <p className="abyss-result-rank">
              {rank}
              <small> / 6 位</small>
            </p>
            <p>3周走破 · {clock(player.finish ?? race.time)}</p>
            <ol>
              {race.order().map((car) => (
                <li key={car.id}>
                  <b>{car.name}</b>
                  <span>
                    {car.finish !== null ? clock(car.finish) : "走行中"}
                  </span>
                </li>
              ))}
            </ol>
            <button autoFocus className="abyss-primary" onClick={start}>
              もう一度レース <span>↗</span>
            </button>
            <button
              className="abyss-secondary"
              onClick={() => {
                release();
                race.reset();
              }}
            >
              スタート画面へ
            </button>
          </section>
        </div>
      )}
    </>
  );
}
