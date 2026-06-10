import { useRestaurantStore } from '../../store/useRestaurantStore';
import { GAME_LENGTH_DAYS, GOAL_MONEY } from '../../utils/constants';

export function GameOverModal() {
  const { gameStatus, lossReason, money } = useRestaurantStore();

  if (gameStatus === 'playing') return null;

  function restart() {
    // Simple page reload — acceptable for a jam project
    window.location.reload();
  }

  const won = gameStatus === 'won';

  let emoji = '😭';
  let title = 'Restaurant Closed!';
  let message = (
    <>Your rating dropped to rock bottom.<br />Final earnings: <span className="text-green-400 font-bold">${money}</span></>
  );

  if (won) {
    emoji = '🎉';
    title = 'Restaurant is a hit!';
    message = (
      <>You hit your ${GOAL_MONEY} goal by day {GAME_LENGTH_DAYS}!<br />Final earnings: <span className="text-green-400 font-bold">${money}</span></>
    );
  } else if (lossReason === 'goal_missed') {
    title = 'Restaurant Closed!';
    message = (
      <>You only made <span className="text-green-400 font-bold">${money}</span> of the ${GOAL_MONEY} goal after {GAME_LENGTH_DAYS} days.</>
    );
  } else if (lossReason === 'bankrupt') {
    title = 'Restaurant Closed!';
    message = (
      <>You ran out of money to pay your staff.<br />Final earnings: <span className="text-green-400 font-bold">${money}</span></>
    );
  }

  return (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className={`bg-gray-900 border ${won ? 'border-green-600' : 'border-red-700'} rounded-xl p-8 text-center max-w-sm w-full mx-4`}>
        <div className="text-5xl mb-4">{emoji}</div>
        <h2 className={`text-2xl font-bold mb-2 ${won ? 'text-green-400' : 'text-red-400'}`}>{title}</h2>
        <p className="text-gray-400 mb-6">{message}</p>
        <button
          onClick={restart}
          className={`px-6 py-2 text-white font-bold rounded transition-colors ${won ? 'bg-green-700 hover:bg-green-600' : 'bg-red-700 hover:bg-red-600'}`}
        >
          {won ? 'Play Again' : 'Try Again'}
        </button>
      </div>
    </div>
  );
}
