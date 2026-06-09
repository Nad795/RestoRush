import { nextId } from '../../utils/idGenerator';
import type { Chef } from './types';

export function createChef(): Chef {
  return {
    id: nextId('chef'),
    state: 'IDLE',
    currentOrderId: null,
    cookTimer: 0,
  };
}
