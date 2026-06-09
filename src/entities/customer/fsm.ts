import { createFSM } from '../../fsm';
import type { CustomerState } from './types';

export function createCustomerFSM() {
  return createFSM<CustomerState>({
    initial: 'SPAWN',
    transitions: {
      SPAWN:       [{ target: 'FIND_TABLE' }],
      FIND_TABLE:  [{ target: 'ORDERING' }],
      ORDERING:    [{ target: 'WAITING' }],
      WAITING:     [{ target: 'EATING' }, { target: 'ANGRY' }],
      ANGRY:       [{ target: 'LEAVING' }],
      EATING:      [{ target: 'PAYING' }],
      PAYING:      [{ target: 'LEAVING' }],
      LEAVING:     [],
    },
  });
}
