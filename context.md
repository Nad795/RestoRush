# RestoRush — Working Notes

Running notes from our codebase walkthrough + investigation. Update this file as we
learn more / change plans — treat it as the shared memory for this work.

---

## 1. Architecture overview (low-level → high-level)

Stack: React 19 + Zustand + TypeScript + Vite + Tailwind. It's a small
entity/system simulation engine wrapped in a React UI.

### Layer 1 — Foundation utilities (`src/utils/`)
- `idGenerator.ts` — module-level counter, `nextId('customer')` → `customer_1`.
  Counter is shared across ALL entity types (global, not per-prefix).
- `randomUtils.ts` — `randomBetween`, `randomItem`.
- `timeUtils.ts` — `scaledDelta(rawMs, speed)` = `rawMs * speed`. Backbone of the
  1×/2×/4× speed control.
- `constants.ts` — the game's balance sheet: spawn rate, patience drain,
  cook/serve/eat durations, prices, hire costs, rating deltas, floor dimensions.
- `pathfinding.ts` — `buildPath(from, to)`. Grid-free: snaps start/end to nearest
  `VERT_AISLES`/`HORIZ_AISLES` and returns an L/Z-shaped route so sprites don't
  walk through tables.

### Layer 2 — Generic FSM engine (`src/fsm/`)
Game-agnostic state machine core:
- `types.ts` — `FSMConfig<S> = { initial, transitions: Record<S, {target, guard?}[]> }`.
- `createFSM.ts` — stateful instance with `state`/`can()`/`transition()`. Invalid
  transitions `console.warn` and no-op.
- `reconstituteFSM.ts` — builds a transient FSM pinned at an arbitrary current state
  (entity state lives in Zustand, not in a long-lived FSM object).
- `stepEntity.ts` — `stepEntity(config, currentState, targetState)` → the function
  every system calls. Returns new state or original if blocked.
- `configs.ts` — the 5 static `FSMConfig`s: Customer, Waiter, Chef, Table, Order.

Pattern everywhere: `updateX(id, { state: stepEntity(X_FSM_CONFIG, x.state, 'NEXT') })`.

**Note:** `entities/customer/fsm.ts` (`createCustomerFSM`) defines a second, slightly
different customer FSM (missing `FIND_TABLE → LEAVING`) that appears unused —
`configs.ts`'s `CUSTOMER_FSM_CONFIG` is the one actually wired into systems. Likely
leftover from an earlier stage. Not yet cleaned up.

### Layer 3 — Entities (`src/entities/`)
Each of `customer`, `waiter`, `chef`, `table`, `order` has:
- `types.ts` — state union + data interface (plain data, no methods).
- `factory.ts` — `createX()` returns a fresh object with an id + randomized starts.

### Layer 4 — State stores (`src/store/`)
- `useSimulationStore.ts` — live entity arrays (`customers`, `waiters`, `chefs`,
  `tables`, `orders`) + CRUD actions (`addX`/`updateX`/`removeX`).
- `useRestaurantStore.ts` — meta state: `money`, `rating`, `day`, `paused`, `speed`,
  daily tallies, `tickDay()` → `DaySummary`.

### Layer 5 — Systems (`src/systems/`)
Run in dependency order via `simulationLoop.ts` → `tickSimulation`:
1. `spawnSystem` — spawns customers every `SPAWN_INTERVAL_MS`, capped at
   `2× table count` (min 4) active customers.
2. `customerSystem` — drives `SPAWN→FIND_TABLE→ORDERING→WAITING→(EATING|ANGRY)→PAYING→LEAVING`,
   patience drain, table assignment, order creation, payment, rating effects.
3. `waiterSystem` — drives `IDLE→TAKE_ORDER→DELIVER_TO_KITCHEN→PICKUP_FOOD→SERVE_FOOD→IDLE`,
   claims `CREATED` orders (per-tick `Set` avoids double-claim).
4. `chefSystem` — `IDLE→COOKING→FOOD_READY→IDLE`, claims `COOKING` orders.
5. `tableSystem` — auto-cycles `DIRTY→CLEANING→AVAILABLE` (no cleaner entity).
6. `orderSystem` — GC: orphaned orders (customer left mid-order) fast-forward to
   `COMPLETED`, frees stuck waiters; removes `COMPLETED` orders.
7. `ratingSystem` — slow passive rating recovery while customers are `EATING`.
8. `movementSystem` (`runMovementSystem`) — **separate from `tickSimulation`**, runs
   every animation frame, steps `posX/posY` along `path[pathIndex]`, axis-aligned
   (horizontal first, then vertical). **Must be called explicitly** — it's not part
   of `tickSimulation`.

### Layer 6 — Game loop (`src/hooks/`)
- `useSimulationTick.ts` — `requestAnimationFrame` loop. `rawDelta` capped at 100ms.
  Simulation logic runs at fixed **10Hz** (`SIM_STEP_MS=100`) via accumulator
  (fixed-timestep pattern). `runMovementSystem` runs every frame for smooth visuals.
