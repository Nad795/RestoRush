import type { Customer } from '../../entities/customer/types';
import { PixelSprite } from './PixelSprite';
import { MENU } from '../../utils/menu';

interface Props { customer: Customer }

const SPRITE_W = 24; // S*12
const SPRITE_H = 48; // approximate sprite height

export function CustomerView({ customer }: Props) {
  const isMoving =
    customer.state === 'SPAWN' ||
    customer.state === 'FIND_TABLE' ||
    customer.state === 'LEAVING' ||
    (customer.path.length > 0 && customer.pathIndex < customer.path.length);

  const spriteType =
    customer.state === 'ANGRY' ? 'angry_customer' : 'customer';

  const patienceColor =
    customer.patience > 50 ? '#22c55e' :
    customer.patience > 20 ? '#eab308' : '#ef4444';

  const dishPrice = MENU.find((m) => m.name === customer.menuItem)?.price;

  return (
    <div
      className="absolute flex flex-col items-center pointer-events-none select-none"
      style={{
        left: Math.round(customer.posX) - SPRITE_W / 2,
        top:  Math.round(customer.posY) - SPRITE_H,
        zIndex: 20,
      }}
    >
      <PixelSprite type={spriteType} direction={customer.direction} walking={isMoving} />

      {/* Dish name badge */}
      <div style={{
        fontSize: 9, color: '#ccc', marginTop: 1,
        fontFamily: 'monospace', whiteSpace: 'nowrap',
        background: 'rgba(0,0,0,0.5)', padding: '0 3px', borderRadius: 2,
      }}>
        {customer.menuItem}{dishPrice !== undefined ? ` $${dishPrice}` : ''}
      </div>

      {/* Patience bar */}
      {(customer.state === 'WAITING' || customer.state === 'ANGRY') && (
        <div style={{
          width: 28, height: 3, background: '#374151',
          borderRadius: 0, marginTop: 2,
        }}>
          <div style={{
            width: `${customer.patience}%`, height: '100%',
            background: patienceColor,
          }} />
        </div>
      )}
    </div>
  );
}
