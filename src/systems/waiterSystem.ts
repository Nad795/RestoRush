import { useSimulationStore } from '../store/useSimulationStore';
import { stepEntity } from '../fsm/stepEntity';
import { WAITER_FSM_CONFIG, ORDER_FSM_CONFIG } from '../fsm/configs';
import { ORDER_WAIT_MS, SERVE_WAIT_MS } from '../utils/constants';

export function runWaiterSystem(delta: number): void {
  const { waiters, orders, updateWaiter, updateOrder } = useSimulationStore.getState();

  // Track order IDs claimed this tick so two waiters don't grab the same one
  const claimedThisTick = new Set<string>(
    waiters.filter((w) => w.assignedOrderId).map((w) => w.assignedOrderId as string),
  );

  for (const waiter of waiters) {
    switch (waiter.state) {
      case 'IDLE': {
        const pendingOrder = orders.find(
          (o) => o.state === 'CREATED' && !claimedThisTick.has(o.id),
        );
        if (pendingOrder) {
          claimedThisTick.add(pendingOrder.id); // reserve for this tick
          updateWaiter(waiter.id, {
            state: stepEntity(WAITER_FSM_CONFIG, 'IDLE', 'TAKE_ORDER'),
            assignedOrderId: pendingOrder.id,
            assignedCustomerId: pendingOrder.customerId,
            taskTimer: 0,
          });
        }
        break;
      }

      case 'TAKE_ORDER': {
        const newTimer = waiter.taskTimer + delta;
        if (newTimer >= ORDER_WAIT_MS) {
          if (waiter.assignedOrderId) {
            // Read current order state — it may have been orphaned
            const order = orders.find((o) => o.id === waiter.assignedOrderId);
            if (order?.state === 'CREATED') {
              updateOrder(waiter.assignedOrderId, {
                state: stepEntity(ORDER_FSM_CONFIG, order.state, 'COOKING'),
              });
            }
          }
          updateWaiter(waiter.id, {
            state: stepEntity(WAITER_FSM_CONFIG, 'TAKE_ORDER', 'DELIVER_TO_KITCHEN'),
            taskTimer: 0,
          });
        } else {
          updateWaiter(waiter.id, { taskTimer: newTimer });
        }
        break;
      }

      case 'DELIVER_TO_KITCHEN': {
        updateWaiter(waiter.id, {
          state: stepEntity(WAITER_FSM_CONFIG, 'DELIVER_TO_KITCHEN', 'PICKUP_FOOD'),
          taskTimer: 0,
        });
        break;
      }

      case 'PICKUP_FOOD': {
        if (waiter.assignedOrderId) {
          const order = orders.find((o) => o.id === waiter.assignedOrderId);
          if (!order) {
            // Order was orphaned and removed — free the waiter (Bug 5 secondary guard)
            updateWaiter(waiter.id, {
              state: 'IDLE',
              assignedOrderId: null,
              assignedCustomerId: null,
              taskTimer: 0,
            });
          } else if (order.state === 'READY') {
            updateWaiter(waiter.id, {
              state: stepEntity(WAITER_FSM_CONFIG, 'PICKUP_FOOD', 'SERVE_FOOD'),
              taskTimer: 0,
            });
          }
        }
        break;
      }

      case 'SERVE_FOOD': {
        const newTimer = waiter.taskTimer + delta;
        if (newTimer >= SERVE_WAIT_MS) {
          if (waiter.assignedOrderId) {
            const order = orders.find((o) => o.id === waiter.assignedOrderId);
            if (order?.state === 'READY') {
              updateOrder(waiter.assignedOrderId, {
                state: stepEntity(ORDER_FSM_CONFIG, 'READY', 'SERVED'),
              });
            }
          }
          updateWaiter(waiter.id, {
            state: stepEntity(WAITER_FSM_CONFIG, 'SERVE_FOOD', 'IDLE'),
            assignedOrderId: null,
            assignedCustomerId: null,
            taskTimer: 0,
          });
        } else {
          updateWaiter(waiter.id, { taskTimer: newTimer });
        }
        break;
      }
    }
  }
}
