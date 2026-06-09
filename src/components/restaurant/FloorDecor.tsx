// Static decorative elements — pixel art, no game logic

function PixelPlant({ x, y }: { x: number; y: number }) {
  return (
    <div style={{ position:'absolute', left:x, top:y, width:20, height:36, imageRendering:'pixelated', zIndex:3 }}>
      {/* Pot */}
      <div style={{ position:'absolute', bottom:0, left:3, width:14, height:10,
        background:'#8B4513', border:'2px solid #6B3410' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2,
          background:'#A0522D' }} />
      </div>
      {/* Soil */}
      <div style={{ position:'absolute', bottom:8, left:4, width:12, height:3,
        background:'#3D2B1A' }} />
      {/* Stem */}
      <div style={{ position:'absolute', bottom:10, left:9, width:2, height:12,
        background:'#2D6A1E' }} />
      {/* Leaves */}
      <div style={{ position:'absolute', bottom:18, left:2, width:8, height:10,
        background:'#2ECC40', border:'1px solid #27AE36' }} />
      <div style={{ position:'absolute', bottom:14, left:10, width:8, height:10,
        background:'#27AE36', border:'1px solid #1E8A28' }} />
      <div style={{ position:'absolute', bottom:22, left:5, width:10, height:8,
        background:'#2ECC40', border:'1px solid #27AE36' }} />
    </div>
  );
}

function PixelWindow({ x, y }: { x: number; y: number }) {
  return (
    <div style={{ position:'absolute', left:x, top:y, width:52, height:36, imageRendering:'pixelated', zIndex:2 }}>
      {/* Frame */}
      <div style={{ position:'absolute', inset:0, background:'#5C3D1E',
        border:'3px solid #4A2E10' }}>
        {/* Glass panes 2×2 */}
        <div style={{ position:'absolute', left:4, top:4, width:18, height:12,
          background:'rgba(180,220,255,0.35)', border:'1px solid #93C5FD' }} />
        <div style={{ position:'absolute', right:4, top:4, width:18, height:12,
          background:'rgba(180,220,255,0.35)', border:'1px solid #93C5FD' }} />
        <div style={{ position:'absolute', left:4, bottom:4, width:18, height:12,
          background:'rgba(180,220,255,0.25)', border:'1px solid #93C5FD' }} />
        <div style={{ position:'absolute', right:4, bottom:4, width:18, height:12,
          background:'rgba(180,220,255,0.25)', border:'1px solid #93C5FD' }} />
        {/* Cross divider */}
        <div style={{ position:'absolute', left:0, right:0, top:'50%', height:3,
          background:'#5C3D1E', transform:'translateY(-50%)' }} />
        <div style={{ position:'absolute', top:0, bottom:0, left:'50%', width:3,
          background:'#5C3D1E', transform:'translateX(-50%)' }} />
      </div>
      {/* Sill */}
      <div style={{ position:'absolute', bottom:-4, left:-2, right:-2, height:4,
        background:'#7A4A2A' }} />
    </div>
  );
}

function PixelChalkboard({ x, y }: { x: number; y: number }) {
  return (
    <div style={{ position:'absolute', left:x, top:y, width:64, height:44, imageRendering:'pixelated', zIndex:2 }}>
      {/* Frame */}
      <div style={{ position:'absolute', inset:0, background:'#4A2E10',
        border:'4px solid #5C3D1E' }}>
        {/* Chalk surface */}
        <div style={{ position:'absolute', inset:4, background:'#1A2E1A' }}>
          {/* "TODAY'S MENU" text (pixel art lines) */}
          <div style={{ position:'absolute', top:3, left:4, right:4, height:2,
            background:'rgba(255,255,200,0.6)' }} />
          {['Burger $12','Pizza $15','Steak $28','Sushi $22'].map((_, i) => (
            <div key={i} style={{ position:'absolute', left:4, top:8+i*6, right:4, height:2,
              background:'rgba(255,255,255,0.25)' }} />
          ))}
          {/* Chalk dust effect */}
          <div style={{ position:'absolute', bottom:2, left:2, width:20, height:2,
            background:'rgba(255,255,255,0.15)' }} />
        </div>
      </div>
      {/* Chalk ledge */}
      <div style={{ position:'absolute', bottom:-2, left:4, width:16, height:4,
        background:'#FFFFFF', opacity:0.6 }} />
    </div>
  );
}

function PixelMat({ x, y }: { x: number; y: number }) {
  return (
    <div style={{ position:'absolute', left:x, top:y, width:40, height:16, imageRendering:'pixelated', zIndex:1 }}>
      <div style={{ position:'absolute', inset:0, background:'#8B1A1A',
        border:'2px solid #6B1010' }}>
        {/* Stripes */}
        {[4,10,16,22,28,34].map((sx,i)=>(
          <div key={i} style={{ position:'absolute', left:sx, top:2, width:2, bottom:2,
            background: i%2===0 ? '#A02020' : '#7B1515' }} />
        ))}
        {/* Fringe */}
        <div style={{ position:'absolute', bottom:-2, left:0, right:0, height:2,
          backgroundImage:'repeating-linear-gradient(90deg,#8B1A1A 0px,#8B1A1A 4px,transparent 4px,transparent 6px)',
        }} />
      </div>
    </div>
  );
}

function WallStrip() {
  return (
    <div style={{ position:'absolute', top:0, left:0, right:0, height:14, zIndex:2 }}>
      {/* Baseboard / wall top */}
      <div style={{ position:'absolute', inset:0, background:'#2D3B2A',
        borderBottom:'3px solid #3D4F38' }} />
      {/* Crown moulding detail */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:3,
        background:'#4A6040' }} />
    </div>
  );
}

export function FloorDecor() {
  return (
    <>
      <WallStrip />

      {/* Corner plants */}
      <PixelPlant x={4}   y={16} />
      <PixelPlant x={696} y={16} />

      {/* Windows on left wall */}
      <PixelWindow x={8}  y={20} />
      <PixelWindow x={8}  y={70} />

      {/* Chalkboard menu near entrance */}
      <PixelChalkboard x={614} y={20} />

      {/* Entrance mat */}
      <PixelMat x={650} y={195} />
    </>
  );
}
