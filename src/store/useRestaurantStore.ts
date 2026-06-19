import { create } from 'zustand';
import {
  STARTING_MONEY,
  DAY_DURATION_MS,
  LOYALTY_MAX,
  GAME_LENGTH_DAYS,
  GOAL_MONEY,
  RATING_LOSS_THRESHOLD,
} from '../utils/constants';
import { AD_TIERS } from '../utils/advertising';
import { type StoryBeat, getStoryForDay, STORY_BEATS } from '../data/storyBeats';

export type SpeedMultiplier = 1 | 2 | 4;

export interface DaySummary {
  day: number;
  revenue: number;
  customersServed: number;
  customersAngry: number;
  ratingEnd: number;
  wages: number;
}

export type GameScreen = 'menu' | 'playing' | 'credits';

interface RestaurantState {
  screen: GameScreen;
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

  // Loyalty & advertising
  loyalty: number;          // 0..LOYALTY_MAX, drives the loyalty-customer trickle spawn chance
  adDaysRemaining: number;  // 0 = no active campaign
  adSpawnBonus: number;     // multiplies effective spawn rate while adDaysRemaining > 0 (1 = no bonus)

  // Story dialogue
  activeStory: StoryBeat | null;
  storyLineIndex: number;
  shownStoryIds: string[];

  // Win/lose
  gameStatus: 'playing' | 'won' | 'lost';
  lossReason: 'rating' | 'bankrupt' | 'goal_missed' | null;

  // Actions
  startGame: () => void;
  showStory: (storyId: string) => void;
  advanceStory: () => void;
  addMoney: (amount: number) => void;
  setRating: (r: number) => void;
  setPaused: (p: boolean) => void;
  setSpeed: (s: SpeedMultiplier) => void;
  tickDay: (delta: number, dailyWageTotal: number) => void;
  recordServed: (amount: number) => void;
  recordAngry: () => void;
  dismissSummary: () => void;
  adjustLoyalty: (delta: number) => void;
  startAdvertisement: (tierId: string) => void;
}

export const useRestaurantStore = create<RestaurantState>((set, get) => ({
  screen: 'menu' as GameScreen,
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

  loyalty: 0,
  adDaysRemaining: 0,
  adSpawnBonus: 1,

  activeStory: null,
  storyLineIndex: 0,
  shownStoryIds: [],

  gameStatus: 'playing',
  lossReason: null,

  startGame: () => {
    const story = getStoryForDay(1);
    if (story) {
      set({
        screen: 'playing',
        paused: true,
        activeStory: story,
        storyLineIndex: 0,
        shownStoryIds: [story.id],
      });
    } else {
      set({ screen: 'playing' });
    }
  },

  showStory: (storyId) => {
    const story = STORY_BEATS.find((s) => s.id === storyId);
    if (!story) return;
    const state = get();
    if (state.shownStoryIds.includes(storyId)) return;
    set({
      activeStory: story,
      storyLineIndex: 0,
      shownStoryIds: [...state.shownStoryIds, storyId],
      paused: true,
    });
  },

  advanceStory: () => {
    const state = get();
    if (!state.activeStory) return;
    const nextIndex = state.storyLineIndex + 1;
    if (nextIndex >= state.activeStory.lines.length) {
      set({ activeStory: null, storyLineIndex: 0, paused: false });
    } else {
      set({ storyLineIndex: nextIndex });
    }
  },

  addMoney: (amount) =>
    set((s) => ({ money: Math.max(0, s.money + amount) })),

  setRating: (r) => {
    const rating = Math.max(1, Math.min(5, r));
    const s = get();
    if (s.gameStatus === 'playing' && rating <= RATING_LOSS_THRESHOLD) {
      set({ rating, gameStatus: 'lost', lossReason: 'rating', paused: true });
    } else {
      set({ rating });
    }
  },

  setPaused: (p) => set({ paused: p }),
  setSpeed: (s) => set({ speed: s }),

  tickDay: (delta, dailyWageTotal) => {
    const s = get();
    const next = s.dayTimer + delta;
    if (next >= DAY_DURATION_MS) {
      const adDaysRemaining = Math.max(0, s.adDaysRemaining - 1);
      const moneyAfterWages = s.money - dailyWageTotal;

      let gameStatus = s.gameStatus;
      let lossReason = s.lossReason;
      if (gameStatus === 'playing') {
        if (moneyAfterWages < 0) {
          gameStatus = 'lost';
          lossReason = 'bankrupt';
        } else if (s.day >= GAME_LENGTH_DAYS) {
          if (moneyAfterWages >= GOAL_MONEY) {
            gameStatus = 'won';
          } else {
            gameStatus = 'lost';
            lossReason = 'goal_missed';
          }
        }
      }

      set({
        money: Math.max(0, moneyAfterWages),
        daySummary: {
          day: s.day,
          revenue: s.revenueToday,
          customersServed: s.customersServedToday,
          customersAngry: s.customersAngryToday,
          ratingEnd: s.rating,
          wages: dailyWageTotal,
        },
        day: s.day + 1,
        dayTimer: 0,
        revenueToday: 0,
        customersServedToday: 0,
        customersAngryToday: 0,
        adDaysRemaining,
        adSpawnBonus: adDaysRemaining > 0 ? s.adSpawnBonus : 1,
        gameStatus,
        lossReason,
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

  dismissSummary: () => {
    const state = get();
    const story = getStoryForDay(state.day);
    if (story && !state.shownStoryIds.includes(story.id)) {
      set({
        daySummary: null,
        paused: true,
        activeStory: story,
        storyLineIndex: 0,
        shownStoryIds: [...state.shownStoryIds, story.id],
      });
    } else {
      set({ daySummary: null, paused: false });
    }
  },

  adjustLoyalty: (delta) =>
    set((s) => ({ loyalty: Math.max(0, Math.min(LOYALTY_MAX, s.loyalty + delta)) })),

  startAdvertisement: (tierId) => {
    const s = get();
    const tier = AD_TIERS.find((t) => t.id === tierId);
    if (!tier || s.money < tier.cost) return;
    set({
      money: s.money - tier.cost,
      adDaysRemaining: s.adDaysRemaining + tier.durationDays,
      adSpawnBonus: Math.max(s.adDaysRemaining > 0 ? s.adSpawnBonus : 1, tier.spawnBonus),
    });
  },
}));
