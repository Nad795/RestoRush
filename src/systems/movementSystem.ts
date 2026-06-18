import type { Direction } from '../entities/customer/types';
import { useSimulationStore } from '../store/useSimulationStore';
import { FLOOR_W, FLOOR_H, KITCHEN_W, WALL_H } from '../utils/constants';

const WALK_SPEED = 90; // px per real-second (speed multiplier applied by caller)

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

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
    const rawX = entity.posX + step;
    const snapped = Math.abs(rawX - target.x) < 1;
    return {
      posX: clamp(snapped ? target.x : rawX, KITCHEN_W, FLOOR_W),
      direction: dx > 0 ? 'right' : 'left',
    };
  }

  if (Math.abs(dy) > 0.5) {
    const step = Math.min(Math.abs(dy), moveAmount) * Math.sign(dy);
    const rawY = entity.posY + step;
    const snapped = Math.abs(rawY - target.y) < 1;
    return {
      posY: clamp(snapped ? target.y : rawY, WALL_H, FLOOR_H),
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