- `useSpeedMultiplier.ts` — thin wrapper around restaurant store's `speed`.

### Layer 7 — UI (`src/components/`, `App.tsx`, `main.tsx`)
- `App.tsx` — calls `initRestaurant()` once (4 tables, 1 waiter, 1 chef), starts
  `useSimulationTick()`, lays out TopBar/RestaurantFloor/RightPanel/ManagementPanel/
  BottomBar + modals.
- `restaurant/` — pure renderers reading `useSimulationStore`: `RestaurantFloor`
  lays out the floor (aisles, kitchen zone, entrance door), maps entities to
  `TableView`/`CustomerView`/`WaiterView`/`ChefView`, each using `PixelSprite`.
- `hud/`, `layout/` — read-only views + a few "hire" actions.

### Big picture
```
useSimulationTick (rAF, fixed 10Hz)
   → tickSimulation → 7 systems (read/write stores)
        → each system calls stepEntity(FSM_CONFIG, state, target)
   → runMovementSystem (every frame) → moves posX/posY along buildPath() routes
React components subscribe to stores and re-render reactively
```

---

## 2. Sprite rendering — current state

**No image files are used for character sprites.** Everything is CSS `div`s.

- `src/components/restaurant/PixelSprite.tsx` — builds each character (chef,
  waiter, customer, angry_customer) out of stacked/positioned `<div>` rectangles
  (hat, hair, head, eyes, body, legs, feet) at scale `S=2`.
- `COLORS` map gives per-type palettes (hair/shirt/pants). Type-specific extras:
  chef hat+apron, waiter bow-tie, angry eyebrows + `ANGRY_SKIN`.
- `direction` flips horizontally via `transform: scaleX(-1)`.
- `walking` toggles `walk-leg-a`/`walk-leg-b` CSS classes — keyframes defined in
  `src/index.css` (simple leg up/down bob, 0.28s loop).
- `PixelTable.tsx`, `KitchenView.tsx`, `FloorDecor.tsx` — same div/CSS approach for
  tables, kitchen, decorations.
- Existing image files (`src/assets/hero.png`, `react.svg`, `vite.svg`,
  `public/favicon.svg`, `public/icons.svg`) are Vite-template leftovers, **not**
  used for game sprites.

---

## 3. Plan: switching to real sprite images (NOT STARTED YET)

Decisions made so far (discussion only — no implementation yet):

- **Format: PNG** (lossless + alpha, ideal for pixel art). Avoid SVG (doesn't suit
  pixel art) and JPEG (artifacts on hard edges). Keep native low-res (e.g. matching
  current `S=2` scale, ~16×24px) and rely on existing `imageRendering: 'pixelated'`
  (already set in `RestaurantFloor.tsx`) for crisp upscaling.
- **Individual frame files vs. sprite sheets**: decided **individual frame files**
  are simpler for this project size — e.g.
  `src/assets/sprites/customer/walk/0.png, 1.png, 2.png...`. Easier to author one
  frame at a time (Aseprite/Piskel) and the animator is just `<img src={frames[i]}>`
  on a timer — no `background-position` math needed. Sprite sheets are the
  alternative if request count / file count ever becomes a concern (not currently).
- **Animator design (sketched, not built)**: replace `PixelSprite`'s internals with
  a `SpriteAnimator` component that keeps the same prop interface (`type`,
  `direction`, `walking`/animState). A `useFrameAnimation` hook advances a frame
  index on a timer/rAF based on fps. A config object
  `SPRITE_CONFIG[type][animState]` → `{frames: string[], fps}` drives which images
  to show. `direction` continues to use `scaleX(-1)` (no separate left/right frames
  needed).
- **Location**: `src/assets/sprites/` (Vite-imported ES modules, hashed + type-checked),
  consistent with existing `src/assets/hero.png`. `public/sprites/` was considered
  as an alternative for non-dev asset swapping but rejected as unnecessary here.

**Status: paused** — user wants to verify gameplay state-machine correctness first
(see §4) before building the sprite/animation system.

---

## 4. Investigation: does the waiter/chef/order flow actually work as intended?

User's expected narrative: waiter walks to customer's table to take the order →
delivers ticket to kitchen/chef → chef cooks → waiter goes to the chef to pick up
the food → waiter delivers it to the customer.

### Method
Wrote `src/systems/__tests__/orderFlow.integration.test.ts` — drives the real
`tickSimulation` + `runMovementSystem` tick-by-tick (1 table, 1 waiter, 1 chef,
1 customer), tracking state transitions and waiter position over time, spying on
`console.warn` (FSM logs invalid transitions there).

