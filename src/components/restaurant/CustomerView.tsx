import { useEffect, useState } from 'react';
import type { Customer } from '../../entities/customer/types';
import { PixelSprite } from './PixelSprite';

interface Props { customer: Customer }

export function CustomerView({ customer }: Props) {
  const [frame, setFrame] = useState(0);
  const moving = customer.state === 'SPAWN' || customer.state === 'FIND_TABLE' || customer.state === 'LEAVING';

  // Walk animation
  useEffect(() => {
    if (!moving) return;
    const id = setInterval(() => setFrame(f => f === 0 ? 1 : 0), 200);
    return () => clearInterval(id);
  }, [moving]);

  const spriteType = customer.state === 'ANGRY' ? 'angry_customer' : 'customer';

  const patienceColor =
    customer.patience > 50 ? '#22c55e' :
    customer.patience > 20 ? '#eab308' : '#ef4444';

  return (
    <div
      className="absolute flex flex-col items-center pointer-events-none select-none"
      style={{
        left: customer.posX - 12,
        top: customer.posY - 24,
        transition: 'left 0.8s ease-in-out, top 0.8s ease-in-out',
        zIndex: 20,
      }}
    >
      <PixelSprite type={spriteType} walking={moving} frame={frame} />

      {/* State label */}
      <div style={{
        fontSize: 8,
        color: '#aaa',
        marginTop: 1,
        whiteSpace: 'nowrap',
        fontFamily: 'monospace',
      }}>
        {customer.menuItem}
      </div>

      {/* Patience bar */}
      {(customer.state === 'WAITING' || customer.state === 'ANGRY') && (
        <div style={{ width: 24, height: 3, background: '#374151', borderRadius: 0, marginTop: 1 }}>
          <div style={{
            width: `${customer.patience}%`, height: '100%',
            background: patienceColor,
            transition: 'width 0.5s, background 0.5s',
          }} />
        </div>
      )}
    </div>
  );
}
