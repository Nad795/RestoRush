import type { Direction } from '../entities/customer/types';
import { useSimulationStore } from '../store/useSimulationStore';

const WALK_SPEED = 90; // px per real-second (speed multiplier applied by caller)

interface MovableEntity {
  id: string;
  posX: number;
  posY: number;
  path: Array<{ x: number; y: number }>;
  pathIndex: number;
  direction: Direction;
}

function stepEntity(
  entity: MovableEntity,
  moveAmount: number,
): Partial<MovableEntity> {
  if (entity.pathIndex >= entity.path.length) return {};

  const target = entity.path[entity.pathIndex];
  const dx = target.x - entity.posX;
  const dy = target.y - entity.posY;

  // Axis-aligned: move horizontally first, then vertically
  if (Math.abs(dx) > 0.5) {
    const step = Math.min(Math.abs(dx), moveAmount) * Math.sign(dx);
    const newX = entity.posX + step;
    // Snap to target if very close to avoid floating-point jitter
    const snapped = Math.abs(newX - target.x) < 1;
    return {
      posX: snapped ? target.x : newX,
      direction: dx > 0 ? 'right' : 'left',
    };
  }

  if (Math.abs(dy) > 0.5) {
    const step = Math.min(Math.abs(dy), moveAmount) * Math.sign(dy);
    const newY = entity.posY + step;
    const snapped = Math.abs(newY - target.y) < 1;
    return {
      posY: snapped ? target.y : newY,
      direction: dy > 0 ? 'down' : 'up',
    };
  }

  // Waypoint reached — advance to next
  return {
    posX: target.x,
    posY: target.y,
    pathIndex: entity.pathIndex + 1,
  };
}

/**
 * Runs every animation frame (not every simulation tick).
 * rawDelta: real ms since last frame. speed: simulation multiplier.
 * Uses a single Zustand setState to batch all position updates → one React render.
 */
export function runMovementSystem(rawDelta: number, speed: number): void {
  const moveAmount = (WALK_SPEED * rawDelta * speed) / 1000;

  useSimulationStore.setState((state) => {
    const customers = state.customers.map((c) => {
      const patch = stepEntity(c, moveAmount);
      return Object.keys(patch).length ? { ...c, ...patch } : c;
    });

    const waiters = state.waiters.map((w) => {
      const patch = stepEntity(w, moveAmount);
      return Object.keys(patch).length ? { ...w, ...patch } : w;
    });

    return { customers, waiters };
  });
}
