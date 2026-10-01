import type { Race } from "./engine";
export class RaceSound {
  context: AudioContext | null = null;
  engine: OscillatorNode | null = null;
  gain: GainNode | null = null;
  enabled = false;
  lastEvent = 0;
  async toggle() {
    if (!this.context) {
      this.context = new AudioContext();
      this.engine = this.context.createOscillator();
      this.engine.type = "triangle";
      this.gain = this.context.createGain();
      this.gain.gain.value = 0;
      this.engine.connect(this.gain).connect(this.context.destination);
      this.engine.start();
    }
    this.enabled = !this.enabled;
    if (this.enabled) await this.context.resume();
    else await this.context.suspend();
    return this.enabled;
  }
  update(race: Race) {
    if (!this.enabled || !this.context || !this.engine || !this.gain) return;
    const t = this.context.currentTime;
    this.engine.frequency.setTargetAtTime(
      45 + race.cars[0].speed * 2.4,
      t,
      0.08,
    );
    this.gain.gain.setTargetAtTime(race.phase === "racing" ? 0.018 : 0, t, 0.1);
    if (race.eventUntil !== this.lastEvent && race.phase !== "paused") {
      this.lastEvent = race.eventUntil;
      const tone = this.context.createOscillator(),
        gain = this.context.createGain();
      tone.type = "sine";
      tone.frequency.setValueAtTime(race.cars[0].boost > 0 ? 660 : 440, t);
      tone.frequency.exponentialRampToValueAtTime(880, t + 0.15);
      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      tone.connect(gain).connect(this.context.destination);
      tone.start();
      tone.stop(t + 0.21);
      tone.onended = () => {
        tone.disconnect();
        gain.disconnect();
      };
    }
  }
  close() {
    this.engine?.stop();
    void this.context?.close();
    this.context = null;
    this.enabled = false;
  }
}
