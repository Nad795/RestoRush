import { useRestaurantStore } from '../../store/useRestaurantStore';

export function GameOverModal() {
  const { rating, money } = useRestaurantStore();

  if (rating > 1.0) return null;

  function restart() {
    // Simple page reload — acceptable for a jam project
    window.location.reload();
  }

  return (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-red-700 rounded-xl p-8 text-center max-w-sm w-full mx-4">
        <div className="text-5xl mb-4">😭</div>
        <h2 className="text-2xl font-bold text-red-400 mb-2">Restaurant Closed!</h2>
        <p className="text-gray-400 mb-6">Your rating dropped to rock bottom.<br />Final earnings: <span className="text-green-400 font-bold">${money}</span></p>
        <button
          onClick={restart}
          className="px-6 py-2 bg-red-700 hover:bg-red-600 text-white font-bold rounded transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
