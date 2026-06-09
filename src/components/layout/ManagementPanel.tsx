import { useRestaurantStore } from '../../store/useRestaurantStore';
import { useSimulationStore } from '../../store/useSimulationStore';
import { createWaiter } from '../../entities/waiter/factory';
import { createChef } from '../../entities/chef/factory';
import { createTable } from '../../entities/table/factory';
import { WAITER_COST, CHEF_COST, TABLE_COST } from '../../utils/constants';

export function ManagementPanel() {
  const { money, addMoney } = useRestaurantStore();
  const { addWaiter, addChef, addTable, tables } = useSimulationStore();

  function hire(cost: number, fn: () => void) {
    if (money >= cost) { addMoney(-cost); fn(); }
  }

  return (
    <div className="flex items-center gap-3 bg-gray-900 border-t border-gray-700 px-4 py-2">
      <span className="text-xs text-gray-400 uppercase tracking-wider mr-2">Hire / Buy</span>

      <button
        disabled={money < WAITER_COST}
        onClick={() => hire(WAITER_COST, () => addWaiter(createWaiter()))}
        className="flex flex-col items-center px-3 py-1 rounded bg-blue-800 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs transition-colors"
      >
        <span>🧑 Waiter</span>
        <span className="text-blue-300">${WAITER_COST}</span>
      </button>

      <button
        disabled={money < CHEF_COST}
        onClick={() => hire(CHEF_COST, () => addChef(createChef()))}
        className="flex flex-col items-center px-3 py-1 rounded bg-orange-800 hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs transition-colors"
      >
        <span>👨‍🍳 Chef</span>
        <span className="text-orange-300">${CHEF_COST}</span>
      </button>

      <button
        disabled={money < TABLE_COST || tables.length >= 16}
        onClick={() => hire(TABLE_COST, () => addTable(createTable(tables.length)))}
        className="flex flex-col items-center px-3 py-1 rounded bg-green-800 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs transition-colors"
      >
        <span>🪑 Table</span>
        <span className="text-green-300">${TABLE_COST}</span>
      </button>

      <span className="ml-auto text-xs text-gray-500">Tables: {tables.length}/16</span>
    </div>
  );
}
