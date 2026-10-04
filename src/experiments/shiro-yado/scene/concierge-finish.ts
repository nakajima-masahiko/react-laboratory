import { Bone, Euler, MathUtils, Quaternion, Vector3 } from 'three';
import type { Object3D } from 'three';

export function createFinishGesture(model: Object3D) {
  let head: Bone | undefined;
  let neck: Bone | undefined;
  model.traverse((object) => {
    if (!(object instanceof Bone)) return;
    if (/^Head(?:_\d+)?$/.test(object.name)) head = object;
    if (/^Neck(?:_\d+)?$/.test(object.name)) neck = object;
  });
  const baseHead = new Quaternion();
  const baseNeck = new Quaternion();
  const delta = new Quaternion();
  const rotation = new Euler();
  const forward = new Vector3(0, 0, 1);
  let active = false, elapsed = 0, smile = 0, applied = false;
  const restore = () => {
    if (!applied) return;
    head?.quaternion.copy(baseHead);
    neck?.quaternion.copy(baseNeck);
    applied = false;
  };
  const reset = () => { restore(); active = false; elapsed = 0; smile = 0; };
  return {
    reset,
    beforeFrame: restore,
    start() { reset(); active = true; },
    get smile() { return smile; },
    update(dt: number) {
      if (!active) return;
      elapsed += Math.max(0, dt);
      const settle = MathUtils.smoothstep(elapsed, 4.5, 6.5);
      smile = MathUtils.smoothstep(elapsed, 0.05, 0.95) * (1 - 0.15 * settle);
      const tilt = MathUtils.smoothstep(elapsed, 0.30, 1.45);
      if (head) {
        baseHead.copy(head.quaternion);
        rotation.set(MathUtils.degToRad(1.2) * tilt, 0, MathUtils.degToRad(6.5) * tilt * (1 - 0.18 * settle));
        head.quaternion.multiply(delta.setFromEuler(rotation));
      }
      if (neck) {
        baseNeck.copy(neck.quaternion);
        neck.quaternion.multiply(delta.setFromAxisAngle(forward, MathUtils.degToRad(1.3) * tilt * (1 - 0.18 * settle)));
      }
      applied = true;
    },
  };
}
