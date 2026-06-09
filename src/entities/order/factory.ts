import { nextId } from '../../utils/idGenerator';
import type { Order } from './types';

const PRICES: Record<string, number> = {
  Burger: 12,
  Pizza: 15,
  Pasta: 13,
  Salad: 9,
  Steak: 28,
  Sushi: 22,
  Tacos: 11,
};

export function createOrder(customerId: string, tableId: string, menuItem: string): Order {
  return {
    id: nextId('order'),
    state: 'CREATED',
    customerId,
    tableId,
    item: menuItem,
    price: PRICES[menuItem] ?? 12,
    createdAt: Date.now(),
  };
}
