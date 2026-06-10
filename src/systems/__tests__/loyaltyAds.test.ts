import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useSimulationStore } from '../../store/useSimulationStore';
import { useRestaurantStore } from '../../store/useRestaurantStore';
import { runSpawnSystem, getSpawnInterval } from '../spawnSystem';
import { runCustomerSystem } from '../customerSystem';
import { createTable } from '../../entities/table/factory';
import { createCustomer } from '../../entities/customer/factory';
import { createOrder } from '../../entities/order/factory';
import {
  LOYALTY_MAX,
  LOYALTY_GAIN_PER_HAPPY,
  LOYALTY_LOSS_PER_ANGRY_LOYAL,
  RATING_SPAWN_MULT_MIN,
  RATING_SPAWN_MULT_MAX,
  SPAWN_INTERVAL_MS,
  PATIENCE_ANGER_THRESHOLD,
} from '../../utils/constants';
import { AD_TIERS } from '../../utils/advertising';

function resetStores() {
  useSimulationStore.setState({
    customers: [], waiters: [], chefs: [], tables: [], orders: [],
  });
  useRestaurantStore.setState({
    money: 500, rating: 5, day: 1, paused: false, speed: 1,
    dayTimer: 0, revenueToday: 0, customersServedToday: 0,
    customersAngryToday: 0, daySummary: null,
    loyalty: 0, adDaysRemaining: 0, adSpawnBonus: 1,
  });
}

describe('useRestaurantStore — loyalty & advertising', () => {
  beforeEach(resetStores);

  it('adjustLoyalty clamps to [0, LOYALTY_MAX]', () => {
    const { adjustLoyalty } = useRestaurantStore.getState();

    adjustLoyalty(-10);
    expect(useRestaurantStore.getState().loyalty).toBe(0);

    adjustLoyalty(LOYALTY_MAX + 50);
    expect(useRestaurantStore.getState().loyalty).toBe(LOYALTY_MAX);

    adjustLoyalty(-5);
    expect(useRestaurantStore.getState().loyalty).toBe(LOYALTY_MAX - 5);
  });

  it('startAdvertisement deducts cost, stacks duration, and takes the higher spawn bonus', () => {
    const { startAdvertisement } = useRestaurantStore.getState();
    const [flyers, local] = AD_TIERS; // local has both a higher cost and a higher bonus

    startAdvertisement(flyers.id);
    expect(useRestaurantStore.getState().money).toBe(500 - flyers.cost);
    expect(useRestaurantStore.getState().adDaysRemaining).toBe(flyers.durationDays);
    expect(useRestaurantStore.getState().adSpawnBonus).toBe(flyers.spawnBonus);

    startAdvertisement(local.id);
    expect(useRestaurantStore.getState().money).toBe(500 - flyers.cost - local.cost);
    expect(useRestaurantStore.getState().adDaysRemaining).toBe(flyers.durationDays + local.durationDays);
    expect(useRestaurantStore.getState().adSpawnBonus).toBe(local.spawnBonus);
  });

  it('does not downgrade the spawn bonus when a weaker campaign is bought while a stronger one is active', () => {
    const { startAdvertisement } = useRestaurantStore.getState();
    const [flyers, , radio] = AD_TIERS; // radio has the higher bonus

    startAdvertisement(radio.id);
    startAdvertisement(flyers.id);

    expect(useRestaurantStore.getState().adSpawnBonus).toBe(radio.spawnBonus);
    expect(useRestaurantStore.getState().adDaysRemaining).toBe(radio.durationDays + flyers.durationDays);
  });

  it('startAdvertisement no-ops when money is insufficient', () => {
    const tier = AD_TIERS[0];
    useRestaurantStore.setState({ money: tier.cost - 1 });
    useRestaurantStore.getState().startAdvertisement(tier.id);

    expect(useRestaurantStore.getState().money).toBe(tier.cost - 1);
    expect(useRestaurantStore.getState().adDaysRemaining).toBe(0);
    expect(useRestaurantStore.getState().adSpawnBonus).toBe(1);
  });

  it('tickDay decrements adDaysRemaining on day rollover, floored at 0, resetting the bonus on expiry', () => {
    useRestaurantStore.setState({ adDaysRemaining: 1, adSpawnBonus: 2.3, dayTimer: 0 });
    useRestaurantStore.getState().tickDay(1_000_000, 0); // force rollover
    expect(useRestaurantStore.getState().adDaysRemaining).toBe(0);
    expect(useRestaurantStore.getState().adSpawnBonus).toBe(1);

    // dismiss the day summary so the next tickDay isn't blocked by `paused`
    useRestaurantStore.getState().dismissSummary();
    useRestaurantStore.setState({ adDaysRemaining: 0, dayTimer: 0 });
    useRestaurantStore.getState().tickDay(1_000_000, 0);
    expect(useRestaurantStore.getState().adDaysRemaining).toBe(0);
  });
});

