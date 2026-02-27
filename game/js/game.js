// Game state and logic

import { createBoard, placeTile, canPlace, canWalk, findMoveTarget } from './board.js';
import { createTile, generateHand, tileHexPositions } from './tiles.js';

const INITIAL_HAND_SIZE = 7;

export function createGame() {
  const board = createBoard();
  const hand = generateHand(INITIAL_HAND_SIZE);

  // Place starting tile at origin
  const startTile = createTile('start', 'road', 'wild');
  startTile.rotation = 0;
  placeTile(board, startTile, 0, 0);

  return {
    board,
    hand,
    player: { q: 0, r: 0 },
    selectedTile: -1,     // index into hand
    ghostAnchor: null,    // { q, r } for preview
    ghostValid: false,
    moves: 0,
    tilesPlaced: 0,
  };
}

export function selectTile(game, index) {
  if (index >= 0 && index < game.hand.length) {
    game.selectedTile = index;
  } else {
    game.selectedTile = -1;
  }
  game.ghostAnchor = null;
}

export function rotateTile(game) {
  if (game.selectedTile < 0) return;
  const tile = game.hand[game.selectedTile];
  tile.rotation = (tile.rotation + 1) % 6;
}

export function updateGhost(game, anchorQ, anchorR) {
  if (game.selectedTile < 0) {
    game.ghostAnchor = null;
    return;
  }
  game.ghostAnchor = { q: anchorQ, r: anchorR };
  const tile = game.hand[game.selectedTile];
  game.ghostValid = canPlace(
    game.board, tile, anchorQ, anchorR,
    game.player.q, game.player.r
  );
}

export function tryPlace(game) {
  if (game.selectedTile < 0 || !game.ghostAnchor || !game.ghostValid) {
    return false;
  }

  const tile = game.hand[game.selectedTile];
  const { q, r } = game.ghostAnchor;

  // Place the tile
  placeTile(game.board, tile, q, r);

  // Move player to adjacent hex in the new tile
  const target = findMoveTarget(tile, q, r, game.player.q, game.player.r);
  if (target) {
    game.player.q = target.q;
    game.player.r = target.r;
  }

  // Remove tile from hand
  game.hand.splice(game.selectedTile, 1);
  game.selectedTile = -1;
  game.ghostAnchor = null;
  game.moves++;
  game.tilesPlaced++;

  // Replenish hand if empty
  if (game.hand.length === 0) {
    game.hand = generateHand(INITIAL_HAND_SIZE);
  }

  return true;
}

// Walk to an adjacent board hex (no tile selected)
export function tryWalk(game, q, r) {
  if (!canWalk(game.board, q, r, game.player.q, game.player.r)) {
    return false;
  }
  game.player.q = q;
  game.player.r = r;
  game.moves++;
  return true;
}
