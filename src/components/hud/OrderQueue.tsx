import { useSimulationStore } from '../../store/useSimulationStore';
import { OrderCard } from './OrderCard';

export function OrderQueue() {
  const orders = useSimulationStore((s) => s.orders);
  const active = orders.filter((o) => o.state !== 'COMPLETED');

  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
        Orders ({active.length})
      </p>
      <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
        {active.length === 0 && (
          <p className="text-xs text-gray-500 italic">No active orders</p>
        )}
        {active.map((o) => <OrderCard key={o.id} order={o} />)}
      </div>
    </div>
  );
}
