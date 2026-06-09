import { useRestaurantStore, type SpeedMultiplier } from '../../store/useRestaurantStore';

const SPEEDS: SpeedMultiplier[] = [1, 2, 4];

export function BottomBar() {
  const { paused, speed, revenueToday, customersServedToday, setPaused, setSpeed } =
    useRestaurantStore();

  return (
    <div className="flex items-center justify-between bg-gray-900 border-t border-gray-700 px-4 h-11">
      {/* Today's quick stats */}
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span>Today: <span className="text-green-400 font-semibold">${revenueToday}</span></span>
        <span>Served: <span className="text-blue-400 font-semibold">{customersServedToday}</span></span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPaused(!paused)}
          className={`px-4 py-1 rounded text-sm font-semibold transition-colors ${
            paused
              ? 'bg-green-600 hover:bg-green-500 text-white'
              : 'bg-yellow-600 hover:bg-yellow-500 text-white'
          }`}
        >
          {paused ? '▶ Resume' : '⏸ Pause'}
        </button>

        <div className="flex gap-1">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                speed === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>

      <span className="text-xs text-gray-500 w-20 text-right">
        {paused ? '⏸ Paused' : '▶ Running'}
      </span>
    </div>
  );
}
