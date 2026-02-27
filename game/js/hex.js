// Hex math — axial coordinates, pointy-top orientation
// Reference: https://www.redblobgames.com/grids/hexagons/

const SQRT3 = Math.sqrt(3);

// 6 neighbor directions in axial coords (pointy-top)
// Order: E, NE, NW, W, SW, SE
export const DIR = [
  { q: +1, r:  0 },  // 0: E
  { q: +1, r: -1 },  // 1: NE
  { q:  0, r: -1 },  // 2: NW
  { q: -1, r:  0 },  // 3: W
  { q: -1, r: +1 },  // 4: SW
  { q:  0, r: +1 },  // 5: SE
];

export const DIR_NAMES = ['E', 'NE', 'NW', 'W', 'SW', 'SE'];

export function hexKey(q, r) {
  return `${q},${r}`;
}

export function parseKey(key) {
  const [q, r] = key.split(',').map(Number);
  return { q, r };
}

export function hexNeighbor(q, r, dir) {
  const d = DIR[dir];
  return { q: q + d.q, r: r + d.r };
}

export function hexNeighbors(q, r) {
  return DIR.map(d => ({ q: q + d.q, r: r + d.r }));
}

export function hexDistance(q1, r1, q2, r2) {
  const dq = q1 - q2;
  const dr = r1 - r2;
  return (Math.abs(dq) + Math.abs(dq + dr) + Math.abs(dr)) / 2;
}

// Axial hex → pixel (pointy-top)
export function hexToPixel(q, r, size) {
  const x = size * (SQRT3 * q + SQRT3 / 2 * r);
  const y = size * (1.5 * r);
  return { x, y };
}

// Pixel → fractional axial hex (pointy-top)
export function pixelToHex(px, py, size) {
  const q = (SQRT3 / 3 * px - 1 / 3 * py) / size;
  const r = (2 / 3 * py) / size;
  return hexRound(q, r);
}

// Round fractional axial to nearest hex
export function hexRound(q, r) {
  const s = -q - r;
  let rq = Math.round(q);
  let rr = Math.round(r);
  let rs = Math.round(s);
  const dq = Math.abs(rq - q);
  const dr = Math.abs(rr - r);
  const ds = Math.abs(rs - s);
  if (dq > dr && dq > ds) {
    rq = -rr - rs;
  } else if (dr > ds) {
    rr = -rq - rs;
  }
  return { q: rq, r: rr };
}

// Vertices of a pointy-top hex centered at (cx, cy) with given size
export function hexVertices(cx, cy, size) {
  const verts = [];
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI / 180 * (60 * i - 30);
    verts.push({
      x: cx + size * Math.cos(angle),
      y: cy + size * Math.sin(angle),
    });
  }
  return verts;
}
