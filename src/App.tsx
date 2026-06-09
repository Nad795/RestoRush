import { useEffect } from 'react';
import { TopBar } from './components/layout/TopBar';
import { BottomBar } from './components/layout/BottomBar';
import { RightPanel } from './components/layout/RightPanel';
import { ManagementPanel } from './components/layout/ManagementPanel';
import { RestaurantFloor } from './components/restaurant/RestaurantFloor';
import { GameOverModal } from './components/modals/GameOverModal';
import { useSimulationTick } from './hooks/useSimulationTick';
import { initRestaurant } from './utils/initRestaurant';

export default function App() {
  useEffect(() => { initRestaurant(); }, []);
  useSimulationTick();

  return (
    <div className="relative flex flex-col h-screen bg-gray-800 text-white overflow-hidden">
      <TopBar />

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        <RestaurantFloor />
        <RightPanel />
      </div>

      <ManagementPanel />
      <BottomBar />

      <GameOverModal />
    </div>
  );
}
