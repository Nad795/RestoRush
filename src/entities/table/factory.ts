import { nextId } from '../../utils/idGenerator';
import type { Table } from './types';

// Tables are placed on a simple grid — caller passes the slot index
export function createTable(slotIndex: number): Table {
  const col = slotIndex % 4;
  const row = Math.floor(slotIndex / 4);
  return {
    id: nextId('table'),
    state: 'AVAILABLE',
    occupiedBy: null,
    x: 80 + col * 160,  // px on the restaurant floor canvas
    y: 80 + row * 140,
  };
}
