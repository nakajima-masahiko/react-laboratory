import { AnimationMixer, Bone, LoopOnce, LoopRepeat, Mesh, SkinnedMesh, Vector3 } from 'three';
import type { AnimationClip, Object3D } from 'three';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import type { ConciergePlaybackState } from '../concierge-playback';
import { createFinishGesture } from './concierge-finish';
import { installMouth } from './concierge-mouth';

/** Clone the rig, keeping immutable GLB textures shared across React mounts. */
export function createConciergeRig(source: Object3D, clips: AnimationClip[], completeBow: (id: number) => void) {
  const model = clone(source);
  model.traverse((object) => { if (object instanceof Mesh) { object.castShadow = false; object.receiveShadow = false; } });
  const mixer = new AnimationMixer(model);
  const idleClip = clips.find((clip) => clip.name === 'Idle');
  const bowClip = clips.find((clip) => clip.name === 'Bow');
  if (!idleClip || !bowClip) throw new Error('Concierge animations are missing');
  const idle = mixer.clipAction(idleClip).setLoop(LoopRepeat, Infinity);
  const bow = mixer.clipAction(bowClip).setLoop(LoopOnce, 1);
  bow.clampWhenFinished = true;
  const mouth = installMouth(model);
  const finish = createFinishGesture(model);
  let phase: ConciergePlaybackState['phase'] = 'idle', requestId = -1, talkTime = 0, mouthAmount = 0;
  let head: Bone | undefined;
  model.traverse((object) => { if (object instanceof Bone && /^Head(?:_\d+)?$/.test(object.name)) head = object; });
  model.updateMatrixWorld(true);
  const headOrigin = head?.getWorldPosition(new Vector3()) ?? new Vector3();
  const headPosition = new Vector3();
  const cameraOffset = new Vector3();
  mouth.set(0);
  idle.play();
  const onFinished = (event: { action: unknown }) => {
    if (event.action !== bow || phase !== 'bowing') return;
    bow.stop(); idle.reset().play();
    completeBow(requestId);
  };
  mixer.addEventListener('finished', onFinished);

  return {
    model, cameraOffset,
    get smile() { return finish.smile; },
    update(state: ConciergePlaybackState, delta: number, now: number, boundaryAt: number) {
      if (state.phase !== phase || state.requestId !== requestId) {
        finish.reset(); mouthAmount = 0; talkTime = 0;
        phase = state.phase; requestId = state.requestId;
        mixer.stopAllAction();
        if (phase === 'bowing') bow.reset().play();
        else idle.reset().play();
        if (phase === 'finished') finish.start();
      }
      const dt = Math.min(delta, 0.05);
      finish.beforeFrame();
      mixer.update(dt);
      finish.update(dt);
      if (phase === 'speaking') talkTime += dt;
      const pulse = Math.max(0, Math.sin(talkTime * 18.5 + 0.32 * Math.sin(talkTime * 3.7)));
      const envelope = 0.64 + 0.18 * Math.sin(talkTime * 5.3);
      const beat = Math.max(0, 1 - (now - boundaryAt) / 130) * 0.18;
      const target = phase === 'speaking' ? Math.min(0.95, pulse * envelope + beat) : 0;
      mouthAmount += (target - mouthAmount) * (1 - Math.exp(-dt * 28));
      mouth.set(mouthAmount, finish.smile);
      model.updateMatrixWorld(true);
      cameraOffset.set(0, 0, 0);
      if (phase === 'bowing' && head) {
        head.getWorldPosition(headPosition).sub(headOrigin);
        // Keep the chest portrait readable as the bowed head moves forwards.
        cameraOffset.set(0, headPosition.y * 0.75, Math.max(0, headPosition.z) * 0.8);
      }
    },
    dispose() {
      finish.reset();
      mixer.removeEventListener('finished', onFinished);
      mixer.stopAllAction(); mixer.uncacheRoot(model);
      mouth.dispose();
      const skeletons = new Set<SkinnedMesh['skeleton']>();
      model.traverse((object) => { if (object instanceof SkinnedMesh) skeletons.add(object.skeleton); });
      skeletons.forEach((skeleton) => skeleton.dispose());
    },
  };
}
