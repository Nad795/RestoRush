import { nextId } from '../../utils/idGenerator';
import type { Waiter } from './types';

export function createWaiter(): Waiter {
  return {
    id: nextId('waiter'),
    state: 'IDLE',
    assignedOrderId: null,
    assignedCustomerId: null,
    taskTimer: 0,
    posX: 120,
    posY: 456,
  };
}
