import { useEffect, useRef } from 'react';
import { useRestaurantStore } from '../store/useRestaurantStore';
import { tickSimulation, createLoopState, type SimulationLoopState } from '../systems/simulationLoop';

const TICK_INTERVAL_MS = 100; // 10 ticks/second — plenty for a sim game

export function useSimulationTick(): void {
  const loopStateRef = useRef<SimulationLoopState>(createLoopState());

  useEffect(() => {
    const id = setInterval(() => {
      const { paused, speed } = useRestaurantStore.getState();
      if (paused) return;

      loopStateRef.current = tickSimulation(
        loopStateRef.current,
        TICK_INTERVAL_MS,
        speed,
      );
    }, TICK_INTERVAL_MS);

    return () => clearInterval(id);
  }, []);
}
