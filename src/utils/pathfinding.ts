export interface Point { x: number; y: number }

// Vertical corridors (characters move vertically along these X positions)
// Shifted right to stay within dining area (kitchen takes 0–100px on the left)
export const VERT_AISLES = [150, 293, 453, 613, 773, 910];

// Horizontal corridors (characters move horizontally along these Y positions)
// First aisle below the 60px top wall; last aisle above floor bottom
export const HORIZ_AISLES = [80, 180, 300, 420, 540, 620];

function nearest(arr: number[], val: number): number {
  return arr.reduce((a, b) => (Math.abs(b - val) < Math.abs(a - val) ? b : a));
}

function dedup(pts: Point[]): Point[] {
  return pts.filter(
    (p, i) => i === 0 || p.x !== pts[i - 1].x || p.y !== pts[i - 1].y,
  );
}

/**
 * Builds an aisle-constrained path (horizontal then vertical segments only).
 * Characters never cross the table grid — they navigate via predefined corridors.
 */
export function buildPath(from: Point, to: Point): Point[] {
  if (Math.abs(from.x - to.x) < 2 && Math.abs(from.y - to.y) < 2) return [];

  const fromVA = nearest(VERT_AISLES, from.x);
  const toVA   = nearest(VERT_AISLES, to.x);
  const pts: Point[] = [];

  if (fromVA === toVA) {
    // Same vertical corridor: go to aisle X, traverse Y, go to dest X
    if (Math.abs(from.x - fromVA) > 2) pts.push({ x: fromVA, y: from.y });
    pts.push({ x: fromVA, y: to.y });
    if (Math.abs(to.x - fromVA) > 2) pts.push({ x: to.x, y: to.y });
  } else {
    // Different vertical corridors: need a horizontal aisle to cross
    const ha = nearest(HORIZ_AISLES, (from.y + to.y) / 2);

    if (Math.abs(from.x - fromVA) > 2) pts.push({ x: fromVA, y: from.y });
    if (Math.abs(from.y - ha)    > 2) pts.push({ x: fromVA, y: ha });
    pts.push({ x: toVA, y: ha });
    if (Math.abs(ha - to.y)      > 2) pts.push({ x: toVA, y: to.y });
    if (Math.abs(to.x - toVA)    > 2) pts.push({ x: to.x, y: to.y });
  }

  // Always include the exact destination
  if (!pts.length || pts[pts.length - 1].x !== to.x || pts[pts.length - 1].y !== to.y) {
    pts.push({ x: to.x, y: to.y });
  }

  return dedup(pts);
}
