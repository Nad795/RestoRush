export type CustomerState =
  | 'SPAWN'
  | 'FIND_TABLE'
  | 'ORDERING'
  | 'WAITING'
  | 'EATING'
  | 'PAYING'
  | 'LEAVING'
  | 'ANGRY';

export interface Customer {
  id: string;
  state: CustomerState;
  tableId: string | null;
  orderId: string | null;
  patience: number;       // 0–100
  happiness: number;      // 0–100
  spendingAmount: number; // $ they will pay
  waitTimer: number;      // ms spent waiting
  eatTimer: number;       // ms spent eating
}
