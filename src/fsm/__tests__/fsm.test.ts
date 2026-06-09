import { describe, it, expect } from 'vitest';
import { stepEntity } from '../stepEntity';
import { reconstituteFSM } from '../reconstituteFSM';
import {
  CUSTOMER_FSM_CONFIG,
  WAITER_FSM_CONFIG,
  CHEF_FSM_CONFIG,
  TABLE_FSM_CONFIG,
  ORDER_FSM_CONFIG,
} from '../configs';

// ─── createFSM / reconstituteFSM core ───────────────────────────────────────

describe('reconstituteFSM', () => {
  it('starts at the provided state, not the config initial', () => {
    const fsm = reconstituteFSM(CUSTOMER_FSM_CONFIG, 'WAITING');
    expect(fsm.state).toBe('WAITING');
  });

  it('allows valid transitions from reconstituted state', () => {
    const fsm = reconstituteFSM(CUSTOMER_FSM_CONFIG, 'WAITING');
    expect(fsm.can('EATING')).toBe(true);
    expect(fsm.can('ANGRY')).toBe(true);
  });

  it('blocks invalid transitions', () => {
    const fsm = reconstituteFSM(CUSTOMER_FSM_CONFIG, 'EATING');
    expect(fsm.can('ORDERING')).toBe(false); // can't go backwards
    expect(fsm.can('SPAWN')).toBe(false);
  });

  it('respects guard functions', () => {
    const config = {
      initial: 'A' as const,
      transitions: {
        A: [{ target: 'B' as const, guard: () => false }],
      },
    };
    const fsm = reconstituteFSM(config, 'A' as const);
    expect(fsm.can('B')).toBe(false);
  });
});

// ─── stepEntity helper ───────────────────────────────────────────────────────

describe('stepEntity', () => {
  it('returns target state on valid transition', () => {
    const next = stepEntity(CUSTOMER_FSM_CONFIG, 'WAITING', 'EATING');
    expect(next).toBe('EATING');
  });

  it('returns original state on invalid transition', () => {
    const next = stepEntity(CUSTOMER_FSM_CONFIG, 'EATING', 'ORDERING');
    expect(next).toBe('EATING');
  });
});

// ─── Customer FSM ────────────────────────────────────────────────────────────

describe('Customer FSM — happy path', () => {
  const states = ['SPAWN','FIND_TABLE','ORDERING','WAITING','EATING','PAYING','LEAVING'] as const;

  it('walks the full happy path', () => {
    let state: typeof states[number] = 'SPAWN';
    for (let i = 0; i < states.length - 1; i++) {
      state = stepEntity(CUSTOMER_FSM_CONFIG, state, states[i + 1]) as typeof state;
      expect(state).toBe(states[i + 1]);
    }
  });
});

describe('Customer FSM — angry path', () => {
  it('can go WAITING → ANGRY → LEAVING', () => {
    let state = stepEntity(CUSTOMER_FSM_CONFIG, 'WAITING', 'ANGRY');
    expect(state).toBe('ANGRY');
    state = stepEntity(CUSTOMER_FSM_CONFIG, state, 'LEAVING');
    expect(state).toBe('LEAVING');
  });

  it('cannot go ANGRY → EATING', () => {
    const state = stepEntity(CUSTOMER_FSM_CONFIG, 'ANGRY', 'EATING');
    expect(state).toBe('ANGRY');
  });
});

describe('Customer FSM — no table path', () => {
  it('can go FIND_TABLE → LEAVING when no table available', () => {
    const state = stepEntity(CUSTOMER_FSM_CONFIG, 'FIND_TABLE', 'LEAVING');
    expect(state).toBe('LEAVING');
  });
});

// ─── Waiter FSM ──────────────────────────────────────────────────────────────

describe('Waiter FSM', () => {
  it('cycles through full work loop back to IDLE', () => {
    const sequence: Array<Parameters<typeof stepEntity>[2]> = [
      'TAKE_ORDER', 'DELIVER_TO_KITCHEN', 'PICKUP_FOOD', 'SERVE_FOOD', 'IDLE',
    ];
    let state = stepEntity(WAITER_FSM_CONFIG, 'IDLE', 'TAKE_ORDER');
    expect(state).toBe('TAKE_ORDER');

    for (let i = 1; i < sequence.length; i++) {
      state = stepEntity(WAITER_FSM_CONFIG, state, sequence[i]);
      expect(state).toBe(sequence[i]);
    }
  });

  it('cannot skip steps', () => {
    const state = stepEntity(WAITER_FSM_CONFIG, 'IDLE', 'SERVE_FOOD');
    expect(state).toBe('IDLE');
  });
});

// ─── Chef FSM ────────────────────────────────────────────────────────────────

describe('Chef FSM', () => {
  it('IDLE → COOKING → FOOD_READY → IDLE', () => {
    let state = stepEntity(CHEF_FSM_CONFIG, 'IDLE', 'COOKING');
    expect(state).toBe('COOKING');
    state = stepEntity(CHEF_FSM_CONFIG, state, 'FOOD_READY');
    expect(state).toBe('FOOD_READY');
    state = stepEntity(CHEF_FSM_CONFIG, state, 'IDLE');
    expect(state).toBe('IDLE');
  });

  it('cannot go IDLE → FOOD_READY directly', () => {
    const state = stepEntity(CHEF_FSM_CONFIG, 'IDLE', 'FOOD_READY');
    expect(state).toBe('IDLE');
  });
});

// ─── Table FSM ───────────────────────────────────────────────────────────────

describe('Table FSM', () => {
  it('cycles AVAILABLE → OCCUPIED → DIRTY → CLEANING → AVAILABLE', () => {
    const cycle = ['OCCUPIED','DIRTY','CLEANING','AVAILABLE'] as const;
    let state = stepEntity(TABLE_FSM_CONFIG, 'AVAILABLE', 'OCCUPIED');
    expect(state).toBe('OCCUPIED');

    for (let i = 1; i < cycle.length; i++) {
      state = stepEntity(TABLE_FSM_CONFIG, state, cycle[i]);
      expect(state).toBe(cycle[i]);
    }
  });
});

// ─── Order FSM ───────────────────────────────────────────────────────────────

describe('Order FSM', () => {
  it('walks CREATED → COOKING → READY → SERVED → COMPLETED', () => {
    const path = ['COOKING','READY','SERVED','COMPLETED'] as const;
    let state = stepEntity(ORDER_FSM_CONFIG, 'CREATED', 'COOKING');
    expect(state).toBe('COOKING');

    for (const next of path.slice(1)) {
      state = stepEntity(ORDER_FSM_CONFIG, state, next);
      expect(state).toBe(next);
    }
  });

  it('COMPLETED is a terminal state — no transitions out', () => {
    const state = stepEntity(ORDER_FSM_CONFIG, 'COMPLETED', 'CREATED');
    expect(state).toBe('COMPLETED');
  });
});
