
export type SpriteType = 'customer' | 'waiter' | 'chef' | 'angry_customer';

interface PixelSpriteProps {
  type: SpriteType;
  walking?: boolean;
  direction?: 'left' | 'right';
  frame?: number; // 0 or 1 for walk cycle
}

// Each sprite is 16×24 px visual, scaled up 2×

const SKIN = '#FDBCB4';
const HAIR_CUSTOMER = '#8B4513';
const HAIR_WAITER = '#222';
const SHIRT_CUSTOMER_M = '#4A90D9';
const WAITER_SHIRT = '#FFFFFF';
const PANTS = '#2C3E50';
const WAITER_PANTS = '#1a1a2e';
const CHEF_HAT = '#FFFFFF';
const CHEF_SHIRT = '#FFFFFF';
const APRON = '#F0E6D3';

export function PixelSprite({ type, walking = false, direction = 'right', frame = 0 }: PixelSpriteProps) {
  const scale = 2;
  const px = (n: number) => n * scale;

  const shirtColor = type === 'waiter' ? WAITER_SHIRT :
                     type === 'chef' ? CHEF_SHIRT :
                     type === 'angry_customer' ? '#E74040' : SHIRT_CUSTOMER_M;

  const hairColor = type === 'waiter' || type === 'chef' ? HAIR_WAITER : HAIR_CUSTOMER;

  const legOffset1 = walking ? (frame === 0 ? -2 : 2) : 0;
  const legOffset2 = walking ? (frame === 0 ? 2 : -2) : 0;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: px(12),
      imageRendering: 'pixelated',
      transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
      filter: type === 'angry_customer' ? 'hue-rotate(0deg)' : 'none',
    }}>
      {/* Hat / Hair top */}
      {type === 'chef' && (
        <div style={{ width: px(10), height: px(4), background: CHEF_HAT, border: `${scale}px solid #ddd` }} />
      )}
      {/* Head */}
      <div style={{
        width: px(8), height: px(8),
        background: type === 'angry_customer' ? '#FFB090' : SKIN,
        position: 'relative',
        boxShadow: `0 ${-px(2)}px 0 ${hairColor}`,
      }}>
        {/* Eyes */}
        <div style={{
          position: 'absolute', top: px(3), left: px(2),
          width: px(1.5), height: px(1.5), background: '#222',
        }} />
        <div style={{
          position: 'absolute', top: px(3), right: px(2),
          width: px(1.5), height: px(1.5), background: '#222',
        }} />
        {/* Mouth — angry */}
        {type === 'angry_customer' && (
          <div style={{
            position: 'absolute', bottom: px(1.5), left: px(2),
            width: px(4), height: px(1), background: '#c0392b',
            borderRadius: 0,
          }} />
        )}
      </div>

      {/* Body */}
      <div style={{
        width: px(10), height: px(8),
        background: shirtColor,
        borderLeft: `${scale}px solid rgba(0,0,0,0.15)`,
        borderRight: `${scale}px solid rgba(0,0,0,0.15)`,
        position: 'relative',
      }}>
        {/* Waiter bow tie */}
        {type === 'waiter' && (
          <div style={{
            position: 'absolute', top: px(1), left: px(3),
            width: px(4), height: px(2), background: '#E74C3C',
          }} />
        )}
        {/* Chef apron */}
        {type === 'chef' && (
          <div style={{
            position: 'absolute', top: px(1), left: px(2),
            width: px(6), height: px(6), background: APRON,
          }} />
        )}
      </div>

      {/* Legs */}
      <div style={{ display: 'flex', gap: px(1) }}>
        <div style={{
          width: px(4), height: px(6),
          background: type === 'waiter' ? WAITER_PANTS : PANTS,
          transform: `translateY(${legOffset1}px)`,
          transition: 'transform 0.1s',
        }} />
        <div style={{
          width: px(4), height: px(6),
          background: type === 'waiter' ? WAITER_PANTS : PANTS,
          transform: `translateY(${legOffset2}px)`,
          transition: 'transform 0.1s',
        }} />
      </div>
    </div>
  );
}
