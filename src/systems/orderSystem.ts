import { useSimulationStore } from '../store/useSimulationStore';

// Orders are driven entirely by chefSystem and waiterSystem.
// This system handles cleanup: remove COMPLETED orders so the queue stays tidy.
export function runOrderSystem(): void {
  const { orders, removeOrder } = useSimulationStore.getState();
  for (const order of orders) {
    if (order.state === 'COMPLETED') {
      removeOrder(order.id);
    }
  }
}
