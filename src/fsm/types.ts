// Generic FSM types — no game logic here

export type StateKey = string;

export interface FSMTransition<S extends StateKey> {
  target: S;
  guard?: () => boolean; // optional condition
}

export interface FSMConfig<S extends StateKey> {
  initial: S;
  transitions: Partial<Record<S, FSMTransition<S>[]>>;
}

export interface FSMInstance<S extends StateKey> {
  state: S;
  transition: (next: S) => void;
  can: (next: S) => boolean;
}
