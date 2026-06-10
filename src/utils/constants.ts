// All timing values are in real milliseconds (simulation speed scales them)

export const SPAWN_INTERVAL_MS   = 6000;   // new customer every 6s (slightly slower than Stage 4)
export const PATIENCE_DRAIN_PER_S = 1.5;   // 1.5pts/s — gives ~53s before anger at patience=100
export const HAPPINESS_DRAIN_PER_S = 3;

export const ORDER_WAIT_MS  = 2500;        // waiter takes the order once at the table
export const COOK_TIME_MS   = 7000;        // chef cooks one dish
export const SERVE_WAIT_MS  = 2000;        // waiter serves the food once back at the table
export const EAT_TIME_MS    = 9000;        // customer eats (longer = table occupied longer = harder)
export const LEAVE_PAUSE_MS = 1000;
export const CLEAN_TABLE_MS = 2000;        // fast clean so tables recycle quickly

// Waiter transitions are arrival-gated (waiterSystem waits for the walk along
// buildPath() to actually finish before starting these timers), so a full
// cycle for the nearest table is roughly:
//   walk-to-table (~4.5s) + ORDER_WAIT (2.5s) + walk-to-kitchen (~4.5s)
//   + remaining cook time + walk-to-table (~4.5s) + SERVE_WAIT (2s) ≈ 22s
// (farther tables take longer). Patience 100→20 in ~53.3s — leaves a healthy
// buffer even for the lowest starting patience (60→20 in ~26.7s).

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

// Floor layout coordinates (pixels)
export const FLOOR_W = 720;
export const FLOOR_H = 480;
export const KITCHEN_Y = 456;         // waiter/chef idle Y
export const ENTRANCE_X = 685;
export const ENTRANCE_Y = 210;
