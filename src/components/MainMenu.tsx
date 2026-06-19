import { useRestaurantStore } from '../store/useRestaurantStore';
import { initRestaurant } from '../utils/initRestaurant';
import { GOAL_MONEY, GAME_LENGTH_DAYS } from '../utils/constants';

export function MainMenu() {
  const startGame = useRestaurantStore((s) => s.startGame);

  function handleStart() {
    initRestaurant();
    startGame();
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white px-4 overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl opacity-10 animate-pulse">🍕</div>
        <div className="absolute top-20 right-16 text-5xl opacity-10 animate-pulse" style={{ animationDelay: '0.5s' }}>🍔</div>
        <div className="absolute bottom-20 left-20 text-5xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }}>🍣</div>
        <div className="absolute bottom-16 right-10 text-6xl opacity-10 animate-pulse" style={{ animationDelay: '1.5s' }}>🥗</div>
        <div className="absolute top-1/3 left-1/4 text-4xl opacity-10 animate-pulse" style={{ animationDelay: '0.7s' }}>🍳</div>
        <div className="absolute top-1/4 right-1/3 text-4xl opacity-10 animate-pulse" style={{ animationDelay: '1.2s' }}>🧁</div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center max-w-md w-full">
        {/* Title */}
        <div className="text-6xl mb-4">🍽</div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-yellow-400 tracking-tight mb-2">
          RestoRush
        </h1>
        <p className="text-gray-400 text-sm md:text-base mb-10">
          Restaurant Management Simulator
        </p>

        {/* Play button */}
        <button
          onClick={handleStart}
          className="px-10 py-4 bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 text-gray-900 text-xl font-bold rounded-xl shadow-lg shadow-yellow-500/20 transition-all hover:scale-105 mb-10"
        >
          Start Game
        </button>

        {/* Credits button */}
        <button
          onClick={() => useRestaurantStore.setState({ screen: 'credits' })}
          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-gray-300 text-sm font-medium rounded-lg transition-all hover:scale-105 mb-6"
        >
          Credits
        </button>

        {/* How to play */}
        <div className="bg-gray-800/80 border border-gray-700 rounded-xl p-5 w-full">
          <h2 className="text-yellow-400 font-bold text-sm uppercase tracking-wider mb-3">How to Play</h2>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="flex gap-2">
              <span className="text-yellow-400 shrink-0">1.</span>
              <span>Manage your restaurant — seat customers, take orders, cook & serve food.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-yellow-400 shrink-0">2.</span>
              <span>Hire staff and buy tables to handle the rush.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-yellow-400 shrink-0">3.</span>
              <span>Keep your rating high — angry customers hurt your reputation!</span>
            </li>
            <li className="flex gap-2">
              <span className="text-yellow-400 shrink-0">4.</span>
              <span>Earn <span className="text-green-400 font-semibold">${GOAL_MONEY}</span> in <span className="text-blue-400 font-semibold">{GAME_LENGTH_DAYS} days</span> to win.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
