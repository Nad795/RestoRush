import type { Customer } from '../../entities/customer/types';
import { useSimulationStore } from '../../store/useSimulationStore';

const STATE_COLOR: Record<Customer['state'], string> = {
  SPAWN:      'bg-gray-500',
  FIND_TABLE: 'bg-yellow-500',
  ORDERING:   'bg-blue-500',
  WAITING:    'bg-blue-400',
  EATING:     'bg-green-500',
  PAYING:     'bg-purple-500',
  LEAVING:    'bg-gray-400',
  ANGRY:      'bg-red-500',
};

const STATE_ICON: Record<Customer['state'], string> = {
  SPAWN:      '🚶',
  FIND_TABLE: '🔍',
  ORDERING:   '📋',
  WAITING:    '⏳',
  EATING:     '🍽',
  PAYING:     '💳',
  LEAVING:    '🚪',
  ANGRY:      '😠',
};

// Deterministic offset from id so position never jitters between renders
function stableOffset(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffff;
  return (hash % 40) - 20;
}

interface Props { customer: Customer }

export function CustomerView({ customer }: Props) {
  const tables = useSimulationStore((s) => s.tables);
  const table = tables.find((t) => t.id === customer.tableId);

  const offset = stableOffset(customer.id);
  const x = table ? table.x + 32 : 640 + (offset * 0.5);
  const y = table ? table.y + offset * 0.3 : 30 + Math.abs(offset);

  const patienceColor =
    customer.patience > 50 ? 'bg-green-500' :
    customer.patience > 20 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div
      className="absolute flex flex-col items-center pointer-events-none select-none"
      style={{ left: x - 16, top: y - 16, zIndex: 10 }}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-lg ${STATE_COLOR[customer.state]}`}
      >
        {STATE_ICON[customer.state]}
      </div>
      {(customer.state === 'WAITING' || customer.state === 'ANGRY') && (
        <div className="w-8 h-1 bg-gray-700 rounded mt-0.5">
          <div
            className={`h-full rounded transition-all duration-500 ${patienceColor}`}
            style={{ width: `${customer.patience}%` }}
          />
        </div>
      )}
    </div>
  );
}
