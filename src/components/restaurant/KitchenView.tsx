import type { Chef } from '../../entities/chef/types';

// Renders the full kitchen interior (vertical strip, 100px wide × full height)

interface StoveProps { chef: Chef; y: number }

function PixelStove({ chef, y }: StoveProps) {
  const cooking   = chef.state === 'COOKING';
  const foodReady = chef.state === 'FOOD_READY';

  return (
    <div style={{ position: 'absolute', left: 8, top: y, width: 60, height: 52, imageRendering: 'pixelated' }}>
      {/* Stove body */}
      <div style={{ position: 'absolute', inset: 0, background: '#1F2937',
        border: '2px solid #374151', borderTop: '3px solid #4B5563' }} />

      {/* Burner panel (top half) */}
      <div style={{ position: 'absolute', left: 4, top: 4, width: 52, height: 26,
        background: '#111827', border: '1px solid #374151' }}>

        {/* 4 burners in 2x2 grid */}
        {[{ lx: 6, ly: 4 }, { lx: 28, ly: 4 }, { lx: 6, ly: 14 }, { lx: 28, ly: 14 }].map((b, i) => (
          <div key={i} style={{ position: 'absolute', left: b.lx, top: b.ly, width: 14, height: 8 }}>
            <div style={{ position: 'absolute', inset: 0,
              background: cooking ? '#FF6600' : '#374151',
              border: `2px solid ${cooking ? '#FF9900' : '#4B5563'}`,
              boxShadow: cooking ? '0 0 6px #FF6600' : 'none',
            }} />
            {cooking && (
              <div style={{ position: 'absolute', left: 3, top: 2, width: 8, height: 4,
                background: '#FFD700', opacity: 0.8 }} />
            )}
          </div>
        ))}
      </div>

      {/* Pot on stove when cooking */}
      {(cooking || foodReady) && (
        <div style={{ position: 'absolute', left: 10, top: 6, width: 40, height: 22 }}>
          <div style={{ position: 'absolute', left: 4, top: 6, width: 32, height: 16,
            background: '#374151', border: '2px solid #6B7280' }} />
          <div style={{ position: 'absolute', left: 2, top: 4, width: 36, height: 6,
            background: foodReady ? '#22C55E' : '#4B5563',
            border: `2px solid ${foodReady ? '#16A34A' : '#6B7280'}` }} />
          <div style={{ position: 'absolute', left: 0, top: 8, width: 4, height: 6,
            background: '#6B7280' }} />
          <div style={{ position: 'absolute', right: 0, top: 8, width: 4, height: 6,
            background: '#6B7280' }} />
          {cooking && (
            <>
              <div style={{ position: 'absolute', left: 10, top: 0, width: 4, height: 4,
                background: 'rgba(200,220,255,0.6)' }} />
              <div style={{ position: 'absolute', left: 18, top: -2, width: 4, height: 6,
                background: 'rgba(200,220,255,0.5)' }} />
              <div style={{ position: 'absolute', left: 26, top: 0, width: 4, height: 4,
                background: 'rgba(200,220,255,0.6)' }} />
            </>
          )}
        </div>
      )}

      {/* Control knobs (bottom strip) */}
      <div style={{ position: 'absolute', left: 4, top: 32, width: 52, height: 10,
        background: '#1F2937', border: '1px solid #374151' }}>
        {[8, 18, 28, 38].map((kx, i) => (
          <div key={i} style={{ position: 'absolute', left: kx, top: 2, width: 6, height: 6,
            background: cooking && i < 2 ? '#EF4444' : '#6B7280',
            border: '1px solid #374151' }} />
        ))}
      </div>

      {/* Oven door (bottom) */}
      <div style={{ position: 'absolute', left: 4, top: 44, width: 52, height: 4,
        background: '#111827', border: '1px solid #374151' }}>
        <div style={{ position: 'absolute', left: 8, top: 1, width: 36, height: 2,
          background: '#1F2937' }} />
      </div>

      {/* Food ready indicator */}
      {foodReady && (
        <div style={{ position: 'absolute', left: 10, top: 2, width: 40, height: 4,
          background: '#22C55E', border: '1px solid #16A34A' }} />
      )}
    </div>
  );
}

interface Props {
  chefs: Chef[];
}

export function KitchenView({ chefs }: Props) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', imageRendering: 'pixelated' }}>

      {/* Kitchen floor tiles */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage:
          'repeating-conic-gradient(#232D3F 0% 25%, #1A2335 0% 50%)',
        backgroundSize: '20px 20px',
      }} />

      {/* Pass-through counter bar (right side — border with dining area) */}
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 6,
        background: '#6B7280', borderRight: '2px solid #9CA3AF' }} />

      {/* Counter surface (right side) */}
      <div style={{ position: 'absolute', top: 0, right: 6, bottom: 0, width: 10,
        background: '#4B5563', borderLeft: '2px solid #374151' }}>
        <div style={{ position: 'absolute', left: 1, top: 0, bottom: 0, width: 2,
          background: 'rgba(255,255,255,0.1)' }} />
      </div>

      {/* Stoves — one per chef, stacked vertically */}
      {chefs.map((chef, i) => (
        <PixelStove key={chef.id} chef={chef} y={20 + i * 110} />
      ))}

      {/* Serving window / pass area (right side, middle) */}
      <div style={{ position: 'absolute', right: 2, top: '50%', transform: 'translateY(-50%)',
        width: 28, height: 80,
        background: '#374151', border: '2px solid #4B5563' }}>
        <div style={{ position: 'absolute', top: 4, left: 4, right: 4, bottom: 20,
          background: '#1F2937', border: '1px solid #6B7280' }}>
          <div style={{ position: 'absolute', inset: 2,
            background: 'rgba(255,200,100,0.05)' }} />
        </div>
        <div style={{ position: 'absolute', bottom: 4, left: 0, right: 0, textAlign: 'center',
          fontSize: 7, color: '#9CA3AF', fontFamily: 'monospace' }}>
          PASS
        </div>
      </div>

      {/* Utensil rack on top wall */}
      <div style={{ position: 'absolute', left: 8, top: 4, width: 48, height: 6,
        background: '#374151', border: '1px solid #4B5563' }}>
        {[12, 22, 32, 42].map((tx, i) => (
          <div key={i} style={{ position: 'absolute', left: tx, top: 1, width: 6, height: 4,
            background: '#9CA3AF' }} />
        ))}
      </div>
    </div>
  );
}