describe('getSpawnInterval', () => {
  it('is fastest at max rating with the strongest ad bonus, slowest at min rating with none', () => {
    const maxBonus = Math.max(...AD_TIERS.map((t) => t.spawnBonus));
    const fastest = getSpawnInterval(5, maxBonus);
    const slowest = getSpawnInterval(1, 1);

    expect(fastest).toBeCloseTo(SPAWN_INTERVAL_MS / (RATING_SPAWN_MULT_MAX * maxBonus));
    expect(slowest).toBeCloseTo(SPAWN_INTERVAL_MS / RATING_SPAWN_MULT_MIN);
    expect(fastest).toBeLessThan(slowest);
  });

  it('a higher ad bonus always speeds up spawns relative to none, at the same rating', () => {
    expect(getSpawnInterval(3, 1.5)).toBeLessThan(getSpawnInterval(3, 1));
  });
});

describe('spawnSystem — base & loyalty trickle spawns', () => {
  beforeEach(resetStores);

  it('spawns a base customer once the effective interval elapses', () => {
    useSimulationStore.getState().addTable(createTable(0));
    const interval = getSpawnInterval(useRestaurantStore.getState().rating, 1);

    const acc = runSpawnSystem(interval, 0);

    expect(acc).toBe(0);
    const customers = useSimulationStore.getState().customers;
    expect(customers).toHaveLength(1);
    expect(customers[0].source).toBe('base');
  });

  it('rolls an extra loyalty-source spawn when loyalty is maxed', () => {
    useSimulationStore.getState().addTable(createTable(0));
    useSimulationStore.getState().addTable(createTable(1));
    useRestaurantStore.setState({ loyalty: LOYALTY_MAX }); // chance = 1

    const interval = getSpawnInterval(useRestaurantStore.getState().rating, 1);
    runSpawnSystem(interval, 0);

    const customers = useSimulationStore.getState().customers;
    expect(customers.map((c) => c.source).sort()).toEqual(['base', 'loyalty']);
  });

  it('never spawns past the maxCustomers cap, even with a guaranteed loyalty roll', () => {
    useSimulationStore.getState().addTable(createTable(0)); // maxCustomers = max(1*2,4) = 4
    for (let i = 0; i < 4; i++) {
      useSimulationStore.getState().addCustomer(createCustomer());
    }
    useRestaurantStore.setState({ loyalty: LOYALTY_MAX });

    const interval = getSpawnInterval(useRestaurantStore.getState().rating, 1);
    runSpawnSystem(interval, 0);

    expect(useSimulationStore.getState().customers).toHaveLength(4);
  });
});

describe('customerSystem — loyalty adjustments on serve / anger', () => {
  beforeEach(resetStores);
  afterEach(() => vi.restoreAllMocks());

  it('gains loyalty when any customer is served before going angry', () => {
    const table = createTable(0);
    useSimulationStore.getState().addTable(table);

    const customer = { ...createCustomer('base'), tableId: table.id, patience: 100 };
    const order = { ...createOrder(customer.id, table.id, customer.menuItem), state: 'SERVED' as const };
    useSimulationStore.getState().addOrder(order);
    useSimulationStore.getState().addCustomer({ ...customer, orderId: order.id, state: 'WAITING' });

    runCustomerSystem(100);

    expect(useRestaurantStore.getState().loyalty).toBe(LOYALTY_GAIN_PER_HAPPY);
    expect(useSimulationStore.getState().customers[0].spendingAmount).toBe(order.price);
  });

  it('loses loyalty only when a loyalty-source customer goes angry', () => {
    const table = createTable(0);
    useSimulationStore.getState().addTable(table);
    useRestaurantStore.setState({ loyalty: LOYALTY_MAX });

    // Patience just above the threshold so one tick of drain pushes it under.
    const customer = {
      ...createCustomer('loyalty'),
      tableId: table.id,
      state: 'WAITING' as const,
      orderId: 'order_pending',
      patience: PATIENCE_ANGER_THRESHOLD + 0.01,
    };
    useSimulationStore.getState().addCustomer(customer);

    runCustomerSystem(100);

    expect(useSimulationStore.getState().customers[0].state).toBe('ANGRY');
    expect(useRestaurantStore.getState().loyalty).toBe(LOYALTY_MAX - LOYALTY_LOSS_PER_ANGRY_LOYAL);
  });

  it('does not penalize loyalty when a base-source customer goes angry', () => {
    const table = createTable(0);
    useSimulationStore.getState().addTable(table);
    useRestaurantStore.setState({ loyalty: LOYALTY_MAX });

    const customer = {
      ...createCustomer('base'),
      tableId: table.id,
      state: 'WAITING' as const,
      orderId: 'order_pending',
      patience: PATIENCE_ANGER_THRESHOLD + 0.01,
    };
    useSimulationStore.getState().addCustomer(customer);

    runCustomerSystem(100);

    expect(useSimulationStore.getState().customers[0].state).toBe('ANGRY');
    expect(useRestaurantStore.getState().loyalty).toBe(LOYALTY_MAX);
  });
});
