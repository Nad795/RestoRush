import { useSimulationStore } from '../store/useSimulationStore';
import { useRestaurantStore } from '../store/useRestaurantStore';
import { createCustomer } from '../entities/customer/factory';
import {
  SPAWN_INTERVAL_MS,
  RATING_SPAWN_MULT_MIN,
  RATING_SPAWN_MULT_MAX,
  LOYALTY_MAX,
} from '../utils/constants';

// Base spawn interval, scaled down by rating (better rating -> more frequent
// customers) and further by an active ad campaign's spawn bonus (1 = none).
export function getSpawnInterval(rating: number, adSpawnBonus: number): number {
  const ratingMult =
    RATING_SPAWN_MULT_MIN +
    ((rating - 1) / 4) * (RATING_SPAWN_MULT_MAX - RATING_SPAWN_MULT_MIN);
  return SPAWN_INTERVAL_MS / (ratingMult * adSpawnBonus);
}

// Returns updated accumulator — simulationLoop owns the value in a ref
export function runSpawnSystem(delta: number, accumulator: number): number {
  const { rating, adDaysRemaining, adSpawnBonus, loyalty } = useRestaurantStore.getState();
  const effectiveInterval = getSpawnInterval(rating, adDaysRemaining > 0 ? adSpawnBonus : 1);

  const next = accumulator + delta;
  if (next < effectiveInterval) return next;

  const { tables, addCustomer } = useSimulationStore.getState();
  const maxCustomers = Math.max(tables.length * 2, 4);

  const activeCount = () =>
    useSimulationStore.getState().customers.filter((c) => c.state !== 'LEAVING').length;

  // Base spawn, scaled by rating/ads
  if (activeCount() < maxCustomers) {
    addCustomer(createCustomer('base'));
  }

  // Loyalty trickle: an additional, independent chance for a returning regular
  if (Math.random() < loyalty / LOYALTY_MAX && activeCount() < maxCustomers) {
    addCustomer(createCustomer('loyalty'));
  }

  return 0;
}
