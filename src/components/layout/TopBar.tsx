import { useRestaurantStore } from '../../store/useRestaurantStore';
import { useSimulationStore } from '../../store/useSimulationStore';
import { StatBadge } from '../hud/StatBadge';

export function TopBar() {
  const { money, rating } = useRestaurantStore();
  const customers = useSimulationStore((s) => s.customers);
  const active = customers.filter((c) => c.state !== 'LEAVING').length;

  const ratingColor =
    rating >= 4 ? 'text-green-400' : rating >= 2.5 ? 'text-yellow-400' : 'text-red-400';

  const stars = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));

  return (
    <div className="flex items-center justify-between bg-gray-900 border-b border-gray-700 px-4 h-14">
      <h1 className="text-yellow-400 font-bold text-lg tracking-wide">🍽 RestoRush</h1>
      <div className="flex divide-x divide-gray-700">
        <StatBadge label="Money" value={`$${money}`} color="text-green-400" />
        <StatBadge label="Rating" value={stars} color={ratingColor} />
        <StatBadge label="Customers" value={active} />
      </div>
    </div>
  );
}
