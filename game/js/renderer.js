// Canvas renderer — 2.5D isometric hex board, hand area, player, ghost preview

import { hexToPixel, hexVertices } from './hex.js';
import { TERRAIN, tileOffsets } from './tiles.js';

const HEX_SIZE = 32;
const HAND_HEIGHT = 140;
const HAND_TILE_SIZE = 18;
const Y_SQUISH = 0.6;          // vertical compression for isometric look
const SIDE_HEIGHT_BASE = 12;   // side face height in pixels at zoom=1

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  const camera = { x: 0, y: 0, zoom: 1 };

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  // World → screen (with Y squish for isometric)
  function screenToWorld(sx, sy) {
    return {
      wx: (sx - canvas.width / 2) / camera.zoom + camera.x,
      wy: (sy - canvas.height / 2) / (camera.zoom * Y_SQUISH) + camera.y,
    };
  }

  function worldToScreen(wx, wy) {
    return {
      sx: (wx - camera.x) * camera.zoom + canvas.width / 2,
      sy: (wy - camera.y) * Y_SQUISH * camera.zoom + canvas.height / 2,
    };
  }

  // --- Color helpers ---
  function darken(hex, factor) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${Math.round(r * factor)},${Math.round(g * factor)},${Math.round(b * factor)})`;
  }

  // --- Hex drawing (isometric) ---

  // Squished hex vertices for top face
  function isoHexVerts(cx, cy, size) {
    const verts = [];
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI / 180 * (60 * i - 30);
      verts.push({
        x: cx + size * Math.cos(angle),
        y: cy + size * Math.sin(angle) * Y_SQUISH,
      });
    }
    return verts;
  }

  function drawPath(verts) {
    ctx.beginPath();
    ctx.moveTo(verts[0].x, verts[0].y);
    for (let i = 1; i < verts.length; i++) {
      ctx.lineTo(verts[i].x, verts[i].y);
    }
    ctx.closePath();
  }

  // Draw a 2.5D hex slab: top face + visible side faces
  function drawIsoHex(cx, cy, size, fillColor, strokeColor, alpha) {
    const sh = SIDE_HEIGHT_BASE * camera.zoom;
    const top = isoHexVerts(cx, cy, size);
    ctx.globalAlpha = alpha;

    // Side face (bottom contour extruded down)
    // Visible sides: v[0]→v[1]→v[2]→v[3] (right + front + left-front)
    const sideVerts = [
      top[3], top[2], top[1], top[0],
      { x: top[0].x, y: top[0].y + sh },
      { x: top[1].x, y: top[1].y + sh },
      { x: top[2].x, y: top[2].y + sh },
      { x: top[3].x, y: top[3].y + sh },
    ];
    drawPath(sideVerts);
    ctx.fillStyle = darken(fillColor, 0.55);
    ctx.fill();
    ctx.strokeStyle = darken(strokeColor, 0.5);
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Dividing line between right-side and front for depth cue
    ctx.beginPath();
    ctx.moveTo(top[1].x, top[1].y);
    ctx.lineTo(top[1].x, top[1].y + sh);
    ctx.strokeStyle = darken(strokeColor, 0.4);
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(top[2].x, top[2].y);
    ctx.lineTo(top[2].x, top[2].y + sh);
    ctx.stroke();

    // Top face
    drawPath(top);
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.globalAlpha = 1;
  }

  // Flat hex (for hand area, no side faces)
  function drawFlatHex(cx, cy, size, fillColor, strokeColor, alpha) {
    const verts = hexVertices(cx, cy, size);
    ctx.globalAlpha = alpha || 1;
    drawPath(verts);
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // --- Board ---

  function drawBoard(board) {
    // Sort cells back-to-front for proper overlap (lower r first, then lower q)
    const cells = [...board.cells.values()];
    cells.sort((a, b) => a.r !== b.r ? a.r - b.r : a.q - b.q);

    for (const cell of cells) {
      const { x, y } = hexToPixel(cell.q, cell.r, HEX_SIZE);
      const scr = worldToScreen(x, y);
      const sz = HEX_SIZE * camera.zoom;
      // Cull off-screen
      if (scr.sx < -sz * 2 || scr.sx > canvas.width + sz * 2) continue;
      if (scr.sy < -sz * 3 || scr.sy > canvas.height + sz * 3) continue;
      const t = TERRAIN[cell.terrain];
      drawIsoHex(scr.sx, scr.sy, sz, t.fill, t.stroke, 1);
    }
  }

  // --- Player ---

  function drawPlayer(q, r) {
    const { x, y } = hexToPixel(q, r, HEX_SIZE);
    const scr = worldToScreen(x, y);
    const sz = HEX_SIZE * camera.zoom;

    // Shadow
    ctx.beginPath();
    ctx.ellipse(scr.sx, scr.sy + sz * 0.05, sz * 0.3, sz * 0.15, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fill();

    // Body (simple figure)
    const figH = sz * 0.6;
    const figW = sz * 0.22;
    const baseY = scr.sy - sz * 0.05;

    // Cloak
    ctx.beginPath();
    ctx.moveTo(scr.sx, baseY - figH);
    ctx.lineTo(scr.sx - figW, baseY);
    ctx.lineTo(scr.sx + figW, baseY);
    ctx.closePath();
    ctx.fillStyle = '#c8a050';
    ctx.fill();
    ctx.strokeStyle = '#8a6a30';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Head
    ctx.beginPath();
    ctx.arc(scr.sx, baseY - figH - sz * 0.1, sz * 0.12, 0, Math.PI * 2);
    ctx.fillStyle = '#f5e6c8';
    ctx.fill();
    ctx.strokeStyle = '#8a6a30';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // --- Ghost preview ---

  function drawGhost(tileHexes, valid) {
    for (const h of tileHexes) {
      const { x, y } = hexToPixel(h.q, h.r, HEX_SIZE);
      const scr = worldToScreen(x, y);
      const sz = HEX_SIZE * camera.zoom;
      const t = TERRAIN[h.terrain];
      const color = valid ? t.fill : '#552222';
      const stroke = valid ? '#ffffff' : '#882222';
      // Ghost: just top face, no sides
      const verts = isoHexVerts(scr.sx, scr.sy, sz);
      ctx.globalAlpha = 0.5;
      drawPath(verts);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  // --- Hand area ---

  function drawHand(hand, selectedIndex) {
    const y0 = canvas.height - HAND_HEIGHT;

    ctx.fillStyle = 'rgba(10, 10, 20, 0.88)';
    ctx.fillRect(0, y0, canvas.width, HAND_HEIGHT);
    ctx.strokeStyle = '#443322';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y0);
    ctx.lineTo(canvas.width, y0);
    ctx.stroke();

    ctx.fillStyle = '#887755';
    ctx.font = '12px "Noto Sans TC", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('手牌', 12, y0 + 18);

    const tileWidth = HAND_TILE_SIZE * 4.5;
    const totalWidth = hand.length * tileWidth;
    const startX = (canvas.width - totalWidth) / 2;

    for (let i = 0; i < hand.length; i++) {
      const tile = hand[i];
      const cx = startX + i * tileWidth + tileWidth / 2;
      const cy = y0 + HAND_HEIGHT / 2 + 5;

      // Selection highlight
      if (i === selectedIndex) {
        ctx.strokeStyle = '#f5e6c8';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - tileWidth / 2 + 4, y0 + 8, tileWidth - 8, HAND_HEIGHT - 16);
      }

      // Mini tile preview (flat, no iso)
      const offsets = tileOffsets(tile.rotation);
      for (let j = 0; j < 3; j++) {
        const hx = cx + (Math.sqrt(3) * offsets[j].dq + Math.sqrt(3) / 2 * offsets[j].dr) * HAND_TILE_SIZE;
        const hy = cy + (1.5 * offsets[j].dr) * HAND_TILE_SIZE;
        const t = TERRAIN[tile.terrains[j]];
        drawFlatHex(hx, hy, HAND_TILE_SIZE, t.fill, t.stroke, 1);
      }
    }
  }

  function hitTestHand(sx, sy, handLength) {
    const y0 = canvas.height - HAND_HEIGHT;
    if (sy < y0) return -1;
    const tileWidth = HAND_TILE_SIZE * 4.5;
    const totalWidth = handLength * tileWidth;
    const startX = (canvas.width - totalWidth) / 2;
    const idx = Math.floor((sx - startX) / tileWidth);
    if (idx >= 0 && idx < handLength) return idx;
    return -1;
  }

  function isInHandArea(sy) {
    return sy >= canvas.height - HAND_HEIGHT;
  }

  function clear() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  return {
    canvas, ctx, camera, resize,
    screenToWorld, worldToScreen,
    clear, drawBoard, drawPlayer, drawGhost, drawHand,
    hitTestHand, isInHandArea,
    HEX_SIZE, Y_SQUISH,
  };
}
