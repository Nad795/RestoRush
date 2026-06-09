import { useEffect, useState } from 'react';
import type { Chef } from '../../entities/chef/types';
import { PixelSprite } from './PixelSprite';
import { COOK_TIME_MS } from '../../utils/constants';

interface Props { chef: Chef; index: number }

export function ChefView({ chef, index }: Props) {
  const [frame, setFrame] = useState(0);
  const cooking = chef.state === 'COOKING';

  useEffect(() => {
    if (!cooking) return;
    const id = setInterval(() => setFrame(f => f === 0 ? 1 : 0), 300);
    return () => clearInterval(id);
  }, [cooking]);

  const x = 80 + index * 64;
  const progress = cooking ? Math.min(100, (chef.cookTimer / COOK_TIME_MS) * 100) : 0;

  return (
    <div
      className="absolute flex flex-col items-center select-none"
      style={{ left: x - 10, bottom: 4, zIndex: 15 }}
    >
      <PixelSprite type="chef" walking={cooking} frame={frame} />

      {/* Cook progress bar */}
      {cooking && (
        <div style={{ width: 28, height: 3, background: '#374151', marginTop: 2 }}>
          <div style={{
            width: `${progress}%`, height: '100%',
            background: '#f97316',
            transition: 'width 0.3s',
          }} />
        </div>
      )}

      {/* Food ready indicator */}
      {chef.state === 'FOOD_READY' && (
        <div style={{ fontSize: 14, marginTop: 2 }}>🍽</div>
      )}

      <div style={{ fontSize: 8, color: '#fb923c', marginTop: 1, fontFamily: 'monospace' }}>
        {chef.state === 'IDLE' ? 'idle' : chef.state === 'COOKING' ? 'cooking...' : 'ready!'}
      </div>
    </div>
  );
}
