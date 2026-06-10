import { nextId } from '../../utils/idGenerator';
import { MENU } from '../../utils/menu';
import { COOK_TIME_MS } from '../../utils/constants';
import type { Order } from './types';

export function createOrder(customerId: string, tableId: string, menuItem: string): Order {
  const dish = MENU.find((m) => m.name === menuItem);
  return {
    id: nextId('order'),
    state: 'CREATED',
    customerId,
    tableId,
    item: menuItem,
    price: dish?.price ?? 16,
    cookTimeMs: dish?.cookTimeMs ?? COOK_TIME_MS,
    createdAt: Date.now(),
  };
}
