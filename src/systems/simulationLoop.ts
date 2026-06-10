import { useRestaurantStore } from '../store/useRestaurantStore';
import { useSimulationStore } from '../store/useSimulationStore';
import { runSpawnSystem } from './spawnSystem';
import { runCustomerSystem } from './customerSystem';
import { runWaiterSystem } from './waiterSystem';
import { runChefSystem } from './chefSystem';
import { runTableSystem } from './tableSystem';
import { runOrderSystem } from './orderSystem';
import { runRatingSystem } from './ratingSystem';
import { WAITER_DAILY_WAGE, CHEF_DAILY_WAGE } from '../utils/constants';

export interface SimulationLoopState {
  spawnAccumulator: number;
  lastTimestamp: number;
}

export function createLoopState(): SimulationLoopState {
  return { spawnAccumulator: 0, lastTimestamp: performance.now() };
}

/**
 * Called every animation frame (or on a fixed interval).
 * rawDelta: real ms since last call.
 * speed: simulation multiplier (1 | 2 | 4).
 * Returns updated loop state (immutable — caller holds it in a ref).
 */
export function tickSimulation(
  state: SimulationLoopState,
  rawDelta: number,
  speed: number,
): SimulationLoopState {
  const delta = rawDelta * speed;

  // Systems run in dependency order:
  // spawn → customer (reads tables) → waiter (reads orders) →
  // chef (reads orders) → table (reads nothing) → order cleanup → rating
  const nextAccumulator = runSpawnSystem(delta, state.spawnAccumulator);
  runCustomerSystem(delta);
  runWaiterSystem(delta);
  runChefSystem(delta);
  runTableSystem(delta);
  runOrderSystem();
  runRatingSystem(delta);

  const { waiters, chefs } = useSimulationStore.getState();
  const dailyWageTotal = waiters.length * WAITER_DAILY_WAGE + chefs.length * CHEF_DAILY_WAGE;
  useRestaurantStore.getState().tickDay(delta, dailyWageTotal);

  return {
    spawnAccumulator: nextAccumulator,
    lastTimestamp: performance.now(),
  };
}
