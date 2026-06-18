import { useSimulationStore } from '../store/useSimulationStore';
import { stepEntity } from '../fsm/stepEntity';
import { WAITER_FSM_CONFIG, ORDER_FSM_CONFIG } from '../fsm/configs';
import { buildPath } from '../utils/pathfinding';
import { ORDER_WAIT_MS, SERVE_WAIT_MS, KITCHEN_PASS_X } from '../utils/constants';

// Waiter approaches from the RIGHT side of the table (aisle between columns)
const SERVE_OFFSET_X = 48;
const SERVE_OFFSET_Y = 0;

function kitchenSlot(waiterId: string): { x: number; y: number } {
  const num = parseInt(waiterId.replace(/\D/g, ''), 10) || 1;
  return { x: KITCHEN_PASS_X, y: 60 + ((num - 1) % 6) * 90 };
}

export function runWaiterSystem(delta: number): void {
  const { waiters, orders, tables, updateWaiter, updateOrder } =
    useSimulationStore.getState();

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
          claimedThisTick.add(pendingOrder.id);
          // Walk to customer's table to take order
          const table = tables.find((t) => t.id === pendingOrder.tableId);
          const dest = table
            ? { x: table.x + SERVE_OFFSET_X, y: table.y + SERVE_OFFSET_Y }
            : kitchenSlot(waiter.id);
          updateWaiter(waiter.id, {
            state: stepEntity(WAITER_FSM_CONFIG, 'IDLE', 'TAKE_ORDER'),
            assignedOrderId: pendingOrder.id,
            assignedCustomerId: pendingOrder.customerId,
            taskTimer: 0,
            path: buildPath({ x: waiter.posX, y: waiter.posY }, dest),
            pathIndex: 0,
          });
        }
        break;
      }

      case 'TAKE_ORDER': {
        const arrived = waiter.pathIndex >= waiter.path.length;
        if (!arrived) break;

        const newTimer = waiter.taskTimer + delta;
        if (newTimer >= ORDER_WAIT_MS) {
          // Order taken — walk to kitchen to hand it off (cooking starts on arrival)
          const slot = kitchenSlot(waiter.id);
          updateWaiter(waiter.id, {
            state: stepEntity(WAITER_FSM_CONFIG, 'TAKE_ORDER', 'DELIVER_TO_KITCHEN'),
            taskTimer: 0,
            path: buildPath({ x: waiter.posX, y: waiter.posY }, slot),
            pathIndex: 0,
          });
        } else {
          updateWaiter(waiter.id, { taskTimer: newTimer });
        }
        break;
      }

      case 'DELIVER_TO_KITCHEN': {
        const arrived = waiter.pathIndex >= waiter.path.length;
        if (!arrived) break;

        // Hand off ticket to kitchen — cooking starts now
        if (waiter.assignedOrderId) {
          const order = orders.find((o) => o.id === waiter.assignedOrderId);
          if (order?.state === 'CREATED') {
            updateOrder(waiter.assignedOrderId, {
              state: stepEntity(ORDER_FSM_CONFIG, order.state, 'COOKING'),
            });
          }
        }

        updateWaiter(waiter.id, {
          state: stepEntity(WAITER_FSM_CONFIG, 'DELIVER_TO_KITCHEN', 'PICKUP_FOOD'),
          taskTimer: 0,
          path: [],
          pathIndex: 0,
        });
        break;
      }

      case 'PICKUP_FOOD': {
        if (waiter.assignedOrderId) {
          const order = orders.find((o) => o.id === waiter.assignedOrderId);
          if (!order) {
            // Orphaned order — go back to idle
            const slot = kitchenSlot(waiter.id);
            updateWaiter(waiter.id, {
              state: 'IDLE',
              assignedOrderId: null,
              assignedCustomerId: null,
              taskTimer: 0,
              path: buildPath({ x: waiter.posX, y: waiter.posY }, slot),
              pathIndex: 0,
            });
          } else if (order.state === 'READY') {
            // Walk to customer's table to serve
            const table = tables.find((t) => t.id === order.tableId);
            const dest = table
              ? { x: table.x + SERVE_OFFSET_X, y: table.y + SERVE_OFFSET_Y }
              : kitchenSlot(waiter.id);
            updateWaiter(waiter.id, {
              state: stepEntity(WAITER_FSM_CONFIG, 'PICKUP_FOOD', 'SERVE_FOOD'),
              taskTimer: 0,
              path: buildPath({ x: waiter.posX, y: waiter.posY }, dest),
              pathIndex: 0,
            });
          }
        }
        break;
      }

      case 'SERVE_FOOD': {
        // Wait until the waiter has actually walked to the table before
        // starting the "serving the food" timer.
        const arrived = waiter.pathIndex >= waiter.path.length;
        if (!arrived) break;

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
          // Walk back to kitchen slot
          const slot = kitchenSlot(waiter.id);
          updateWaiter(waiter.id, {
            state: stepEntity(WAITER_FSM_CONFIG, 'SERVE_FOOD', 'IDLE'),
            assignedOrderId: null,
            assignedCustomerId: null,
            taskTimer: 0,
            path: buildPath({ x: waiter.posX, y: waiter.posY }, slot),
            pathIndex: 0,
          });
        } else {
          updateWaiter(waiter.id, { taskTimer: newTimer });
        }
        break;
      }
    }
  }
}
