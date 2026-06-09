import { create } from 'zustand';

export type SpeedMultiplier = 1 | 2 | 4;

interface RestaurantState {
  money: number;
  rating: number;        // 1.0 – 5.0
  day: number;
  paused: boolean;
  speed: SpeedMultiplier;

  addMoney: (amount: number) => void;
  setRating: (r: number) => void;
  setPaused: (p: boolean) => void;
  setSpeed: (s: SpeedMultiplier) => void;
  nextDay: () => void;
}

export const useRestaurantStore = create<RestaurantState>((set) => ({
  money: 500,
  rating: 5.0,
  day: 1,
  paused: false,
  speed: 1,

  addMoney: (amount) => set((s) => ({ money: s.money + amount })),
  setRating: (r) => set({ rating: Math.max(1, Math.min(5, r)) }),
  setPaused: (p) => set({ paused: p }),
  setSpeed: (s) => set({ speed: s }),
  nextDay: () => set((s) => ({ day: s.day + 1 })),
}));
