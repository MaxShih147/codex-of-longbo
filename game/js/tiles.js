// Tile definitions — Taluva-style 3-hex tiles
// Each tile: 1 center hex (裂) + 2 terrain hexes on adjacent directions

import { DIR } from './hex.js';

// Terrain types and their display properties
export const TERRAIN = {
  crack:  { label: '裂', fill: '#8b2500', stroke: '#a03020', glow: true },
  road:   { label: '路', fill: '#b89a5a', stroke: '#9a7d42' },
  wild:   { label: '野', fill: '#3a6b35', stroke: '#2d5429' },
  ruin:   { label: '墟', fill: '#7a6e5a', stroke: '#5e544a' },
  rock:   { label: '岩', fill: '#4a4a4a', stroke: '#3a3a3a' },
  water:  { label: '水', fill: '#2a4a7a', stroke: '#1e3a5e' },
  sigil:  { label: '紋', fill: '#3a1a4a', stroke: '#2a1038' },
};

// For Phase 1, only use: crack, road, wild, ruin
export const PHASE1_TERRAINS = ['road', 'wild', 'ruin'];

// Tile shape: center (0,0) + two hexes at adjacent directions
// rotation 0..5 determines which pair of adjacent directions
export function tileOffsets(rotation) {
  const d1 = rotation % 6;
  const d2 = (rotation + 1) % 6;
  return [
    { dq: 0, dr: 0 },                         // center (裂)
    { dq: DIR[d1].q, dr: DIR[d1].r },          // terrain A
    { dq: DIR[d2].q, dr: DIR[d2].r },          // terrain B
  ];
}

// A tile definition
export function createTile(id, terrainA, terrainB) {
  return {
    id,
    terrains: ['crack', terrainA, terrainB],  // [center, A, B]
    rotation: 0,
  };
}

// Get world positions of a tile's 3 hexes given anchor (center) position
export function tileHexPositions(tile, anchorQ, anchorR) {
  const offsets = tileOffsets(tile.rotation);
  return offsets.map((o, i) => ({
    q: anchorQ + o.dq,
    r: anchorR + o.dr,
    terrain: tile.terrains[i],
  }));
}

// Generate a random hand of tiles for Phase 1
export function generateHand(count) {
  const hand = [];
  for (let i = 0; i < count; i++) {
    const a = PHASE1_TERRAINS[Math.floor(Math.random() * PHASE1_TERRAINS.length)];
    const b = PHASE1_TERRAINS[Math.floor(Math.random() * PHASE1_TERRAINS.length)];
    hand.push(createTile(`tile-${i}`, a, b));
  }
  return hand;
}
