// All timing values are in real milliseconds (simulation speed scales them)

export const SPAWN_INTERVAL_MS = 5000;       // new customer every 5s
export const PATIENCE_DRAIN_PER_S = 4;       // patience points lost per second while waiting
export const HAPPINESS_DRAIN_PER_S = 3;      // happiness lost per second while ANGRY

export const ORDER_WAIT_MS = 3000;           // waiter walks to table to take order
export const COOK_TIME_MS = 6000;            // chef cooks one dish
export const SERVE_WAIT_MS = 3000;           // waiter carries food to table
export const EAT_TIME_MS = 8000;             // customer eats
export const LEAVE_PAUSE_MS = 1000;          // brief pause before customer removed
export const CLEAN_TABLE_MS = 3000;          // waiter cleans dirty table

// Anger / leaving thresholds
export const PATIENCE_ANGER_THRESHOLD = 20;  // customer goes ANGRY below this
export const PATIENCE_LEAVE_THRESHOLD = 0;   // customer leaves if hits 0

// Hire / buy costs
export const WAITER_COST = 150;
export const CHEF_COST = 200;
export const TABLE_COST = 100;

// Rating impact
export const RATING_HIT_ANGRY = 0.1;        // subtracted per angry customer
export const RATING_RECOVER_HAPPY = 0.05;   // added per satisfied customer
