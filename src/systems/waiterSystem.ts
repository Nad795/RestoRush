import { useSimulationStore } from '../store/useSimulationStore';
import { stepEntity } from '../fsm/stepEntity';
import { WAITER_FSM_CONFIG } from '../fsm/configs';
import { ORDER_FSM_CONFIG } from '../fsm/configs';
import { ORDER_WAIT_MS, SERVE_WAIT_MS } from '../utils/constants';

export function runWaiterSystem(delta: number): void {
  const { waiters, orders, updateWaiter, updateOrder } = useSimulationStore.getState();

  for (const waiter of waiters) {
    switch (waiter.state) {
      case 'IDLE': {
        // Pick up the first order that was just CREATED and has no waiter yet
        const pendingOrder = orders.find(
          (o) =>
            o.state === 'CREATED' &&
            !waiters.some((w) => w.assignedOrderId === o.id),
        );
        if (pendingOrder) {
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
        // Walk to the table — simulated by a timer
        const newTimer = waiter.taskTimer + delta;
        if (newTimer >= ORDER_WAIT_MS) {
          updateWaiter(waiter.id, {
            state: stepEntity(WAITER_FSM_CONFIG, 'TAKE_ORDER', 'DELIVER_TO_KITCHEN'),
            taskTimer: 0,
          });
          // Advance order into the kitchen queue
          if (waiter.assignedOrderId) {
            updateOrder(waiter.assignedOrderId, {
              state: stepEntity(ORDER_FSM_CONFIG, 'CREATED', 'COOKING'),
            });
          }
        } else {
          updateWaiter(waiter.id, { taskTimer: newTimer });
        }
        break;
      }

      case 'DELIVER_TO_KITCHEN': {
        // Instantly transition — waiter dropped the ticket off, now waits for food
        updateWaiter(waiter.id, {
          state: stepEntity(WAITER_FSM_CONFIG, 'DELIVER_TO_KITCHEN', 'PICKUP_FOOD'),
          taskTimer: 0,
        });
        break;
      }

      case 'PICKUP_FOOD': {
        // Wait until the chef marks the order READY
        if (waiter.assignedOrderId) {
          const order = orders.find((o) => o.id === waiter.assignedOrderId);
          if (order?.state === 'READY') {
            updateWaiter(waiter.id, {
              state: stepEntity(WAITER_FSM_CONFIG, 'PICKUP_FOOD', 'SERVE_FOOD'),
              taskTimer: 0,
            });
          }
        }
        break;
      }

      case 'SERVE_FOOD': {
        // Walk food to the table
        const newTimer = waiter.taskTimer + delta;
        if (newTimer >= SERVE_WAIT_MS) {
          if (waiter.assignedOrderId) {
            updateOrder(waiter.assignedOrderId, {
              state: stepEntity(ORDER_FSM_CONFIG, 'READY', 'SERVED'),
            });
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
