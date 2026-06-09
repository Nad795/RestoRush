import { createFSM } from '../../fsm';
import type { WaiterState } from './types';

export function createWaiterFSM() {
  return createFSM<WaiterState>({
    initial: 'IDLE',
    transitions: {
      IDLE:              [{ target: 'TAKE_ORDER' }],
      TAKE_ORDER:        [{ target: 'DELIVER_TO_KITCHEN' }],
      DELIVER_TO_KITCHEN:[{ target: 'PICKUP_FOOD' }],
      PICKUP_FOOD:       [{ target: 'SERVE_FOOD' }],
      SERVE_FOOD:        [{ target: 'IDLE' }],
    },
  });
}
