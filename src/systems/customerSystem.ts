import { useSimulationStore } from '../store/useSimulationStore';
import { useRestaurantStore } from '../store/useRestaurantStore';
import { stepEntity } from '../fsm/stepEntity';
import { CUSTOMER_FSM_CONFIG, ORDER_FSM_CONFIG } from '../fsm/configs';
import { createOrder } from '../entities/order/factory';
import {
  PATIENCE_DRAIN_PER_S,
  PATIENCE_ANGER_THRESHOLD,
  EAT_TIME_MS,
  RATING_HIT_ANGRY,
  RATING_RECOVER_HAPPY,
  ENTRANCE_X,
  ENTRANCE_Y,
} from '../utils/constants';

export function runCustomerSystem(delta: number): void {
  const { customers, tables, orders, updateCustomer, removeCustomer, addOrder, updateTable, updateOrder } =
    useSimulationStore.getState();
  const { addMoney, setRating, rating, recordServed, recordAngry } = useRestaurantStore.getState();

  for (const customer of customers) {
    switch (customer.state) {
      case 'SPAWN': {
        updateCustomer(customer.id, {
          state: stepEntity(CUSTOMER_FSM_CONFIG, 'SPAWN', 'FIND_TABLE'),
        });
        break;
      }

      case 'FIND_TABLE': {
        // Re-read tables from store so we see claims made earlier this same tick
        const freshTables = useSimulationStore.getState().tables;
        const freeTable = freshTables.find((t) => t.state === 'AVAILABLE');
        if (freeTable) {
          updateTable(freeTable.id, { state: 'OCCUPIED', occupiedBy: customer.id });
          updateCustomer(customer.id, {
            state: stepEntity(CUSTOMER_FSM_CONFIG, 'FIND_TABLE', 'ORDERING'),
            tableId: freeTable.id,
            posX: freeTable.x,
            posY: freeTable.y - 25,
          });
        } else {
          updateCustomer(customer.id, {
            state: stepEntity(CUSTOMER_FSM_CONFIG, 'FIND_TABLE', 'LEAVING'),
            posX: ENTRANCE_X,
            posY: ENTRANCE_Y,
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
        const newPatience = Math.max(0, customer.patience - (PATIENCE_DRAIN_PER_S * delta) / 1000);
        const newWaitTimer = customer.waitTimer + delta;

        const order = orders.find((o) => o.id === customer.orderId);
        if (order?.state === 'SERVED') {
          // Food received — mark order completed and start eating
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
        // Free the table
        if (customer.tableId) {
          const table = tables.find((t) => t.id === customer.tableId);
          if (table?.state === 'OCCUPIED') {
            updateTable(customer.tableId, { state: 'DIRTY', occupiedBy: null });
          }
        }
        updateCustomer(customer.id, { posX: ENTRANCE_X, posY: ENTRANCE_Y });
        removeCustomer(customer.id);
        break;
      }
    }
  }
}
