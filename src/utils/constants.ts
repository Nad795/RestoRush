// All timing values are in real milliseconds (simulation speed scales them)

export const SPAWN_INTERVAL_MS   = 6000;   // new customer every 6s (slightly slower than Stage 4)
export const PATIENCE_DRAIN_PER_S = 3;     // 3pts/s — gives ~27s before anger at patience=100
export const HAPPINESS_DRAIN_PER_S = 3;

export const ORDER_WAIT_MS  = 2500;        // waiter walks to table
export const COOK_TIME_MS   = 7000;        // chef cooks one dish
export const SERVE_WAIT_MS  = 2000;        // waiter delivers food
export const EAT_TIME_MS    = 9000;        // customer eats (longer = table occupied longer = harder)
export const LEAVE_PAUSE_MS = 1000;
export const CLEAN_TABLE_MS = 2000;        // fast clean so tables recycle quickly

// Total 1-waiter-1-chef service time: 2.5 + 7 + 2 = 11.5s
// Patience 100→20 in ~26.7s — leaves ~15s buffer, comfortable with 1 staff each
// Patience 60→20 in ~13.3s — tight! second queued customer will often get angry

// Anger / leaving thresholds
export const PATIENCE_ANGER_THRESHOLD = 20;
export const PATIENCE_LEAVE_THRESHOLD = 0;

// Starting money — enough to hire 1 extra waiter or chef immediately
export const STARTING_MONEY = 500;

// Hire / buy costs
export const WAITER_COST = 150;
export const CHEF_COST   = 200;
export const TABLE_COST  = 100;

// Rating impact
export const RATING_HIT_ANGRY      = 0.15;  // harder penalty — keeps rating meaningful
export const RATING_RECOVER_HAPPY  = 0.04;  // slower recovery than penalty

// Day length in real ms (speed-scaled)
export const DAY_DURATION_MS = 90_000;     // 90s real-time = 1 game day at 1×
