export type WaiterState =
  | 'IDLE'
  | 'TAKE_ORDER'
  | 'DELIVER_TO_KITCHEN'
  | 'PICKUP_FOOD'
  | 'SERVE_FOOD';

export interface Waiter {
  id: string;
  state: WaiterState;
  assignedOrderId: string | null;
  assignedCustomerId: string | null;
  taskTimer: number; // ms elapsed in current task
}
