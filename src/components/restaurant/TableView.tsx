import type { Table } from '../../entities/table/types';
import { PixelTable } from './PixelTable';

const TABLE_W = 80;
const TABLE_H = 60;

interface Props { table: Table }

export function TableView({ table }: Props) {
  return (
    <div
      className="absolute select-none"
      style={{
        left: table.x - TABLE_W / 2,
        top:  table.y - TABLE_H / 2,
        width: TABLE_W,
        height: TABLE_H,
        zIndex: 5,
      }}
    >
      <PixelTable state={table.state} />
    </div>
  );
}
