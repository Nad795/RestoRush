import { useSimulationStore } from '../store/useSimulationStore';
import { stepEntity } from '../fsm/stepEntity';
import { CHEF_FSM_CONFIG, ORDER_FSM_CONFIG } from '../fsm/configs';
import { COOK_TIME_MS } from '../utils/constants';

export function runChefSystem(delta: number): void {
  const { chefs, orders, updateChef, updateOrder } = useSimulationStore.getState();

  // Track order IDs claimed this tick so two chefs don't cook the same dish
  const claimedThisTick = new Set<string>(
    chefs.filter((c) => c.currentOrderId).map((c) => c.currentOrderId as string),
  );

  for (const chef of chefs) {
    switch (chef.state) {
      case 'IDLE': {
        const unclaimed = orders.find(
          (o) => o.state === 'COOKING' && !claimedThisTick.has(o.id),
        );
        if (unclaimed) {
          claimedThisTick.add(unclaimed.id);
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
        const order = chef.currentOrderId
          ? orders.find((o) => o.id === chef.currentOrderId)
          : undefined;
        const cookTimeMs = order?.cookTimeMs ?? COOK_TIME_MS;
        if (newTimer >= cookTimeMs) {
          if (chef.currentOrderId && order?.state === 'COOKING') {
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
        updateChef(chef.id, {
          state: stepEntity(CHEF_FSM_CONFIG, 'FOOD_READY', 'IDLE'),
          currentOrderId: null,
        });
        break;
      }
    }
  }
}
