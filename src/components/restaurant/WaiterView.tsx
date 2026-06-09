import { useEffect, useState } from 'react';
import type { Waiter } from '../../entities/waiter/types';
import { PixelSprite } from './PixelSprite';

interface Props { waiter: Waiter; index: number }

export function WaiterView({ waiter }: Props) {
  const [frame, setFrame] = useState(0);
  const moving = waiter.state !== 'IDLE' && waiter.state !== 'PICKUP_FOOD';

  useEffect(() => {
    if (!moving) return;
    const id = setInterval(() => setFrame(f => f === 0 ? 1 : 0), 180);
    return () => clearInterval(id);
  }, [moving]);

  return (
    <div
      className="absolute flex flex-col items-center pointer-events-none select-none"
      style={{
        left: waiter.posX - 10,
        top: waiter.posY - 24,
        transition: 'left 0.6s ease-in-out, top 0.6s ease-in-out',
        zIndex: 25,
      }}
    >
      <PixelSprite type="waiter" walking={moving} frame={frame} />
      <div style={{ fontSize: 8, color: '#93c5fd', marginTop: 1, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
        {waiter.state === 'IDLE' ? 'idle' :
         waiter.state === 'TAKE_ORDER' ? 'taking order' :
         waiter.state === 'DELIVER_TO_KITCHEN' ? 'to kitchen' :
         waiter.state === 'PICKUP_FOOD' ? 'waiting' : 'serving'}
      </div>
    </div>
  );
}
