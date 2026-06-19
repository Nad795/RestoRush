import { useState } from 'react';
import { TopBar } from './components/layout/TopBar';
import { BottomBar } from './components/layout/BottomBar';
import { RightPanel } from './components/layout/RightPanel';
import { ManagementPanel } from './components/layout/ManagementPanel';
import { RestaurantFloor } from './components/restaurant/RestaurantFloor';
import { GameOverModal } from './components/modals/GameOverModal';
import { DaySummaryModal } from './components/modals/DaySummaryModal';
import { StoryDialogueModal } from './components/modals/StoryDialogueModal';
import { MainMenu } from './components/MainMenu';
import { useSimulationTick } from './hooks/useSimulationTick';
import { useIsMobile } from './hooks/useIsMobile';
import { useRestaurantStore } from './store/useRestaurantStore';

type Drawer = 'none' | 'right' | 'manage';

export default function App() {
  const screen = useRestaurantStore((s) => s.screen);
  useSimulationTick();

  const isMobile = useIsMobile();
  const [drawer, setDrawer] = useState<Drawer>('none');

  const toggleDrawer = (d: 'right' | 'manage') =>
    setDrawer((prev) => (prev === d ? 'none' : d));

  const closeDrawer = () => setDrawer('none');

  if (screen === 'menu') return <MainMenu />;

  return (
    <div className="relative flex flex-col h-screen bg-gray-800 text-white overflow-hidden">
      <TopBar />

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden relative">
        <RestaurantFloor />

        <RightPanel
          isMobile={isMobile}
          isOpen={!isMobile || drawer === 'right'}
          onClose={closeDrawer}
        />

        {/* Mobile FABs */}
        {isMobile && drawer === 'none' && (
          <div className="absolute bottom-3 right-3 flex flex-col gap-2" style={{ zIndex: 30 }}>
            <button
              onClick={() => toggleDrawer('right')}
              className="w-12 h-12 rounded-full bg-blue-600 active:bg-blue-500 text-white text-lg shadow-lg flex items-center justify-center"
            >
              📋
            </button>
            <button
              onClick={() => toggleDrawer('manage')}
              className="w-12 h-12 rounded-full bg-green-600 active:bg-green-500 text-white text-lg shadow-lg flex items-center justify-center"
            >
              🛒
            </button>
          </div>
        )}
      </div>

      <ManagementPanel
        isMobile={isMobile}
        isOpen={!isMobile || drawer === 'manage'}
        onClose={closeDrawer}
      />
      <BottomBar />

      {/* Backdrop for mobile drawers */}
      {isMobile && drawer !== 'none' && (
        <div
          className="fixed inset-0 bg-black/40"
          style={{ zIndex: 30 }}
          onClick={closeDrawer}
        />
      )}

      <DaySummaryModal />
      <GameOverModal />
      <StoryDialogueModal />
    </div>
  );
}
