/**
 * Static FSM configs for every entity type.
 * Systems import these directly — no need to call the factory just to get the config.
 */

import type { FSMConfig } from './types';
import type { CustomerState } from '../entities/customer/types';
import type { WaiterState } from '../entities/waiter/types';
import type { ChefState } from '../entities/chef/types';
import type { TableState } from '../entities/table/types';
import type { OrderState } from '../entities/order/types';

export const CUSTOMER_FSM_CONFIG: FSMConfig<CustomerState> = {
  initial: 'SPAWN',
  transitions: {
    SPAWN:      [{ target: 'FIND_TABLE' }],
    FIND_TABLE: [{ target: 'ORDERING' }, { target: 'LEAVING' }],
    ORDERING:   [{ target: 'WAITING' }],
    WAITING:    [{ target: 'EATING' }, { target: 'ANGRY' }],
    ANGRY:      [{ target: 'LEAVING' }],
    EATING:     [{ target: 'PAYING' }],
    PAYING:     [{ target: 'LEAVING' }],
    LEAVING:    [],
  },
};

export const WAITER_FSM_CONFIG: FSMConfig<WaiterState> = {
  initial: 'IDLE',
  transitions: {
    IDLE:               [{ target: 'TAKE_ORDER' }],
    TAKE_ORDER:         [{ target: 'DELIVER_TO_KITCHEN' }],
    DELIVER_TO_KITCHEN: [{ target: 'PICKUP_FOOD' }],
    PICKUP_FOOD:        [{ target: 'SERVE_FOOD' }],
    SERVE_FOOD:         [{ target: 'IDLE' }],
  },
};

export const CHEF_FSM_CONFIG: FSMConfig<ChefState> = {
  initial: 'IDLE',
  transitions: {
    IDLE:       [{ target: 'COOKING' }],
    COOKING:    [{ target: 'FOOD_READY' }],
    FOOD_READY: [{ target: 'IDLE' }],
  },
};

export const TABLE_FSM_CONFIG: FSMConfig<TableState> = {
  initial: 'AVAILABLE',
  transitions: {
    AVAILABLE: [{ target: 'OCCUPIED' }],
    OCCUPIED:  [{ target: 'DIRTY' }],
    DIRTY:     [{ target: 'CLEANING' }],
    CLEANING:  [{ target: 'AVAILABLE' }],
  },
};

export const ORDER_FSM_CONFIG: FSMConfig<OrderState> = {
  initial: 'CREATED',
  transitions: {
    CREATED:   [{ target: 'COOKING' }],
    COOKING:   [{ target: 'READY' }],
    READY:     [{ target: 'SERVED' }],
    SERVED:    [{ target: 'COMPLETED' }],
    COMPLETED: [],
  },
};
