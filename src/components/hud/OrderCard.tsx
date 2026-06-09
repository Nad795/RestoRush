import type { Order } from '../../entities/order/types';

const STATE_COLOR: Record<Order['state'], string> = {
  CREATED:   'bg-gray-600 text-gray-200',
  COOKING:   'bg-orange-700 text-orange-100',
  READY:     'bg-green-700 text-green-100',
  SERVED:    'bg-blue-700 text-blue-100',
  COMPLETED: 'bg-gray-800 text-gray-400',
};

const STATE_LABEL: Record<Order['state'], string> = {
  CREATED:   'Waiting',
  COOKING:   'Cooking',
  READY:     'Ready!',
  SERVED:    'Served',
  COMPLETED: 'Done',
};

interface Props { order: Order }

export function OrderCard({ order }: Props) {
  return (
    <div className={`flex items-center justify-between rounded px-2 py-1 text-sm ${STATE_COLOR[order.state]}`}>
      <span className="font-medium">{order.item}</span>
      <span className="text-xs opacity-75">{STATE_LABEL[order.state]}</span>
    </div>
  );
}
