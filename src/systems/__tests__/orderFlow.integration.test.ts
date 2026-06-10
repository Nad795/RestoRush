import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSimulationStore } from '../../store/useSimulationStore';
import { useRestaurantStore } from '../../store/useRestaurantStore';
import { tickSimulation, createLoopState } from '../simulationLoop';
import { runMovementSystem } from '../movementSystem';
import { createTable } from '../../entities/table/factory';
import { createWaiter } from '../../entities/waiter/factory';
import { createChef } from '../../entities/chef/factory';
import { createCustomer } from '../../entities/customer/factory';
import { KITCHEN_Y } from '../../utils/constants';

// End-to-end trace of one customer through the full
// order -> kitchen -> chef -> waiter -> serve -> eat -> pay -> leave loop.
describe('full order flow (1 table, 1 waiter, 1 chef, 1 customer)', () => {
  beforeEach(() => {
    useSimulationStore.setState({
      customers: [], waiters: [], chefs: [], tables: [], orders: [],
    });
    useRestaurantStore.setState({
      money: 500, rating: 5, day: 1, paused: false, speed: 1,
      dayTimer: 0, revenueToday: 0, customersServedToday: 0,
      customersAngryToday: 0, daySummary: null,
    });
  });

  it('runs the whole lifecycle without any invalid FSM transitions', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const sim = useSimulationStore.getState();
    sim.addTable(createTable(0));
    sim.addWaiter(createWaiter());
    sim.addChef(createChef());
    // Pin to the fastest dish (Salad) so the happy-path lifecycle below stays
    // deterministic regardless of which dish is randomly assigned — a slow
    // dish (e.g. Steak) combined with low starting patience can legitimately
    // push a customer to ANGRY before being served, which is intended menu
    // balance (see context.md §6.5) but would make this trace non-deterministic.
    sim.addCustomer({ ...createCustomer(), menuItem: 'Salad' });

    let loopState = createLoopState();

    const initial = useSimulationStore.getState();
    const customerId = initial.customers[0].id;
    const customerStates: string[] = [initial.customers[0].state];
    const orderStates: string[] = [];
    const waiterStates: string[] = [initial.waiters[0].state];
    const chefStates: string[] = [initial.chefs[0].state];
    const tableStates: string[] = [initial.tables[0].state];
    // last-seen waiter position while in each state (captures "arrived" position)
    const waiterPosByState: Record<string, { x: number; y: number }> = {};

    const STEP_MS = 100;
    const MAX_TICKS = 1200; // 120s sim time — generous upper bound

    for (let i = 0; i < MAX_TICKS; i++) {
      loopState = tickSimulation(loopState, STEP_MS, 1);
      runMovementSystem(STEP_MS, 1);

      const s = useSimulationStore.getState();
      const customer = s.customers.find((c) => c.id === customerId);
      const order = customer?.orderId ? s.orders.find((o) => o.id === customer.orderId) : undefined;
      const waiter = s.waiters[0];
      const chef = s.chefs[0];
      const table = s.tables[0];

      // Cap each trace to its first full cycle — the table/waiter/chef may
      // start a second customer's cycle while customer 1 is still walking
      // to the exit, which is correct concurrent behaviour but out of scope
      // for this single-order trace.
      if (customer && customerStates.at(-1) !== customer.state) customerStates.push(customer.state);
      if (order && orderStates.at(-1) !== order.state) orderStates.push(order.state);
      if (table && tableStates.length < 4 && tableStates.at(-1) !== table.state) tableStates.push(table.state);
      if (chef && chefStates.length < 4 && chefStates.at(-1) !== chef.state) chefStates.push(chef.state);
      if (waiter && waiterStates.length < 6) {
        if (waiterStates.at(-1) !== waiter.state) waiterStates.push(waiter.state);
        waiterPosByState[waiter.state] = { x: waiter.posX, y: waiter.posY };
      }

      if (import.meta.env.DEBUG_FLOW) {
        console.log(
          i,
          'cust:', customer?.state, customer ? `(${customer.posX.toFixed(0)},${customer.posY.toFixed(0)}) path=${customer.pathIndex}/${customer.path.length}` : '-',
          'table:', table?.state, `clean=${table?.cleanTimer}`,
          'order:', order?.state ?? '-',
          'waiter:', waiter?.state, `(${waiter.posX.toFixed(0)},${waiter.posY.toFixed(0)}) path=${waiter.pathIndex}/${waiter.path.length} timer=${waiter.taskTimer}`,
          'chef:', chef?.state,
        );
      }

      // tracked customer fully left and removed -> done
      if (!customer) break;
    }

    // No FSM ever attempted an illegal transition
    expect(warnSpy).not.toHaveBeenCalled();

    // ── Customer lifecycle ──────────────────────────────────────────────
    expect(customerStates).toEqual([
      'SPAWN', 'FIND_TABLE', 'ORDERING', 'WAITING', 'EATING', 'PAYING', 'LEAVING',
    ]);
    expect(useSimulationStore.getState().customers.find((c) => c.id === customerId)).toBeUndefined();

    // ── Order lifecycle ──────────────────────────────────────────────────
    expect(orderStates).toEqual(['CREATED', 'COOKING', 'READY', 'SERVED']);

    // ── Waiter lifecycle ───────────────────────────────────────────────
    expect(waiterStates).toEqual([
      'IDLE', 'TAKE_ORDER', 'DELIVER_TO_KITCHEN', 'PICKUP_FOOD', 'SERVE_FOOD', 'IDLE',
    ]);

    // ── Chef lifecycle ─────────────────────────────────────────────────
    expect(chefStates).toEqual(['IDLE', 'COOKING', 'FOOD_READY', 'IDLE']);

    // ── Table lifecycle ────────────────────────────────────────────────
    // Note: DIRTY is set by customerSystem and immediately advanced to
    // CLEANING by tableSystem within the same tick, so it's never observed
    // as a standalone polled state (by design — no separate cleaner entity).
    expect(tableStates).toEqual(['AVAILABLE', 'OCCUPIED', 'CLEANING', 'AVAILABLE']);

    // ── Spatial sanity: did the waiter actually reach the table / kitchen? ──
    const table0 = createTable(0);
    const SERVE_OFFSET_X = 48;
    const tableDest = { x: table0.x + SERVE_OFFSET_X, y: table0.y };

    // By the end of TAKE_ORDER, waiter should have walked to the table
    expect(waiterPosByState['TAKE_ORDER']).toBeDefined();
    expect(waiterPosByState['TAKE_ORDER']!.x).toBeCloseTo(tableDest.x, 0);
    expect(waiterPosByState['TAKE_ORDER']!.y).toBeCloseTo(tableDest.y, 0);

    // By the end of DELIVER_TO_KITCHEN/PICKUP_FOOD, waiter should be at the kitchen row
    expect(waiterPosByState['PICKUP_FOOD']).toBeDefined();
    expect(waiterPosByState['PICKUP_FOOD']!.y).toBeCloseTo(KITCHEN_Y, 0);

    // By the end of SERVE_FOOD, waiter should be back at the table
    expect(waiterPosByState['SERVE_FOOD']).toBeDefined();
    expect(waiterPosByState['SERVE_FOOD']!.x).toBeCloseTo(tableDest.x, 0);
    expect(waiterPosByState['SERVE_FOOD']!.y).toBeCloseTo(tableDest.y, 0);
  });
});
