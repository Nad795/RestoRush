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
    <div className="flex-1 bg-gray-800 overflow-hidden flex items-center justify-center p-2">
      <div
        className="relative border-2 border-gray-600 rounded-lg overflow-hidden flex-shrink-0"
        style={{
          width: FLOOR_W,
          height: FLOOR_H,
          background:
            'repeating-linear-gradient(0deg,transparent,transparent 44px,rgba(255,255,255,0.025) 45px),' +
            'repeating-linear-gradient(90deg,transparent,transparent 44px,rgba(255,255,255,0.025) 45px),' +
            '#1f2937',
        }}
      >
        {/* Labels */}
        <div className="absolute top-2 left-3 text-[10px] text-gray-600 uppercase tracking-widest select-none">Dining Area</div>
        <div className="absolute top-2 right-3 text-xs text-gray-500 select-none">🚪 Entrance</div>

        {/* Tables */}
        {tables.map((t) => <TableView key={t.id} table={t} />)}

        {/* Customers — absolutely positioned by posX/posY */}
        {activeCustomers.map((c) => <CustomerView key={c.id} customer={c} />)}

        {/* Waiters — absolutely positioned by posX/posY (move across whole floor) */}
        {waiters.map((w, i) => <WaiterView key={w.id} waiter={w} index={i} />)}

        {/* Kitchen zone */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gray-900 border-t-2 border-gray-600">
          <span className="absolute left-3 top-1 text-[10px] text-gray-500 uppercase tracking-widest select-none">Kitchen</span>
          <div className="absolute left-12 bottom-0 flex gap-2">
            {chefs.map((c, i) => <ChefView key={c.id} chef={c} index={i} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
