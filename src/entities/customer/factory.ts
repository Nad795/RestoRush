import { nextId } from '../../utils/idGenerator';
import { randomBetween } from '../../utils/randomUtils';
import type { Customer } from './types';

const MENU_ITEMS = ['Burger', 'Pizza', 'Pasta', 'Salad', 'Steak', 'Sushi', 'Tacos'];

export function createCustomer(): Customer {
  return {
    id: nextId('customer'),
    state: 'SPAWN',
    tableId: null,
    orderId: null,
    patience: randomBetween(60, 100),
    happiness: 100,
    spendingAmount: randomBetween(10, 40),
    waitTimer: 0,
    eatTimer: 0,
    menuItem: MENU_ITEMS[Math.floor(Math.random() * MENU_ITEMS.length)],
    posX: 685,
    posY: 210,
  };
}
