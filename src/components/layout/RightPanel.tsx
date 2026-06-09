import { useSimulationStore } from '../../store/useSimulationStore';
import { OrderQueue } from '../hud/OrderQueue';

export function RightPanel() {
  const customers = useSimulationStore((s) => s.customers);
  const waiters   = useSimulationStore((s) => s.waiters);
  const chefs     = useSimulationStore((s) => s.chefs);

  const waiting = customers.filter((c) => c.state === 'WAITING' || c.state === 'ANGRY');

  return (
    <div className="w-56 bg-gray-900 border-l border-gray-700 flex flex-col gap-4 p-3 overflow-y-auto">
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
