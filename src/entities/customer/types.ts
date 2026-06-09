export type CustomerState =
  | 'SPAWN'
  | 'FIND_TABLE'
  | 'ORDERING'
  | 'WAITING'
  | 'EATING'
  | 'PAYING'
  | 'LEAVING'
  | 'ANGRY';

export type Direction = 'left' | 'right' | 'up' | 'down';

export interface Customer {
  id: string;
  state: CustomerState;
  tableId: string | null;
  orderId: string | null;
  patience: number;
  happiness: number;
  spendingAmount: number;
  waitTimer: number;
  eatTimer: number;
  menuItem: string;
  posX: number;
  posY: number;
  path: Array<{ x: number; y: number }>;
  pathIndex: number;
  direction: Direction;
}
