import { useRestaurantStore, type SpeedMultiplier } from '../../store/useRestaurantStore';

const SPEEDS: SpeedMultiplier[] = [1, 2, 4];

export function BottomBar() {
  const { paused, speed, day, setPaused, setSpeed } = useRestaurantStore();

  return (
    <div className="flex items-center justify-between bg-gray-900 border-t border-gray-700 px-4 h-12">
      <span className="text-sm text-gray-400">Day <span className="text-white font-bold">{day}</span></span>

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

      <span className="text-xs text-gray-500">
        {paused ? '⏸ Paused' : '▶ Running'}
      </span>
    </div>
  );
}
