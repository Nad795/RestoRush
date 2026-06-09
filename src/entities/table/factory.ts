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
    // Floor is 720 × 480; kitchen zone takes 64px at bottom → usable = 416px
    // 4 rows × 90px + 55 offset = 415px — fits exactly
    x: 90 + col * 160,
    y: 55 + row * 90,
    cleanTimer: 0,
  };
}
