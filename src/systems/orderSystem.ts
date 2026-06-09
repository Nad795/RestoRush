import { useSimulationStore } from '../store/useSimulationStore';

export function runOrderSystem(): void {
  const { orders, customers, waiters, removeOrder, updateOrder, updateWaiter } =
    useSimulationStore.getState();

  for (const order of orders) {
    const customerAlive = customers.some((c) => c.id === order.customerId);

    // Orphan: customer left while order was still in-flight — fast-forward to COMPLETED
    if (!customerAlive && order.state !== 'COMPLETED') {
      updateOrder(order.id, { state: 'COMPLETED' });

      // Bug 5 fix: free any waiter stuck waiting for this order
      const stuck = waiters.find((w) => w.assignedOrderId === order.id);
      if (stuck) {
        updateWaiter(stuck.id, {
          state: 'IDLE',
          assignedOrderId: null,
          assignedCustomerId: null,
          taskTimer: 0,
        });
      }
      continue;
    }

    if (order.state === 'COMPLETED') {
      removeOrder(order.id);
    }
  }
}
