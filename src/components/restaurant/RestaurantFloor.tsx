import { useSimulationStore } from '../../store/useSimulationStore';
import { TableView } from './TableView';
import { CustomerView } from './CustomerView';
import { WaiterView } from './WaiterView';
import { ChefView } from './ChefView';

const FLOOR_W = 720;
const FLOOR_H = 480;

export function RestaurantFloor() {
  const tables    = useSimulationStore((s) => s.tables);
  const customers = useSimulationStore((s) => s.customers);
  const waiters   = useSimulationStore((s) => s.waiters);
  const chefs     = useSimulationStore((s) => s.chefs);

  const activeCustomers = customers.filter((c) => c.state !== 'LEAVING');

  return (
    <div className="flex-1 bg-gray-800 overflow-hidden flex items-center justify-center">
      {/* Floor canvas */}
      <div
        className="relative bg-gray-850 border-2 border-gray-600 rounded-lg overflow-hidden"
        style={{
          width: FLOOR_W,
          height: FLOOR_H,
          background: 'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,0.03) 40px), repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,0.03) 40px)',
        }}
      >
        {/* Kitchen zone label */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gray-900 border-t border-gray-700 flex items-center px-4">
          <span className="text-xs text-gray-500 uppercase tracking-widest mr-4">Kitchen</span>
          <div className="flex gap-3">
            {chefs.map((c, i) => <ChefView key={c.id} chef={c} index={i} />)}
          </div>
          <div className="flex gap-3 ml-auto">
            {waiters.map((w, i) => <WaiterView key={w.id} waiter={w} index={i} />)}
          </div>
        </div>

        {/* Tables */}
        {tables.map((t) => <TableView key={t.id} table={t} />)}

        {/* Customers */}
        {activeCustomers.map((c) => <CustomerView key={c.id} customer={c} />)}

        {/* Entrance label */}
        <div className="absolute top-2 right-3 text-xs text-gray-600">🚪 Entrance</div>
      </div>
    </div>
  );
}
