import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MathUtils, Vector3 } from 'three';
import { tanks } from './data';
import { useAquariumControls, type MovementKey } from './control-store';

const keyMap: Partial<Record<string, MovementKey>> = {
  KeyW: 'forward', ArrowUp: 'forward', KeyS: 'backward', ArrowDown: 'backward',
  KeyA: 'left', KeyD: 'right', ArrowLeft: 'turnLeft', ArrowRight: 'turnRight',
};

export function PlayerController() {
  const { camera, gl } = useThree();
  const yaw = useRef(0);
  const pitch = useRef(0);
  const direction = useRef(new Vector3());
  const right = useRef(new Vector3());

  useEffect(() => {
    camera.position.set(0, 1.65, 20);
    camera.rotation.order = 'YXZ';
    const setKeyboard = (event: KeyboardEvent, pressed: boolean) => {
      const control = keyMap[event.code];
      if (!control) return;
      event.preventDefault();
      useAquariumControls.getState().setPressed(control, pressed);
    };
    const onKeyDown = (event: KeyboardEvent) => setKeyboard(event, true);
    const onKeyUp = (event: KeyboardEvent) => setKeyboard(event, false);
    const onMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== gl.domElement) return;
      yaw.current -= event.movementX * 0.0019;
      pitch.current = MathUtils.clamp(pitch.current - event.movementY * 0.0017, -0.72, 0.72);
    };
    const requestLock = () => gl.domElement.requestPointerLock?.();
    gl.domElement.addEventListener('click', requestLock);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('mousemove', onMouseMove);
    return () => {
      gl.domElement.removeEventListener('click', requestLock);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('mousemove', onMouseMove);
    };
  }, [camera, gl]);

  useFrame((_, delta) => {
    const controls = useAquariumControls.getState();
    const dt = Math.min(delta, 0.05);
    if (controls.pressed.turnLeft) yaw.current += dt * 1.35;
    if (controls.pressed.turnRight) yaw.current -= dt * 1.35;
    camera.rotation.set(pitch.current, yaw.current, 0);

    direction.current.set(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
    right.current.set(Math.cos(yaw.current), 0, -Math.sin(yaw.current));
    const forward = Number(controls.pressed.forward) - Number(controls.pressed.backward);
    const sideways = Number(controls.pressed.right) - Number(controls.pressed.left);
    camera.position.addScaledVector(direction.current, forward * dt * 3.15);
    camera.position.addScaledVector(right.current, sideways * dt * 2.35);
    camera.position.x = MathUtils.clamp(camera.position.x, -3.25, 3.25);
    camera.position.y = 1.65;
    camera.position.z = MathUtils.clamp(camera.position.z, -20, 20);

    const nearest = tanks.reduce<(typeof tanks)[number] | null>((best, tank) => {
      if (Math.abs(camera.position.z - tank.z) > 5.3) return best;
      if (camera.position.x * tank.side < -0.35) return best;
      return !best || Math.abs(camera.position.z - tank.z) < Math.abs(camera.position.z - best.z) ? tank : best;
    }, null);
    if (controls.currentTank !== nearest?.id) controls.setCurrentTank(nearest?.id ?? null);
  });

  return null;
}

