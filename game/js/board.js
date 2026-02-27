// Board state — tracks placed hexes on the infinite grid

import { hexKey, hexNeighbors } from './hex.js';
import { tileHexPositions } from './tiles.js';

export function createBoard() {
  return {
    cells: new Map(),   // hexKey -> { terrain, tileId, height }
    tileCount: 0,
  };
}

// Place a tile on the board at anchor position
export function placeTile(board, tile, anchorQ, anchorR) {
  const hexes = tileHexPositions(tile, anchorQ, anchorR);
  for (const h of hexes) {
    const key = hexKey(h.q, h.r);
    board.cells.set(key, {
      q: h.q,
      r: h.r,
      terrain: h.terrain,
      tileId: tile.id,
      height: 0,
    });
  }
  board.tileCount++;
}

// Check if a tile can be placed at anchor position
// Phase 1 rules: at least one hex must be adjacent to an existing hex,
// and none of the 3 hexes may overlap existing hexes,
// and at least one hex must be adjacent to the player position
export function canPlace(board, tile, anchorQ, anchorR, playerQ, playerR) {
  const hexes = tileHexPositions(tile, anchorQ, anchorR);

  // Check no overlap
  for (const h of hexes) {
    if (board.cells.has(hexKey(h.q, h.r))) {
      return false;
    }
  }

  // Check adjacency + terrain color matching
  // 裂 (crack) is a wildcard — matches any terrain
  let hasNeighbor = false;
  for (const h of hexes) {
    for (const n of hexNeighbors(h.q, h.r)) {
      const cell = board.cells.get(hexKey(n.q, n.r));
      if (cell) {
        hasNeighbor = true;
        if (cell.terrain !== 'crack' && h.terrain !== 'crack'
            && cell.terrain !== h.terrain) {
          return false;
        }
      }
    }
  }
  if (!hasNeighbor) return false;

  // Check at least one hex is adjacent to the player
  let adjToPlayer = false;
  const playerNeighbors = hexNeighbors(playerQ, playerR);
  const playerNeighborKeys = new Set(playerNeighbors.map(n => hexKey(n.q, n.r)));
  for (const h of hexes) {
    if (playerNeighborKeys.has(hexKey(h.q, h.r))) {
      adjToPlayer = true;
      break;
    }
  }

  return adjToPlayer;
}

// Check if player can walk to a hex (must be on board and adjacent to player)
export function canWalk(board, targetQ, targetR, playerQ, playerR) {
  if (!board.cells.has(hexKey(targetQ, targetR))) return false;
  return hexNeighbors(playerQ, playerR).some(
    n => n.q === targetQ && n.r === targetR
  );
}

// Find which hex in the new tile the player should move to
// (the one adjacent to the player's current position)
export function findMoveTarget(tile, anchorQ, anchorR, playerQ, playerR) {
  const hexes = tileHexPositions(tile, anchorQ, anchorR);
  const playerNeighborKeys = new Set(
    hexNeighbors(playerQ, playerR).map(n => hexKey(n.q, n.r))
  );

  // Prefer the center hex if it's adjacent
  for (const h of hexes) {
    if (h.terrain === 'crack' && playerNeighborKeys.has(hexKey(h.q, h.r))) {
      return { q: h.q, r: h.r };
    }
  }
  // Otherwise first adjacent hex
  for (const h of hexes) {
    if (playerNeighborKeys.has(hexKey(h.q, h.r))) {
      return { q: h.q, r: h.r };
    }
  }
  return null;
}
