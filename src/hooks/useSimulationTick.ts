import { useEffect, useRef } from 'react';
import { useRestaurantStore } from '../store/useRestaurantStore';
import {
  tickSimulation,
  createLoopState,
  type SimulationLoopState,
} from '../systems/simulationLoop';
import { runMovementSystem } from '../systems/movementSystem';

const SIM_STEP_MS = 100; // simulation logic runs at 10 Hz

export function useSimulationTick(): void {
  const loopStateRef = useRef<SimulationLoopState>(createLoopState());
  const simAccRef    = useRef(0);

  useEffect(() => {
    let rafId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      // Cap delta to 100ms so tab-blur doesn't cause a time explosion
      const rawDelta = Math.min(now - lastTime, 100);
      lastTime = now;

      const { paused, speed, screen } = useRestaurantStore.getState();

      if (!paused && screen === 'playing') {
        // Accumulate real time and drain in fixed simulation steps
        simAccRef.current += rawDelta;
        while (simAccRef.current >= SIM_STEP_MS) {
          loopStateRef.current = tickSimulation(
            loopStateRef.current,
            SIM_STEP_MS,
            speed,
          );
          simAccRef.current -= SIM_STEP_MS;
        }

        // Movement runs every frame for smooth visuals
        runMovementSystem(rawDelta, speed);
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);
}
