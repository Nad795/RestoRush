import { nextId } from '../../utils/idGenerator';
import { KITCHEN_W, WALL_H } from '../../utils/constants';
import type { Table } from './types';

// Tables are placed on a simple grid — caller passes the slot index
export function createTable(slotIndex: number): Table {
  const col = slotIndex % 5;
  const row = Math.floor(slotIndex / 5);
  return {
    id: nextId('table'),
    state: 'AVAILABLE',
    occupiedBy: null,
    x: KITCHEN_W + 113 + col * 160,
    y: WALL_H + 40 + row * 130,
    cleanTimer: 0,
  };
}
