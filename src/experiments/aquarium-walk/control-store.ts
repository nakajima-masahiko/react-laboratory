import { create } from 'zustand';

export type MovementKey = 'forward' | 'backward' | 'left' | 'right' | 'turnLeft' | 'turnRight';

interface ControlState {
  pressed: Record<MovementKey, boolean>;
  currentTank: string | null;
  setPressed: (key: MovementKey, pressed: boolean) => void;
  setCurrentTank: (id: string | null) => void;
}

const emptyControls: Record<MovementKey, boolean> = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  turnLeft: false,
  turnRight: false,
};

export const useAquariumControls = create<ControlState>((set) => ({
  pressed: emptyControls,
  currentTank: null,
  setPressed: (key, pressed) => set((state) => ({ pressed: { ...state.pressed, [key]: pressed } })),
  setCurrentTank: (currentTank) => set({ currentTank }),
}));

