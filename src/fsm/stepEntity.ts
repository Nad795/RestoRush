import type { FSMConfig, StateKey } from './types';
import { reconstituteFSM } from './reconstituteFSM';

/**
 * Convenience wrapper used by every simulation system.
 *
 * Attempts a transition from entity.state → nextState.
 * Returns the new state string if the transition succeeded, or the original
 * state if it was blocked (guard failed or edge doesn't exist).
 *
 * Usage:
 *   const next = stepEntity(customerFSMConfig, customer.state, 'EATING');
 *   if (next !== customer.state) updateCustomer(id, { state: next });
 */
export function stepEntity<S extends StateKey>(
  config: FSMConfig<S>,
  currentState: S,
  targetState: S,
): S {
  const fsm = reconstituteFSM(config, currentState);
  if (fsm.can(targetState)) {
    fsm.transition(targetState);
    return fsm.state;
  }
  return currentState;
}
