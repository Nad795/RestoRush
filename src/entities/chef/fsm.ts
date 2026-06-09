import { createFSM } from '../../fsm';
import type { ChefState } from './types';

export function createChefFSM() {
  return createFSM<ChefState>({
    initial: 'IDLE',
    transitions: {
      IDLE:       [{ target: 'COOKING' }],
      COOKING:    [{ target: 'FOOD_READY' }],
      FOOD_READY: [{ target: 'IDLE' }],
    },
  });
}
