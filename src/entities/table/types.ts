export type TableState = 'AVAILABLE' | 'OCCUPIED' | 'DIRTY' | 'CLEANING';

export interface Table {
  id: string;
  state: TableState;
  occupiedBy: string | null; // customer id
  x: number; // grid position for rendering
  y: number;
}
