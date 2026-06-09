import type { Waiter } from '../../entities/waiter/types';

const STATE_ICON: Record<Waiter['state'], string> = {
  IDLE:               '🧑',
  TAKE_ORDER:         '📋',
  DELIVER_TO_KITCHEN: '🏃',
  PICKUP_FOOD:        '⏳',
  SERVE_FOOD:         '🍽',
};

// Waiters stand in a row at the bottom of the floor
interface Props { waiter: Waiter; index: number }

export function WaiterView({ waiter, index }: Props) {
  return (
    <div
      className="absolute flex flex-col items-center select-none"
      style={{ left: 20 + index * 60, bottom: 16, zIndex: 10 }}
    >
      <div className="w-10 h-10 rounded-full bg-blue-700 border-2 border-blue-400 flex items-center justify-center text-lg shadow">
        {STATE_ICON[waiter.state]}
      </div>
      <span className="text-[9px] text-blue-300 mt-0.5 max-w-[56px] text-center leading-tight">
        {waiter.state.replace(/_/g, ' ')}
      </span>
    </div>
  );
}
