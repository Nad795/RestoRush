// Returns elapsed ms adjusted for simulation speed
export const scaledDelta = (rawMs: number, speed: number): number =>
  rawMs * speed;
