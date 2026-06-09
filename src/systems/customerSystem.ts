import { useSimulationStore } from '../store/useSimulationStore';
import { useRestaurantStore } from '../store/useRestaurantStore';
import { stepEntity } from '../fsm/stepEntity';
import { CUSTOMER_FSM_CONFIG, ORDER_FSM_CONFIG } from '../fsm/configs';
import { createOrder } from '../entities/order/factory';
import { buildPath } from '../utils/pathfinding';
import {
  PATIENCE_DRAIN_PER_S,
  PATIENCE_ANGER_THRESHOLD,
  EAT_TIME_MS,
  RATING_HIT_ANGRY,
  RATING_RECOVER_HAPPY,
  ENTRANCE_X,
  ENTRANCE_Y,
} from '../utils/constants';

// Customer approaches from the LEFT side of their table (leaves aisle clear on right for waiter)
const SEAT_OFFSET_X = -42;
const SEAT_OFFSET_Y =  0;

export function runCustomerSystem(delta: number): void {
  const {
    customers, tables, orders,
    updateCustomer, removeCustomer, addOrder, updateTable, updateOrder,
  } = useSimulationStore.getState();
  const { addMoney, setRating, rating, recordServed, recordAngry } =
    useRestaurantStore.getState();

  for (const customer of customers) {
    switch (customer.state) {
      case 'SPAWN': {
        updateCustomer(customer.id, {
          state: stepEntity(CUSTOMER_FSM_CONFIG, 'SPAWN', 'FIND_TABLE'),
        });
        break;
      }

      case 'FIND_TABLE': {
        const freshTables = useSimulationStore.getState().tables;
        const freeTable = freshTables.find((t) => t.state === 'AVAILABLE');
        if (freeTable) {
          const dest = {
            x: freeTable.x + SEAT_OFFSET_X,
            y: freeTable.y + SEAT_OFFSET_Y,
          };
          updateTable(freeTable.id, { state: 'OCCUPIED', occupiedBy: customer.id });
          updateCustomer(customer.id, {
            state: stepEntity(CUSTOMER_FSM_CONFIG, 'FIND_TABLE', 'ORDERING'),
            tableId: freeTable.id,
            path: buildPath({ x: customer.posX, y: customer.posY }, dest),
            pathIndex: 0,
          });
        } else {
          updateCustomer(customer.id, {
            state: stepEntity(CUSTOMER_FSM_CONFIG, 'FIND_TABLE', 'LEAVING'),
          });
        }
        break;
      }

      case 'ORDERING': {
        if (!customer.orderId && customer.tableId) {
          const order = createOrder(customer.id, customer.tableId, customer.menuItem);
          addOrder(order);
          updateCustomer(customer.id, {
            state: stepEntity(CUSTOMER_FSM_CONFIG, 'ORDERING', 'WAITING'),
            orderId: order.id,
          });
        }
        break;
      }

      case 'WAITING': {
        const newPatience = Math.max(
          0,
          customer.patience - (PATIENCE_DRAIN_PER_S * delta) / 1000,
        );
        const newWaitTimer = customer.waitTimer + delta;
        const order = orders.find((o) => o.id === customer.orderId);

        if (order?.state === 'SERVED') {
          updateOrder(order.id, {
            state: stepEntity(ORDER_FSM_CONFIG, 'SERVED', 'COMPLETED'),
          });
          updateCustomer(customer.id, {
            state: stepEntity(CUSTOMER_FSM_CONFIG, 'WAITING', 'EATING'),
            patience: newPatience,
            waitTimer: newWaitTimer,
          });
        } else if (newPatience <= PATIENCE_ANGER_THRESHOLD) {
          updateCustomer(customer.id, {
            state: stepEntity(CUSTOMER_FSM_CONFIG, 'WAITING', 'ANGRY'),
            patience: newPatience,
            waitTimer: newWaitTimer,
          });
          setRating(rating - RATING_HIT_ANGRY);
          recordAngry();
        } else {
          updateCustomer(customer.id, { patience: newPatience, waitTimer: newWaitTimer });
        }
        break;
      }

      case 'ANGRY': {
        updateCustomer(customer.id, {
          state: stepEntity(CUSTOMER_FSM_CONFIG, 'ANGRY', 'LEAVING'),
        });
        break;
      }

      case 'EATING': {
        const newEatTimer = customer.eatTimer + delta;
        if (newEatTimer >= EAT_TIME_MS) {
          updateCustomer(customer.id, {
            state: stepEntity(CUSTOMER_FSM_CONFIG, 'EATING', 'PAYING'),
            eatTimer: newEatTimer,
          });
        } else {
          updateCustomer(customer.id, { eatTimer: newEatTimer });
        }
        break;
      }

      case 'PAYING': {
        addMoney(customer.spendingAmount);
        recordServed(customer.spendingAmount);
        setRating(Math.min(5, rating + RATING_RECOVER_HAPPY));
        updateCustomer(customer.id, {
          state: stepEntity(CUSTOMER_FSM_CONFIG, 'PAYING', 'LEAVING'),
        });
        break;
      }

      case 'LEAVING': {
        if (customer.tableId) {
          // First entry into LEAVING: free table and start walking to exit
          const table = tables.find((t) => t.id === customer.tableId);
          if (table?.state === 'OCCUPIED') {
            updateTable(customer.tableId, { state: 'DIRTY', occupiedBy: null });
          }
          updateCustomer(customer.id, {
            tableId: null,
            path: buildPath(
              { x: customer.posX, y: customer.posY },
              { x: ENTRANCE_X, y: ENTRANCE_Y },
            ),
            pathIndex: 0,
          });
        } else if (customer.pathIndex >= customer.path.length) {
          // Reached the exit — remove from simulation
          removeCustomer(customer.id);
        }
        break;
      }
    }
  }
}
