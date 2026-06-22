// All timing values are in real milliseconds (simulation speed scales them)

export const SPAWN_INTERVAL_MS   = 9000;   // base: new customer every 9s — deliberately slow
                                            // without advertising (see AD_TIERS in utils/advertising.ts)
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

// Win/lose conditions
export const GAME_LENGTH_DAYS = 21;        // game ends after this many days
export const GOAL_MONEY = 1000;            // win if money >= this by end of day 21
export const RATING_LOSS_THRESHOLD = 1.0;  // instant loss if rating drops to/below this

// Daily staff wages — deducted from money on each day rollover. Meaningfully
// smaller than WAITER_COST/CHEF_COST per-day, but a real running cost: the
// starting 1 waiter + 1 chef cost $45/day, ~$945 over 21 days.
export const WAITER_DAILY_WAGE = 10;
export const CHEF_DAILY_WAGE   = 15;

// Loyalty
export const LOYALTY_GAIN_PER_HAPPY       = 2;   // +loyalty per happy "served before anger"
export const LOYALTY_LOSS_PER_ANGRY_LOYAL = 5;   // -loyalty when a loyalty customer goes ANGRY
export const LOYALTY_MAX = 100;                  // cap; also denominator for trickle-spawn chance

// Spawn rate scaling (rating affects base spawn rate; ads add a multiplier)
export const RATING_SPAWN_MULT_MIN = 0.5;  // at rating = 1
export const RATING_SPAWN_MULT_MAX = 1.5;  // at rating = 5

// Floor layout coordinates (pixels) — virtual resolution, CSS-scaled to fill container
export const FLOOR_W = 960;
export const FLOOR_H = 640;
export const WALL_H = 60;             // top wall height (windows/decorations, not walkable)
export const KITCHEN_W = 100;         // vertical kitchen strip width (left side)
export const KITCHEN_PASS_X = 110;    // x where waiters idle near kitchen pass-through
export const ENTRANCE_X = 935;
export const ENTRANCE_Y = 320;
