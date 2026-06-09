export type ChefState = 'IDLE' | 'COOKING' | 'FOOD_READY';

export interface Chef {
  id: string;
  state: ChefState;
  currentOrderId: string | null;
  cookTimer: number; // ms elapsed cooking
}
