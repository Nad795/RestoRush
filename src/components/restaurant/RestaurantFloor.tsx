import { useSimulationStore } from '../../store/useSimulationStore';
import { TableView } from './TableView';
import { CustomerView } from './CustomerView';
import { WaiterView } from './WaiterView';
import { ChefView } from './ChefView';
import { KitchenView } from './KitchenView';
import { FloorDecor } from './FloorDecor';
import { FLOOR_W, FLOOR_H } from '../../utils/constants';

const KITCHEN_H = 64;
const DINING_H  = FLOOR_H - KITCHEN_H;

export function RestaurantFloor() {
  const tables    = useSimulationStore((s) => s.tables);
  const customers = useSimulationStore((s) => s.customers);
  const waiters   = useSimulationStore((s) => s.waiters);
  const chefs     = useSimulationStore((s) => s.chefs);

  const activeCustomers = customers.filter(
    (c) => c.state !== 'LEAVING' || c.pathIndex < c.path.length,
  );

  return (
    <div className="flex-1 bg-gray-900 overflow-hidden flex items-center justify-center p-2">
      <div
        className="relative border-2 border-gray-700 flex-shrink-0"
        style={{ width: FLOOR_W, height: FLOOR_H, imageRendering: 'pixelated' }}
      >
        {/* ── Dining floor tiles (warm checkerboard) ── */}
        <div style={{
          position:'absolute', top:0, left:0, right:0, height: DINING_H,
          backgroundImage:
            'repeating-conic-gradient(#3D2C1E 0% 25%, #2E2016 0% 50%)',
          backgroundSize:'32px 32px',
        }} />

        {/* Static interior decorations (includes wall strip) */}
        <FloorDecor />

        {/* Tables */}
        {tables.map((t) => <TableView key={t.id} table={t} />)}

        {/* Customers */}
        {activeCustomers.map((c) => <CustomerView key={c.id} customer={c} />)}

        {/* Waiters — positioned by posX/posY across whole floor */}
        {waiters.map((w) => <WaiterView key={w.id} waiter={w} />)}

        {/* ── Divider between dining and kitchen ── */}
        <div style={{
          position:'absolute', bottom: KITCHEN_H, left:0, right:0, height:6,
          background:'#4B5563',
          borderTop:'2px solid #6B7280',
          borderBottom:'2px solid #374151',
          zIndex:10,
        }} />

        {/* Serving hatch label */}
        <div style={{
          position:'absolute',
          bottom: KITCHEN_H + 8,
          right: 12,
          fontSize: 9,
          color: '#6B7280',
          fontFamily: 'monospace',
          letterSpacing: 2,
          zIndex: 11,
        }}>
          KITCHEN →
        </div>

        {/* ── Kitchen zone ── */}
        <div style={{
          position:'absolute', bottom:0, left:0, right:0, height: KITCHEN_H,
          zIndex: 8,
        }}>
          <KitchenView chefs={chefs} floorW={FLOOR_W} />

          {/* Chefs positioned to align with their stoves (stove x = 16 + i*72) */}
          {chefs.map((c, i) => (
            <div key={c.id} style={{ position:'absolute', left: 16 + i * 72, bottom: 4, zIndex: 12 }}>
              <ChefView chef={c} />
            </div>
          ))}
        </div>

        {/* Entrance door (right wall) — 18px wide, centred on ENTRANCE_Y=210 */}
        <div style={{
          position:'absolute', right:0, top:178, width:18, height:64,
          background:'#8B5E3C',
          borderLeft:'3px solid #6B4226',
          borderTop:'3px solid #A0724C',
          borderBottom:'3px solid #5A3820',
          zIndex:4,
        }} />
        {/* Door glass */}
        <div style={{
          position:'absolute', right:2, top:184, width:10, height:50,
          background:'rgba(180,220,255,0.25)', zIndex:5,
        }} />
        {/* Door knob */}
        <div style={{
          position:'absolute', right:13, top:207, width:4, height:4,
          background:'#D4A835', zIndex:6,
        }} />
      </div>
    </div>
  );
}
