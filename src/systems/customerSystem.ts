import { useSimulationStore } from '../store/useSimulationStore';
import { useRestaurantStore } from '../store/useRestaurantStore';
import { stepEntity } from '../fsm/stepEntity';
import { CUSTOMER_FSM_CONFIG } from '../fsm/configs';
import { createOrder } from '../entities/order/factory';
import {
  PATIENCE_DRAIN_PER_S,
  PATIENCE_ANGER_THRESHOLD,
  EAT_TIME_MS,
  RATING_HIT_ANGRY,
  RATING_RECOVER_HAPPY,
} from '../utils/constants';

export function runCustomerSystem(delta: number): void {
  const { customers, tables, orders, updateCustomer, removeCustomer, addOrder, updateTable } =
    useSimulationStore.getState();
  const { addMoney, setRating, rating } = useRestaurantStore.getState();

  for (const customer of customers) {
    switch (customer.state) {
      case 'SPAWN': {
        updateCustomer(customer.id, {
          state: stepEntity(CUSTOMER_FSM_CONFIG, 'SPAWN', 'FIND_TABLE'),
        });
        break;
      }

      case 'FIND_TABLE': {
        const freeTable = tables.find((t) => t.state === 'AVAILABLE');
        if (freeTable) {
          // Claim table immediately so no other customer steals it this tick
          updateTable(freeTable.id, { state: 'OCCUPIED', occupiedBy: customer.id });
          updateCustomer(customer.id, {
            state: stepEntity(CUSTOMER_FSM_CONFIG, 'FIND_TABLE', 'ORDERING'),
            tableId: freeTable.id,
          });
        } else {
          // No table — leave rather than wait forever
          updateCustomer(customer.id, {
            state: stepEntity(CUSTOMER_FSM_CONFIG, 'FIND_TABLE', 'LEAVING'),
          });
        }
        break;
      }

      case 'ORDERING': {
        // Place order immediately; waiter will pick it up
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
        const drainedPatience =
          customer.patience - (PATIENCE_DRAIN_PER_S * delta) / 1000;
        const newPatience = Math.max(0, drainedPatience);
        const newWaitTimer = customer.waitTimer + delta;

        // Check if food has arrived (order state SERVED)
        const order = orders.find((o) => o.id === customer.orderId);
        if (order?.state === 'SERVED') {
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
        } else {
          updateCustomer(customer.id, {
            patience: newPatience,
            waitTimer: newWaitTimer,
          });
        }
        break;
      }

      case 'ANGRY': {
        // Angry customers leave immediately
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
        removeCustomer(customer.id);
        break;
      }
    }
  }
}
