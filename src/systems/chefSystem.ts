import { useSimulationStore } from '../store/useSimulationStore';
import { stepEntity } from '../fsm/stepEntity';
import { CHEF_FSM_CONFIG, ORDER_FSM_CONFIG } from '../fsm/configs';
import { COOK_TIME_MS } from '../utils/constants';

export function runChefSystem(delta: number): void {
  const { chefs, orders, updateChef, updateOrder } = useSimulationStore.getState();

  for (const chef of chefs) {
    switch (chef.state) {
      case 'IDLE': {
        // Grab the first order in COOKING state that no chef has claimed yet
        const unclaimed = orders.find(
          (o) =>
            o.state === 'COOKING' &&
            !chefs.some((c) => c.currentOrderId === o.id),
        );
        if (unclaimed) {
          updateChef(chef.id, {
            state: stepEntity(CHEF_FSM_CONFIG, 'IDLE', 'COOKING'),
            currentOrderId: unclaimed.id,
            cookTimer: 0,
          });
        }
        break;
      }

      case 'COOKING': {
        const newTimer = chef.cookTimer + delta;
        if (newTimer >= COOK_TIME_MS) {
          // Food done — mark order READY
          if (chef.currentOrderId) {
            updateOrder(chef.currentOrderId, {
              state: stepEntity(ORDER_FSM_CONFIG, 'COOKING', 'READY'),
            });
          }
          updateChef(chef.id, {
            state: stepEntity(CHEF_FSM_CONFIG, 'COOKING', 'FOOD_READY'),
            cookTimer: 0,
          });
        } else {
          updateChef(chef.id, { cookTimer: newTimer });
        }
        break;
      }

      case 'FOOD_READY': {
        // Clear and go idle so next order can be picked up
        updateChef(chef.id, {
          state: stepEntity(CHEF_FSM_CONFIG, 'FOOD_READY', 'IDLE'),
          currentOrderId: null,
        });
        break;
      }
    }
  }
}
