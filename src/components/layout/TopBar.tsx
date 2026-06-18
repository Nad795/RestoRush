import { useRestaurantStore } from '../../store/useRestaurantStore';
import { useSimulationStore } from '../../store/useSimulationStore';
import { DAY_DURATION_MS } from '../../utils/constants';

export function TopBar() {
  const { money, rating, day, dayTimer, speed } = useRestaurantStore();
  const customers = useSimulationStore((s) => s.customers);
  const active = customers.filter((c) => c.state !== 'LEAVING').length;

  const ratingColor =
    rating >= 4 ? 'text-green-400' : rating >= 2.5 ? 'text-yellow-400' : 'text-red-400';

  const stars = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  const dayProgress = Math.min(100, (dayTimer / DAY_DURATION_MS) * 100);

  return (
    <div className="bg-gray-900 border-b border-gray-700">
      <div className="flex items-center justify-between px-2 md:px-4 h-10 md:h-12">
        <h1 className="text-yellow-400 font-bold text-sm md:text-base tracking-wide">🍽 RestoRush</h1>

        <div className="flex items-center divide-x divide-gray-700 text-xs md:text-sm">
          {/* Money */}
          <div className="flex flex-col items-center px-2 md:px-4">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider hidden md:block">Money</span>
            <span className="font-bold text-green-400">${money}</span>
          </div>

          {/* Rating */}
          <div className="flex flex-col items-center px-2 md:px-4">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider hidden md:block">Rating</span>
            <span className={`font-bold text-sm ${ratingColor}`}>
              {stars} <span className="text-xs opacity-60 hidden md:inline">{rating.toFixed(1)}</span>
            </span>
          </div>

          {/* Customers — hidden on mobile */}
          <div className="hidden md:flex flex-col items-center px-4">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Customers</span>
            <span className="font-bold text-white">{active}</span>
          </div>

          {/* Day */}
          <div className="flex flex-col items-center px-2 md:px-4">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider hidden md:block">Day</span>
            <span className="font-bold text-white">Day {day}</span>
          </div>

          {/* Speed — hidden on mobile */}
          <div className="hidden md:flex flex-col items-center px-4">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Speed</span>
            <span className="font-bold text-blue-400">{speed}×</span>
          </div>
        </div>
      </div>

      {/* Day progress bar */}
      <div className="h-1 bg-gray-800">
        <div
          className="h-full bg-yellow-500 transition-all duration-100"
          style={{ width: `${dayProgress}%` }}
        />
      </div>
    </div>
  );
}
