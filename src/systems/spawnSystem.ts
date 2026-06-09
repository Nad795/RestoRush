import { useSimulationStore } from '../store/useSimulationStore';
import { createCustomer } from '../entities/customer/factory';
import { SPAWN_INTERVAL_MS } from '../utils/constants';

// Returns updated accumulator — simulationLoop owns the value in a ref
export function runSpawnSystem(delta: number, accumulator: number): number {
  const next = accumulator + delta;
  if (next < SPAWN_INTERVAL_MS) return next;

  const { tables, customers } = useSimulationStore.getState();

  // Cap active customers at 2× table count so the floor never floods
  const maxCustomers = Math.max(tables.length * 2, 4);
  const active = customers.filter((c) => c.state !== 'LEAVING').length;
  if (active < maxCustomers) {
    useSimulationStore.getState().addCustomer(createCustomer());
  }

  return 0;
}
