export interface Point { x: number; y: number }

// Vertical corridors (characters move vertically along these X positions)
export const VERT_AISLES = [30, 170, 330, 490, 650];

// Horizontal corridors (characters move horizontally along these Y positions)
// y=18 top, y=110 between row0-row1, y=200 between row1-row2,
// y=290 between row2-row3, y=380 above kitchen entrance
export const HORIZ_AISLES = [18, 110, 200, 290, 380];

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
