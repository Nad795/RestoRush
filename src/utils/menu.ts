export interface MenuItem {
  name: string;
  price: number;      // $ paid by the customer when served
  cookTimeMs: number;  // chef time to prepare this dish
}

// Prices bumped ~30-40% over their original values to offset the daily staff
// wages introduced alongside the win/lose goal (see WAITER_DAILY_WAGE /
// CHEF_DAILY_WAGE in constants.ts) while keeping GOAL_MONEY achievable.
export const MENU: MenuItem[] = [
  { name: 'Salad',  price: 12, cookTimeMs: 4000 },
  { name: 'Tacos',  price: 15, cookTimeMs: 5000 },
  { name: 'Burger', price: 16, cookTimeMs: 6000 },
  { name: 'Pasta',  price: 18, cookTimeMs: 6500 },
  { name: 'Pizza',  price: 21, cookTimeMs: 8000 },
  { name: 'Sushi',  price: 30, cookTimeMs: 9000 },
  { name: 'Steak',  price: 38, cookTimeMs: 11000 },
];
