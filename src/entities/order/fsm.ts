import { createFSM } from '../../fsm';
import type { OrderState } from './types';

export function createOrderFSM() {
  return createFSM<OrderState>({
    initial: 'CREATED',
    transitions: {
      CREATED:   [{ target: 'COOKING' }],
      COOKING:   [{ target: 'READY' }],
      READY:     [{ target: 'SERVED' }],
      SERVED:    [{ target: 'COMPLETED' }],
      COMPLETED: [],
    },
  });
}
