import { useRestaurantStore, type SpeedMultiplier } from '../store/useRestaurantStore';

const LABELS: Record<SpeedMultiplier, string> = { 1: '1×', 2: '2×', 4: '4×' };

export function useSpeedMultiplier() {
  const speed = useRestaurantStore((s) => s.speed);
  const setSpeed = useRestaurantStore((s) => s.setSpeed);
  return { speed, setSpeed, label: LABELS[speed] };
}
