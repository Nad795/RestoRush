import { useState } from 'react';
import { useRestaurantStore } from '../../store/useRestaurantStore';
import { useSimulationStore } from '../../store/useSimulationStore';
import { createWaiter } from '../../entities/waiter/factory';
import { createChef } from '../../entities/chef/factory';
import { createTable } from '../../entities/table/factory';
import { WAITER_COST, CHEF_COST, TABLE_COST } from '../../utils/constants';
import { AD_TIERS } from '../../utils/advertising';

interface Props {
  isMobile: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export function ManagementPanel({ isMobile, isOpen, onClose }: Props) {
  const { money, addMoney, adDaysRemaining, adSpawnBonus, startAdvertisement } = useRestaurantStore();
  const { addWaiter, addChef, addTable, tables } = useSimulationStore();
  const [showAds, setShowAds] = useState(false);

  function hire(cost: number, fn: () => void) {
    if (money >= cost) { addMoney(-cost); fn(); }
  }

  function pickAd(tierId: string) {
    startAdvertisement(tierId);
    setShowAds(false);
  }

  const adStatus = adDaysRemaining > 0
    ? `Active: ${adDaysRemaining}d (x${adSpawnBonus.toFixed(1)})`
    : null;

  const btnBase = 'flex flex-col items-center rounded disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors';
  const btnDesktop = `${btnBase} px-3 py-1 text-xs`;
  const btnMobile = `${btnBase} px-4 py-3 text-sm min-h-[48px] justify-center`;

  const adPopup = showAds && (
    <>
      <div className="fixed inset-0 bg-black/50" style={{ zIndex: 50 }} onClick={() => setShowAds(false)} />
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 border border-gray-600 rounded-lg p-4 w-80 max-w-[90vw]"
        style={{ zIndex: 51 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider">Ad Campaigns</h3>
          <button onClick={() => setShowAds(false)} className="text-gray-400 hover:text-white active:text-white p-1 text-lg">✕</button>
        </div>

        {adStatus && (
          <div className="bg-purple-900/50 rounded px-3 py-2 mb-3 text-xs text-purple-200 text-center">
            {adStatus}
          </div>
        )}

        <div className="flex flex-col gap-2">
          {AD_TIERS.map((tier) => {
            const canAfford = money >= tier.cost;
            return (
              <button
                key={tier.id}
                disabled={!canAfford}
                onClick={() => pickAd(tier.id)}
                className={`flex items-center justify-between rounded px-3 py-3 text-left transition-colors ${
                  canAfford
                    ? 'bg-purple-800 hover:bg-purple-700 active:bg-purple-700 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                <div>
                  <p className="text-sm font-semibold">{tier.label}</p>
                  <p className="text-xs text-gray-300">{tier.durationDays}d duration &middot; x{tier.spawnBonus} customers</p>
                </div>
                <span className={`text-sm font-bold ${canAfford ? 'text-green-400' : 'text-gray-500'}`}>
                  ${tier.cost}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        <div
          className={[
            'fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700',
            'transition-transform duration-200 ease-out',
            'p-4 pb-6',
            isOpen ? 'translate-y-0' : 'translate-y-full',
          ].join(' ')}
          style={{ zIndex: 40 }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400 uppercase tracking-wider">Hire / Buy</span>
            <button onClick={onClose} className="text-gray-400 active:text-white p-2 text-lg">✕</button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              disabled={money < WAITER_COST}
              onClick={() => hire(WAITER_COST, () => addWaiter(createWaiter()))}
              className={`${btnMobile} bg-blue-800 active:bg-blue-700`}
            >
              <span>🧑 Waiter</span>
              <span className="text-blue-300">${WAITER_COST}</span>
            </button>

            <button
              disabled={money < CHEF_COST}
              onClick={() => hire(CHEF_COST, () => addChef(createChef()))}
              className={`${btnMobile} bg-orange-800 active:bg-orange-700`}
            >
              <span>👨‍🍳 Chef</span>
              <span className="text-orange-300">${CHEF_COST}</span>
            </button>

            <button
              disabled={money < TABLE_COST || tables.length >= 20}
              onClick={() => hire(TABLE_COST, () => addTable(createTable(tables.length)))}
              className={`${btnMobile} bg-green-800 active:bg-green-700`}
            >
              <span>🪑 Table</span>
              <span className="text-green-300">${TABLE_COST}</span>
            </button>

            <button
              onClick={() => setShowAds(true)}
              className={`${btnMobile} bg-purple-800 active:bg-purple-700`}
            >
              <span>📢 Advertise</span>
              {adStatus && <span className="text-purple-300 text-xs">{adStatus}</span>}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-3">Tables: {tables.length}/20</p>
        </div>
        {adPopup}
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 bg-gray-900 border-t border-gray-700 px-4 py-2">
        <span className="text-xs text-gray-400 uppercase tracking-wider mr-2">Hire / Buy</span>

        <button
          disabled={money < WAITER_COST}
          onClick={() => hire(WAITER_COST, () => addWaiter(createWaiter()))}
          className={`${btnDesktop} bg-blue-800 hover:bg-blue-700`}
        >
          <span>🧑 Waiter</span>
          <span className="text-blue-300">${WAITER_COST}</span>
        </button>

        <button
          disabled={money < CHEF_COST}
          onClick={() => hire(CHEF_COST, () => addChef(createChef()))}
          className={`${btnDesktop} bg-orange-800 hover:bg-orange-700`}
        >
          <span>👨‍🍳 Chef</span>
          <span className="text-orange-300">${CHEF_COST}</span>
        </button>

        <button
          disabled={money < TABLE_COST || tables.length >= 20}
          onClick={() => hire(TABLE_COST, () => addTable(createTable(tables.length)))}
          className={`${btnDesktop} bg-green-800 hover:bg-green-700`}
        >
          <span>🪑 Table</span>
          <span className="text-green-300">${TABLE_COST}</span>
        </button>

        <button
          onClick={() => setShowAds(true)}
          className="flex flex-col items-center px-3 py-1 rounded bg-purple-800 hover:bg-purple-700 text-white text-xs transition-colors cursor-pointer"
        >
          <span>📢 Advertise</span>
          <span className="text-purple-300">
            {adStatus ?? 'Choose campaign'}
          </span>
        </button>

        <span className="ml-auto text-xs text-gray-500">Tables: {tables.length}/20</span>
      </div>
      {adPopup}
    </>
  );
}
