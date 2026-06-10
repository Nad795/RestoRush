import type { Chef } from '../../entities/chef/types';
import { PixelSprite } from './PixelSprite';
import { useSimulationStore } from '../../store/useSimulationStore';
import { COOK_TIME_MS } from '../../utils/constants';

interface Props { chef: Chef; index?: number }

export function ChefView({ chef }: Props) {
  const order = useSimulationStore((s) =>
    chef.currentOrderId ? s.orders.find((o) => o.id === chef.currentOrderId) : undefined,
  );
  const cooking   = chef.state === 'COOKING';
  const cookTimeMs = order?.cookTimeMs ?? COOK_TIME_MS;
  const progress  = cooking
    ? Math.min(100, (chef.cookTimer / cookTimeMs) * 100)
    : 0;

  return (
    <div
      className="flex flex-col items-center select-none"
      style={{ marginRight: 16 }}
    >
      <PixelSprite
        type="chef"
        direction="right"
        walking={cooking}
      />

      {/* Cook progress bar */}
      <div style={{
        width: 28, height: 3, background: '#374151', marginTop: 2,
      }}>
        <div style={{
          width: cooking ? `${progress}%` : chef.state === 'FOOD_READY' ? '100%' : '0%',
          height: '100%',
          background: chef.state === 'FOOD_READY' ? '#22c55e' : '#f97316',
          transition: 'width 0.1s, background 0.3s',
        }} />
      </div>

      <div style={{
        fontSize: 9, color: '#fb923c', marginTop: 1,
        fontFamily: 'monospace', whiteSpace: 'nowrap',
      }}>
        {chef.state === 'IDLE' ? 'idle' :
         chef.state === 'COOKING' ? 'cooking' : '✓ ready'}
      </div>
    </div>
  );
}
