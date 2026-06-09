import { createFSM } from './createFSM';
import type { FSMConfig, FSMInstance, StateKey } from './types';

/**
 * Rebuilds a transient FSM at an arbitrary current state.
 * Use this in simulation systems — never persist the returned instance.
 *
 * Pattern:
 *   const fsm = reconstituteFSM(customerFSMConfig, customer.state);
 *   if (fsm.can('EATING')) {
 *     fsm.transition('EATING');
 *     updateCustomer(id, { state: fsm.state });
 *   }
 */
export function reconstituteFSM<S extends StateKey>(
  config: FSMConfig<S>,
  currentState: S,
): FSMInstance<S> {
  // Create at initial, then forcibly set to currentState via internal override
  const fsm = createFSM({ ...config, initial: currentState });
  return fsm;
}
