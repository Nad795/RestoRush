export interface AdTier {
  id: string;
  label: string;
  cost: number;
  durationDays: number;
  spawnBonus: number; // multiplies the effective spawn rate while active
}

// Ordered cheapest -> most expensive. Higher cost buys a bigger spawn-rate
// boost and/or a longer campaign.
export const AD_TIERS: AdTier[] = [
  { id: 'flyers',    label: 'Flyers',     cost: 80,  durationDays: 1, spawnBonus: 1.4 },
  { id: 'local',     label: 'Local Ads',  cost: 180, durationDays: 2, spawnBonus: 1.8 },
  { id: 'radio',     label: 'Radio Spot', cost: 350, durationDays: 3, spawnBonus: 2.3 },
  { id: 'billboard', label: 'Billboard',  cost: 600, durationDays: 4, spawnBonus: 3.0 },
];
