import { describe, it, expect, beforeEach } from 'vitest';
import { useRestaurantStore } from '../useRestaurantStore';
import { GAME_LENGTH_DAYS, GOAL_MONEY, DAY_DURATION_MS, RATING_LOSS_THRESHOLD } from '../../utils/constants';

function resetStore() {
  useRestaurantStore.setState({
    money: 500, rating: 5, day: 1, paused: false, speed: 1,
    dayTimer: 0, revenueToday: 0, customersServedToday: 0,
    customersAngryToday: 0, daySummary: null,
    loyalty: 0, adDaysRemaining: 0, adSpawnBonus: 1,
    gameStatus: 'playing', lossReason: null,
  });
}

describe('useRestaurantStore — win/lose conditions', () => {
  beforeEach(resetStore);

  it('wins when day 21 ends with money >= GOAL_MONEY', () => {
    useRestaurantStore.setState({ day: GAME_LENGTH_DAYS, money: GOAL_MONEY, dayTimer: 0 });
    useRestaurantStore.getState().tickDay(DAY_DURATION_MS, 0);

    expect(useRestaurantStore.getState().gameStatus).toBe('won');
    expect(useRestaurantStore.getState().lossReason).toBeNull();
    expect(useRestaurantStore.getState().paused).toBe(true);
  });

  it('loses with goal_missed when day 21 ends with money < GOAL_MONEY', () => {
    useRestaurantStore.setState({ day: GAME_LENGTH_DAYS, money: GOAL_MONEY - 1, dayTimer: 0 });
    useRestaurantStore.getState().tickDay(DAY_DURATION_MS, 0);

    expect(useRestaurantStore.getState().gameStatus).toBe('lost');
    expect(useRestaurantStore.getState().lossReason).toBe('goal_missed');
  });

  it('does not set gameStatus on day rollovers before day 21', () => {
    useRestaurantStore.setState({ day: GAME_LENGTH_DAYS - 1, money: 0, dayTimer: 0 });
    useRestaurantStore.getState().tickDay(DAY_DURATION_MS, 0);

    expect(useRestaurantStore.getState().gameStatus).toBe('playing');
    expect(useRestaurantStore.getState().day).toBe(GAME_LENGTH_DAYS);
  });

  it('tickDay deducts dailyWageTotal from money on rollover and records it on the daySummary', () => {
    useRestaurantStore.setState({ day: 1, money: 500, dayTimer: 0 });
    useRestaurantStore.getState().tickDay(DAY_DURATION_MS, 45);

    expect(useRestaurantStore.getState().money).toBe(455);
    expect(useRestaurantStore.getState().daySummary?.wages).toBe(45);
  });

  it('goes bankrupt when wages exceed money on rollover', () => {
    useRestaurantStore.setState({ day: 1, money: 30, dayTimer: 0 });
    useRestaurantStore.getState().tickDay(DAY_DURATION_MS, 45);

    expect(useRestaurantStore.getState().money).toBe(0);
    expect(useRestaurantStore.getState().gameStatus).toBe('lost');
    expect(useRestaurantStore.getState().lossReason).toBe('bankrupt');
  });

  it('bankruptcy takes priority over the day-21 goal check', () => {
    useRestaurantStore.setState({ day: GAME_LENGTH_DAYS, money: 30, dayTimer: 0 });
    useRestaurantStore.getState().tickDay(DAY_DURATION_MS, 45);

    expect(useRestaurantStore.getState().gameStatus).toBe('lost');
    expect(useRestaurantStore.getState().lossReason).toBe('bankrupt');
  });

  it('setRating to the loss threshold immediately ends the game with lossReason "rating"', () => {
    useRestaurantStore.getState().setRating(RATING_LOSS_THRESHOLD);

    expect(useRestaurantStore.getState().gameStatus).toBe('lost');
    expect(useRestaurantStore.getState().lossReason).toBe('rating');
    expect(useRestaurantStore.getState().paused).toBe(true);
  });

  it('setRating above the loss threshold does not affect gameStatus', () => {
    useRestaurantStore.getState().setRating(RATING_LOSS_THRESHOLD + 1);

    expect(useRestaurantStore.getState().gameStatus).toBe('playing');
    expect(useRestaurantStore.getState().lossReason).toBeNull();
  });

  it('once the game is over, further setRating calls do not change gameStatus or lossReason', () => {
    useRestaurantStore.getState().setRating(RATING_LOSS_THRESHOLD);
    useRestaurantStore.getState().setRating(5);

    expect(useRestaurantStore.getState().gameStatus).toBe('lost');
    expect(useRestaurantStore.getState().lossReason).toBe('rating');
  });
});
