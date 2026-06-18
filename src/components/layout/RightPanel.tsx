import { useSimulationStore } from '../../store/useSimulationStore';
import { useRestaurantStore } from '../../store/useRestaurantStore';
import { OrderQueue } from '../hud/OrderQueue';
import { LOYALTY_MAX } from '../../utils/constants';

interface Props {
  isMobile: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export function RightPanel({ isMobile, isOpen, onClose }: Props) {
  const customers = useSimulationStore((s) => s.customers);
  const waiters   = useSimulationStore((s) => s.waiters);
  const chefs     = useSimulationStore((s) => s.chefs);
  const { loyalty, adDaysRemaining, adSpawnBonus } = useRestaurantStore();

  const waiting = customers.filter((c) => c.state === 'WAITING' || c.state === 'ANGRY');

  const desktopClass = 'w-56 bg-gray-900 border-l border-gray-700 flex flex-col gap-4 p-3 overflow-y-auto';

  const mobileClass = [
    'fixed top-0 right-0 bottom-0 w-72 max-w-[85vw] bg-gray-900',
    'flex flex-col gap-4 p-3 overflow-y-auto',
    'transition-transform duration-200 ease-out',
    isOpen ? 'translate-x-0' : 'translate-x-full',
  ].join(' ');

  return (
    <div
      className={isMobile ? mobileClass : desktopClass}
      style={isMobile ? { zIndex: 40 } : undefined}
    >
      {isMobile && (
        <button
          onClick={onClose}
          className="self-end text-gray-400 active:text-white p-2 -mt-1 -mr-1 text-lg"
        >
          ✕
        </button>
      )}

      <OrderQueue />

      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
          Waiting ({waiting.length})
        </p>
        <div className="flex flex-col gap-1">
          {waiting.length === 0 && (
            <p className="text-xs text-gray-500 italic">No one waiting</p>
          )}
          {waiting.map((c) => (
            <div
              key={c.id}
              className={`flex justify-between items-center rounded px-2 py-1 text-xs ${
                c.state === 'ANGRY' ? 'bg-red-900 text-red-200' : 'bg-gray-700 text-gray-200'
              }`}
            >
              <span>{c.menuItem}</span>
              <span className={c.state === 'ANGRY' ? 'text-red-400' : 'text-yellow-400'}>
                {c.state === 'ANGRY' ? '😠' : `❤ ${Math.round(c.patience)}`}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Marketing</p>
        <div className="flex flex-col gap-1 text-xs">
          <div className="bg-gray-800 rounded px-2 py-1">
            <div className="flex justify-between mb-1">
              <span className="text-pink-300">💗 Loyalty</span>
              <span className="text-gray-400">{Math.round(loyalty)}/{LOYALTY_MAX}</span>
            </div>
            <div style={{ height: 3, background: '#374151' }}>
              <div style={{
                width: `${(loyalty / LOYALTY_MAX) * 100}%`, height: '100%',
                background: '#ec4899',
              }} />
            </div>
          </div>
          <div className="flex justify-between bg-gray-800 rounded px-2 py-1">
            <span className="text-purple-300">📢 Ad Campaign</span>
            <span className="text-gray-400">
              {adDaysRemaining > 0 ? `${adDaysRemaining}d left (x${adSpawnBonus.toFixed(1)})` : 'inactive'}
            </span>
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Staff</p>
        <div className="flex flex-col gap-1 text-xs">
          {waiters.map((w) => (
            <div key={w.id} className="flex justify-between bg-gray-800 rounded px-2 py-1">
              <span className="text-blue-300">🧑 Waiter</span>
              <span className="text-gray-400">{w.state.replace(/_/g, ' ')}</span>
            </div>
          ))}
          {chefs.map((c) => (
            <div key={c.id} className="flex justify-between bg-gray-800 rounded px-2 py-1">
              <span className="text-orange-300">👨‍🍳 Chef</span>
              <span className="text-gray-400">{c.state}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
