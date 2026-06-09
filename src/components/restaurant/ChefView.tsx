import type { Chef } from '../../entities/chef/types';
import { COOK_TIME_MS } from '../../utils/constants';

const STATE_ICON: Record<Chef['state'], string> = {
  IDLE:       '👨‍🍳',
  COOKING:    '🔥',
  FOOD_READY: '✅',
};

interface Props { chef: Chef; index: number }

export function ChefView({ chef, index }: Props) {
  const progress = chef.state === 'COOKING'
    ? Math.min(100, (chef.cookTimer / COOK_TIME_MS) * 100)
    : 0;

  return (
    <div
      className="absolute flex flex-col items-center select-none"
      style={{ right: 20 + index * 60, bottom: 16, zIndex: 10 }}
    >
      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg shadow ${
        chef.state === 'FOOD_READY'
          ? 'bg-green-700 border-green-400'
          : chef.state === 'COOKING'
          ? 'bg-orange-800 border-orange-500'
          : 'bg-gray-700 border-gray-500'
      }`}>
        {STATE_ICON[chef.state]}
      </div>
      {chef.state === 'COOKING' && (
        <div className="w-10 h-1 bg-gray-700 rounded mt-0.5">
          <div
            className="h-full bg-orange-400 rounded transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      <span className="text-[9px] text-orange-300 mt-0.5">{chef.state}</span>
    </div>
  );
}
