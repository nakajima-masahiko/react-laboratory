import { useCallback, useEffect, useRef, useState } from "react";
import { emptyInput, Race } from "./engine";
import { mountRace, type SceneOptions } from "./scene";
import { RaceSound } from "./sound";
export function useRace() {
  const [race] = useState(() => new Race());
  const [sound] = useState(() => new RaceSound());
  const host = useRef<HTMLDivElement>(null),
    input = useRef(emptyInput()),
    held = useRef(new Set<string>());
  const [view, setView] = useState({ tick: 0, fps: 60 });
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [light, setLight] = useState(false),
    [audio, setAudio] = useState(false),
    [auto, setAuto] = useState(true);
  const autoRef = useRef(auto);
  const options = useRef<SceneOptions>({ light: false, reducedMotion: false });
  useEffect(() => {
    options.current.light = light;
  }, [light]);
  const refresh = useCallback(() => {
    const has = (key: string) =>
      held.current.has(key) || held.current.has(`touch:${key}`);
    input.current.steer =
      (has("ArrowRight") || has("KeyD") ? 1 : 0) -
      (has("ArrowLeft") || has("KeyA") ? 1 : 0);
    input.current.brake = has("ArrowDown") || has("KeyS");
    input.current.throttle = autoRef.current || has("ArrowUp") || has("KeyW");
    input.current.drift = has("Space") || has("ShiftLeft") || has("ShiftRight");
  }, []);
  useEffect(() => {
    autoRef.current = auto;
    refresh();
  }, [auto, refresh]);
  const release = useCallback(() => {
    held.current.clear();
    Object.assign(input.current, emptyInput(), { throttle: autoRef.current });
  }, []);
  const press = useCallback(
    (key: string, down: boolean) => {
      if (key === "item") {
        if (down && race.phase === "racing") input.current.use = true;
        return;
      }
      if (down) held.current.add(`touch:${key}`);
      else held.current.delete(`touch:${key}`);
      refresh();
    },
    [race, refresh],
  );
  useEffect(() => {
    options.current.reducedMotion = matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let cleanup: (() => void) | undefined;
    const frame = requestAnimationFrame(() => {
      try {
        cleanup = mountRace(
          host.current!,
          race,
          input.current,
          options.current,
          (fps) => {
            sound.update(race);
            setView((v) => ({ tick: v.tick + 1, fps }));
          },
          (message) => {
            race.pause();
            sound.update(race);
            setError(message);
          },
        );
      } catch (e) {
        setError(
          `3D描画を開始できませんでした。${e instanceof Error ? e.message : ""}`,
        );
      }
    });
    return () => {
      cancelAnimationFrame(frame);
      cleanup?.();
    };
  }, [race, sound, attempt]);
  useEffect(() => {
    const movement = [
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "KeyW",
      "KeyA",
      "KeyS",
      "KeyD",
      "Space",
      "ShiftLeft",
      "ShiftRight",
      "KeyE",
    ];
    const keydown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLElement &&
        ["SELECT", "INPUT", "TEXTAREA"].includes(e.target.tagName)
      )
        return;
      if (e.code === "Escape") {
        e.preventDefault();
        if (race.phase === "paused") race.resume();
        else race.pause();
        release();
        return;
      }
      if (
        !movement.includes(e.code) ||
        !["racing", "countdown"].includes(race.phase)
      )
        return;
      e.preventDefault();
      if (e.code === "KeyE") {
        if (!e.repeat) input.current.use = true;
        return;
      }
      held.current.add(e.code);
      refresh();
    };
    const keyup = (e: KeyboardEvent) => {
      held.current.delete(e.code);
      refresh();
    };
    const pause = () => {
      release();
      race.pause();
    };
    const visibility = () => {
      if (document.hidden) pause();
    };
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    window.addEventListener("blur", pause);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
      window.removeEventListener("blur", pause);
      document.removeEventListener("visibilitychange", visibility);
      release();
    };
  }, [race, refresh, release]);
  useEffect(() => () => sound.close(), [sound]);
  return {
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
    toggleAudio: async () => {
      try {
        setAudio(await sound.toggle());
      } catch {
        setAudio(false);
        setError("音声を開始できませんでした。音をOFFにして続行できます。");
      }
    },
    retry: () => {
      release();
      race.reset();
      setError("");
      setLight(true);
      setAttempt((v) => v + 1);
    },
    dismissError: () => setError(""),
  };
}
