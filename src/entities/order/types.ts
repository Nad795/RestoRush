export type OrderState = 'CREATED' | 'COOKING' | 'READY' | 'SERVED' | 'COMPLETED';

export interface Order {
  id: string;
  state: OrderState;
  customerId: string;
  tableId: string;
  item: string;   // dish name (randomised)
  price: number;
  cookTimeMs: number;
  createdAt: number; // game-time ms
}
