import { create } from 'zustand';
import { STARTING_MONEY, DAY_DURATION_MS } from '../utils/constants';

export type SpeedMultiplier = 1 | 2 | 4;

export interface DaySummary {
  day: number;
  revenue: number;
  customersServed: number;
  customersAngry: number;
  ratingEnd: number;
}

interface RestaurantState {
  money: number;
  rating: number;           // 1.0 – 5.0
  day: number;
  paused: boolean;
  speed: SpeedMultiplier;

  // Daily tracking
  dayTimer: number;         // ms elapsed in current day (speed-scaled)
  revenueToday: number;
  customersServedToday: number;
  customersAngryToday: number;

  // Day summary modal (non-null when day just ended)
  daySummary: DaySummary | null;

  // Actions
  addMoney: (amount: number) => void;
  setRating: (r: number) => void;
  setPaused: (p: boolean) => void;
  setSpeed: (s: SpeedMultiplier) => void;
  tickDay: (delta: number) => void;
  recordServed: (amount: number) => void;
  recordAngry: () => void;
  dismissSummary: () => void;
}

export const useRestaurantStore = create<RestaurantState>((set, get) => ({
  money: STARTING_MONEY,
  rating: 5.0,
  day: 1,
  paused: false,
  speed: 1,

  dayTimer: 0,
  revenueToday: 0,
  customersServedToday: 0,
  customersAngryToday: 0,
  daySummary: null,

  addMoney: (amount) =>
    set((s) => ({ money: Math.max(0, s.money + amount) })),

  setRating: (r) =>
    set({ rating: Math.max(1, Math.min(5, r)) }),

  setPaused: (p) => set({ paused: p }),
  setSpeed: (s) => set({ speed: s }),

  tickDay: (delta) => {
    const s = get();
    const next = s.dayTimer + delta;
    if (next >= DAY_DURATION_MS) {
      set({
        daySummary: {
          day: s.day,
          revenue: s.revenueToday,
          customersServed: s.customersServedToday,
          customersAngry: s.customersAngryToday,
          ratingEnd: s.rating,
        },
        day: s.day + 1,
        dayTimer: 0,
        revenueToday: 0,
        customersServedToday: 0,
        customersAngryToday: 0,
        paused: true,
      });
    } else {
      set({ dayTimer: next });
    }
  },

  recordServed: (amount) =>
    set((s) => ({
      revenueToday: s.revenueToday + amount,
      customersServedToday: s.customersServedToday + 1,
    })),

  recordAngry: () =>
    set((s) => ({ customersAngryToday: s.customersAngryToday + 1 })),

  dismissSummary: () => set({ daySummary: null, paused: false }),
}));