### ✅ Finding 1 — FSM/state graph is correct
Full lifecycle completes for Customer (`SPAWN→FIND_TABLE→ORDERING→WAITING→EATING→
PAYING→LEAVING`), Order (`CREATED→COOKING→READY→SERVED→[COMPLETED]`), Waiter
(`IDLE→TAKE_ORDER→DELIVER_TO_KITCHEN→PICKUP_FOOD→SERVE_FOOD→IDLE`), Chef
(`IDLE→COOKING→FOOD_READY→IDLE`), Table (`AVAILABLE→OCCUPIED→CLEANING→AVAILABLE`,
note `DIRTY` is set then immediately advanced to `CLEANING` in the same tick by
`tableSystem.ts` — by design, no separate cleaner entity). **Zero invalid
transitions** (`createFSM`'s warn never fires).

### ❌ Finding 2 — Waiter never visually reaches the table or kitchen (BUG)
Root cause: task timers (`ORDER_WAIT_MS=2500ms`, `SERVE_WAIT_MS=2000ms`) are
**independent of `buildPath` travel distance/time** (`WALK_SPEED=90px/s`). A trip
from the kitchen to a table takes ~4.5s, but timers fire at 2.5s/2s.

Concretely (traced for table 0):
1. **`TAKE_ORDER`** (`waiterSystem.ts:49-73`): waiter starts walking toward the
   table but the 2.5s timer fires when it's only ~40% of the way there
   (e.g. stuck at `y=294` vs table `y=55`). Order flips to `COOKING` anyway.
2. **`DELIVER_TO_KITCHEN→PICKUP_FOOD`** (`waiterSystem.ts:75-84`): **instant** —
   clears the waiter's path immediately, abandoning the walk to the kitchen. Waiter
   is stranded mid-aisle (e.g. `(170,303)`) for the entire 7s `COOK_TIME_MS`,
   nowhere near the chef.
3. **`SERVE_FOOD`** (`waiterSystem.ts:117-142`): new path to table is built, but
   the 2s timer is again shorter than the ~2.7s walk needed — waiter gets within
   ~70px of the table, order flips to `SERVED` (customer starts `EATING`), and
   waiter immediately reverses back toward the kitchen without visually arriving.

### ✅ FIXED — arrival-gated transitions implemented
Implemented **Option A** in `src/systems/waiterSystem.ts`:
- `TAKE_ORDER`: now blocks (`break`) until `pathIndex >= path.length` (i.e. the
  waiter has actually walked to the table). Only then does the `ORDER_WAIT_MS`
  timer start counting; on expiry the order flips to `COOKING` and the waiter
  builds a path back to its kitchen slot.
- `DELIVER_TO_KITCHEN`: now blocks until arrived at the kitchen slot before
  transitioning to `PICKUP_FOOD` (previously this was instant and abandoned the
  walk).
- `SERVE_FOOD`: now blocks until arrived back at the table before starting the
  `SERVE_WAIT_MS` timer; on expiry the order flips to `SERVED` and the waiter
  walks back to its kitchen slot.
- `PICKUP_FOOD` unchanged (already correctly waits for `order.state === 'READY'`
  — now the waiter is *actually* standing at the kitchen while it waits).

### ⚖️ Balance follow-up — also fixed
Realistic walking made one full order cycle take **~22s** for the nearest table
(walk-to-table ~4.5s + `ORDER_WAIT_MS` 2.5s + walk-to-kitchen ~4.5s + remaining
cook time + walk-to-table ~4.5s + `SERVE_WAIT_MS` 2s), but the old
`PATIENCE_DRAIN_PER_S=3` meant a customer with the minimum starting patience (60)
went `ANGRY` after only ~13.3s. Fixed by lowering `PATIENCE_DRAIN_PER_S` from `3`
to `1.5` in `src/utils/constants.ts` (patience 100→20 in ~53.3s, 60→20 in ~26.7s —
comfortable buffer over the ~22s+ cycle, even for farther tables).

### Test status
`src/systems/__tests__/orderFlow.integration.test.ts` — **all assertions pass**,
including the spatial ones (waiter visually arrives at the table for
`TAKE_ORDER`/`SERVE_FOOD`, and at `KITCHEN_Y` for `PICKUP_FOOD`). Full suite:
18/18 tests passing, run 5x with no flakiness from the randomized customer
patience (60-100).

**Next step**: resume the sprite animation work from §3.

---

## 5. Game progression — 21-day goal, daily wages, loyalty & advertising

**Status: ALL THREE SUBSYSTEMS (§5.1 win/lose, §5.2 wages, §5.3 loyalty &
advertising) IMPLEMENTED — see the IMPLEMENTED notes below.** Written in
response to "the game is too easy / has no challenge." Three interlocking
systems:

### 5.1 Win/lose condition — 21-day money goal — IMPLEMENTED
- New constants in `constants.ts`: `GAME_LENGTH_DAYS = 21`, `GOAL_MONEY = 5000`
  (an initial estimate — ~10x starting money; revisit after a balance pass once
  §5.2 wages are tuned), `RATING_LOSS_THRESHOLD = 1.0`.
- `useRestaurantStore` gained `gameStatus: 'playing' | 'won' | 'lost'` and
  `lossReason: 'rating' | 'bankrupt' | 'goal_missed' | null` (the `'bankrupt'`
  variant is plumbed through the modal but not yet triggered — that's §5.2).
- **Lose-by-rating**: `setRating` now checks the clamped value against
  `RATING_LOSS_THRESHOLD`; if `<= 1.0` and `gameStatus === 'playing'`, it sets
  `gameStatus: 'lost'`, `lossReason: 'rating'`, `paused: true`. This replaces
  the old render-time `if (rating > 1.0) return null` check in
  `GameOverModal.tsx`.
- **Win/lose-by-goal**: `tickDay` (`useRestaurantStore.ts`), on the day rollover
  where `s.day >= GAME_LENGTH_DAYS` (i.e. day 21 ending), sets `gameStatus =
  'won'` if `money >= GOAL_MONEY`, else `gameStatus = 'lost'` with
  `lossReason: 'goal_missed'`. `paused: true` (already set on every rollover)
  freezes `useSimulationTick`'s loop — no separate "stop ticking" logic needed.
- Once `gameStatus !== 'playing'`, further `setRating` calls update `rating`
  but no longer touch `gameStatus`/`lossReason` (can't un-lose/un-win).
- `GameOverModal.tsx` is now a generic win/lose screen: 🎉 green "Restaurant is
  a hit!" (won, shows final earnings vs `GOAL_MONEY`) vs 😭 red "Restaurant
  Closed!" with copy varying by `lossReason` (`'rating'`, `'goal_missed'`, or
  the not-yet-triggered `'bankrupt'`).
- `DaySummaryModal.tsx` now also returns `null` when `gameStatus !== 'playing'`,
  so the day-21 summary doesn't render underneath/alongside the win/lose modal.
- New test file `src/store/__tests__/gameStatus.test.ts` (6 tests) covers: win
  at day 21 with `money >= GOAL_MONEY`, loss with `goal_missed` when under goal,
  no status change on earlier day rollovers, instant loss via
  `setRating(<= RATING_LOSS_THRESHOLD)`, no status change above the threshold,
  and that gameStatus/lossReason are sticky once set.
- Verified: `tsc --noEmit` and `eslint .` clean; `vitest run` 37/37 passing
  (31 pre-existing + 6 new, across 4 files) across 4 repeated runs; visual
  smoke test confirmed the app still loads and renders normally with no
  console errors.

### 5.2 Daily staff wages — IMPLEMENTED
- New constants in `constants.ts`: `WAITER_DAILY_WAGE = 20`, `CHEF_DAILY_WAGE =
  25` — meaningfully smaller than `WAITER_COST`/`CHEF_COST` per-day, but the
  starting 1 waiter + 1 chef cost $45/day, ~$945 over 21 days, so hiring isn't
  a free permanent upgrade.
- **Integration**: `simulationLoop.ts` reads `useSimulationStore` each tick and
  computes `dailyWageTotal = waiters.length * WAITER_DAILY_WAGE + chefs.length
  * CHEF_DAILY_WAGE`, passing it to `useRestaurantStore.getState().tickDay(delta,
  dailyWageTotal)`. `tickDay`'s signature is now `(delta, dailyWageTotal)`; it
  deducts the total from `money` only on the tick where the day rolls over,
  clamped at 0.
- **Bankruptcy**: in `tickDay`, if `money - dailyWageTotal < 0` at day-end and
  `gameStatus === 'playing'` → `gameStatus = 'lost'`, `lossReason: 'bankrupt'`
  (v1: hard game over, no debt mechanic). This check runs *before* the day-21
  goal check and takes priority if both would otherwise apply.
- `DaySummary` (`useRestaurantStore.ts`) gained a `wages: number` field.
  `DaySummaryModal.tsx` now shows two extra tiles: "Wages" (`-$N`, red) and
  "Net" = revenue − wages (green if ≥0, red if negative).
- **Menu price rebalance** (`utils/menu.ts`): all `MENU` prices bumped ~30-40%
  (Salad 9→12, Tacos 11→15, Burger 12→16, Pasta 13→18, Pizza 15→21, Sushi
  22→30, Steak 28→38) to offset the new wage drain while keeping `GOAL_MONEY =
  5000` achievable. The fallback price in `entities/order/factory.ts` (used if
  a dish lookup ever misses) was bumped from 12→16 to match the new Burger
  price.
- New tests added to `src/store/__tests__/gameStatus.test.ts`: wages deducted
  from `money` and recorded on `daySummary.wages`; bankruptcy triggers
  `gameStatus: 'lost'`/`lossReason: 'bankrupt'` with `money` clamped to 0;
  bankruptcy takes priority over the day-21 goal check when both apply.
- Verified: `tsc --noEmit` and `eslint .` clean; `vitest run` 40/40 passing
  across 4 repeated runs; visual check at 4× speed showed Day 1 ending with
  Revenue $28, Wages -$45, Net -$17, money $500→$483 — wages correctly
  deducted and reflected in the modal.
- `GOAL_MONEY = 5000` is still an initial estimate — revisit after broader
  playtesting now that both wages and the higher menu prices are in.

### 5.3 Loyalty & advertisement system
**Customer sources**: every spawned customer comes from either the **loyalty**
pool or the **base** pool. Plan: add `source: 'loyalty' | 'base'` to
`Customer` (`entities/customer/types.ts` + `factory.ts`), set at spawn time.

**Loyalty counter** (new `useRestaurantStore` field `loyalty: number`, starts
at a small baseline e.g. `0`):
- On a **good experience** — customer reaches `EATING` from `WAITING` (order
  served before anger), i.e. the existing `WAITING → EATING` branch in
  `customerSystem.ts:81-89` — call `adjustLoyalty(+LOYALTY_GAIN)` regardless of
  the customer's `source`.
- On a **bad experience** — customer goes `WAITING → ANGRY`
  (`customerSystem.ts:90-97`) — call `adjustLoyalty(-LOYALTY_LOSS)` **only if**
  `customer.source === 'loyalty'`. Base/ad customers going angry instead just
  hit `rating` as today (no double-penalty).
- New constants: `LOYALTY_GAIN_PER_HAPPY`, `LOYALTY_LOSS_PER_ANGRY_LOYAL`.

**Spawn rate redesign** (`spawnSystem.ts`, currently a flat
`SPAWN_INTERVAL_MS` capped at `2× table count`):
- **Base spawn rate** scales with `rating` (the "review" lever) and with an
  active ad campaign (the "advertisement" lever). E.g.
  `effectiveInterval = SPAWN_INTERVAL_MS / (ratingMultiplier * adMultiplier)`,
  where `ratingMultiplier` maps `rating∈[1,5]` → roughly `[0.5, 1.5]`, and
  `adMultiplier = AD_SPAWN_BONUS` (e.g. `1.5`–`2`) while an ad is active, else
  `1`. Customers spawned this way get `source: 'base'`.
- **Loyalty spawns**: a separate, additive trickle driven by `loyalty` — e.g.
  every spawn check, `loyaltyChance = clamp(loyalty / LOYALTY_SCALE, 0, 1)`
  rolls for one extra `source: 'loyalty'` customer. Higher loyalty → more
  returning regulars, independent of rating/ads.
- The existing `maxCustomers = max(tables.length * 2, 4)` cap stays — this is
  what creates the "can't handle the influx" pressure: a successful ad pushes
  the floor toward that cap more often, service slows down, more customers tip
  into `ANGRY` before being served, which (a) hits `rating` → lowers future base
  spawn rate, and (b) if any of those angry customers were `source: 'loyalty'`,
  drains the loyalty counter too. This gives the risk/reward loop the user
  described without needing a separate "rejected at the door" mechanic.

**Advertisement**:
- New `useRestaurantStore` field `adDaysRemaining: number` (0 = inactive).
- New constants: `AD_COST`, `AD_DURATION_DAYS` (e.g. 1–3), `AD_SPAWN_BONUS`.
- New action `startAdvertisement()`: if `money >= AD_COST`, deduct cost, set
  `adDaysRemaining = AD_DURATION_DAYS` (or extend if already active — TBD).
- `tickDay` decrements `adDaysRemaining` (floor at 0) on day rollover.
- `ManagementPanel.tsx` gets a "📢 Advertise" button next to Hire/Buy, disabled
  when `money < AD_COST`, showing days remaining when active.

### 5.3 — IMPLEMENTED
Resolved the open questions from §5.6 with concrete values and shipped
end-to-end (no dependency on §5.1/§5.2 — `tickDay` already existed):
- New constants in `constants.ts`: `LOYALTY_GAIN_PER_HAPPY = 2`,
  `LOYALTY_LOSS_PER_ANGRY_LOYAL = 5`, `LOYALTY_MAX = 100` (doubles as the
  trickle-chance denominator), `RATING_SPAWN_MULT_MIN/MAX = 0.5/1.5`,
  `AD_COST = 100`, `AD_DURATION_DAYS = 2`, `AD_SPAWN_BONUS = 1.6`.
- `entities/customer/types.ts`/`factory.ts` — `CustomerSource = 'loyalty' |
  'base'`; `createCustomer(source = 'base')`.
- `useRestaurantStore.ts` — `loyalty`/`adDaysRemaining` state,
  `adjustLoyalty(delta)` (clamped `[0, LOYALTY_MAX]`), `startAdvertisement()`
  (deducts `AD_COST`, **stacks/extends** `adDaysRemaining` by
  `AD_DURATION_DAYS` rather than refreshing — so repeat purchases queue up
  more days), `tickDay` decrements `adDaysRemaining` on rollover.
- `systems/spawnSystem.ts` — new exported pure helper `getSpawnInterval(rating,
  adDaysRemaining)` implementing the formula above; `runSpawnSystem` recomputes
  it every tick, spawns a `source: 'base'` customer on threshold, and
  independently rolls `Math.random() < loyalty / LOYALTY_MAX` for an extra
  `source: 'loyalty'` spawn — both gated by the existing `maxCustomers` cap.
- `systems/customerSystem.ts` — `WAITING → EATING` now also calls
  `adjustLoyalty(+LOYALTY_GAIN_PER_HAPPY)` (any source); `WAITING → ANGRY`
  calls `adjustLoyalty(-LOYALTY_LOSS_PER_ANGRY_LOYAL)` only when
  `customer.source === 'loyalty'`.
- UI: `ManagementPanel.tsx` got a purple "📢 Advertise" button (`$100` /
  `Active: Nd`); `RightPanel.tsx` got a new "Marketing" section showing a
  Loyalty meter (`x/100`) and Ad Campaign status (`Nd left` / `inactive`).
- Tests: `src/systems/__tests__/loyaltyAds.test.ts` covers store clamping/ad
  stacking/tickDay decrement, `getSpawnInterval` bounds, base+loyalty trickle
  spawns respecting the cap, and the loyalty gain/loss hooks (including that
  `base`-source angry customers don't drain loyalty). Full suite: 30/30
  passing (5x, no flakiness), `tsc --noEmit` and `eslint` clean. Verified
  visually — Advertise button deducts $100 and shows "Active: 2d", Marketing
  panel renders correctly.

**Next step**: §5.1 (win/lose scaffolding) and §5.2 (wages) remain
unimplemented — `gameStatus`/`lossReason` don't exist yet, `GameOverModal.tsx`
is still the old rating-only check.

### 5.3.1 — Tiered advertising & slower base spawn rate (UPDATE, IMPLEMENTED)
Follow-up requested after §5.3: the base customer rate was too high to make
advertising feel necessary, and a single flat ad option wasn't an interesting
choice. Changes:
- `constants.ts` — `SPAWN_INTERVAL_MS` raised `6000 → 9000` (base spawn ~33%
  slower at every rating level, before any ad bonus). Removed `AD_COST`,
  `AD_DURATION_DAYS`, `AD_SPAWN_BONUS` (superseded by tiers below).
- New `utils/advertising.ts` — `AdTier { id, label, cost, durationDays,
  spawnBonus }` and an `AD_TIERS` ladder (cheapest → most expensive, each tier
  more costly with both a longer duration *and* a bigger spawn bonus):
  - Flyers: `$80`, 1 day, `x1.4`
  - Local Ads: `$180`, 2 days, `x1.8`
  - Radio Spot: `$350`, 3 days, `x2.3`
  - Billboard: `$600`, 4 days, `x3.0`
- `useRestaurantStore.ts` — added `adSpawnBonus: number` (default `1`).
  `startAdvertisement(tierId)`: looks up the tier, no-ops if `money <
  tier.cost`, deducts cost, **adds** `tier.durationDays` to
  `adDaysRemaining` (stacks/extends as before), and sets `adSpawnBonus =
  max(currentBonusIfActive, tier.spawnBonus)` — buying a weaker campaign while
  a stronger one is running extends the duration but never downgrades the
  bonus. `tickDay` resets `adSpawnBonus` back to `1` once `adDaysRemaining`
  reaches `0` on rollover.
- `systems/spawnSystem.ts` — `getSpawnInterval(rating, adSpawnBonus)` now takes
  the bonus directly (no more boolean "is an ad active"); `runSpawnSystem`
  passes `adSpawnBonus` only while `adDaysRemaining > 0`, else `1`.
- UI: `ManagementPanel.tsx`'s "📢 Advertise" control is now a `<select>`
  dropdown listing all four tiers with cost/duration/bonus, each disabled if
  unaffordable; selecting one immediately purchases it and the dropdown resets
  to a placeholder showing `Active: Nd (xBonus)` while a campaign runs.
  `RightPanel.tsx`'s Marketing section now shows `Nd left (xBonus)` for the ad
  campaign.
- Tests: `loyaltyAds.test.ts` rewritten for the tier API — covers cost
  deduction/duration stacking, the "never downgrade the bonus" rule,
  insufficient-funds no-op, `tickDay` resetting `adSpawnBonus` to `1` on
  expiry, and `getSpawnInterval`'s new bounds. Full suite: 31/31 passing (5x,
  no flakiness), `tsc --noEmit` and `eslint` clean. Verified visually — buying
  "Flyers" deducts $80 ($500→$420) and the dropdown/Marketing panel both show
  "1d left (x1.4)".

### 5.4 UI surface summary
- `TopBar.tsx` or `RightPanel.tsx`: show `loyalty` counter, days remaining
  until the day-14 deadline, and ad status (e.g. "📢 Ad: 2 days left").
- `DaySummaryModal.tsx`: add Wages line, net profit, loyalty delta, ad days
  remaining.
- `GameOverModal.tsx`: generalize to win/lose, driven by `gameStatus` +
  `lossReason`.
- `ManagementPanel.tsx`: add Advertise button.

### 5.5 Files expected to change
`utils/constants.ts` (new constants) · `store/useRestaurantStore.ts`
(`gameStatus`, `lossReason`, `loyalty`, `adDaysRemaining`, wage deduction +
win/lose check in `tickDay`, `adjustLoyalty`, `startAdvertisement`) ·
`entities/customer/types.ts` + `factory.ts` (`source` field) ·
`systems/spawnSystem.ts` (rating/ad-scaled base rate + loyalty trickle, tag
`source`) · `systems/customerSystem.ts` (call `adjustLoyalty` on
good/bad experience) · `systems/simulationLoop.ts` (compute daily wage total,
pass to `tickDay`) · `components/modals/GameOverModal.tsx` (win/lose) ·
`components/modals/DaySummaryModal.tsx` (wages/loyalty/ad rows) ·
`components/layout/ManagementPanel.tsx` (Advertise button) ·
`components/layout/TopBar.tsx`/`RightPanel.tsx` (loyalty/deadline/ad HUD).

### 5.6 Open balancing questions (resolve during implementation)
- `GOAL_MONEY` value — needs a playtested baseline daily revenue × 14 with
  margin for upgrades.
- `WAITER_DAILY_WAGE`/`CHEF_DAILY_WAGE` relative to one-time hire costs and to
  typical daily revenue.
- Loyalty gain/loss magnitudes and the `loyalty → extra spawn chance` formula
  (`LOYALTY_SCALE`).
- Ad cost/duration/bonus, and whether stacking ad purchases extend duration or
  just refresh it.
- Bankruptcy: hard game-over vs. a debt/grace-period mechanic.

**Next step**: once numbers are roughed out, implement in the order: §5.1
(win/lose scaffolding + generalized modal) → §5.2 (wages) → §5.3 (loyalty +
advertising), since each layer's "is the game over" check builds on the last.

---

## 6. Menu items with differing profit & cook time

**Status: IMPLEMENTED.**

- New `src/utils/menu.ts` — `MENU: MenuItem[]` (name/price/cookTimeMs), the
  values from the table in §6.2, exported via `utils/index.ts`.
- `entities/customer/factory.ts` — `menuItem = randomItem(MENU).name`,
  `spendingAmount` starts at `0` (set from `order.price` on serve, not random
  10-40 anymore).
- `entities/order/types.ts` / `factory.ts` — `Order` gains `cookTimeMs`;
  `createOrder` looks up both `price` and `cookTimeMs` from `MENU` (fallback
  `?? 12` / `?? COOK_TIME_MS` for unrecognized names).
- `systems/chefSystem.ts` — `COOKING` case now cooks against
  `order?.cookTimeMs ?? COOK_TIME_MS` (per-dish) instead of the old global
  constant. `COOK_TIME_MS` remains in `constants.ts` as the fallback.
- `systems/customerSystem.ts` — `WAITING → EATING` branch now sets
  `customer.spendingAmount = order.price` (read before `orderSystem` GCs the
  completed order).
- UI: `CustomerView.tsx` dish badge now shows price (e.g. "Steak $28");
  `ChefView.tsx` cook-progress bar scales against the active order's
  `cookTimeMs`.
- `src/systems/__tests__/orderFlow.integration.test.ts` — pins the traced
  customer's `menuItem` to `'Salad'` (fastest dish) so the hardcoded
  happy-path lifecycle stays deterministic; a slow dish (e.g. Steak) + low
  starting patience can legitimately send a customer to `ANGRY` before being
  served — that's the intended challenge lever from §6.5, not a bug.
- All 18 tests pass (verified 5x), `tsc --noEmit` and `eslint` clean.

### 6.1 Current state — menu items are purely cosmetic today
- `entities/customer/factory.ts`: a 7-item `MENU_ITEMS` array of names; each
  customer gets a random one as `menuItem` (shown as a badge in
  `CustomerView.tsx`) — and *separately* a random `spendingAmount =
  randomBetween(10, 40)` that's **completely unrelated** to the dish.
- `entities/order/factory.ts`: a separate `PRICES` map keyed by the same 7
  names computes `order.price` — but `order.price` is **never read** anywhere.
  Payment in `customerSystem.ts`'s `PAYING` case uses `customer.spendingAmount`
  instead.
- `systems/chefSystem.ts`: cook time is the single global constant
  `COOK_TIME_MS = 7000` for every dish, regardless of what was ordered.

So today "menu item" is cosmetic only — every dish pays the same (random)
amount and takes the same time to cook. This plan ties name → price → cook
time together into one source of truth.

### 6.2 New shared menu data
New file `src/utils/menu.ts`:
```ts
export interface MenuItem {
  name: string;
  price: number;      // $ paid by the customer when served
  cookTimeMs: number;  // chef time to prepare this dish
}

export const MENU: MenuItem[] = [ /* see table below */ ];
```
This becomes the single source of truth, replacing both `MENU_ITEMS` (customer
factory) and `PRICES` (order factory).

Suggested starting values (TBD — balance pass needed):

| Dish   | Price | Cook time |
|--------|------:|----------:|
| Salad  |  $9   | 4.0s |
| Tacos  | $11   | 5.0s |
| Burger | $12   | 6.0s |
| Pasta  | $13   | 6.5s |
| Pizza  | $15   | 8.0s |
| Sushi  | $22   | 9.0s |
| Steak  | $28   | 11.0s |

(Roughly centered on the old flat `COOK_TIME_MS=7000`, spread so cheap dishes
are quick and expensive dishes are slow — a throughput-vs-profit tradeoff per
table turn.)

### 6.3 Entity/type changes
- `entities/customer/factory.ts`: pick `randomItem(MENU)`, store `.name` as
  `menuItem` (keep the field as `string` — no change needed in
  `CustomerView.tsx`). Drop the random `spendingAmount = randomBetween(10,40)`
  (it gets set from the real order price instead — see §6.4).
- `entities/order/types.ts`: add `cookTimeMs: number`.
- `entities/order/factory.ts`: `createOrder` looks up
  `MENU.find(m => m.name === menuItem)` and sets `price`/`cookTimeMs` from it
  (keep a fallback default, matching the existing `?? 12` pattern, in case of
  an unrecognized name).

### 6.4 System changes
- `systems/chefSystem.ts` `COOKING` case: replace the global `COOK_TIME_MS`
  threshold with the order's own `cookTimeMs`. The chef only stores
  `currentOrderId`, so look up the order (`orders.find(...)` — cheap, small
  array) and use `order?.cookTimeMs ?? COOK_TIME_MS` as the threshold.
  `COOK_TIME_MS` stays in `constants.ts` as the fallback default.
- `systems/customerSystem.ts` `WAITING → EATING` branch (the existing
  "good experience" trigger, also where §5.3's loyalty gain hooks in): when
  `order.state === 'SERVED'`, set `customer.spendingAmount = order.price` in
  the same `updateCustomer` call. This must happen here because `orderSystem`
  marks the order `COMPLETED` and removes it before the customer reaches
  `PAYING`.
- `systems/customerSystem.ts` `PAYING` case: **unchanged**
  (`addMoney(customer.spendingAmount)`) — now reflects the actual dish price
  instead of a random number.

### 6.5 Interaction with existing systems (this is where the challenge comes from)
- §4's patience rebalance assumed a flat 7s cook time → ~22s full order cycle
  for the nearest table, comfortably inside the ~26.7s patience buffer for the
  least-patient customers (patience=60). With variable cook times, a **Steak**
  order (~11s cook) pushes the full cycle to ~29s — **exceeding** that buffer.
  Impatient customers who order expensive dishes become meaningfully more
  likely to go `ANGRY`.
- This is the intended challenge lever: premium dishes are worth more but
  riskier to deliver before patience runs out. A second chef (parallel
  cooking, already supported by `chefSystem.ts`'s per-tick claim logic) is the
  direct mitigation — ties hiring decisions to menu mix.
- Ties into §5.3 (loyalty): an impatient customer who orders Steak and goes
  `ANGRY` costs more (lost revenue + possible loyalty/rating hit) than a Salad
  customer doing the same — making menu variety and staffing a real strategic
  tradeoff once §5.2 wages are in play.

### 6.6 UI changes (optional, nice-to-have)
- `CustomerView.tsx` dish badge could show price too (e.g. "🥩 Steak $28") so
  the player can spot high-value/slow tables at a glance.
- Chef/kitchen rendering could show a cook-progress bar scaled to that dish's
  `cookTimeMs` instead of an implicit fixed duration.

### 6.7 Files expected to change
`utils/menu.ts` (new) · `entities/customer/factory.ts` (use `MENU`, drop random
`spendingAmount`) · `entities/order/types.ts` (`cookTimeMs`) ·
`entities/order/factory.ts` (look up price/cookTimeMs from `MENU`) ·
`systems/chefSystem.ts` (per-order cook time) · `systems/customerSystem.ts`
(set `spendingAmount` from `order.price` on serve) · optionally
`components/restaurant/CustomerView.tsx` / kitchen rendering for display.

### 6.8 Open balancing questions
- Final price/cook-time table per dish (above is a starting guess).
- Whether to revisit §5.1's `GOAL_MONEY` once real per-dish prices replace the
  old random `spendingAmount` range (10-40 vs. the 9-28 menu range above).
- Future extension (not needed for this plan): "menu unlocks" — new high-value
  dishes become available as the player progresses through the 14 days,
  building on §5's progression system.
