// Main entry point — initialization, input handling, render loop

import { createRenderer } from './renderer.js';
import { createGame, selectTile, rotateTile, updateGhost, tryPlace, tryWalk } from './game.js';
import { pixelToHex } from './hex.js';
import { tileHexPositions } from './tiles.js';

const canvas = document.getElementById('canvas');
const hud = document.getElementById('hud');
const renderer = createRenderer(canvas);
const game = createGame();

renderer.resize();
window.addEventListener('resize', () => renderer.resize());

// --- Input state ---
let dragging = false;
let dragStart = { x: 0, y: 0 };
let cameraStart = { x: 0, y: 0 };
let hasDragged = false;

// --- Mouse events ---
canvas.addEventListener('mousedown', (e) => {
  // Check hand area first
  const handIdx = renderer.hitTestHand(e.clientX, e.clientY, game.hand.length);
  if (handIdx >= 0) {
    if (game.selectedTile === handIdx) {
      selectTile(game, -1);
    } else {
      selectTile(game, handIdx);
    }
    updateCursor();
    return;
  }

  // Start drag (placement/walk resolved on mouseup if no drag)
  dragging = true;
  hasDragged = false;
  dragStart.x = e.clientX;
  dragStart.y = e.clientY;
  cameraStart.x = renderer.camera.x;
  cameraStart.y = renderer.camera.y;
});

canvas.addEventListener('mousemove', (e) => {
  if (dragging) {
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasDragged = true;
    if (hasDragged) {
      renderer.camera.x = cameraStart.x - dx / renderer.camera.zoom;
      renderer.camera.y = cameraStart.y - dy / (renderer.camera.zoom * renderer.Y_SQUISH);
      canvas.classList.add('grabbing');
    }
    return;
  }

  // Update ghost preview
  if (game.selectedTile >= 0 && !renderer.isInHandArea(e.clientY)) {
    const { wx, wy } = renderer.screenToWorld(e.clientX, e.clientY);
    const hex = pixelToHex(wx, wy, renderer.HEX_SIZE);
    updateGhost(game, hex.q, hex.r);
  } else {
    game.ghostAnchor = null;
  }
});

canvas.addEventListener('mouseup', (e) => {
  const wasDragging = dragging;
  dragging = false;
  canvas.classList.remove('grabbing');

  if (wasDragging && !hasDragged) {
    // It was a click (not a drag)
    const { wx, wy } = renderer.screenToWorld(e.clientX, e.clientY);
    const hex = pixelToHex(wx, wy, renderer.HEX_SIZE);

    if (game.selectedTile >= 0 && game.ghostAnchor && game.ghostValid) {
      // Place tile
      tryPlace(game);
      updateCursor();
    } else if (game.selectedTile < 0) {
      // Walk to clicked hex
      tryWalk(game, hex.q, hex.r);
    }
  }
});

canvas.addEventListener('mouseleave', () => {
  dragging = false;
  canvas.classList.remove('grabbing');
  game.ghostAnchor = null;
});

// Zoom
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const factor = e.deltaY > 0 ? 0.9 : 1.1;
  renderer.camera.zoom = Math.max(0.3, Math.min(3, renderer.camera.zoom * factor));
}, { passive: false });

// Keyboard
window.addEventListener('keydown', (e) => {
  if (e.key === 'r' || e.key === 'R') {
    rotateTile(game);
    if (game.ghostAnchor) {
      updateGhost(game, game.ghostAnchor.q, game.ghostAnchor.r);
    }
  }
  const num = parseInt(e.key);
  if (num >= 1 && num <= 9 && num - 1 < game.hand.length) {
    selectTile(game, num - 1);
    updateCursor();
  }
  if (e.key === 'Escape') {
    selectTile(game, -1);
    updateCursor();
  }
});

function updateCursor() {
  canvas.classList.toggle('placing', game.selectedTile >= 0);
}

// --- HUD ---
function updateHUD() {
  hud.innerHTML =
    `步數 ${game.moves} ｜ 手牌 ${game.hand.length} ｜ 棋盤 ${game.board.cells.size} 格` +
    (game.selectedTile >= 0 ? `<br>已選板塊 #${game.selectedTile + 1} — R 旋轉` : '');
}

// --- Render loop ---
function frame() {
  renderer.clear();
  renderer.drawBoard(game.board);

  // Ghost preview
  if (game.ghostAnchor && game.selectedTile >= 0) {
    const tile = game.hand[game.selectedTile];
    const hexes = tileHexPositions(tile, game.ghostAnchor.q, game.ghostAnchor.r);
    renderer.drawGhost(hexes, game.ghostValid);
  }

  renderer.drawPlayer(game.player.q, game.player.r);
  renderer.drawHand(game.hand, game.selectedTile);
  updateHUD();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
