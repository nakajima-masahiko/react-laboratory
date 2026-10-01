import type { CSSProperties } from "react";
import { clock, ITEM_NAMES, type Race } from "./engine";
import {
  CAR_COLORS,
  LAPS,
  LENGTH,
  MAP_PATH,
  mapPoint,
  sectionAt,
  SECTIONS,
} from "./track";
export function MiniMap({
  race,
  large = false,
}: {
  race: Race;
  large?: boolean;
}) {
  return (
    <div className={`abyss-map ${large ? "abyss-map-large" : ""}`}>
      <div className="abyss-map-caption">
        <span>THE ABYSS CIRCUIT</span>
        <span>{(LENGTH / 1000).toFixed(2)} KM</span>
      </div>
      <svg viewBox="0 0 240 200" role="img" aria-label="海底コースと6台の位置">
        <path d={MAP_PATH} className="abyss-map-bed" />
        <path d={MAP_PATH} className="abyss-map-line" />
        {Array.from({ length: 6 }, (_, i) => {
          const p = mapPoint((LENGTH * i) / 6);
          return (
            <text key={i} x={p.x + 10} y={p.y - 8}>
              {String(i + 1).padStart(2, "0")}
            </text>
          );
        })}
        {race.cars
          .slice()
          .reverse()
          .map((car) => {
            const p = mapPoint(car.s);
            return (
              <circle
                key={car.id}
                cx={p.x}
                cy={p.y}
                r={car.id === 0 ? 5 : 3}
                fill={CAR_COLORS[car.id]}
                stroke="var(--ar-ink)"
                strokeWidth="1.5"
              />
            );
          })}
      </svg>
      <span className="abyss-map-key">
        <i /> YOU <span>● AI RIVALS</span>
      </span>
    </div>
  );
}
function TouchButton({
  label,
  text,
  control,
  press,
  className = "",
}: {
  label: string;
  text: string;
  control: string;
  press: (key: string, down: boolean) => void;
  className?: string;
}) {
  return (
    <button
      className={`abyss-touch-button ${className}`}
      aria-label={label}
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        press(control, true);
      }}
      onPointerUp={(e) => {
        press(control, false);
        if (e.currentTarget.hasPointerCapture(e.pointerId))
          e.currentTarget.releasePointerCapture(e.pointerId);
      }}
      onPointerCancel={() => press(control, false)}
      onLostPointerCapture={() => press(control, false)}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !e.repeat) {
          e.preventDefault();
          press(control, true);
        }
      }}
      onKeyUp={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          press(control, false);
        }
      }}
    >
      {text}
    </button>
  );
}

export function RaceHud({
  race,
  auto,
  press,
}: {
  race: Race;
  auto: boolean;
  press: (key: string, down: boolean) => void;
}) {
  const player = race.cars[0],
    rank = race.order().findIndex((c) => c.id === 0) + 1,
    section = sectionAt(player.s),
    lap = Math.min(
      LAPS,
      Math.max(1, Math.floor(Math.max(0, player.s) / LENGTH) + 1),
    );
  const active = race.phase === "racing" || race.phase === "countdown";

  return (
    <>
      <div className="abyss-race-hud">
        <div className="abyss-rank">
          <small>POSITION</small>
          <strong>
            {String(rank).padStart(2, "0")}
            <span>/ 06</span>
          </strong>
        </div>
        <div className="abyss-timing">
          <span>
            LAP{" "}
            <b>
              {lap}
              <small> / {LAPS}</small>
            </b>
          </span>
          <span>
            RACE TIME{" "}
            <b data-testid="race-time">{clock(player.finish ?? race.time)}</b>
          </span>
        </div>
      </div>
      <div className="abyss-sector">
        <span>SECTOR {String(section + 1).padStart(2, "0")} / 06</span>
        <strong>{SECTIONS[section]}</strong>
      </div>
      <div className="abyss-right-hud">
        <MiniMap race={race} />
        <ol className="abyss-leaderboard">
          {race.order().map((car, i) => (
            <li key={car.id} className={car.id === 0 ? "is-you" : ""}>
              <span>{i + 1}</span>
              <i
                style={{ "--car-color": CAR_COLORS[car.id] } as CSSProperties}
              />
              {car.name}
              <small>
                {car.finish !== null
                  ? "FIN"
                  : car.id === 0
                    ? "YOU"
                    : `${Math.abs(car.s - player.s).toFixed(0)}m`}
              </small>
            </li>
          ))}
        </ol>
      </div>
      {race.phase === "countdown" && (
        <div className="abyss-countdown" role="status">
          <strong>{Math.max(1, Math.ceil(race.countdown))}</strong>
          <span>GET READY TO DIVE</span>
        </div>
      )}
      {race.phase === "racing" && race.time < race.eventUntil && (
        <div className="abyss-toast" role="status">
          {race.event}
        </div>
      )}
      <div className="abyss-bottom-hud">
        <div className="abyss-speed">
          <strong data-testid="speed">{Math.round(player.speed * 3.6)}</strong>
          <span>KM/H</span>
          <div className="abyss-charge">
            <i style={{ width: `${Math.min(100, player.drift * 100)}%` }} />
          </div>
          <small>
            {player.boost > 0
              ? "BOOST ACTIVE"
              : player.drift > 0.45
                ? "RELEASE TO BOOST"
                : "DRIFT CHARGE"}
          </small>
        </div>
        <button
          className={`abyss-item ${player.item ? "is-loaded" : ""}`}
          disabled={!player.item || race.phase !== "racing"}
          onClick={() => press("item", true)}
          aria-label="アイテムを使用"
        >
          <span>
            {player.item === "turbo"
              ? "↗"
              : player.item === "pulse"
                ? "◎"
                : player.item === "shield"
                  ? "◈"
                  : "◇"}
          </span>
          <div>
            <small>ITEM / E</small>
            <b>{player.item ? ITEM_NAMES[player.item] : "ゲートで獲得"}</b>
          </div>
        </button>
      </div>
      {active && (
        <div className="abyss-touch" aria-label="タッチ操作">
          <div className="abyss-steering">
            <TouchButton
              label="左へハンドル"
              text="◀"
              control="ArrowLeft"
              press={press}
            />
            <TouchButton
              label="右へハンドル"
              text="▶"
              control="ArrowRight"
              press={press}
            />
          </div>
          <div className="abyss-pedals">
            {!auto && (
              <TouchButton
                label="アクセル"
                text="ACCEL"
                control="ArrowUp"
                press={press}
              />
            )}
            <TouchButton
              label="ブレーキ"
              text="BRAKE"
              control="ArrowDown"
              press={press}
            />
            <TouchButton
              label="ドリフト"
              text="DRIFT"
              control="Space"
              press={press}
              className="abyss-drift-button"
            />
          </div>
        </div>
      )}
    </>
  );
}
