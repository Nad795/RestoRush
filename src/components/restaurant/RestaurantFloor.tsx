import { useRef, useState, useEffect } from 'react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { TableView } from './TableView';
import { CustomerView } from './CustomerView';
import { WaiterView } from './WaiterView';
import { ChefView } from './ChefView';
import { KitchenView } from './KitchenView';
import { FloorDecor } from './FloorDecor';
import { FLOOR_W, FLOOR_H, KITCHEN_W, WALL_H } from '../../utils/constants';

export function RestaurantFloor() {
  const tables    = useSimulationStore((s) => s.tables);
  const customers = useSimulationStore((s) => s.customers);
  const waiters   = useSimulationStore((s) => s.waiters);
  const chefs     = useSimulationStore((s) => s.chefs);

  const activeCustomers = customers.filter(
    (c) => c.state !== 'LEAVING' || c.pathIndex < c.path.length,
  );

  // Responsive scaling: measure container and scale the virtual-resolution game div
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      const padding = 16;
      setScale(Math.min((width - padding) / FLOOR_W, (height - padding) / FLOOR_H));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="flex-1 bg-gray-900 overflow-hidden flex items-center justify-center p-1 md:p-2">
      <div
        className="relative border-2 border-gray-700 flex-shrink-0"
        style={{
          width: FLOOR_W,
          height: FLOOR_H,
          imageRendering: 'pixelated',
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        {/* ── Kitchen zone (vertical strip on the left) ── */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: KITCHEN_W,
          zIndex: 8,
        }}>
          <KitchenView chefs={chefs} />

          {/* Chefs stacked vertically to align with their stoves */}
          {chefs.map((c, i) => (
            <div key={c.id} style={{ position: 'absolute', left: 12, top: 24 + i * 110, zIndex: 12 }}>
              <ChefView chef={c} />
            </div>
          ))}
        </div>

        {/* ── Vertical divider between kitchen and dining ── */}
        <div style={{
          position: 'absolute', left: KITCHEN_W, top: 0, bottom: 0, width: 6,
          background: '#4B5563',
          borderLeft: '2px solid #6B7280',
          borderRight: '2px solid #374151',
          zIndex: 10,
        }} />

        {/* Kitchen label */}
        <div style={{
          position: 'absolute',
          left: 8,
          top: 8,
          fontSize: 9,
          color: '#6B7280',
          fontFamily: 'monospace',
          letterSpacing: 2,
          zIndex: 11,
        }}>
          KITCHEN
        </div>

        {/* ── Dining floor tiles (warm checkerboard, below top wall) ── */}
        <div style={{
          position: 'absolute', top: WALL_H, left: KITCHEN_W + 6, right: 0, bottom: 0,
          backgroundImage:
            'repeating-conic-gradient(#3D2C1E 0% 25%, #2E2016 0% 50%)',
          backgroundSize: '32px 32px',
        }} />

        {/* Static interior decorations */}
        <FloorDecor />

        {/* Tables */}
        {tables.map((t) => <TableView key={t.id} table={t} />)}

        {/* Customers */}
        {activeCustomers.map((c) => <CustomerView key={c.id} customer={c} />)}

        {/* Waiters */}
        {waiters.map((w) => <WaiterView key={w.id} waiter={w} />)}

      </div>
    </div>
  );
}
