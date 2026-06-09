import type { Table } from '../../entities/table/types';

const STATE_BG: Record<Table['state'], string> = {
  AVAILABLE: 'bg-green-800 border-green-600',
  OCCUPIED:  'bg-blue-800 border-blue-500',
  DIRTY:     'bg-yellow-900 border-yellow-700',
  CLEANING:  'bg-purple-900 border-purple-600',
};

const STATE_ICON: Record<Table['state'], string> = {
  AVAILABLE: '',
  OCCUPIED:  '👤',
  DIRTY:     '🗑',
  CLEANING:  '🧹',
};

const TABLE_W = 80;
const TABLE_H = 60;

interface Props { table: Table }

export function TableView({ table }: Props) {
  return (
    <div
      className={`absolute flex flex-col items-center justify-center rounded border-2 text-xs text-white select-none ${STATE_BG[table.state]}`}
      style={{
        left: table.x - TABLE_W / 2,
        top:  table.y - TABLE_H / 2,
        width: TABLE_W,
        height: TABLE_H,
      }}
    >
      <span className="text-lg leading-none">{STATE_ICON[table.state] || '🪑'}</span>
      <span className="text-[10px] opacity-60 mt-0.5">{table.state}</span>
    </div>
  );
}
