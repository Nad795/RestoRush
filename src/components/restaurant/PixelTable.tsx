import type { TableState } from '../../entities/table/types';

// Drawn in a 80×60 container, strict pixel-art style (no border-radius)

const C = {
  tableTop:    '#A0724C',
  tableSurface:'#8B5E3C',
  tableEdge:   '#6B4226',
  tableLeg:    '#5A3820',
  cloth:       '#F2EAD8',
  clothEdge:   '#D4C4A4',
  chairBack:   '#5C3D1E',
  chairSeat:   '#7A4A2A',
  chairSide:   '#6B4226',
  plate:       '#E8E8E8',
  plateRim:    '#C0C0C0',
  food:        '#F4A460',
  foodHot:     '#FF8C00',
  stainDark:   '#3D2212',
  stainMid:    '#5C3520',
  dirtyCloth:  '#B8A080',
  dirtyPlate:  '#A08060',
  bubble:      'rgba(160,220,255,0.9)',
  bubbleRim:   'rgba(80,160,220,0.8)',
  wetCloth:    '#D8EEF8',
};

interface Props { state: TableState }

export function PixelTable({ state }: Props) {
  const isDirty    = state === 'DIRTY';
  const isCleaning = state === 'CLEANING';
  const isOccupied = state === 'OCCUPIED';

  return (
    <div style={{ position: 'relative', width: 80, height: 60, imageRendering: 'pixelated' }}>

      {/* ── Top chair ── */}
      <div style={{ position:'absolute', left:22, top:0, width:36, height:6,
        background: C.chairBack }} />
      <div style={{ position:'absolute', left:20, top:5, width:40, height:8,
        background: C.chairSeat,
        borderLeft:`2px solid ${C.chairSide}`, borderRight:`2px solid ${C.chairSide}` }} />

      {/* ── Table surface ── */}
      <div style={{ position:'absolute', left:6, top:13, width:68, height:34,
        background: C.tableSurface,
        borderTop: `3px solid ${C.tableTop}`,
        borderBottom: `4px solid ${C.tableEdge}`,
        borderLeft: `2px solid ${C.tableEdge}`,
        borderRight: `2px solid ${C.tableEdge}`,
      }}>

        {/* Tablecloth */}
        <div style={{
          position:'absolute', left:4, top:3, width:60, height:24,
          background: isDirty ? C.dirtyCloth : isCleaning ? C.wetCloth : C.cloth,
          borderBottom: `2px solid ${isDirty ? '#9A8060' : C.clothEdge}`,
        }}>

          {/* ── AVAILABLE / OCCUPIED: clean plate + food ── */}
          {!isDirty && !isCleaning && (
            <>
              {/* Left place setting */}
              <div style={{ position:'absolute', left:4, top:5, width:12, height:12,
                background: C.plate, border:`2px solid ${C.plateRim}` }} />
              {isOccupied && (
                <div style={{ position:'absolute', left:7, top:8, width:6, height:6,
                  background: C.foodHot }} />
              )}
              {/* Right place setting */}
              <div style={{ position:'absolute', right:4, top:5, width:12, height:12,
                background: C.plate, border:`2px solid ${C.plateRim}` }} />
              {isOccupied && (
                <div style={{ position:'absolute', right:7, top:8, width:6, height:6,
                  background: C.foodHot }} />
              )}
              {/* Center condiments */}
              <div style={{ position:'absolute', left:25, top:3, width:4, height:12,
                background:'#D4E0A0', border:'1px solid #B0C070' }} />
              <div style={{ position:'absolute', left:31, top:3, width:4, height:12,
                background:'#E06040', border:'1px solid #C04020' }} />
            </>
          )}

          {/* ── DIRTY: stains + messy dishes ── */}
          {isDirty && (
            <>
              {/* Stain blobs */}
              <div style={{ position:'absolute', left:5,  top:3,  width:14, height:10,
                background: C.stainDark, opacity:0.85 }} />
              <div style={{ position:'absolute', left:24, top:8,  width:10, height:8,
                background: C.stainMid,  opacity:0.7 }} />
              <div style={{ position:'absolute', right:6, top:2,  width:12, height:12,
                background: C.stainDark, opacity:0.6 }} />
              {/* Dirty overturned plate */}
              <div style={{ position:'absolute', left:14, top:4, width:16, height:14,
                background: C.dirtyPlate,
                transform:'rotate(12deg)',
                border:`2px solid #7A5840` }} />
              {/* Food scraps */}
              <div style={{ position:'absolute', left:38, top:6, width:4, height:4,
                background:'#8B6040' }} />
              <div style={{ position:'absolute', left:44, top:12, width:3, height:3,
                background:'#6B4020' }} />
              <div style={{ position:'absolute', left:50, top:5, width:5, height:3,
                background:'#9A7050' }} />
            </>
          )}

          {/* ── CLEANING: wet cloth + soap bubbles ── */}
          {isCleaning && (
            <>
              {/* Wet sheen */}
              <div style={{ position:'absolute', inset:0,
                background:'linear-gradient(135deg,rgba(200,235,255,0.4) 0%,transparent 60%)' }} />
              {/* Bubbles */}
              {[
                {l:6,  t:3,  s:8},
                {l:18, t:9,  s:6},
                {l:28, t:2,  s:10},
                {l:40, t:8,  s:7},
                {l:50, t:3,  s:8},
              ].map((b,i) => (
                <div key={i} style={{
                  position:'absolute', left:b.l, top:b.t,
                  width:b.s, height:b.s,
                  background: C.bubble,
                  border: `1px solid ${C.bubbleRim}`,
                }} />
              ))}
            </>
          )}
        </div>
      </div>

      {/* ── Table legs ── */}
      <div style={{ position:'absolute', left:10,  top:43, width:5, height:6, background:C.tableLeg }} />
      <div style={{ position:'absolute', right:10, top:43, width:5, height:6, background:C.tableLeg }} />

      {/* ── Bottom chair ── */}
      <div style={{ position:'absolute', left:20, top:48, width:40, height:8,
        background: C.chairSeat,
        borderLeft:`2px solid ${C.chairSide}`, borderRight:`2px solid ${C.chairSide}` }} />
      <div style={{ position:'absolute', left:22, top:55, width:36, height:5,
        background: C.chairBack }} />
    </div>
  );
}
