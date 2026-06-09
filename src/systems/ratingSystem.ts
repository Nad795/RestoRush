import { useSimulationStore } from '../store/useSimulationStore';
import { useRestaurantStore } from '../store/useRestaurantStore';

// Slowly recovers rating over time when customers are eating happily.
// Larger impacts (angry / paying) are applied directly in customerSystem.
export function runRatingSystem(delta: number): void {
  const { customers } = useSimulationStore.getState();
  const { rating, setRating } = useRestaurantStore.getState();

  const eatingCount = customers.filter((c) => c.state === 'EATING').length;
  if (eatingCount > 0) {
    // +0.001 per eating customer per second — gentle passive recovery
    const recovery = (eatingCount * 0.001 * delta) / 1000;
    setRating(Math.min(5, rating + recovery));
  }
}
