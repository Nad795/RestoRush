import type { Direction } from '../../entities/customer/types';

export type SpriteType = 'customer' | 'waiter' | 'chef' | 'angry_customer';

interface Props {
  type: SpriteType;
  direction?: Direction;
  walking?: boolean;
}

const S = 2; // pixel scale multiplier — 1 CSS "pixel" = 2×2 box

const SKIN     = '#FDBCB4';
const ANGRY_SKIN = '#FFB090';
const DARK     = '#222';
const PANTS    = '#2C3E50';
const DARK_PANTS = '#1a1a2e';
const CHEF_WHITE = '#F5F5F5';
const APRON    = '#E8D5B0';

const COLORS = {
  customer:       { hair: '#8B4513', shirt: '#4A90D9', pants: PANTS },
  waiter:         { hair: DARK,      shirt: '#FFFFFF', pants: DARK_PANTS },
  chef:           { hair: DARK,      shirt: CHEF_WHITE, pants: PANTS },
  angry_customer: { hair: '#8B4513', shirt: '#D94A4A', pants: PANTS },
};

export function PixelSprite({ type, direction = 'right', walking = false }: Props) {
  const c = COLORS[type];
  const flipH = direction === 'left';
  const skin = type === 'angry_customer' ? ANGRY_SKIN : SKIN;

  const legA = walking ? 'walk-leg-a' : '';
  const legB = walking ? 'walk-leg-b' : '';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: S * 12,
      imageRendering: 'pixelated',
      transform: flipH ? 'scaleX(-1)' : undefined,
      userSelect: 'none',
      pointerEvents: 'none',
    }}>

      {/* Chef hat */}
      {type === 'chef' && (
        <div style={{
          width: S * 10, height: S * 5,
          background: CHEF_WHITE,
          borderBottom: `${S}px solid #ddd`,
        }} />
      )}

      {/* Hair */}
      <div style={{
        width: S * 8, height: S * 2,
        background: c.hair,
      }} />

      {/* Head */}
      <div style={{
        width: S * 8, height: S * 7,
        background: skin,
        position: 'relative',
      }}>
        {/* Eyes */}
        <div style={{
          position: 'absolute', top: S * 2,
          left: S * 1.5, width: S * 1.5, height: S * 1.5,
          background: DARK,
        }} />
        <div style={{
          position: 'absolute', top: S * 2,
          right: S * 1.5, width: S * 1.5, height: S * 1.5,
          background: DARK,
        }} />
        {/* Angry brow */}
        {type === 'angry_customer' && (
          <>
            <div style={{ position:'absolute', top: S*0.5, left: S*1, width: S*2, height: S, background:'#8B2500', transform:'rotate(-15deg)' }} />
            <div style={{ position:'absolute', top: S*0.5, right: S*1, width: S*2, height: S, background:'#8B2500', transform:'rotate(15deg)' }} />
          </>
        )}
      </div>

      {/* Body */}
      <div style={{
        width: S * 10, height: S * 8,
        background: c.shirt,
        position: 'relative',
      }}>
        {/* Waiter bow-tie */}
        {type === 'waiter' && (
          <div style={{
            position: 'absolute', top: S, left: S * 3,
            width: S * 4, height: S * 2,
            background: '#E74C3C',
            clipPath: 'polygon(0 0, 40% 50%, 0 100%, 60% 100%, 100% 50%, 60% 0)',
          }} />
        )}
        {/* Chef apron center strip */}
        {type === 'chef' && (
          <div style={{
            position: 'absolute', top: S, left: S * 3,
            width: S * 4, height: S * 6,
            background: APRON,
          }} />
        )}
      </div>

      {/* Legs */}
      <div style={{ display: 'flex', gap: S }}>
        <div className={legA} style={{ width: S * 4, height: S * 6, background: c.pants }} />
        <div className={legB} style={{ width: S * 4, height: S * 6, background: c.pants }} />
      </div>

      {/* Feet */}
      <div style={{ display: 'flex', gap: S * 2 }}>
        <div style={{ width: S * 4, height: S * 2, background: '#1a1a1a' }} />
        <div style={{ width: S * 4, height: S * 2, background: '#1a1a1a' }} />
      </div>
    </div>
  );
}
