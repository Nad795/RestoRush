import { createFSM } from '../../fsm';
import type { TableState } from './types';

export function createTableFSM() {
  return createFSM<TableState>({
    initial: 'AVAILABLE',
    transitions: {
      AVAILABLE: [{ target: 'OCCUPIED' }],
      OCCUPIED:  [{ target: 'DIRTY' }],
      DIRTY:     [{ target: 'CLEANING' }],
      CLEANING:  [{ target: 'AVAILABLE' }],
    },
  });
}
