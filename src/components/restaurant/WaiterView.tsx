import type { Waiter } from '../../entities/waiter/types';
import { PixelSprite } from './PixelSprite';

interface Props { waiter: Waiter }

const SPRITE_W = 24;
const SPRITE_H = 50;

export function WaiterView({ waiter }: Props) {
  const isMoving =
    waiter.state !== 'IDLE' &&
    waiter.state !== 'PICKUP_FOOD' &&
    waiter.pathIndex < waiter.path.length;

  return (
    <div
      className="absolute flex flex-col items-center pointer-events-none select-none"
      style={{
        left: Math.round(waiter.posX) - SPRITE_W / 2,
        top:  Math.round(waiter.posY) - SPRITE_H,
        zIndex: 25,
      }}
    >
      <PixelSprite type="waiter" direction={waiter.direction} walking={isMoving} />
      <div style={{
        fontSize: 9, color: '#93c5fd', marginTop: 1,
        fontFamily: 'monospace', whiteSpace: 'nowrap',
        background: 'rgba(0,0,0,0.5)', padding: '0 3px', borderRadius: 2,
      }}>
        {waiter.state === 'IDLE'               ? 'idle' :
         waiter.state === 'TAKE_ORDER'         ? 'taking order' :
         waiter.state === 'DELIVER_TO_KITCHEN' ? 'to kitchen' :
         waiter.state === 'PICKUP_FOOD'        ? 'waiting food' : 'serving'}
      </div>
    </div>
  );
}
