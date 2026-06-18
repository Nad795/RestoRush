import { nextId } from '../../utils/idGenerator';
import { randomBetween, randomItem } from '../../utils/randomUtils';
import { MENU } from '../../utils/menu';
import type { Customer, CustomerSource } from './types';

export function createCustomer(source: CustomerSource = 'base'): Customer {
  return {
    id: nextId('customer'),
    state: 'SPAWN',
    source,
    tableId: null,
    orderId: null,
    patience: randomBetween(80, 120),
    happiness: 100,
    spendingAmount: 0, // set from order.price once the order is served
    waitTimer: 0,
    eatTimer: 0,
    menuItem: randomItem(MENU).name,
    posX: 935,
    posY: 320,
    path: [],
    pathIndex: 0,
    direction: 'left',
  };
}
