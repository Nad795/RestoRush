import { useSimulationStore } from '../store/useSimulationStore';
import { createTable } from '../entities/table/factory';
import { createWaiter } from '../entities/waiter/factory';
import { createChef } from '../entities/chef/factory';

// Seeds the store with starting entities so the game is immediately playable
export function initRestaurant(): void {
  const store = useSimulationStore.getState();
  // Only initialise once (idempotent guard)
  if (store.tables.length > 0) return;

  for (let i = 0; i < 5; i++) store.addTable(createTable(i));
  store.addWaiter(createWaiter());
  store.addChef(createChef());
}
