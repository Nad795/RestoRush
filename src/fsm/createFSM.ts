import type { FSMConfig, FSMInstance, StateKey } from './types';

export function createFSM<S extends StateKey>(config: FSMConfig<S>): FSMInstance<S> {
  let current: S = config.initial;

  function can(next: S): boolean {
    const edges = config.transitions[current] ?? [];
    return edges.some(
      (t) => t.target === next && (t.guard == null || t.guard())
    );
  }

  function transition(next: S): void {
    if (!can(next)) {
      console.warn(`FSM: invalid transition ${current} → ${next}`);
      return;
    }
    current = next;
  }

  return {
    get state() { return current; },
    transition,
    can,
  };
}
