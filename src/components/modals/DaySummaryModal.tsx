import { useRestaurantStore } from '../../store/useRestaurantStore';

export function DaySummaryModal() {
  const { daySummary, dismissSummary } = useRestaurantStore();
  if (!daySummary) return null;

  const { day, revenue, customersServed, customersAngry, ratingEnd } = daySummary;
  const stars = '★'.repeat(Math.round(ratingEnd)) + '☆'.repeat(5 - Math.round(ratingEnd));

  return (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-yellow-600 rounded-xl p-8 text-center max-w-sm w-full mx-4 shadow-2xl">
        <div className="text-4xl mb-3">🌙</div>
        <h2 className="text-2xl font-bold text-yellow-400 mb-1">Day {day} Complete!</h2>
        <p className="text-gray-400 text-sm mb-6">Restaurant is closing for the night</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-400 uppercase tracking-wide">Revenue</div>
            <div className="text-xl font-bold text-green-400">${revenue}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-400 uppercase tracking-wide">Served</div>
            <div className="text-xl font-bold text-blue-400">{customersServed}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-400 uppercase tracking-wide">Angry</div>
            <div className={`text-xl font-bold ${customersAngry > 0 ? 'text-red-400' : 'text-gray-500'}`}>
              {customersAngry}
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-400 uppercase tracking-wide">Rating</div>
            <div className="text-lg font-bold text-yellow-400">{stars}</div>
          </div>
        </div>

        <button
          onClick={dismissSummary}
          className="w-full py-2 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-lg transition-colors"
        >
          ▶ Start Day {day + 1}
        </button>
      </div>
    </div>
  );
}
